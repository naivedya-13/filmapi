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

    const currentTime = new Date().toISOString();
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

    const paramOrder = [];
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    
    for (const [key, value] of urlParams.entries()) {
      if (key === 'filmId' && value) paramOrder.push({ field: 'film', value, type: 'ScheduledFilmId' });
      if (key === 'cinemaId' && value) paramOrder.push({ field: 'cinema', value, type: 'CinemaId' });
      if (key === 'selectedDate' && value) paramOrder.push({ field: 'date', value, type: 'Showtime' });
    }

    let filteredSessions = futureSessions;
    const appliedFilters = {};
    
    for (let i = 0; i < paramOrder.length; i++) {
      const { field, value, type } = paramOrder[i];
      
      if (type === 'Showtime') {
        filteredSessions = filteredSessions.filter(session => {
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
        appliedFilters.date = value;
      } else if (type === 'CinemaId') {
        filteredSessions = filteredSessions.filter(session => 
          session.CinemaId.toString() === value.toString()
        );
        appliedFilters.cinema = value;
      } else if (type === 'ScheduledFilmId') {
        filteredSessions = filteredSessions.filter(session => 
          session.ScheduledFilmId.toString() === value.toString()
        );
        appliedFilters.film = value;
      }
    }

    const result = organizeFilteredData(filteredSessions, futureSessions, appliedFilters, paramOrder);
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
      CinemaId: cinemaId,
    },
    select: {
      ScreenNumber: true,
      SessionId: true,
    },
  });
}

function organizeInitialData(sessions) {
  return {
    data: {
      cinemas: groupSessionsByCinema(sessions),
      movies: groupSessionsByFilm(sessions),
      dates: getUniqueDates(sessions),
      experience: groupSessionsByFilmformat(sessions),
      sessions: groupSessionsByDate(sessions),
    }
  };
}

function organizeFilteredData(filteredSessions, allSessions, appliedFilters, paramOrder) {
  const result = { data: {} };

  const allCinemas = groupSessionsByCinema(allSessions);
  const allMovies = groupSessionsByFilm(allSessions);
  const allDates = getUniqueDates(allSessions);

  const hasFilmFilter = !!appliedFilters.film;
  const hasCinemaFilter = !!appliedFilters.cinema;
  const hasDateFilter = !!appliedFilters.date;

  const filmPriority = paramOrder.findIndex(p => p.field === 'film');
  const cinemaPriority = paramOrder.findIndex(p => p.field === 'cinema');
  const datePriority = paramOrder.findIndex(p => p.field === 'date');

  let availableCinemas = allCinemas;
  let availableMovies = allMovies;
  let availableDates = allDates;

  if (hasCinemaFilter && (cinemaPriority > 0)) {
    let cinemaFilterSessions = allSessions;
    
    if (hasFilmFilter && filmPriority < cinemaPriority) {
      cinemaFilterSessions = cinemaFilterSessions.filter(session => 
        session.ScheduledFilmId.toString() === appliedFilters.film.toString()
      );
    }
    
    if (hasDateFilter && datePriority < cinemaPriority) {
      cinemaFilterSessions = cinemaFilterSessions.filter(session => {
        if (!session.Showtime) return false;
        try {
          const sessionDate = new Date(session.Showtime);
          const selectedDateObj = new Date(appliedFilters.date);
          if (isNaN(selectedDateObj.getTime())) return false;
          return sessionDate.toDateString() === selectedDateObj.toDateString();
        } catch {
          return false;
        }
      });
    }
    
    availableCinemas = groupSessionsByCinema(cinemaFilterSessions);
  }

  if (hasFilmFilter && (filmPriority > 0)) {
    let movieFilterSessions = allSessions;
    
    if (hasCinemaFilter && cinemaPriority < filmPriority) {
      movieFilterSessions = movieFilterSessions.filter(session => 
        session.CinemaId.toString() === appliedFilters.cinema.toString()
      );
    }
    
    if (hasDateFilter && datePriority < filmPriority) {
      movieFilterSessions = movieFilterSessions.filter(session => {
        if (!session.Showtime) return false;
        try {
          const sessionDate = new Date(session.Showtime);
          const selectedDateObj = new Date(appliedFilters.date);
          if (isNaN(selectedDateObj.getTime())) return false;
          return sessionDate.toDateString() === selectedDateObj.toDateString();
        } catch {
          return false;
        }
      });
    }
    
    availableMovies = groupSessionsByFilm(movieFilterSessions);
  }

  if (hasDateFilter && (datePriority > 0)) {
    let dateFilterSessions = allSessions;
    
    if (hasCinemaFilter && cinemaPriority < datePriority) {
      dateFilterSessions = dateFilterSessions.filter(session => 
        session.CinemaId.toString() === appliedFilters.cinema.toString()
      );
    }
    
    if (hasFilmFilter && filmPriority < datePriority) {
      dateFilterSessions = dateFilterSessions.filter(session => 
        session.ScheduledFilmId.toString() === appliedFilters.film.toString()
      );
    }
    
    availableDates = getUniqueDates(dateFilterSessions);
  }

  result.data.cinemas = availableCinemas;
  result.data.movies = availableMovies;
  result.data.dates = availableDates;

  if (hasFilmFilter && hasCinemaFilter && hasDateFilter) {
    result.data.sessions = groupSessionsByDate(filteredSessions);
  } else {
    result.data.sessions = {};
  }

  return result;
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

function groupSessionsByFilmformat(sessions) {
  const formatMap = new Map();
  
  sessions.forEach(session => {
    if (session.filFormat && !formatMap.has(session.FormatCode)) {
      formatMap.set(session.FormatCode, {
        format_id: session.FormatCode,
        format_name: session.filFormat.name,
        format_short_name: session.filFormat.shortName || '',
      });
    }
  });
  
  return Array.from(formatMap.values());
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