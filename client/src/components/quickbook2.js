// const express = require('express');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const router = express.Router();
// router.get("/fetch-filmss", async (req, res) => {
//   try {
//     const { CinemaID } = req.query;
//     const now = new Date().toISOString();
//     const films = await prisma.session.findMany({
//       where: {
//         Showtime: {
//           gte: now,
//         },
//         CinemaId: CinemaID,  
//       },
//       include: {
//         film: true,
//         filFormat: true,
//       },
//     });
//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json(films);
//   } catch (error) {
//     console.error("Error fetching films with sessions:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });
// router.get("/fetch-showtimes", async (req, res) => {
//   try {
//     const { FilmID } = req.query;
//     const now = new Date().toISOString();
//     const showtimes = await prisma.session.findMany({
//       where: {
//         Showtime: {
//           gte: now,
//         },
//         ScheduledFilmId: FilmID,  
//       },
//     });
//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json(showtimes);
//   } catch (error) {
//     console.error("Error fetching showtimes:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });
// router.get("/fetch-dates", async (req, res) => {
//   try {
//     const { selectedDate, nextDate, filmId } = req.query;
//     const showtimes = await prisma.session.findMany({
//       where: {
//         Showtime: {
//           gte: selectedDate,
//           lt: nextDate
//         },
//         ScheduledFilmId: filmId,  
//       },
//     });
//     res.setHeader('Content-Type', 'application/json');
//     console.log(showtimes);
//     res.status(200).json(showtimes);
//   } catch (error) {
//     console.error("Error fetching showtimes:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });
// router.get("/fetch-session", async (req, res) => {
//   try {
//     const { selectedTime, cinemaId, filmId } = req.query;
//     const session = await prisma.session.findMany({
//       where: {
//         Showtime: selectedTime,
//         ScheduledFilmId: filmId,  
//         CinemaId: cinemaId
//       },
//       select: {
//         ScreenName: true,
//         SessionId: true
//       }
//     });
//     res.setHeader('Content-Type', 'application/json');
//     console.log(session);
//     res.status(200).json(session);
//   } catch (error) {
//     console.error("Error fetching session:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });
// router.get("/fetch-by-date", async (req, res) => {
//   try {
//     const { selectedDate } = req.query;
    
//     if (!selectedDate) {
//       return res.status(400).json({ error: "selectedDate is required" });
//     }
//     const startDate = new Date(selectedDate);
//     const endDate = new Date(selectedDate);
//     endDate.setDate(endDate.getDate() + 1);
//     const sessions = await prisma.session.findMany({
//       where: {
//         Showtime: {
//           gte: startDate.toISOString(),
//           lt: endDate.toISOString()
//         }
//       },
//       include: {
//         film: true,
//         cinema: true,
//         filFormat: true
//       },
//       orderBy: {
//         Showtime: 'asc'
//       }
//     });
//     const movieMap = new Map();
//     const cinemaMap = new Map();

//     sessions.forEach(session => {
//       if (!movieMap.has(session.ScheduledFilmId)) {
//         movieMap.set(session.ScheduledFilmId, {
//           filmId: session.ScheduledFilmId,
//           film: session.film,
//           cinemas: new Set(),
//           showtimes: []
//         });
//       }
//       const movieData = movieMap.get(session.ScheduledFilmId);
//       movieData.cinemas.add(session.CinemaId);
//       movieData.showtimes.push({
//         time: session.Showtime,
//         cinema: session.cinema,
//         screen: session.ScreenName,
//         sessionId: session.SessionId
//       });
//       if (!cinemaMap.has(session.CinemaId)) {
//         cinemaMap.set(session.CinemaId, {
//           cinemaId: session.CinemaId,
//           cinema: session.cinema,
//           movies: new Set(),
//           showtimes: []
//         });
//       }
//       const cinemaData = cinemaMap.get(session.CinemaId);
//       cinemaData.movies.add(session.ScheduledFilmId);
//       cinemaData.showtimes.push({
//         time: session.Showtime,
//         film: session.film,
//         screen: session.ScreenName,
//         sessionId: session.SessionId
//       });
//     });
//     const movies = Array.from(movieMap.values()).map(movie => ({
//       ...movie,
//       cinemas: Array.from(movie.cinemas),
//       totalCinemas: movie.cinemas.size
//     }));

//     const cinemas = Array.from(cinemaMap.values()).map(cinema => ({
//       ...cinema,
//       movies: Array.from(cinema.movies),
//       totalMovies: cinema.movies.size
//     }));

