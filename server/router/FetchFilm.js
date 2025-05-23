
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.post('/bookings', async (req, res) => {
  try {
    const { sessionId, filmId, seats, cinemaId, showtime, price } = req.body;

    // Validate input
    if (!sessionId || !filmId || !seats || !cinemaId || !showtime || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if seats are available
    const session = await prisma.session.findUnique({
      where: { SessionId: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.SeatsAvailable < seats) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        sessionId,
        filmId,
        cinemaId,
        seats,
        totalPrice: price * seats,
        showtime: new Date(showtime),
        status: 'CONFIRMED',
      },
    });

    // Update available seats
    await prisma.session.update({
      where: { SessionId: sessionId },
      data: {
        SeatsAvailable: {
          decrement: seats,
        },
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
});
router.get("/fetch-films", async (req, res) => {
  try {
    const now = new Date().toISOString();
    const films = await prisma.session.findMany({
      where: {
        Showtime: {
          gte: now,
        },
      },
      include: {
        film: true,
        filFormat:true,
      },
    });
    res.setHeader('Content-Type', 'application/json');
    console.log(films)
    res.status(200).json(films);
  } catch (error) {
    console.error("Error fetching films with sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect(); 
  }
});

router.get("/fetch-cinemas", async (req, res) => {
  try {
    const cinema = await prisma.cinema.findMany({
      select:{
        CinemaID:true,
        Name:true
      }
    });
    res.setHeader('Content-Type', 'application/json');
    console.log(cinema)
    res.status(200).json(cinema);
  } catch (error) {
    console.error("Error fetching cinema with sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect(); 
  }
});

module.exports = router;