const express = require("express");
const Razorpay = require("razorpay");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const crypto = require("crypto");
const axios = require("axios");
const basicAuth = Buffer.from(`${process.env.keyID}:${process.env.KeySecret}`).toString('base64');

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();
async function refundPayment(paymentId, amount) {
  const response = await axios.post(
    `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
    {
      amount: amount
    },
    {
      headers: {
        Authorization: `Basic ${basicAuth}`
      }
    }
  );
  return response.data;
}

function isSignatureValid(reqBody, razorpaySignature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(reqBody))
    .digest("hex");

  return expectedSignature === razorpaySignature;
}

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

    if (!film) {
      return res.status(404).json({ error: "Film not found" });
    }

    const total = parseInt(seatLength) * film.ticketPrice;
    const amount = Math.round(parseFloat(total) * 100);

    const booking = await prisma.booking.create({
      data: {
        filmId,
        customerName,
        customerEmail,
        seats: JSON.stringify(seats),
        showTime,
        totalAmount: total,
        status: "PENDING",
      },
    });

    const bookingId = booking.id;
    console.log("✅ Created booking with ID:", bookingId);

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `bk_${bookingId.substring(0, 30)}`,
      notes: {
        bookingId: bookingId,
        customerName,
        customerEmail,
        seats: Array.isArray(seats) ? seats.join(",") : seats,
        showTime,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      bookingId: bookingId,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/webhook", async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];

  const isValid = isSignatureValid(
    req.body,
    signature,
    process.env.WEBHOOK_SECRET
  );
  if (!isValid) {
    console.log("⚠️ Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  // Valid signature
  const payload = req.body;
  // console.log("✅ Valid webhook received:", payload.event);
  if (payload.event === "payment.captured") {
    const payment = payload.payload.payment.entity;
    const bookingId = payment.notes.bookingId;
    const amount = payment.amount / 100;
    const transactionId = payment.order_id;
    const status = "PENDING";
    const razorpay_payment_id = payment.id;
    console.log(payment, bookingId);
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
        razorpay_payment_id,
      }),
    });
    res.status(200).send("OK");
  }
  if (payload.event === "order.paid") {
    const payment = payload.payload.payment.entity;
    const bookingId = payment.notes.bookingId;
    const amount = payment.amount / 100;
    const transactionId = payment.order_id;
    let status = "COMPLETED";
    const razorpay_payment_id = payment.id;
    console.log(payment, bookingId);
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
        razorpay_payment_id,
      }),
    });
    const data = await refundPayment(razorpay_payment_id,payment.amount)
    if(data){
      const status = "REFUNDED"
      const transactionId=data.id;
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
        razorpay_payment_id,
      })});
    }
  res.status(200);
  }

  if (payload.event === "payment.failed") {
    const payment = payload.payload.payment.entity;
    const bookingId = payment.notes.bookingId;
    const amount = payment.amount / 100;
    let transactionId = payment.order_id;
    const status = "FAILED";
    const razorpay_payment_id = payment.id;
    console.log(payment, bookingId);
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
        razorpay_payment_id,
      }),
    });
  res.status(200).send("OK");
  }
});

module.exports = router;
