const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
};

// Create connection pool
let pool;

exports.handler = async (event, context) => {
	// Enable connection reuse
	context.callbackWaitsForEmptyEventLoop = false;

	console.log("Event:", JSON.stringify(event));

	try {
		// Initialize pool if it doesn't exist
		if (!pool) {
			console.log("Creating connection pool");
			pool = await mysql.createPool(dbConfig);
		}

		// Extract visitor information
		const ip = event.requestContext?.identity?.sourceIp || "unknown";
		const userAgent = event.headers?.["User-Agent"] || "unknown";
		const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

		console.log(`Visitor: IP=${ip}, UA=${userAgent}, Date=${today}`);

		// Check if visitor exists today
		const [rows] = await pool.execute(
			"SELECT * FROM visitors WHERE ip_address = ? AND user_agent = ? AND visit_date = ?",
			[ip, userAgent, today]
		);

		let visitorCount;

		if (rows.length > 0) {
			console.log("Visitor already counted today");
			// Visitor already counted today, just get total count
			const [countResult] = await pool.execute(
				"SELECT COUNT(DISTINCT CONCAT(ip_address, user_agent, visit_date)) as count FROM visitors"
			);
			visitorCount = countResult[0].count;
		} else {
			console.log("New visitor today, inserting record");
			// New visitor today, insert record
			await pool.execute(
				"INSERT INTO visitors (ip_address, user_agent, visit_date) VALUES (?, ?, ?)",
				[ip, userAgent, today]
			);

			// Get updated count
			const [countResult] = await pool.execute(
				"SELECT COUNT(DISTINCT CONCAT(ip_address, user_agent, visit_date)) as count FROM visitors"
			);
			visitorCount = countResult[0].count;
		}

		console.log(`Visitor count: ${visitorCount}`);

		// Return response with CORS headers
		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*", // Allow any origin
				"Access-Control-Allow-Headers":
					"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
				"Access-Control-Allow-Methods": "GET,OPTIONS",
			},
			body: JSON.stringify({ visitorCount: visitorCount }),
		};
	} catch (error) {
		console.error("Error:", error);
		return {
			statusCode: 500,
			headers: {
				"Access-Control-Allow-Origin": "*", // Changed from 'https://www.peter-kvac.com' to '*'
				"Access-Control-Allow-Methods": "GET,OPTIONS",
				"Access-Control-Allow-Headers":
					"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
			},
			body: JSON.stringify({ error: "Failed to process request" }),
		};
	}
};