//     const result = {
//       date: selectedDate,
//       totalSessions: sessions.length,
//       movies: movies,
//       cinemas: cinemas,
//       allSessions: sessions
//     };

//     res.setHeader('Content-Type', 'application/json');
//     // console.log(`Found ${sessions.length} sessions for ${selectedDate}`);
//     res.status(200).json(result);

//   } catch (error) {
//     console.error("Error fetching data by date:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });

// router.get("/fetch-cinemas-by-movie-date", async (req, res) => {
//   try {
//     const { movieId, selectedDate } = req.query;
    
//     if (!movieId || !selectedDate) {
//       return res.status(400).json({ error: "movieId and selectedDate are required" });
//     }

//     const startDate = new Date(selectedDate);
//     const endDate = new Date(selectedDate);
//     endDate.setDate(endDate.getDate() + 1);

//     const sessions = await prisma.session.findMany({
//       where: {
//         ScheduledFilmId: movieId,
//         Showtime: {
//           gte: startDate.toISOString(),
//           lt: endDate.toISOString()
//         }
//       },
//       include: {
//         cinema: true,
//         film: true
//       },
//       orderBy: {
//         Showtime: 'asc'
//       }
//     });
//     const cinemaMap = new Map();
//     sessions.forEach(session => {
//       if (!cinemaMap.has(session.CinemaId)) {
//         cinemaMap.set(session.CinemaId, {
//           cinema: session.cinema,
//           showtimes: []
//         });
//       }
//       cinemaMap.get(session.CinemaId).showtimes.push({
//         time: session.Showtime,
//         screen: session.ScreenName,
//         sessionId: session.SessionId
//       });
//     });

//     const result = {
//       movieId: movieId,
//       date: selectedDate,
//       cinemas: Array.from(cinemaMap.values())
//     };

//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json(result);

//   } catch (error) {
//     console.error("Error fetching cinemas by movie and date:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });
// router.get("/fetch-movies-by-cinema-date", async (req, res) => {
//   try {
//     const { cinemaId, selectedDate } = req.query;
    
//     if (!cinemaId || !selectedDate) {
//       return res.status(400).json({ error: "cinemaId and selectedDate are required" });
//     }

//     const startDate = new Date(selectedDate);
//     const endDate = new Date(selectedDate);
//     endDate.setDate(endDate.getDate() + 1);

//     const sessions = await prisma.session.findMany({
//       where: {
//         CinemaId: cinemaId,
//         Showtime: {
//           gte: startDate.toISOString(),
//           lt: endDate.toISOString()
//         }
//       },
//       include: {
//         film: true,
//         cinema: true,
//         filFormat: true
//       },
//       orderBy: {
//         Showtime: 'asc'
//       }
//     });
//     const movieMap = new Map();
//     sessions.forEach(session => {
//       if (!movieMap.has(session.ScheduledFilmId)) {
//         movieMap.set(session.ScheduledFilmId, {
//           film: session.film,
//           showtimes: []
//         });
//       }
//       movieMap.get(session.ScheduledFilmId).showtimes.push({
//         time: session.Showtime,
//         screen: session.ScreenName,
//         sessionId: session.SessionId,
//         format: session.filFormat
//       });
//     });

//     const result = {
//       cinemaId: cinemaId,
//       date: selectedDate,
//       movies: Array.from(movieMap.values())
//     };

//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json(result);

//   } catch (error) {
//     console.error("Error fetching movies by cinema and date:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });
// router.get("/fetch-all-dates", async (req, res) => {
//   try {
//     const now = new Date().toISOString();
//     const sessions = await prisma.session.findMany({
//       where: {
//         Showtime: {
//           gte: now,
//         },  
//       },
//       select: {
//         Showtime: true
//       },
//       orderBy: {
//         Showtime: 'asc'
//       }
//     });
//     const uniqueDates = [...new Set(
//       sessions.map(session => 
//         new Date(session.Showtime).toISOString().split('T')[0]
//       )
//     )];

//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json({ dates: uniqueDates });
//   } catch (error) {
//     console.error("Error fetching dates:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });
// router.get("/fetch-all-films", async (req, res) => {
//   try {
//     const now = new Date().toISOString();
//     const sessions = await prisma.session.findMany({
//       where: {
//         Showtime: {
//           gte: now,
//         },  
//       },
//       include: {
//         film: true
//       },
//       distinct: ['ScheduledFilmId']
//     });

