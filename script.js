// ==========================================
// ATULRIDE - COMPLETE SCRIPT
// ==========================================


// ==========================================
// VEHICLE BOOKING
// ==========================================

function bookVehicle(vehicleName, price) {

    localStorage.setItem(
        "selectedVehicle",
        vehicleName
    );

    localStorage.setItem(
        "vehiclePrice",
        price
    );

    window.location.href =
        "booking.html";
}


// ==========================================
// BOOKING PAGE ELEMENTS
// ==========================================

const vehicleElement =
    document.getElementById("vehicle");

const rentalType =
    document.getElementById("rentalType");

const pickup =
    document.getElementById("pickup");

const pickupTime =
    document.getElementById("pickupTime");

const returnDate =
    document.getElementById("return");

const returnTime =
    document.getElementById("returnTime");

const rcNumber =
    document.getElementById("rcNumber");

const total =
    document.getElementById("total");

const daysText =
    document.getElementById("daysText");

const bookingForm =
    document.getElementById("bookingForm");


// ==========================================
// CALCULATE RENT
// ==========================================

function calculateRent() {

    if (
        !vehicleElement ||
        !rentalType ||
        !pickup ||
        !pickupTime ||
        !returnDate ||
        !returnTime ||
        !total ||
        !daysText
    ) {
        return;
    }


    // Check required fields
    if (
        vehicleElement.value === "" ||
        rentalType.value === "" ||
        pickup.value === "" ||
        pickupTime.value === "" ||
        returnDate.value === "" ||
        returnTime.value === ""
    ) {

        total.innerText = "0";

        daysText.innerText =
            "Select vehicle, rental type and dates.";

        return;
    }


    // Create pickup and return date/time
    const start =
        new Date(
            pickup.value +
            "T" +
            pickupTime.value
        );

    const end =
        new Date(
            returnDate.value +
            "T" +
            returnTime.value
        );


    // Difference in milliseconds
    const difference =
        end.getTime() -
        start.getTime();


    // ======================================
    // INVALID DATE/TIME
    // ======================================

    if (difference <= 0) {

        total.innerText = "0";

        daysText.innerText =
            "Return date/time must be after pickup.";

        return;
    }


    // ======================================
    // HOURLY RENTAL
    // ======================================

    if (
        rentalType.value === "hour"
    ) {

        const hours =
            Math.ceil(
                difference /
                (1000 * 60 * 60)
            );


        const selectedOption =
            vehicleElement.options[
                vehicleElement.selectedIndex
            ];


        const hourlyPrice =
            Number(
                selectedOption.dataset.hourly
            );


        const totalPrice =
            hours * hourlyPrice;


        total.innerText =
            totalPrice.toLocaleString(
                "en-IN"
            );


        daysText.innerText =
            hours +
            " hour(s) × ₹" +
            hourlyPrice.toLocaleString(
                "en-IN"
            ) +
            " per hour";


        return;
    }


    // ======================================
    // FULL DAY RENTAL
    // ======================================

    if (
        rentalType.value === "day"
    ) {

        /*
            Calculate exact duration in hours.
            Then round up to the next full 24-hour
            rental period.
        */

        const totalHours =
            difference /
            (1000 * 60 * 60);


        const days =
            Math.ceil(
                totalHours / 24
            );


        const pricePerDay =
            Number(
                vehicleElement.value
            );


        const totalPrice =
            days *
            pricePerDay;


        total.innerText =
            totalPrice.toLocaleString(
                "en-IN"
            );


        daysText.innerText =
            days +
            " day(s) × ₹" +
            pricePerDay.toLocaleString(
                "en-IN"
            ) +
            " per day";


        return;
    }
}


// ==========================================
// LOAD SELECTED VEHICLE
// ==========================================

if (vehicleElement) {

    const selectedVehicle =
        localStorage.getItem(
            "selectedVehicle"
        );

    const selectedPrice =
        localStorage.getItem(
            "vehiclePrice"
        );


    if (
        selectedVehicle &&
        selectedPrice
    ) {

        for (
            let option of vehicleElement.options
        ) {

            if (
                option.textContent.includes(
                    selectedVehicle
                )
            ) {

                vehicleElement.value =
                    selectedPrice;

                break;
            }
        }
    }


    vehicleElement.addEventListener(
        "change",
        calculateRent
    );
}


// ==========================================
// RENTAL TYPE
// ==========================================

if (rentalType) {

    rentalType.addEventListener(
        "change",
        calculateRent
    );
}


