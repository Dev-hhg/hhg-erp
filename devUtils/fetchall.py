# Author: kuldeepaher01
# Created: 2024
# This script fetches all the data from the database and sends WhatsApp messages to farmers.
# It also sends a summary message to the admin at the end of the day.
# It is intended to be run as a scheduled task on a server.
# 

import psycopg2
from datetime import date, datetime, timedelta
import time
from urllib.parse import urlparse
import pywhatkit as kit
from simple_colors import *
import os
import csv
import json
import logging


# Set up logging
logging.basicConfig(filename='logs.txt', level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')


def connect_to_database():
    """Establishes a connection to the PostgreSQL database.

    This function reads the `config.json` file to get the database URL and connects to the database.

    Returns:
        tuple: A tuple containing the database connection object and configuration data.

    Raises:
        FileNotFoundError: If `config.json` is not found.
        JSONDecodeError: If `config.json` is not properly formatted.
        KeyError: If required keys are missing in `config.json`.
        Exception: If an error occurs during the connection process.
    """
    print(blue("Connecting to the database...", "italic"))
    try:
        with open('config.json', 'r', encoding='utf-8') as config_file:
            config = json.load(config_file)
        url = urlparse(config['database_url'])
        conn = psycopg2.connect(
            database=url.path[1:],
            user=url.username,
            password=url.password,
            host=url.hostname,
            port=5432
        )
        logging.info("Successfully connected to the database")
        return conn, config
    except FileNotFoundError:
        logging.error("Config file not found. Please ensure config.json exists in the same directory as the script.")
        raise
    except json.JSONDecodeError:
        logging.error("Error parsing config.json. Please ensure it's valid JSON.")
        raise
    except KeyError:
        logging.error("Required keys not found in config.json. Please ensure all necessary configurations are present.")
        raise
    except Exception as e:
        logging.error(f"Error connecting to database: {str(e)}")
        raise

def fetch_entries(conn, today):
    """Fetches the farmer entries for the current day from the database.

    Queries the database for farmer entries and a special WhatsApp message for the specified date.

    Args:
        conn (psycopg2.connection): The database connection object.
        today (str): The current date.

    Returns:
        tuple: A tuple containing the new entries and any special WhatsApp message for the day.

    Raises:
        Exception: If there is an issue with fetching the data.
    """
    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT farmername, mobilenumber, vendorname, item, quantity, weight, transactionid, date, uid
            FROM ENTRY 
            LEFT OUTER JOIN FARMERS ON ENTRY.farmerid = FARMERS.farmerid 
            WHERE date = '{today}' AND mobilenumber != '';
        """)
        new_entries = cur.fetchall()

        # cur.execute("""
        #     SELECT farmername, mobilenumber, vendorname, item, quantity, weight, transactionid, date, payable, rate, uid
        #     FROM entry 
        #     LEFT OUTER JOIN vendormemo ON entry.transactionid = vendormemo.entryid
        #     LEFT OUTER JOIN FARMERS ON ENTRY.farmerid = FARMERS.farmerid
        #     WHERE mobileNumber != '' AND vendormemo.payable > 0 AND patti_timestamp > %s
        # """, (today,))
        # patti_entries = cur.fetchall()

        cur.execute("""
            SELECT message FROM whatsapp_messages WHERE active_date >= %s
        """, (today,))
        special_message = cur.fetchone()

        cur.close()
        logging.info(f"Fetched data for date {today}")
        return new_entries, special_message
    except Exception as e:
        logging.error(f"Error fetching data: {str(e)}")
        raise

def fetch_patti_entries(conn: object, today: str) -> list:
    """Fetches the patti entries for the current day from the database.

    Queries the database for patti entries with non-zero payable amounts after the specified date.

    Args:
        conn (psycopg2.connection): The database connection object.
        today (str): The current date.

    Returns:
        list: A list of patti entries.

    Raises:
        Exception: If there is an issue with fetching the data.
    """
    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT farmername, mobilenumber, vendorname, item, quantity, weight, vendormemo.id, date, payable, rate, uid
            FROM entry 
            LEFT OUTER JOIN vendormemo ON entry.transactionid = vendormemo.entryid
            LEFT OUTER JOIN FARMERS ON ENTRY.farmerid = FARMERS.farmerid
            WHERE mobileNumber != '' AND vendormemo.payable > 0 AND patti_timestamp > %s
        """, (today,))
        patti_entries = cur.fetchall()
        cur.close()
        logging.info(f"Fetched data for date {today}")
        return patti_entries
    
    except Exception as e:
        logging.error(f"Error fetching data: {str(e)}")
        raise

def aggregate_entries(rows):
    """Aggregates farmer entries by mobile number.

    Args:
        rows (list): A list of rows containing farmer entry data.

    Returns:
        dict: A dictionary where the key is the mobile number and the value is a list of entries for that farmer.
    """
    aggregated = {}
    for row in rows:
        mobilenumber = row[1]
        if mobilenumber not in aggregated:
            aggregated[mobilenumber] = []
        aggregated[mobilenumber].append(row)
    return aggregated

def read_sent_entries(filename):
    """Reads sent entries from a CSV file.

    Args:
        filename (str): The name of the file to read.

    Returns:
        tuple: A set of transaction IDs that have already been sent, and the date of the last entry.
    """
    sent_entries = set()
    csv_date = None
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) > 7:
                    sent_entries.add(int(row[6]))
                    csv_date = row[7]
    return sent_entries, csv_date

def write_sent_entry(filename, entry):
    """Clears the contents of the given file.

    Args:
        filename (str): The name of the file to clear.
    """
    with open(filename, 'a', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        encoded_entry = [str(item).encode('utf-8', errors='ignore').decode('utf-8') for item in entry]
        encoded_entry[7] = date.today()
        writer.writerow(encoded_entry)
        
def clear_file(filename):
    """Clear the contents of the given file.

    Args:
        filename (String): Name of the file to clear.
    """
    open(filename, 'w').close()

def send_whatsapp_message(mobile_number, message):
    """Send a WhatsApp message to the given mobile number.

    Args:
        mobile_number (string): Mobile number to send the message to.
        message (string): Message to send.

    Returns:
        boolean: True if the message was sent successfully, False otherwise.
    """
    try:
        kit.sendwhatmsg_instantly(mobile_number, message, tab_close=True, wait_time=22, close_time=8)
        logging.info(f"Message sent to {mobile_number}")
        return True
    except Exception as e:
        logging.error(f"Error sending message to {mobile_number}: {str(e)}")
        return False

def send_summary_message(new_entry_count, patti_count, date1):
    """Sends a WhatsApp message using the `pywhatkit` library.

    Args:
        mobile_number (str): The mobile number to send the message to.
        message (str): The message content.

    Returns:
        bool: True if the message was sent successfully, False otherwise.
    """
    time_stamp = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    message = f'[INFO] आज दि. *{date1}*माल नोंदीचे *{new_entry_count}* आणि पट्टीचे *{patti_count}* संदेश शेतकऱ्यांना पाठवले गेले आहेत. वेळ: {time_stamp}'
    send_whatsapp_message("+911234567890", message)
    send_whatsapp_message("+911234567890", message)

def check_time():
    """Checks the current time and returns a value based on the time of day.

    Returns:
        int: 0 if the time is between 12 PM and 5 PM, 1 if it's before 12 PM, 2 if it's after 5 PM.
    """
    current_time = datetime.now().time()
    if current_time.hour < 12:
        return 1
    elif current_time.hour >= 16:
        return 2
    return 0

def shutdown_at_9pm():
    """Shuts down the computer at 9 PM.

    This function runs continuously until the current time is 9 PM or later, at which point the computer is shut down.
    """
    while True:
        current_time = datetime.now().time()
        if current_time.hour >= 21:
            print(red("[WARNING]: Shutting down the computer...", "bold"))
            logging.info("Initiating shutdown at 9 PM")
            os.system("shutdown /s /t 1")
            break
        time.sleep(60)
        print(red("[WARNING]: Computer will shutdown at 9 PM. Press Ctrl + C to stop.", "italic"))

def process_entries_new_entry(aggregated_entries, sent_entries, filename, special_message, config):
    """Processes new entries and sends WhatsApp messages to farmers.

    Args:
        aggregated_entries (dict): Aggregated farmer entries.
        sent_entries (set): Set of transaction IDs already sent.
        filename (str): The file to write sent entries to.
        special_message (str): Special WhatsApp message.
        config (dict): Configuration data from the config.json file.

    Returns:
        int: The count of new entries sent.
    """
    count = 0
    for mobilenumber, entries in aggregated_entries.items():
        farmername = entries[0][0]
        vendor_entries = []
        for entry in entries:
            _, _, vendorName, item, quantity, weight, transactionId, date1, uid = entry
            if transactionId in sent_entries:
                print(yellow(f"[WARNING]: Skipping nond message for {farmername} as it was already sent transaction_id: {transactionId}", "italic"))
                continue
            if not mobilenumber or len(mobilenumber) < 10:
                print(yellow(f"[WARNING]: Skipping message for {farmername} due to invalid mobile number: {mobilenumber}", "italic"))
                continue
            vendor_entries.append((vendorName, item, quantity, weight))
            write_sent_entry(filename, entry)
            count += 1
        if vendor_entries:
            mobilenumber = "+91" + mobilenumber
            date1 = entries[0][7].strftime("%d/%m/%Y")
            entries_text = "".join([config['new_entry_line_template'].format(
                index=i+1,
                quantity=quantity, weight=weight, item=item, vendorName=vendorName
            ) for i, (vendorName, item, quantity, weight) in enumerate(vendor_entries)])
            message = config['new_entry_message_template'].format(
                date=date1,
                farmername=farmername,
                entries=entries_text,
                uid=uid,
                special_message=special_message[0] if special_message else ''
            )
            if send_whatsapp_message(mobilenumber, message):
                print(green(f"[INFO]: Entry Message sent to {farmername} at {mobilenumber}.", "bold"))

    return count

def process_entries_patti(aggregated_entries,sent_patti_entries, filename, special_message, config):
    """Processes patti entries and sends WhatsApp messages to farmers.

    Args:
        aggregated_patti (dict): Aggregated patti entries.
        sent_patti (set): Set of patti IDs already sent.
        filename (str): The file to write sent entries to.
        config (dict): Configuration data from the config.json file.

    Returns:
        int: The count of patti entries sent.
    """
    count = 0
    for mobilenumber, entries in aggregated_entries.items():
        farmername = entries[0][0]
        patti_entries = []
        for entry in entries:
            _, _, vendorname, item, quantity, weight, transactionid, date1, payable, rate, uid = entry
            # print(transactionid, sent_patti_entries)
            if transactionid in sent_patti_entries:
                print(yellow(f"[WARNING]: Skipping patti message for {farmername} as it was already sent transaction_id: {transactionid}", "italic"))
                continue
            if not mobilenumber or len(mobilenumber) < 10:
                print(yellow(f"[WARNING]: Skipping message for {farmername} due to invalid mobile number: {mobilenumber}", "italic"))
                continue
            
            patti_entries.append((date1, vendorname, item, quantity, weight, payable, rate))
            write_sent_entry(filename, entry)
            count += 1
        if patti_entries:
            mobilenumber = "+91" + mobilenumber
            entries_text = "".join([config['patti_line_template'].format(
                index=i+1,
                date=date1.strftime('%d/%m/%Y'),
                quantity=quantity, weight=weight, item=item, vendorname=vendorname,
                payable=payable, rate=int(rate)/10
            ) for i, (date1, vendorname, item, quantity, weight, payable, rate) in enumerate(patti_entries)])
            message = config['patti_message_template'].format(
                farmername=farmername,
                entries=entries_text,
                
                uid=uid,
                special_message=special_message[0] if special_message else ''
            )
            if send_whatsapp_message(mobilenumber, message):
                print(green(f"[INFO]: Patti Message sent to {farmername} at {mobilenumber}.", "bold"))

    return count

def handle_csv_file(filename, today):
    sent_entries, csv_date = read_sent_entries(filename)
    if csv_date != str(today):
        clear_file(filename)
        sent_entries.clear()
        logging.info(f"Cleared {filename} file as data was from {csv_date}, now refreshed for {today}.")
    return sent_entries

def main():
    try:
        print(magenta("Welcome Hanuman Hundekari Whatsapp Message Bot\n", "bold"))
        filenames = ["sent_entries.csv", "sent_patti.csv"]
        special_message = None
        run_entries = 2
        
        checked_time = check_time()

        conn, config = connect_to_database()
        
        
        today = date.today()
        
        print("_______________________________________________________________")
        print(green(f"[INFO]: \tData being fetched for: {today}", "bold"))
        
        if checked_time == run_entries:
            new_entries, special_message = fetch_entries(conn, today)
            print(green(f"[INFO]: \t{len(new_entries)} new entries fetched", "bold"))
        
        patti_entries = fetch_patti_entries(conn, today)
        
        conn.close()
        # print count
        
        print(green(f"[INFO]: \t{len(patti_entries)} patti fetched", "bold"))
        
        if checked_time == run_entries:
            sent_entries = handle_csv_file(filenames[0], today)
            aggregated_new_entries = aggregate_entries(new_entries)
        
        sent_patti_entries = handle_csv_file(filenames[1], today)
        aggregated_patti_entries = aggregate_entries(patti_entries)
        print("_______________________________________________________________")
        
        
        if checked_time == run_entries:
            print(green(f"[INFO]: \t{len(aggregated_new_entries)} unique farmers with entries", "bold"))
        print(green(f"[INFO]: \t{len(aggregated_patti_entries)} unique farmers with patti ", "bold"))
        if checked_time == run_entries:
            new_entry_count = process_entries_new_entry(aggregated_new_entries, sent_entries, filenames[0], special_message, config)
            
        patti_count = process_entries_patti(aggregated_patti_entries,sent_patti_entries,filenames[1], special_message, config)

        if checked_time == run_entries:
            send_summary_message(new_entry_count, patti_count, today.strftime("%d/%m/%Y"))
        send_summary_message(0, patti_count, today.strftime("%d/%m/%Y"))

        shutdown_at_9pm()

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        print(red(f"[ERROR]: An error occurred: {str(e)}", "bold"))

if __name__ == "__main__":
    main()

