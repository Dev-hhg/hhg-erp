const runQuery = require("./runquery");

function VendorMemo() {
	const createTableQuery = `
    CREATE TABLE IF NOT EXISTS VendorMemo (
    id SERIAL PRIMARY KEY,
    entryid INT NOT NULL,
    rate INT DEFAULT 0,
    commision INT DEFAULT 0,
    payable INT DEFAULT 0,
    paid BOOLEAN DEFAULT false,
    paidDate DATE
  );
`;
	runQuery(createTableQuery);
}

VendorMemo();
