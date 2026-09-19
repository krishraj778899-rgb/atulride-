const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Cashfree environment
const CASHFREE_URL =
    process.env.CASHFREE_ENV === "production"
        ? "https://api.cashfree.com"
        : "https://sandbox.cashfree.com";


// ================= HOME =================

app.get("/", (req, res) => {

    res.json({
        message: "AtulRide Backend is Running 🚗"
    });

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
                    "http://localhost:5500/success.html?order_id={order_id}"

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