"use client";
import Alert from "@/components/Alert";
import DateSection from "@/components/DateSection";
import {
  getTodayEntries,
  deleteEntry,
  updateEntry,
} from "@/serverComponents/dbFunctions";
import { useState, useEffect } from "react";
import VendorSelect from "@/components/VendorSelect";
import { set } from "react-hook-form";
import { useSession } from "next-auth/react";

function Page() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const today = new Date().toISOString().split("T")[0];
  const [error, setError] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [print, setPrint] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [tempEntries, setTempEntries] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [day, setDay] = useState(new Date().getDate());
  const [allowed, setAllowed] = useState(false);

  const [data, setData] = useState({
    farmerName: "",
    mobileNumber: "",
    vendorName: "",
    item: "",
    quantity: "",
    weight: "",
    transactionId: "",
  });
  const [alert, setAlert] = useState({
    state: false,
    type: "",
    message: "",
  });
  const [total, setTotal] = useState({
    weight: 0,
    quantity: 0,
  });

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Session", session);
      if (session?.user?.role === "guest" || session?.user?.role === "user") {
        setAllowed(false);
      }else{
        setAllowed(true);
      }
    }
  }, [status, session]);


  useEffect(() => {
    setLoading(true);
    function getDayName(dateStr) {
      var date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", { weekday: "long" });
    }
    getTodayEntries(date)
      .then((data) => {
        // sort data according to vendor name
        data.sort((a, b) => {
          if (a.entrytime < b.entrytime) {
            return -1;
          }
          if (a.entrytime > b.entrytime) {
            return 1;
          }
          return 0;
        });
        setEntries(data);
        let tempWeight = 0;
        let tempQuantity = 0;
        data.forEach((data) => {
          const { weight, quantity } = data;
          tempWeight += weight;
          tempQuantity += quantity;
        });
        console.log(data);
        setTotal((prev) => ({
          ...prev,
          quantity: tempQuantity,
          weight: tempWeight,
        }));
        setDay(getDayName(date));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setError(true);
      });
  }, [date]);

  function handleDelete(transactionId) {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      deleteEntry({ transactionId: transactionId }).then(() => {
        setAlert({
          state: true,
          type: "success",
          message: "Entry deleted successfully!",
        });
        setEntries(
          entries.filter((entry) => entry.transactionid !== transactionId)
        );
      });
    }
  }
  function handleEdit(transactionId) {
    setEditClicked(true);

    const entry = entries.find(
      (entry) => entry.transactionid === transactionId
    );

    if (entry) {
      const formattedData = {
        transactionId: entry.transactionid,
        farmerid: entry.farmerid,
        uid: entry.uid,
        farmerName: entry.farmername,
        mobileNumber: entry.mobilenumber,
        vendorName: entry.vendorname,
        item: entry.item,
        quantity: entry.quantity,
        weight: entry.weight,
      };

      setData(formattedData);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    // console.log(name, value);
    setData((prev) => {
      return { ...prev, [name]: value };
    });
  }
  function handleSubmit(event) {
    event.preventDefault();
    setEditClicked(false);
    const trimmedData = {
      farmerid: data.farmerid,
      vendorName: data.vendorName.trim(),
      item: data.item.trim(),
      quantity: data.quantity,
      weight: data.weight,
      transactionId: data.transactionId,
    };

    // console.log(trimmedData);

    try {
      updateEntry(trimmedData);
      setAlert({
        state: true,
        type: "success",
        message: "Entry Updated Successfully",
      });
      setData({
        farmerName: "",
        mobileNumber: "",
        vendorName: "",
        item: "",
        quantity: "",
        weight: "",
      });
    } catch (error) {
      setAlert({
        state: true,
        type: "danger",
        message: error,
      });
    } finally {
      setLoading(false);
    }
  }
  function printPDF() {
    setPrint(true);
    const printWindow = window.open();
    printWindow.document.write(`
      <html>
        <head>
          <title> HHG</title>
          <style>
          @media print {
          @page {
            size: A4;
            margin: 0;
          }
          }
        
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th {
              border: 2px solid black;
              padding: 2px;
              text-align: center;
              font-size: smaller;
              white-space: nowrap;
            }td {
              border: 1px solid black;
              padding: 2px;
              text-align: center;
              font-size: smaller;
              white-space: nowrap;
            }
            th {
              background-color: #f2f2f2;
            }
            

            h1, h2 {
            position: relative;
              margin-bottom: 0px;
            }


          </style>
        </head>
        <body style="margin-top: 0px;">
         <div class="border">
         
           <h4 style="text-align: center; margin-top: 0px; margin-bottom: 0px; font-size: 18px;">।। H ।।</h4>
           <h2 style="text-align: center; margin-top: 0px; margin-bottom: 0px; font-size: smaller;">
           <span id="date">${day}, ${date
      .split("-")
      .reverse()
      .join("-")} Entries =>
                ${total.quantity} Quantity</span></h2>
   
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Farmer Name</th>
                <th>Item</th>
                <th>Vendor Name</th>
                <th>Item</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              ${entries
                .map(
                  (entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.farmername}</td>
                  <td>${entry.item}</td>
                  <td>${entry.vendorname}</td>
                  <td>${entry.quantity}</td>
                  <td>${entry.weight}</td>

                </tr>
              `
                )
                .join("")}
              <tr>
                <td>Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td style="font-weight: bold">${total.quantity}</td>
                <td style="font-weight: bold">${Number(
                  total.weight
                ).toLocaleString("en-IN")} Kg</td>
              </tr>
            </tbody>
          </table>
          </div>
         

        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    setPrint(false);
  }
  const toast = (
    <div>
      <form autoComplete="off" onSubmit={handleSubmit} className={`space-y-4 `}>
        <h1 className="text-2xl align-middle font-bold text-white">
          Editing entry for farmer id: {data.farmerid} with UID: {data.uid}
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="farmerName">
            farmerName
            </label>
            <input
              className="w-full rounded-lg border-gray-200 p-3 text-sm e-disable"
              placeholder="farmerName "
              type="text"
              id="farmerName"
              name="farmerName"
              onChange={handleChange}
              value={data.farmerName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="sr-only" htmlFor="mobileNumber">
          mobileNumber
          </label>
          <input
            className=" w-full rounded-lg border-gray-200 p-3 text-sm "
            placeholder="mobileNumber"
            type="number"
            id="mobileNumber"
            name="mobileNumber"
            onChange={handleChange}
            value={data.mobileNumber}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="vendorName">
            vendorName
            </label>
            <VendorSelect
              handleChange={handleChange}
              value={data.vendorName}
              setLoadingVendors={setLoadingVendors}
              loading={loadingVendors}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="item">
            item
            </label>
            <input
              className="w-full rounded-lg border-gray-200 p-3 text-sm"
              placeholder="item"
              type="text"
              id="item"
              name="item"
              onChange={handleChange}
              value={data.item}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="quantity">
            quantity
            </label>
            <input
              className="w-full rounded-lg border-gray-200 p-3 text-sm"
              placeholder="quantity "
              type="number"
              id="quantity"
              name="quantity"
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              value={data.quantity}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="weight">
            weight
            </label>
            <input
              className="w-full rounded-lg border-gray-200 p-3 text-sm"
              placeholder="weight "
              type="number"
              id="weight"
              name="weight"
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              value={data.weight}
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            disabled={loading}
            type="submit"
            className={`inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto ${
              loading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-gray-900"
            }`}
          >
            Update Entry
          </button>
        </div>
      </form>
    </div>
  );
  // search function using the name of the farmer in the input field farmername
  function handleSearch(event) {
    event.preventDefault();
    setSearchClicked(!searchClicked);
    const check = !searchClicked;
    if (check) {
      setTempEntries(entries);
      const searchFarmer = document.getElementById("searchFarmer").value;
      if (searchFarmer === "") {
        setAlert({
          state: true,
          type: "danger",
          message: "Please enter the name of the farmer to search",
        });
        setSearchClicked(false);
        return;
      }
      setLoading(true);
      if (!isNaN(searchFarmer) && Number.isInteger(parseInt(searchFarmer))) {
        searchByNumber(searchFarmer);
        setLoading(false);
      } else {
        searchByName(searchFarmer);
        setLoading(false);
      }
    } else {
      console.log("Seacrhc should clear", searchClicked);
      setEntries(tempEntries);
      //make input field empty
      document.getElementById("searchFarmer").value = "";
    }
  }

  function searchByName(text) {
    // search in entries for the text in entries using farmername, item, vendorname
    const result = entries.filter(
      (entry) =>
        entry.farmername.includes(text) ||
        entry.item.includes(text) ||
        entry.vendorname.includes(text)
    );
    if (result.length === 0) {
      setAlert({
        state: true,
        type: "danger",
        message: "No entries found for the name",
      });
      return;
    } else {
      setEntries(result);
    }
  }
  function searchByNumber(number) {
    // search in entries for the number in adhaar
    const result = entries.filter((entry) => entry.uid.includes(number));
    if (result.length === 0) {
      setAlert({
        state: true,
        type: "danger",
        message: "No entries found for the adhaar number",
      });
      return;
    } else {
      setEntries(result);
    }
  }

  function convertTime(entryTime) {
    // Parse the timestamp string manually
    
    const date = new Date(entryTime);
    
    // Set the timezone offset to IST (+05:30)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    
    // Subtract 5 hours and 30 minutes
    date.setHours(date.getHours() - 11);
    
    // Format the result to show only time in Indian English locale
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,

    };
    return date.toLocaleTimeString('en-IN', options);
  }
  

  return (
    <div className="p-2 md:p-14 lg:p-14">
      {alert.state && (
        <Alert
          message={alert.message}
          type={alert.type}
          setState={setAlert}
          timer={2000}
        />
      )}

      {editClicked ? (
        toast
      ) : (
        <div className=" overflow-x-auto rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-8 ">
          <div className="flex flex-col justify-between">
            <DateSection date={date} setDate={setDate} />
            <div className="flex flex-row justify-center items-center space-x-6 mt-4">
              <h1 className="  text-xl font-bold text-center">
                Entries for {day}, {date.split("-").reverse().join("-")} {" "}
                {total.quantity} Bags
              </h1>
            </div>
            <div className="flex space-x-4 mt-1">
              <div className="flex items-center">
                <label className="sr-only" htmlFor="farmerName">
                  farmerName
                </label>
                <input
                  className=" rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Search by name or adhaar number"
                  type="text"
                  id="searchFarmer"
                  name="searchFarmer"
                  // onChange={handleChange}
                  // value={data.farmerName}
                  disabled={loading}
                  // required
                />
              </div>
              <button
                onClick={handleSearch}
                className={`inline-flex items-center rounded-lg bg-black py-2 px-4 font-medium text-white hover:bg-gray-800 `}
                disabled={loading}
              >
                {!searchClicked && (
                  <svg
                    class="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0  0  24  24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-width="2"
                      d="m21  21-3.5-3.5M17  10a7  7  0  1  1-14  0  7  7  0  0  1  14  0Z"
                    />
                  </svg>
                )}

                {searchClicked && (
                  <svg
                    data-unchecked-icon
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>{searchClicked ? "Clear Search" : "Search"}</span>
              </button>

              <button
                onClick={printPDF}
                className={`inline-flex items-center rounded-lg bg-black py-2 px-4 hover:bg-gray-800 font-medium text-white ${
                  print ? "opacity-50" : ""
                }`}
                disabled={print}
              >
                <svg
                  class="w-6 h-6 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0  0  24  24"
                >
                  <path
                    fillRule="evenodd"
                    d="M8  3a2  2  0  0  0-2  2v3h12V5a2  2  0  0  0-2-2H8Zm-3  7a2  2  0  0  0-2  2v5c0  1.1.9  2  2  2h1v-4c0-.6.4-1  1-1h10c.6  0  1 .4  1  1v4h1a2  2  0  0  0  2-2v-5a2  2  0  0  0-2-2H5Zm4  11a1  1  0  0  1-1-1v-4h8v4c0 .6-.4  1-1  1H9Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Print</span>
              </button>
            </div>
            {loading && (
              <div className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
                <svg
                  aria-hidden="true"
                  className="inline w-10 h-10text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            )}
            <form
              className={`flex items-center justify-center ${
                loading ? "opacity-20" : ""
              }`}
            >
              <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm mt-5">
                <thead className="">
                  <tr className="bg-gray-300">
                    <th className="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900">
                      Sr. No.
                    </th>
                    <th className="whitespace-nowrap px-1 md:px-4 lg:px-4 py-2 font-bold text-gray-900">
                      Farmer Uid
                    </th>
                    <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                      Farmer Name
                    </th>
                    <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                      Item
                    </th>

                    <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                      Vendor Name
                    </th>
                    <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                      Quantity
                    </th>
                    <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                      Weight
                    </th>
                    <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                      Time
                    </th>
                    <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry, index) => (
                    <tr key={entry.transactionid}>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700">
                        {entry.uid}
                      </td>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700">
                        {entry.farmername}
                      </td>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700">
                        {entry.item}
                      </td>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700">
                        {entry.vendorname}
                      </td>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700">
                        {entry.quantity}
                      </td>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700">
                        {entry.weight}
                      </td>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700">
                        {convertTime(entry.entrytime)}
                      </td>
                      <td className="whitespace-nowrap text-center py-1 text-gray-700 space-x-1">
                        <button
                          title="Delete entry"
                          onClick={(event) => {
                            event.preventDefault();
                            handleDelete(entry.transactionid);
                          }}
                          className={`bg-red-500 text-white rounded-lg p-2 ${
                            date !== today || !allowed
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer hover:bg-red-900"
                          }`}
                          disabled={!allowed}
                        >
                          <svg
                            className="w-6 h-6 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 18 20"
                          >
                            <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
                          </svg>
                        </button>
                        <button
                          key="editButton"
                          className={`"ml-1 bg-green-500 text-white rounded-lg p-2 ${!allowed ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-green-900"}"`}
                          onClick={(event) => {
                            event.preventDefault();
                            handleEdit(entry.transactionid);
                          }}
                          disabled={!allowed}
                        >
                          <svg
                            className="w-6 h-6 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M1 5h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 1 0 0-2H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2Zm18 4h-1.424a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2h10.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Zm0 6H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 0 0 0 2h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900">
                      Total
                    </td>
                    <td
                      className="whitespace-nowrap text-center py-4 font-semibold text-gray-900"
                      colSpan="4"
                    ></td>
                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
                      {total.quantity}
                    </td>
                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
                      {total.weight}
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </div>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-center mt-2">
          Error fetching data. Please try again.
        </div>
      )}
    </div>
  );
}

export default Page;
