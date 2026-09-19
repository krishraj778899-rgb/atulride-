// Run this ONCE to create tables and seed initial vehicles:
//   node init-db.js
// Safe to run again later — uses IF NOT EXISTS / ON CONFLICT so it won't duplicate data.

const pool = require("./db");

async function init() {
    try {
        console.log("Creating tables...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                phone VARCHAR(20),
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                description TEXT,
                emoji VARCHAR(10),
                price_per_day NUMERIC(10,2) NOT NULL,
                price_per_hour NUMERIC(10,2),
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
                customer_name VARCHAR(150) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_email VARCHAR(150),
                amount NUMERIC(10,2) NOT NULL,
                order_id VARCHAR(100) UNIQUE,
                payment_status VARCHAR(20) DEFAULT 'pending',
                booking_status VARCHAR(20) DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log("Tables created.");

        console.log("Seeding vehicles (if empty)...");

        const { rows } = await pool.query("SELECT COUNT(*) FROM vehicles");
        if (Number(rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO vehicles (name, description, emoji, price_per_day, price_per_hour) VALUES
                ('Maruti Swift', 'Comfortable & fuel efficient car', '🚗', 1200, 150),
                ('Hyundai Creta', 'Premium SUV for long journeys', '🚙', 2000, 250),
                ('Royal Enfield', 'Powerful bike for your trip', '🏍️', 900, 100),
                ('Honda Activa', 'Easy and affordable city ride', '🛵', 500, 60);
            `);
            console.log("Seeded 4 default vehicles.");
        } else {
            console.log("Vehicles table already has data, skipping seed.");
        }

        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error("Error initializing database:", err);
        process.exit(1);
    }
}

init();
