const express = require("express")
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

 router.post(`/post`, async (req, res) => {
  const { filmId, customerName, customerEmail,seats,showTime,totalAmount} = req.body
  const result = await prisma.booking.create({
    data: {
      filmId,
       customerName,
       customerEmail,
        seats: {
      create: seats.map(seatNumber => ({
        seatNumber,
      })),
    },
       showTime,
       totalAmount,
    },include: {
    seats: true, 
  }
  })
  res.json(result)
})

module.exports = router;
