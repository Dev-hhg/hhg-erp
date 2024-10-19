const runQuery = require("./runquery");

function createVegetableDetailsTable() {
	const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Vegtype (
    id SERIAL PRIMARY KEY,
    vegetableName VARCHAR(30) NOT NULL
  );
`;
	runQuery(createTableQuery);
}

createVegetableDetailsTable();