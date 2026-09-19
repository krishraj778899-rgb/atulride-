const express = require("express");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Serve the existing AtulRide frontend from the same Render service.
app.use(express.static(path.join(__dirname, "..")));

const PORT = process.env.PORT || 5000;

// Cashfree environment
const CASHFREE_URL =
    process.env.CASHFREE_ENV === "production"
        ? "https://api.cashfree.com"
        : "https://sandbox.cashfree.com";


// ================= HOME =================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "AtulRide Backend is Running 🚗"
    });

});


// ================= USERS (SIGNUP / LOGIN) =================

app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, phone, password_hash)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, phone, created_at`,
            [name, email, phone || null, passwordHash]
        );

        res.status(201).json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// ================= VEHICLES =================

app.get("/api/vehicles", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM vehicles WHERE is_available = TRUE ORDER BY id"
        );
        res.json({ success: true, vehicles: result.rows });
    } catch (error) {
        console.error("Vehicles fetch error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post("/api/vehicles", async (req, res) => {
    try {
        const { name, description, emoji, price_per_day, price_per_hour } = req.body;

        if (!name || !price_per_day) {
            return res.status(400).json({
                success: false,
                message: "Name and price_per_day are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO vehicles (name, description, emoji, price_per_day, price_per_hour)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, description || null, emoji || "🚗", price_per_day, price_per_hour || null]
        );

        res.status(201).json({ success: true, vehicle: result.rows[0] });
    } catch (error) {
        console.error("Vehicle create error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// ================= BOOKINGS =================

app.get("/api/bookings", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT b.*, v.name AS vehicle_name
             FROM bookings b
             LEFT JOIN vehicles v ON b.vehicle_id = v.id
             ORDER BY b.created_at DESC`
        );
        res.json({ success: true, bookings: result.rows });
    } catch (error) {
        console.error("Bookings fetch error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// ================= FRONTEND =================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});


// ================= CREATE CASHFREE ORDER =================

app.post("/create-order", async (req, res) => {

    try {

        const {
            amount,
            customerName,
            customerPhone,
            customerEmail
        } = req.body;


        // Basic validation

        if (!amount) {

            return res.status(400).json({
                success: false,
                message: "Amount is required"
            });

        }


        if (!customerName || !customerPhone) {

            return res.status(400).json({
                success: false,
                message:
                    "Customer name and phone are required"
            });

        }


        // Create unique order ID

        const orderId =
            "AR_" +
            Date.now();


        // Cashfree order data

        const orderData = {

            order_id: orderId,

            order_amount:
                Number(amount),

            order_currency: "INR",

            customer_details: {

                customer_id:
                    "customer_" +
                    Date.now(),

                customer_name:
                    customerName,

                customer_phone:
                    customerPhone,

                customer_email:
                    customerEmail ||
                    "customer@atulride.com"

            },

            order_meta: {

                return_url:
                    `${process.env.PUBLIC_URL || "http://localhost:" + PORT}/success.html?order_id={order_id}`

            },

            order_note:
                "AtulRide Vehicle Rental Booking"

        };


        // Cashfree API request

        const response = await fetch(
            `${CASHFREE_URL}/pg/orders`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "x-api-version":
                        "2025-01-01",

                    "x-client-id":
                        process.env.CASHFREE_CLIENT_ID,

                    "x-client-secret":
                        process.env.CASHFREE_CLIENT_SECRET

                },

                body:
                    JSON.stringify(orderData)

            }
        );


        const data =
            await response.json();


        // Cashfree error

        if (!response.ok) {

            console.error(
                "Cashfree Error:",
                data
            );

            return res.status(
                response.status
            ).json({

                success: false,

                message:
                    "Cashfree order creation failed",

                error: data

            });

        }


        // Save booking to database

        try {

            await pool.query(
                `INSERT INTO bookings
                    (customer_name, customer_phone, customer_email, amount, order_id, payment_status)
                 VALUES ($1, $2, $3, $4, $5, 'pending')`,
                [customerName, customerPhone, customerEmail || null, Number(amount), orderId]
            );

        } catch (dbError) {

            console.error("Booking save error:", dbError);
            // Don't fail the payment flow if DB save fails — order already created with Cashfree

        }


        // Success

        res.json({

            success: true,

            orderId:
                data.order_id,

            paymentSessionId:
                data.payment_session_id

        });

    }


    catch (error) {

        console.error(
            "Server Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

});


// ================= SERVER =================

app.listen(
    PORT,
    () => {

        console.log(
            `AtulRide backend running on http://localhost:${PORT}`
        );

    }
);