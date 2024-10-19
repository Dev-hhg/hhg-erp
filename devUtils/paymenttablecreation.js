const runQuery = require('./runquery');
function createPaymentTable() {
  const createPaymentTableQuery = `
CREATE TABLE payment (
    paymentId SERIAL PRIMARY KEY,
    vendorName VARCHAR(30) NOT NULL,
    received INT Default 0,
    date DATE NOT NULL,
    modeofpayment VARCHAR(255) Default NULL
);
`;
  runQuery(createPaymentTableQuery);
}
createPaymentTable();
