const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const app = express();
app.use(express.json());
const router = express.Router();

router.get("/sessions", async (req, res) => {
  try {
    const { sessionId, scheduledFilmId, date, time, minSeats } = req.query;

    // Build filter object for Prisma
    const filters = {};
    if (sessionId) filters.sessionId = sessionId;
    if (scheduledFilmId) filters.scheduledFilmId = scheduledFilmId;
    
    // Add date filter if provided
    if (date) {
      // Create date objects for the start and end of the day
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      filters.showtime = {
        gte: startDate,
        lt: endDate
      };
    }
    
    // Add time filter if provided
    if (time) {
      // If a specific time is requested, we need to filter in memory
      // as Prisma doesn't have a time-only filter
      // We'll get all sessions and filter after
    }
    
    // Add seatsAvailable filter if provided
    if (minSeats) {
      filters.seatsAvailable = {
        gte: parseInt(minSeats, 10)
      };
    }

    // Fetch filtered sessions
    const sessions = await prisma.session.findMany({
      where: filters,
      orderBy: {
        showtime: 'asc'
      }
    });

    // Additional in-memory time filtering if needed
    let filteredSessions = sessions;
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      filteredSessions = sessions.filter(session => {
        const sessionTime = new Date(session.showtime);
        return sessionTime.getHours() === hours && sessionTime.getMinutes() === minutes;
      });
    }

    const films = await prisma.film.findMany();

    const result = filteredSessions.map((session) => {
      const rawScheduledFilmId = session.scheduledFilmId;
      const matchingFilm = films.find(
        (film) => String(film.id).trim() === rawScheduledFilmId
      );

      return {
        sessionId: session.sessionId,
        scheduledFilmId: rawScheduledFilmId,
        matchedFilmTitle: matchingFilm ? matchingFilm.title : "No match",
        showtime: session.showtime,
        seatsAvailable: session.seatsAvailable
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a new endpoint to get available filters for the frontend
router.get("/sessions/filters", async (req, res) => {
  try {
    // Get unique dates from sessions
    const sessions = await prisma.session.findMany({
      select: {
        showtime: true,
        scheduledFilmId: true,
        seatsAvailable: true
      }
    });
    
    // Get all films
    const films = await prisma.film.findMany({
      select: {
        id: true,
        title: true
      }
    });
    
    // Extract unique dates
    const dates = [...new Set(sessions.map(session => {
      const date = new Date(session.showtime);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }))].sort();
    
    // Extract unique times
    const times = [...new Set(sessions.map(session => {
      const date = new Date(session.showtime);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }))].sort();
    
    // Calculate min and max seats available
    const seatsRange = sessions.reduce((acc, session) => {
      return {
        min: Math.min(acc.min, session.seatsAvailable),
        max: Math.max(acc.max, session.seatsAvailable)
      };
    }, { min: Infinity, max: 0 });
    
    res.json({
      dates,
      times,
      films: films.map(film => ({ 
        id: film.id, 
        title: film.title 
      })),
      seatsRange
    });
    
  } catch (error) {
    console.error("Error fetching filter options:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;