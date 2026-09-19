const { Pool } = require("pg");
require("dotenv").config();

// Neon requires SSL. connectionString comes from DATABASE_URL env var,
// which Neon gives you in the format:
// postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.on("error", (err) => {
    console.error("Unexpected database error:", err);
});

module.exports = pool;