// ==========================================
// DATE & TIME
// ==========================================

if (pickup) {

    pickup.addEventListener(
        "change",
        calculateRent
    );
}


if (pickupTime) {

    pickupTime.addEventListener(
        "change",
        calculateRent
    );
}


if (returnDate) {

    returnDate.addEventListener(
        "change",
        calculateRent
    );
}


if (returnTime) {

    returnTime.addEventListener(
        "change",
        calculateRent
    );
}


// ==========================================
// CONFIRM BOOKING
// ==========================================

if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (
                !total ||
                total.innerText === "0"
            ) {

                alert(
                    "Please select valid vehicle, rental type and dates."
                );

                return;
            }


            const customerName =
                document.getElementById(
                    "name"
                ).value;


            const mobile =
                document.getElementById(
                    "mobile"
                ).value;


            // Save customer details
            localStorage.setItem(
                "customerName",
                customerName
            );

            localStorage.setItem(
                "mobile",
                mobile
            );


            // Save RC
            if (rcNumber) {

                localStorage.setItem(
                    "rcNumber",
                    rcNumber.value
                );
            }


            // Save total
            localStorage.setItem(
                "bookingTotal",
                total.innerText
            );


            // Save vehicle
            localStorage.setItem(
                "bookingVehicle",
                vehicleElement.options[
                    vehicleElement.selectedIndex
                ].text
            );


            // Save rental type
            localStorage.setItem(
                "rentalType",
                rentalType.value
            );


            // Save pickup
            localStorage.setItem(
                "pickupDate",
                pickup.value
            );

            localStorage.setItem(
                "pickupTime",
                pickupTime.value
            );


            // Save return
            localStorage.setItem(
                "returnDate",
                returnDate.value
            );

            localStorage.setItem(
                "returnTime",
                returnTime.value
            );


            // Go to payment
            window.location.href =
                "payment.html";

        }
    );
}


// ==========================================
// PAYMENT PAGE
// ==========================================

const paymentAmount =
    document.getElementById(
        "paymentAmount"
    );

const summaryAmount =
    document.getElementById(
        "summaryAmount"
    );

const summaryVehicle =
    document.getElementById(
        "summaryVehicle"
    );

const summaryPickup =
    document.getElementById(
        "summaryPickup"
    );

const summaryReturn =
    document.getElementById(
        "summaryReturn"
    );


// Payment amount
if (paymentAmount) {

    paymentAmount.innerText =
        localStorage.getItem(
            "bookingTotal"
        ) || "0";
}


// Summary amount
if (summaryAmount) {

    summaryAmount.innerText =
        localStorage.getItem(
            "bookingTotal"
        ) || "0";
}


// Summary vehicle
if (summaryVehicle) {

    summaryVehicle.innerText =
        localStorage.getItem(
            "bookingVehicle"
        ) || "Not Selected";
}


// Summary pickup
if (summaryPickup) {

    summaryPickup.innerText =
        localStorage.getItem(
            "pickupDate"
        ) || "-";
}


// Summary return
if (summaryReturn) {

    summaryReturn.innerText =
        localStorage.getItem(
            "returnDate"
        ) || "-";
}


// ==========================================
// SUCCESS PAGE
// ==========================================

const successVehicle =
    document.getElementById(
        "successVehicle"
    );

const successPickup =
    document.getElementById(
        "successPickup"
    );

const successReturn =
    document.getElementById(
        "successReturn"
    );

const successPayment =
    document.getElementById(
        "successPayment"
    );

const successAmount =
    document.getElementById(
        "successAmount"
    );

const successRC =
    document.getElementById(
        "successRC"
    );


// Success vehicle
if (successVehicle) {

    successVehicle.innerText =
        localStorage.getItem(
            "bookingVehicle"
        ) || "-";
}


// Success pickup
if (successPickup) {

    successPickup.innerText =
        localStorage.getItem(
            "pickupDate"
        ) || "-";
}


// Success return
if (successReturn) {

    successReturn.innerText =
        localStorage.getItem(
            "returnDate"
        ) || "-";
}


// Success payment
if (successPayment) {

    successPayment.innerText =
        localStorage.getItem(
            "paymentMethod"
        ) || "-";
}


// Success amount
if (successAmount) {

    successAmount.innerText =
        localStorage.getItem(
            "bookingTotal"
        ) || "0";
}


// Success RC
if (successRC) {

    successRC.innerText =
        localStorage.getItem(
            "rcNumber"
        ) || "-";
}