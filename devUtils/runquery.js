const { Pool } = require("pg");
require("dotenv").config();

// async function runQuery(query) {
// 	try {
// 		const connectionString = process.env.NEON;

// 		const pool = new Pool({
// 			connectionString: connectionString,
// 		});
// 		const client = await pool.connect();
// 		await client.query(query);
// 		client.release();
// 		console.log("Table created successfully");
// 		process.exit(0);
// 	} catch (err) {
// 		console.error("Error creating table:", err);
// 	}
// }
async function runQuery(query, values) {
	const connectionString = process.env.NEON_V2;

	const pool = new Pool({
		connectionString: connectionString,
	});

	try {
		const client = await pool.connect();
		const result = await client.query(query, values);
		client.release();
		console.log("Query executed successfully:\n", query, values);
		return result.rows;
	} catch (err) {
		console.error("Error executing query:", err);
		throw err;
	}
}
module.exports = runQuery;
