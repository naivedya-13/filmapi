const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();
const crypto = require("crypto")
dotenv.config();
let bookingId ,amount;

const razorpay = new Razorpay({
  key_id: process.env.keyID,
  key_secret: process.env.KeySecret,
});

router.post("/createpayment", async (req, res) => {
  try {
    const { filmId, customerName, customerEmail, seats, showTime, seatLength } =
      req.body;

    const film = await prisma.film.findUnique({
      where: { id: filmId },
      select: { ticketPrice: true },
    });

    const books = await prisma.booking.findFirst({
      where:{
        filmId:filmId,
        showTime:showTime
      }
    })
    bookingId = books.id

    if (!film) {
      return res.status(404).json({ error: "Film not found" });
    }

    const total = parseInt(seatLength) * film.ticketPrice;
    amount = Math.round(parseFloat(total) * 100);
    const bookingData = {
      filmId,
      customerName,
      customerEmail,
      seats,
      showTime,
      seatLength,
    };

    await fetch("http://localhost:3000/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
      notes: {
        customerName,
        customerEmail,
        seats: seats.join(","),
        showTime,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// router.post("/verifypayment", async (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const generated_signature = crypto.createHmac("sha256", process.env.KeySecret)
//         .update(razorpay_order_id + "|" + razorpay_payment_id)
//         .digest("hex");

//   transactionId = razorpay_payment_id
//   const status = "COMPLETED"
//     if (generated_signature === razorpay_signature) {
//         res.json({ success: true, payment_id: razorpay_payment_id });
//          await fetch("http://localhost:3000/transaction", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: {
//         bookingId, amount, transactionId, status, razorpay_payment_id
//       },
//     });

//     } else {
//         res.status(400).json({ success: false });
//         const status = "FAILED"
//                await fetch("http://localhost:3000/transaction", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: {
//         bookingId, amount, transactionId, status, razorpay_payment_id
//       },
//     });
//     }
// });

router.post("/verifypayment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated_signature = crypto.createHmac("sha256", process.env.KeySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const transactionId = razorpay_payment_id;
    let status = "COMPLETED";

    if (generated_signature === razorpay_signature) {
      await fetch("http://localhost:3000/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId, 
          amount, 
          transactionId, 
          status, 
          razorpay_payment_id
        }),
      });
      res.json({ success: true, payment_id: razorpay_payment_id });
    } else {
      status = "FAILED";
      await fetch("http://localhost:3000/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId, 
          amount, 
          transactionId, 
          status, 
          razorpay_payment_id
        }),
      });
      res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;
