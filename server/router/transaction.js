const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const prisma = new PrismaClient();
dotenv.config();
const axios = require("axios");

const fetchPaymentMethod = async (paymentId) => {
  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/payments/${paymentId}`,
      {
        auth: {
          username: process.env.keyID,
          password: process.env.KeySecret,
        },
      }
    );
    const word  = response.data.method
    return word.toUpperCase();
  } catch (error) {
    return "Error fetching payment details:", error.response.data;
  }
};

router.post("/transaction", async (req, res) => {
  try {
    const { bookingId, amount, transactionId, status, razorpay_payment_id } = req.body;

    const paymentMethod = await fetchPaymentMethod(razorpay_payment_id);

   
      await prisma.transaction.create({
        data: {
          bookingId: bookingId,
          amount: amount,
          transactionId: transactionId,
          paymentMethod: paymentMethod,
          status: status,
        },
      });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: "Failed to process transaction" });
  }
});

module.exports = router