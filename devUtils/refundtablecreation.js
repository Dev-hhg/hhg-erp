const runQuery = require("./runquery");

function createRefundTable() {
	const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Refund (
    id SERIAL PRIMARY KEY,
    vendorName VARCHAR(30) NOT NULL,
    date DATE NOT NULL,
    value INT DEFAULT 0,
    transporterName VARCHAR(30) NOT NULL,
    vehicleNo VARCHAR(30) NOT NULL,
    vmdata boolean DEFAULT false,
    printed BOOLEAN default false;
    PRIMARY KEY (vendorName, date),
    refundAdded TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
  );
`;
	runQuery(createTableQuery);
}

function createdeletedRefundTable() {
	const createTableQuery1 = `CREATE TABLE IF NOT EXISTS deletedRefundData (
    id SERIAL PRIMARY KEY,
    vendorName VARCHAR(30) NOT NULL,
    date DATE NOT NULL,
    value INT DEFAULT 0,
    transporterName VARCHAR(30) NOT NULL,
    vehicleNo VARCHAR(30) NOT NULL,
    vmdata BOOLEAN DEFAULT false,
    printed BOOLEAN DEFAULT false,
    deltedon VARCHAR(150) NOT NULL,
    PRIMARY KEY (vendorName, date)
);
`;
}
createRefundTable();

// alter table to add transporter varchar and vehicle no varchar
// const alterTableQuery = `
// ALTER TABLE Refund
// ADD COLUMN transporterName VARCHAR(30) NOT NULL,
// ADD COLUMN vehicalNo VARCHAR(30) NOT NULL;
// `;
