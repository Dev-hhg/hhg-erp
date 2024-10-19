### HHG ERP 

I'm still updating the files and the code.
<!-- to do marks -->

- [x] Create a new repository
- [x] Create a new branch
- [x] Create a new file
- [x] Sanitise into english
- [x] Add a license
- [x] Add a code of conduct
- [x] Add a contributing guideline
- [x] Add a issue template
- [x] Add a pull request template
- [x] Add hacktoberfest label
- [x] Add girlscript label
- [ ] Open a pull request
- [x] Add a dependabot
- [x] Add a vulnerability alert
- [x] Add a dependabot alert
- [x] Add a security policy
- [ ] Merge pull request
- [ ] Add a wiki
- [ ] Add a project board
- [ ] Complete the README file
- [x] Add a docker config for db
- [x] Add a shell script for db setup





# Project Overview

Welcome to the project! This application utilizes **NextAuth.js** for authentication using a custom client provider connected to our PostgreSQL database. Here’s everything you need to know to get started:

## Authentication

- **Login Credentials:** 
  - **Username:** admin
  - **Password:** admin
  - *(These credentials are automatically created when you run `schema.sql`.)*

## Role-Based Access

The application employs role-based access controls:

- **Admin:** Full access to all features.
- **User & Guest:** Limited permissions.

If you encounter any issues, don’t hesitate to reach out for help!

## Getting Started

### 1. Setting Up Vendors and Farmers

To kick things off, you need to add vendors and farmers:

- Navigate to the **Vendor** and **Farmer** menus to add them manually.
- Alternatively, use the provided SQL file to bulk add users, farmers, entries, and vendors.

### 2. Managing Entries

#### Entry Page

- **Function:** This is the main interface for recording new produce entries.
- **Steps:**
  - Select a **Date:** When a farmer brings in produce, select the date.
  - **Farmer Identification:** Enter the farmer’s UID or Name to fetch their details (UID, Name, Mobile Number).
  - **Vendor Details:** Specify the vendor name, number of bags, type of produce (Beans, Cauliflower, Tomato, Potato), and the total weight.
  - **Print:** After submitting, a print window will open for sticker printing (25mm x 30mm), including an extra sticker for the farmer’s acknowledgment.
  - **Recent Entries:** Displays the last successful entry and the last five entries for quick reference.

#### View Entries

- **Function:** View and manage all entries for the selected day.
- **Steps:**
  - Change the date using a date picker.
  - Entries can be deleted (which moves them to a different table) or edited as needed.

### 3. Transporter Memo

- **Function:** Summarizes the number of bags and freight to be collected based on vendor data.
- **Steps:**
  - Click on a vendor name to be redirected to the **Vendor-Transport Memo** page for detailed entry management.

### 4. Vendor-Transport Memo

- **Function:** Captures daily entry details for a specific vendor.
- **Steps:**
  - Automatically calculates transport rates based on weight (20-90 kg). For weights outside this range, manual input is required.
  - Transport rate is approximately calculated as `weight x 2`.
  - Refund amounts (usually `quantity x 10`) are tracked here.

#### Transporter Details

- **Function:** Record transporter information for the day’s memo.
- **Steps:**
  - Enter the transporter’s name and vehicle number for that day’s memo only; these details will auto-fill for subsequent memos.
  - Only modified rows are updated in the database when saving.

### 5. Printing Functionality

- **Function:** Allows users to print entry records.
- **Steps:**
  - After saving your entries, you’ll be redirected to a print page for your records.

### 6. Vendor Memo Pages

- **Pending Vendor Memos (`/vmdata`):**
  - **Function:** Displays all pending vendor memos. 
  - **Steps:** Click on a row to access the specific vendor's memo page.
  
- **Monetary Details (`/vendormemo`):**
  - **Function:** Displays financial transactions for vendors.
  - **Steps:** Enter receipts manually when vendors sell produce. Refunds are pulled from the Vendor-Transporter Memo, and only changed rows are sent to the database upon saving.

### 7. Finding Farmer Data

- **Function:** Search and view farmer transaction histories.
- **Steps:**
  - Search for farmers and view their history, including produce brought, selling prices, and payment status.
  - Payments marked as disbursed are recorded, along with who marked them.

### 8. Daily Payment Book (`/dailybook`)

- **Function:** Summarizes payments made to farmers.
- **Steps:** Displays all relevant details regarding disbursed payments.

## Vendor Menu

- **Add New Vendor:**
  - **Function:** Allows for adding new vendors.
  
- **Add Vendor Payment:**
  - **Function:** Track payments sent to HHG Enterprise by vendors.

- **Vendor Statement:**
  - **Function:** Displays a summary of a selected vendor’s financial transactions over a specified period.

## Farmer Menu

- **Add New Farmer:**
  - **Function:** Input required farmer details.
  - **Steps:** UID is essential for easy identification.

- **Add Advance:**
  - **Function:** Record any advance payments made to farmers.

- **View All Farmers:**
  - **Function:** View, update, and delete farmer records.

## Reports

- **Daily Market Rate:**
  - **Function:** View and print per kg rates for items, organized by date.

- **Daily Summary:**
  - **Function:** A dashboard summarizing overall income, data, and top farmers.

- **Daily Payment Book:**
  - **Function:** Previously explained, displays daily payment summaries.

## Additional Features

- **Extras:**
  - **Function:** The **Refresh Daily Rate** function updates the materialized view used in a client application.
  
- **Add Late Entries:**
  - **Function:** Quickly add entries if they need to be recorded after other transport rates have been applied.

---

If you have any questions or need clarification on any features, feel free to reach out. We’re here to help you make valuable contributions!