//     const uniqueFilms = sessions.map(session => session.film);

//     res.setHeader('Content-Type', 'application/json');
//     res.status(200).json({ films: uniqueFilms });
//   } catch (error) {
//     console.error("Error fetching films:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     await prisma.$disconnect();
//   }
// });

// module.exports = router;






import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Calendar, Clock, ArrowRight } from "lucide-react";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (timeString) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Quickbook = () => {
  const navigate = useNavigate();
  const [cinemas, setCinemas] = useState([]);
  const [allFilms, setAllFilms] = useState([]);
  const [availableFilms, setAvailableFilms] = useState([]);
  const [allDates, setAllDates] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableCinemas, setAvailableCinemas] = useState([]);
  const [times, setTimes] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedFilm, setSelectedFilm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionIdd, setSessionIdd] = useState(null);
  const [screenNumber, setScreenNumber] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({
    cinemas: true,
    films: false,
    dates: false,
    times: false,
    session: false
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(prev => ({...prev, cinemas: true, films: true, dates: true}));
        const cinemasResponse = await fetch("http://localhost:3000/fetch-cinemas");
        if (cinemasResponse.ok) {
          const cinemasData = await cinemasResponse.json();
          setCinemas(cinemasData);
          setAvailableCinemas(cinemasData);
        }
        const filmsResponse = await fetch("http://localhost:3000/fetch-all-films");
        if (filmsResponse.ok) {
          const filmsData = await filmsResponse.json();
          setAllFilms(filmsData.films || filmsData);
          setAvailableFilms(filmsData.films || filmsData);
        }
        const datesResponse = await fetch("http://localhost:3000/fetch-all-dates");
        if (datesResponse.ok) {
          const datesData = await datesResponse.json();
          setAllDates(datesData.dates || []);
          setAvailableDates(datesData.dates || []);
        }

      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Unable to load initial data. Please try again.");
      } finally {
        setLoading(prev => ({...prev, cinemas: false, films: false, dates: false}));
      }
    };

    fetchInitialData();
  }, []);
  useEffect(() => {
    updateAvailableOptions();
  }, [selectedCinema, selectedFilm, selectedDate]);

  const updateAvailableOptions = async () => {
    setTimes([]);
    setSelectedTime("");
    setSessionIdd(null);
    setScreenNumber(null);
    setError(null);

    try {
      if (selectedDate && !selectedCinema && !selectedFilm) {
        const response = await fetch(`http://localhost:3000/fetch-by-date?selectedDate=${selectedDate}`);
        if (response.ok) {
          const data = await response.json();
          const availableMovies = data.movies.map(movie => movie.film);
          setAvailableFilms(availableMovies);
          const availableCinemasForDate = data.cinemas.map(cinema => cinema.cinema);
          setAvailableCinemas(availableCinemasForDate);
          
          console.log(`Found ${data.movies.length} movies and ${data.cinemas.length} cinemas for ${selectedDate}`);
        }
      }
      else if (selectedCinema && !selectedFilm && !selectedDate) {
        const response = await fetch(`http://localhost:3000/fetch-films?CinemaID=${selectedCinema}`);
        if (response.ok) {
          const data = await response.json();
          const uniqueFilms = Array.from(
            new Map(data.map(item => [item.film.FilmID, item.film])).values()
          );
          setAvailableFilms(uniqueFilms);
          setAvailableCinemas(cinemas); 
          const uniqueDates = [...new Set(
            data.map(item => new Date(item.Showtime).toISOString().split('T')[0])
          )];
          setAvailableDates(uniqueDates);
        }
      }
      else if (selectedFilm && !selectedCinema && !selectedDate) {
        const response = await fetch(`http://localhost:3000/fetch-showtimes?FilmID=${selectedFilm}`);
        if (response.ok) {
          const data = await response.json();
          const uniqueCinemaIds = [...new Set(data.map(item => item.CinemaId))];
          const availableCinemasForFilm = cinemas.filter(cinema => 
            uniqueCinemaIds.includes(cinema.CinemaID)
          );
          setAvailableCinemas(availableCinemasForFilm);
          const uniqueDates = [...new Set(
            data.map(item => new Date(item.Showtime).toISOString().split('T')[0])
          )];
          setAvailableDates(uniqueDates);
          setAvailableFilms(allFilms);
        }
      }
      else if (selectedDate && selectedCinema && !selectedFilm) {
        const response = await fetch(`http://localhost:3000/fetch-movies-by-cinema-date?cinemaId=${selectedCinema}&selectedDate=${selectedDate}`);
        if (response.ok) {
          const data = await response.json();
          const availableMovies = data.movies.map(movie => movie.film);
          setAvailableFilms(availableMovies);
        }
      }
      else if (selectedDate && selectedFilm && !selectedCinema) {
        const response = await fetch(`http://localhost:3000/fetch-cinemas-by-movie-date?movieId=${selectedFilm}&selectedDate=${selectedDate}`);
        if (response.ok) {
          const data = await response.json();
          const availableCinemasForMovie = data.cinemas.map(cinema => cinema.cinema);
          setAvailableCinemas(availableCinemasForMovie);
        }
      }
      else if (selectedCinema && selectedFilm && !selectedDate) {
        const filmResponse = await fetch(`http://localhost:3000/fetch-showtimes?FilmID=${selectedFilm}`);
        if (filmResponse.ok) {
          const filmData = await filmResponse.json();
          const cinemaFilmData = filmData.filter(item => item.CinemaId == selectedCinema);
          const uniqueDates = [...new Set(
            cinemaFilmData.map(item => new Date(item.Showtime).toISOString().split('T')[0])
          )];
          setAvailableDates(uniqueDates);
        }
      }
      else if (selectedCinema && selectedFilm && selectedDate) {
        await fetchTimes();
      }
      else if (!selectedCinema && !selectedFilm && !selectedDate) {
        setAvailableFilms(allFilms);
        setAvailableCinemas(cinemas);
        setAvailableDates(allDates);
      }

    } catch (err) {
      console.error("Error updating available options:", err);
      setError("Error updating available options. Please try again.");
    }
  };

  const fetchTimes = async () => {
    try {
      setLoading(prev => ({...prev, times: true}));
      setError(null);
      
      const dateObj = new Date(selectedDate);
      const nextDate = new Date(dateObj);
      nextDate.setDate(dateObj.getDate() + 1);
      nextDate.setHours(0, 0, 0, 0);

      const response = await fetch(
        `http://localhost:3000/fetch-dates?selectedDate=${dateObj.toISOString()}` +
        `&nextDate=${nextDate.toISOString()}&filmId=${selectedFilm}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch show times");
      
      const data = await response.json();
      const filteredTimes = data.filter(session => session.CinemaId == selectedCinema);
      setTimes(filteredTimes);
      
    } catch (err) {
      console.error(err);
      setError("Unable to load show times. Please try again.");
    } finally {
      setLoading(prev => ({...prev, times: false}));
    }
  };
  useEffect(() => {
    if (!selectedTime || !selectedCinema || !selectedFilm) return;

    const fetchSession = async () => {
      try {
        setLoading(prev => ({...prev, session: true}));
        setError(null);
        const response = await fetch(
          `http://localhost:3000/fetch-session?selectedTime=${selectedTime}` +
          `&cinemaId=${selectedCinema}&filmId=${selectedFilm}`
        );
        if (!response.ok) throw new Error("Failed to fetch session details");
        const data = await response.json();
        if (data.length > 0) {
          setSessionIdd(data[0].SessionId);
          setScreenNumber(data[0].ScreenName);
        } else {
          throw new Error("No session found for the selected time");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load session details. Please try again.");
      } finally {
        setLoading(prev => ({...prev, session: false}));
      }
    };
    fetchSession();
  }, [selectedTime, selectedCinema, selectedFilm]);

  const handleSelectionChange = (type, value) => {
    if (type === 'cinema') {
      setSelectedCinema(value);
      if (value !== selectedCinema) {
        setSelectedTime("");
        setTimes([]);
        setSessionIdd(null);
        setScreenNumber(null);
      }
    } else if (type === 'film') {
      setSelectedFilm(value);
      if (value !== selectedFilm) {
        setSelectedTime("");
        setTimes([]);
        setSessionIdd(null);
        setScreenNumber(null);
      }
    } else if (type === 'date') {
      setSelectedDate(value);
      if (value !== selectedDate) {
        setSelectedTime("");
        setTimes([]);
        setSessionIdd(null);
        setScreenNumber(null);
      }
    } else if (type === 'time') {
      setSelectedTime(value);
      setSessionIdd(null);
      setScreenNumber(null);
    }
    
    setError(null);
  };

  const handleBooking = async () => {
    if (!sessionIdd || !screenNumber) {
      setError("Please select a valid session before booking.");
      return;
    }
    try {
      const params = new URLSearchParams({
        sessionId: sessionIdd,
        cinemaId: selectedCinema,
        ScreenNumber: screenNumber,
        showTime: selectedTime
      });

      const response = await fetch(
        `http://localhost:3000/seatArrangement?${params}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Booking failed");
      }

      const paramsObject = Object.fromEntries(params.entries());
      navigate("/seat-booking", {
        state: { seatData: data, params: paramsObject },
      });
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const isTimeDisabled = !selectedCinema || !selectedFilm || !selectedDate;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Title Bar */}
          <div className="bg-blue-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <ArrowRight className="mr-2" size={20} />
              Quick Book Your Tickets
            </h2>
          </div>

          {/* Booking Form */}
          <div className="p-6">
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Cinema Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Film className="inline mr-1" size={16} />
                  Select Cinema
                </label>
                <select
                  onChange={(e) => handleSelectionChange('cinema', e.target.value)}
                  value={selectedCinema}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.cinemas}
                >
                  <option value="">Choose cinema</option>
                  {availableCinemas.map((cinema) => (
                    <option key={cinema.CinemaID} value={cinema.CinemaID}>
                      {cinema.Name}
                    </option>
                  ))}
                </select>
                {loading.cinemas && (
                  <div className="text-xs text-gray-500 mt-1">Loading cinemas...</div>
                )}
                {availableCinemas.length === 0 && !loading.cinemas && (selectedDate || selectedFilm) && (
                  <div className="text-xs text-orange-600 mt-1">
                    No cinemas available for selected options
                  </div>
                )}
              </div>

              {/* Film Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Film className="inline mr-1" size={16} />
                  Select Movie
                </label>
                <select
                  onChange={(e) => handleSelectionChange('film', e.target.value)}
                  value={selectedFilm}
                  disabled={loading.films}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose movie</option>
                  {availableFilms.map((film) => (
                    <option key={film.FilmID} value={film.FilmID}>
                      {film.Title}
                    </option>
                  ))}
                </select>
                {loading.films && (
                  <div className="text-xs text-gray-500 mt-1">Loading movies...</div>
                )}
                {availableFilms.length === 0 && !loading.films && (selectedDate || selectedCinema) && (
                  <div className="text-xs text-orange-600 mt-1">
                    No movies available for selected options
                  </div>
                )}
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline mr-1" size={16} />
                  Select Date
                </label>
                <select
                  onChange={(e) => handleSelectionChange('date', e.target.value)}
                  value={selectedDate}
                  disabled={loading.dates}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose date</option>
                  {availableDates.map((date, index) => (
                    <option key={index} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
                {loading.dates && (
                  <div className="text-xs text-gray-500 mt-1">Loading dates...</div>
                )}
                {availableDates.length === 0 && !loading.dates && (selectedCinema || selectedFilm) && (
                  <div className="text-xs text-orange-600 mt-1">
                    No dates available for selected options
                  </div>
                )}
              </div>

              {/* Time Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline mr-1" size={16} />
                  Select Time
                </label>
                <select
                  onChange={(e) => handleSelectionChange('time', e.target.value)}
                  value={selectedTime}
                  disabled={isTimeDisabled || loading.times}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">
                    {isTimeDisabled ? "Select cinema, movie & date first" : "Choose time"}
                  </option>
                  {times.map((session) => (
                    <option key={session.SessionId} value={session.Showtime}>
                      {formatTime(session.Showtime)}
                    </option>
                  ))}
                </select>
                {loading.times && (
                  <div className="text-xs text-gray-500 mt-1">Loading times...</div>
                )}
                {isTimeDisabled && (
                  <div className="text-xs text-yellow-600 mt-1">
                    Please select cinema, movie, and date to see available times
                  </div>
                )}
              </div>
            </div>

            {/* Selection Summary */}
            {(selectedDate || selectedCinema || selectedFilm) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Current Selection:</strong>
                  {selectedDate && ` Date: ${formatDate(selectedDate)}`}
                  {selectedCinema && ` | Cinema: ${cinemas.find(c => c.CinemaID == selectedCinema)?.Name}`}
                  {selectedFilm && ` | Movie: ${allFilms.find(f => f.FilmID == selectedFilm)?.Title}`}
                  {selectedTime && ` | Time: ${formatTime(selectedTime)}`}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Available options are automatically filtered based on your selection
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleBooking}
                disabled={!sessionIdd || !screenNumber || loading.session}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center"
              >
                {loading.session ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Book Now
                    <ArrowRight className="ml-2" size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quickbook;