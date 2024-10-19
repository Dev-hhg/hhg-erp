const runQuery = require('./runquery');

function createVendorTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Vendor (
    vendorId SERIAL PRIMARY KEY,
    vendorName VARCHAR(30) NOT NULL,
    mobileNumber VARCHAR(10) NOT NULL,
    galanumber VARCHAR(30) NOT NULL DEFAULT 'NA' ,
    token_no VARCHAR(30) NOT NULL DEFAULT 'NA',
  );
`;
  runQuery(createTableQuery);
}

createVendorTable();
