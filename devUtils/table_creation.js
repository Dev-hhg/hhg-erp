const runQuery = require("./runquery");
function createFarmerTable() {
  const createFarmerTableQuery = `
    CREATE TABLE IF NOT EXISTS farmers (
      farmerId SERIAL PRIMARY KEY,
      farmerName VARCHAR(155) NOT NULL,
      uid VARCHAR(5) NOT NULL,
      mobileNumber VARCHAR(10) NOT NULL,
      farmerAddress VARCHAR(155),
     lastUpdated TIMESTAMP WITH TIME ZONE DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP;
     dateJoined DATE NOT NULL DEFAULT CURRENT_DATE,
      status VARCHAR(10) CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active';
  );
`;
  runQuery(createFarmerTableQuery);
}

function createEntryTable() {
  const createEntryTableQuery = `
  CREATE TABLE IF NOT EXISTS entry (
    transactionId SERIAL PRIMARY KEY,
    farmerId INT NOT NULL,
    vendorName VARCHAR(30) NOT NULL,
    item VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    weight INT NOT NULL,
    transportRate INT,
    date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (farmerId) REFERENCES farmers(farmerId),
    postDated BOOLEAN DEFAULT false,
 edited BOOLEAN DEFAULT false,
transporterName VARCHAR(100);
);
  
`;
  runQuery(createEntryTableQuery);
}
// createEntryTable();

function createFarmerPaymentTable() {
  const createFarmerPaymentTableQuery = `
    CREATE TABLE IF NOT EXISTS farmerpayments (
      farmerPaymentId SERIAL PRIMARY KEY,
      farmerId INT NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(30) NOT NULL,
      amount INT NOT NULL,
      description VARCHAR(155),
      FOREIGN KEY (farmerId) REFERENCES farmers(farmerId)
  );

`;
  runQuery(createFarmerPaymentTableQuery);
}

// create deletedfarmer table
function createDeletedFarmerTable() {
  const createDeletedFarmerTableQuery = `
    CREATE TABLE IF NOT EXISTS deletedfarmers (
      farmerId INT NOT NULL,
      farmerName VARCHAR(155) NOT NULL,
      uid VARCHAR(5) NOT NULL,
      mobileNumber VARCHAR(10) NOT NULL,
      farmerAddress VARCHAR(155),
      reason VARCHAR(155),
      deletedOn DATE DEFAULT CURRENT_DATE,
      time TIME DEFAULT CURRENT_TIME
  );
`;
  runQuery(createDeletedFarmerTableQuery);
}

// create deletedentry table
function createDeletedEntryTable() {
  const createDeletedEntryTableQuery = `
    CREATE TABLE IF NOT EXISTS deletedentry (
      transactionId INT NOT NULL,
      farmerId INT NOT NULL,
      vendorName VARCHAR(30) NOT NULL,
      item VARCHAR(20) NOT NULL,
      quantity INT NOT NULL,
      weight INT NOT NULL,
      transportRate INT,
      date DATE DEFAULT CURRENT_DATE,
      deletedOn DATE DEFAULT CURRENT_DATE,
      time TIME DEFAULT CURRENT_TIME
  );
`;
  runQuery(createDeletedEntryTableQuery);
}

function createItemsTable() {
  const createItemsTableQuery = `
  CREATE TABLE items (
    itemId SERIAL PRIMARY KEY,
    itemName VARCHAR(255) NOT NULL);
`;
  runQuery(createItemsTableQuery);
}

createItemsTable();
createFarmerTable();
createEntryTable();
createFarmerPaymentTable();
