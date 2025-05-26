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

// router.post("/transaction", async (req, res) => {
//   try {
//     const { bookingId, amount,status} = req.body;

   
//       await prisma.booking.updateMany({
//         where:{
//           bookingId: bookingId
//         },
//         data: {
//           Transactionstatus: status,
//         },
//       });
//     res.status(200).json({ success: true });
//   } catch (error) {
//     console.error("Transaction error:", error);
//     res.status(500).json({ error: "Failed to process transaction" });
//   }
// });

// Transaction handler endpoint
router.post("/transaction", async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    // Update booking status using SessionId (not bookingId)
    await prisma.booking.updateMany({
      where: {
        SessionId: bookingId, // Use SessionId as the field name
      },
      data: {
        Transactionstatus: status
      }
    });

    console.log(`Updated booking ${bookingId} to status: ${status}`);
    res.status(200).json({ 
      success: true, 
      message: `Booking status updated to ${status}` 
    });
    
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to update booking status" 
    });
  }
});

module.exports = router