// see all the rows of the vendor table
const runQuery = require('./runquery');
// async function getVendors() {
// 	const getDataQuery = `SELECT * FROM Vendor;`;
// 	const result = await runQuery(getDataQuery);
// 	console.log(result);
// }

// getVendors();
//
// see all the entries in Entry table
// const runQuery = require("./runquery");
// async function getEntries() {
// 	const getDataQuery = `SELECT * FROM Entry;`;
// 	const result = await runQuery(getDataQuery);
// 	console.log(result);
// }

// getEntries();
//
// see all the entries in vendortable table
// const runQuery = require("./runquery");
// async function getVendorTable() {
// 	const getDataQuery = `SELECT * FROM Entry;`;
// 	const result = await runQuery(getDataQuery);
// 	console.log(result);
// }

// getVendorTable();

// see all the tables in database
// const runQuery = require("./runquery");
// async function getTables() {
// 	const getDataQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';`;
// 	const result = await runQuery(getDataQuery);
// 	console.log(result);
// }

// getTables();
//

// see all the entries in Entry table
// const runQuery = require("./runquery");
async function getEntries() {
  const getDataQuery = `
        SELECT date, vendorName, item, quantity, weight, payable
        FROM Entry
        LEFT OUTER JOIN vendorMemo ON Entry.transactionid = vendorMemo.entryid
		WHERE Entry.farmerName = 'john doe';

    `;
  const result = await runQuery(getDataQuery);
  console.log(result);
}

getEntries();
