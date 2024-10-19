// const runQuery = require("./runquery");

// // update vendor table
// async function updateVendor() {
// 	const updateVendorQuery = `
//     UPDATE Vendor
//     SET galanumber = $2
//     WHERE vendorid = $1;
//     `;
// 	const values = [23, "चाकण"];
// 	await runQuery(updateVendorQuery, values);
// 	console.log("updated");
// }

// updateVendor();

// see all the entries in Entry table
// const runQuery = require("./runquery");
// async function getEntries() {
// 	const getDataQuery = `
//         SELECT date, vendorName, item, quantity, weight, payable
//         FROM Entry
//         LEFT OUTER JOIN vendorMemo ON Entry.transactionid = vendorMemo.entryid
// 		WHERE Entry.farmerName = 'john doe';

//     `;
// 	const result = await runQuery(getDataQuery);
// 	console.log(result);
// }

//update refund taable to add a new field vmdata boolean default false
// const runQuery = require("./runquery");
// async function updateRefund() {
// 	const updateRefundQuery = `
//     ALTER TABLE Refund
//     ADD COLUMN vmdata boolean DEFAULT false;
//     `;
// 	await runQuery(updateRefundQuery);
// 	console.log("updated");
// }

// updateRefund();

// mark all the entries in refund table for vmdata true where date is less than 2024-01-04
const runQuery = require("./runquery");
async function updateRefund() {
	const updateRefundQuery = `
    UPDATE Refund
    SET vmdata = true
    WHERE date < '2024-01-03';
    `;
	await runQuery(updateRefundQuery);
	console.log("updated");
}

updateRefund();