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
    const sessions = await getAllSessions(cinemaId, filmId, selectedDate)
    const result = organizeBookingData(sessions, cinemaId, filmId, selectedDate, selectedTime);
    
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
      ScheduledFilmId: filmId,
      CinemaId: cinemaId
    },
    select: {
      ScreenName: true,
      SessionId: true
    }
  });
}
async function getAllSessions(cinemaId, filmId, selectedDate) {
  const filters = createDateFilter(selectedDate);
  if (cinemaId) {
    filters.CinemaId = cinemaId;
  }
  if (filmId) {
    filters.ScheduledFilmId = filmId;
  }

  return await prisma.session.findMany({
    where: filters,
    include: {
      film: true,
      cinema: true,
      filFormat: true
    },
    orderBy: {
      Showtime: 'asc'
    }
  });
}
function createDateFilter(selectedDate) {
  if (selectedDate) {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 1);
    
    return {
      Showtime: {
        gte: startDate.toISOString(),
        lt: endDate.toISOString()
      }
    };
  }
  return {
    Showtime: {
      gte: new Date().toISOString()
    }
  };
}
function organizeBookingData(sessions, cinemaId, filmId, selectedDate, selectedTime) {
  const result = {
    totalSessions: sessions.length,
    availableOptions: {},
    filteredData: {},
    summary: {},
    metadata: {
      filters: { cinemaId, filmId, selectedDate, selectedTime },
      timestamp: new Date().toISOString()
    }
  };
  result.availableOptions.cinemas = groupSessionsByCinema(sessions);
  result.availableOptions.films = groupSessionsByFilm(sessions);
  result.availableOptions.dates = groupSessionsByDate(sessions);
  result.filteredData = createFilteredData(sessions, cinemaId, filmId, selectedDate, result.availableOptions);
  
  result.summary = createSummary(result.availableOptions, sessions.length, cinemaId, filmId, selectedDate);
  
  return result;
}

function groupSessionsByCinema(sessions) {
  const cinemaGroups = new Map();
  
  sessions.forEach(session => {
    const cinemaId = session.CinemaId;
    if (!cinemaGroups.has(cinemaId)) {
      cinemaGroups.set(cinemaId, {
        ...session.cinema,
        sessionCount: 0,
        films: new Set(),
        dates: new Set(),
        showtimes: []
      });
    }
    const cinema = cinemaGroups.get(cinemaId);
    cinema.sessionCount++;
    cinema.films.add(session.ScheduledFilmId);
    cinema.dates.add(getDateString(session.Showtime));
    cinema.showtimes.push({
      time: session.Showtime,
      filmId: session.ScheduledFilmId,
      filmTitle: session.film.Title,
      screen: session.ScreenName,
      sessionId: session.SessionId,
      format: session.filFormat
    });
  });
  
  return Array.from(cinemaGroups.values()).map(cinema => ({
    ...cinema,
    films: Array.from(cinema.films),
    dates: Array.from(cinema.dates),
    totalFilms: cinema.films.size,
    totalDates: cinema.dates.size
  }));
}
function groupSessionsByFilm(sessions) {
  const filmGroups = new Map();
  
  sessions.forEach(session => {
    const filmId = session.ScheduledFilmId;
    if (!filmGroups.has(filmId)) {
      filmGroups.set(filmId, {
        ...session.film,
        sessionCount: 0,
        cinemas: new Set(),
        dates: new Set(),
        showtimes: []
      });
    }
    const film = filmGroups.get(filmId);
    film.sessionCount++;
    film.cinemas.add(session.CinemaId);
    film.dates.add(getDateString(session.Showtime));
    film.showtimes.push({
      time: session.Showtime,
      cinemaId: session.CinemaId,
      cinemaName: session.cinema.Name,
      screen: session.ScreenName,
      sessionId: session.SessionId,
      format: session.filFormat
    });
  });
  return Array.from(filmGroups.values()).map(film => ({
    ...film,
    cinemas: Array.from(film.cinemas),
    dates: Array.from(film.dates),
    totalCinemas: film.cinemas.size,
    totalDates: film.dates.size
  }));
}
function groupSessionsByDate(sessions) {
  const dateGroups = new Map();
  
  sessions.forEach(session => {
    const dateString = getDateString(session.Showtime);
    if (!dateGroups.has(dateString)) {
      dateGroups.set(dateString, {
        date: dateString,
        sessionCount: 0,
        cinemas: new Set(),
        films: new Set(),
        showtimes: []
      });
    }
    const date = dateGroups.get(dateString);
    date.sessionCount++;
    date.cinemas.add(session.CinemaId);
    date.films.add(session.ScheduledFilmId);
    date.showtimes.push({
      time: session.Showtime,
      cinemaId: session.CinemaId,
      cinemaName: session.cinema.Name,
      filmId: session.ScheduledFilmId,
      filmTitle: session.film.Title,
      screen: session.ScreenName,
      sessionId: session.SessionId
    });
  });
  return Array.from(dateGroups.values()).map(date => ({
    ...date,
    cinemas: Array.from(date.cinemas),
    films: Array.from(date.films),
    totalCinemas: date.cinemas.size,
    totalFilms: date.films.size
  }));
}
function createFilteredData(sessions, cinemaId, filmId, selectedDate, availableOptions) {
  const filteredData = {};
  if (cinemaId && filmId && selectedDate) {
    filteredData.availableTimes = sessions.map(session => ({
      time: session.Showtime,
      sessionId: session.SessionId,
      screen: session.ScreenName,
      format: session.filFormat
    }));
  }
  if (selectedDate && cinemaId && !filmId) {
    filteredData.moviesAtCinemaOnDate = availableOptions.films;
  }
  if (selectedDate && filmId && !cinemaId) {
    filteredData.cinemasShowingMovieOnDate = availableOptions.cinemas;
  }
  if (cinemaId && filmId && !selectedDate) {
    filteredData.availableDatesForMovieAtCinema = availableOptions.dates;
  }
  
  return filteredData;
}
function createSummary(availableOptions, totalSessions, cinemaId, filmId, selectedDate) {
  return {
    totalCinemas: availableOptions.cinemas.length,
    totalFilms: availableOptions.films.length,
    totalDates: availableOptions.dates.length,
    totalSessions: totalSessions,
    hasFilters: !!(cinemaId || filmId || selectedDate)
  };
}
function getDateString(datetime) {
  return new Date(datetime).toISOString().split('T')[0];
}

module.exports = router;