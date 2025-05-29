
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get("/booking-data", async (req, res) => {
  try {
    const { cinemaId, filmId, selectedDate, selectedTime, action = 'get-options' } = req.query;

    if (action === 'get-session' && selectedTime && cinemaId && filmId) {
      const session = await getSpecificSession(cinemaId, filmId, selectedTime);
      return res.json(session);
    }

    const allSessions = await prisma.session.findMany({
      where: { 
        Showtime: { 
          not: null 
        }
      },
      include: {
        film: true,
        cinema: true,
        filFormat: true,
      },
      orderBy: { Showtime: 'asc' },
    });

    const futureSessions = allSessions.filter(session => {
      if (!session.Showtime) return false;
      try {
        const showDate = new Date(session.Showtime);
        return showDate >= new Date();
      } catch {
        return false;
      }
    });
    if (!cinemaId && !filmId && !selectedDate) {
      const result = organizeInitialData(futureSessions);
      return res.json(result);
    }

    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const paramOrder = [];
    
    for (const [key, value] of urlParams.entries()) {
      if (key === 'cinemaId' && value) {
        paramOrder.push({ field: 'cinema', value, type: 'CinemaId' });
      }
      if (key === 'filmId' && value) {
        paramOrder.push({ field: 'film', value, type: 'ScheduledFilmId' });
      }
      if (key === 'selectedDate' && value) {
        paramOrder.push({ field: 'date', value, type: 'Showtime' });
      }
    }

    const result = applyPriorityBasedFiltering(futureSessions, paramOrder);
    res.json(result);

  } catch (error) {
    console.error("Booking API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    await prisma.$disconnect();
  }
});

async function getSpecificSession(cinemaId, filmId, selectedTime) {
  return await prisma.session.findMany({
    where: {
      Showtime: selectedTime,
      ScheduledFilmId: parseInt(filmId),
      CinemaId: parseInt(cinemaId),
    },
    select: {
      ScreenNumber: true,
      SessionId: true,
    },
  });
}

function applyPriorityBasedFiltering(allSessions, paramOrder) {
  const availableOptions = {
    cinemas: [],
    movies: [],
    dates: [],
    sessions: {}
  };

  ['cinema', 'film', 'date'].forEach(fieldType => {
    const fieldIndex = paramOrder.findIndex(p => p.field === fieldType);
    let sessionsToFilter = allSessions;

    if (fieldIndex === -1) {
      paramOrder.forEach(({ field, value, type }) => {
        sessionsToFilter = applyFilter(sessionsToFilter, type, value);
      });
    } else {
      paramOrder.slice(0, fieldIndex).forEach(({ field, value, type }) => {
        sessionsToFilter = applyFilter(sessionsToFilter, type, value);
      });
    }
    if (fieldType === 'cinema') {
      availableOptions.cinemas = groupSessionsByCinema(sessionsToFilter);
    } else if (fieldType === 'film') {
      availableOptions.movies = groupSessionsByFilm(sessionsToFilter);
    } else if (fieldType === 'date') {
      availableOptions.dates = getUniqueDates(sessionsToFilter);
    }
  });
  const hasAllSelections = paramOrder.length === 3 && 
    paramOrder.some(p => p.field === 'cinema') &&
    paramOrder.some(p => p.field === 'film') &&
    paramOrder.some(p => p.field === 'date');

  if (hasAllSelections) {
    let finalSessions = allSessions;
    paramOrder.forEach(({ field, value, type }) => {
      finalSessions = applyFilter(finalSessions, type, value);
    });
    availableOptions.sessions = groupSessionsByDate(finalSessions);
  }

  return { data: availableOptions };
}

function applyFilter(sessions, type, value) {
  if (type === 'CinemaId') {
    return sessions.filter(session => session.CinemaId.toString() === value.toString());
  } else if (type === 'ScheduledFilmId') {
    return sessions.filter(session => session.ScheduledFilmId.toString() === value.toString());
  } else if (type === 'Showtime') {
    return sessions.filter(session => {
      if (!session.Showtime) return false;
      try {
        const sessionDate = new Date(session.Showtime);
        const selectedDateObj = new Date(value);
        if (isNaN(selectedDateObj.getTime())) return false;
        return sessionDate.toDateString() === selectedDateObj.toDateString();
      } catch {
        return false;
      }
    });
  }
  return sessions;
}

function organizeInitialData(sessions) {
  return {
    data: {
      cinemas: groupSessionsByCinema(sessions),
      movies: groupSessionsByFilm(sessions),
      dates: getUniqueDates(sessions),
      sessions: {},
    }
  };
}

function groupSessionsByCinema(sessions) {
  const cinemaMap = new Map();
  
  sessions.forEach(session => {
    if (!cinemaMap.has(session.CinemaId)) {
      cinemaMap.set(session.CinemaId, {
        id: session.CinemaId,
        name: session.cinema.Name || 'Unknown Cinema',
        nameAlt: session.cinema.NameAlt || '',
      });
    }
  });
  
  return Array.from(cinemaMap.values());
}

function groupSessionsByFilm(sessions) {
  const filmMap = new Map();
  
  sessions.forEach(session => {
    if (!filmMap.has(session.ScheduledFilmId)) {
      filmMap.set(session.ScheduledFilmId, {
        movie_id: session.ScheduledFilmId,
        movie_title: session.film.Title || 'Unknown Movie',
        rating: session.film.Rating || '',
        synopsis: session.film.Synopsis || '',
        runTime: session.film.RunTime || 0,
        ticketPrice: session.film.ticketPrice || 0,
        graphicUrl: session.film.GraphicUrl || '',
        isComingSoon: session.film.IsComingSoon || false,
      });
    }
  });
  
  return Array.from(filmMap.values());
}

function getUniqueDates(sessions) {
  const dateSet = new Set();
  
  sessions.forEach(session => {
    if (session.Showtime) {
      try {
        const date = new Date(session.Showtime);
        const dateString = date.toISOString().split('T')[0];
        dateSet.add(dateString);
      } catch {
      }
    }
  });
  
  return Array.from(dateSet).sort();
}

function groupSessionsByDate(sessions) {
  const dateMap = new Map();
  
  sessions.forEach(session => {
    if (session.Showtime) {
      try {
        const date = new Date(session.Showtime);
        const dateString = date.toISOString().split('T')[0];
        
        if (!dateMap.has(dateString)) {
          dateMap.set(dateString, []);
        }
        
        dateMap.get(dateString).push({
          session_id: session.SessionId,
          show_time: session.Showtime,
          screen_name: session.ScreenName,
          screen_number: session.ScreenNumber,
          cinema_name: session.cinema.Name,
          movie_title: session.film.Title,
          format_name: session.filFormat?.name || 'Standard',
          seats_available: session.SeatsAvailable || 0,
          minimum_price: session.MinimumTicketPriceInCents || 0,
        });
      } catch {
      }
    }
  });
  
  const result = {};
  dateMap.forEach((sessions, date) => {
    result[date] = sessions;
  });
  
  return result;
}

module.exports = router;