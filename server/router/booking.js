const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/post", async (req, res) => {
  const { filmId, customerName, customerEmail, seats, showTime, seatLength } =
    req.body;
  const film = await prisma.film.findUnique({
  where: { id: filmId },
  select: {ticketPrice: true },
});

if (!film) {
  return res.status(404).json({ error: "Film not found" });
}

const total = parseInt(seatLength) * film.ticketPrice;
  const result = await prisma.booking.create({
    data: {
      filmId,
      customerName,
      customerEmail,
      seats: seats,
      showTime,
      totalAmount:total,
      Bookingstatus,     
      Transactionstatus 
    },
  });
  res.json(result);
});

router.get("/fetchbookings", async (req, res) => {
  const bookingData = await prisma.booking.findMany({});
  res.json(bookingData);
});

module.exports = router;
