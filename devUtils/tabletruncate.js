// truncate the Entry table
const runQuery = require("./runquery");
// function truncateEntryTable() {
// 	const truncateEntryTableQuery = `
//     TRUNCATE TABLE VendorMemo;
// `;
// 	runQuery(truncateEntryTableQuery);
// }

// truncateEntryTable();
//truncate the Vendor table
// const runQuery = require("./runquery");
// function truncateVendorTable() {
//   const truncateVendorTableQuery = `
//     TRUNCATE TABLE Vendor;
// `;
//   runQuery(truncateVendorTableQuery);
// }

//

function copyDbLocally() {
	const copyDbLocallyQuery = `
	\copy Entry TO 'C:\\Users\\kulde\\OneDrive\\Documents\\DB\\Entry.csv' DELIMITER ',' CSV HEADER;
`;
	runQuery(copyDbLocallyQuery);
}
copyDbLocally();
