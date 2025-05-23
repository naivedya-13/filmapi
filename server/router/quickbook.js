const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();
router.get("/fetch-filmss", async (req, res) => {
  try {
    const { CinemaID } = req.query;
    const now = new Date().toISOString();
    const films = await prisma.session.findMany({
      where: {
        Showtime: {
          gte: now,
        },
        CinemaId: CinemaID,  
      },
      include: {
        film: true,
        filFormat: true,
      },
    });
    res.setHeader('Content-Type', 'application/json');
    console.log(films);
    res.status(200).json(films);
  } catch (error) {
    console.error("Error fetching films with sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/fetch-showtimes", async (req, res) => {
  try {
    const { FilmID } = req.query;
    const now = new Date().toISOString();
    const showtimes = await prisma.session.findMany({
      where: {
        Showtime: {
          gte: now,
        },
        ScheduledFilmId: FilmID,  
      },
    });
    res.setHeader('Content-Type', 'application/json');
    console.log(showtimes);
    res.status(200).json(showtimes);
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
});

router.get("/fetch-dates", async (req, res) => {
  try {
    const { selectedDate,nextDate,filmId } = req.query;
    const now = new Date().toISOString();
    const showtimes = await prisma.session.findMany({
      where: {
        Showtime: {
          gte: selectedDate,
          lt: nextDate
        },
        ScheduledFilmId: filmId,  
      },
    });
    res.setHeader('Content-Type', 'application/json');
    console.log(showtimes);
    res.status(200).json(showtimes);
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
});
router.get("/fetch-session", async (req, res) => {
  try {
    const { selectedTime,cinemaId,filmId } = req.query;
    const showtimes = await prisma.session.findMany({
      where: {
        Showtime: selectedTime,
        ScheduledFilmId: filmId,  
        CinemaId : cinemaId

      },
      select:{
        ScreenName:true,
        SessionId:true
      }
    });
    res.setHeader('Content-Type', 'application/json');
    console.log(showtimes);
    res.status(200).json(showtimes);
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
});

module.exports = router;
