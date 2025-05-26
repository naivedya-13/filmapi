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
  const [films, setFilms] = useState([]);
  const [dates, setDates] = useState([]);
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

  // Fetch cinemas on initial render
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(prev => ({...prev, cinemas: true}));
        const response = await fetch("http://localhost:3000/fetch-cinemas");
        if (!response.ok) throw new Error("Failed to fetch cinemas");
        const data = await response.json();
        setCinemas(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load cinemas. Please try again.");
      } finally {
        setLoading(prev => ({...prev, cinemas: false}));
      }
    };
    fetchCinemas();
  }, []);

  // Fetch films when cinema is selected
  useEffect(() => {
    if (!selectedCinema) return;

    const fetchFilms = async () => {
      try {
        setLoading(prev => ({...prev, films: true}));
        setError(null);
        const response = await fetch(
          `http://localhost:3000/fetch-filmss?CinemaID=${selectedCinema}`
        );
        if (!response.ok) throw new Error("Failed to fetch films");
        const data = await response.json();
        const uniqueFilms = Array.from(
          new Map(data.map(item => [item.film.FilmID, item.film])).values()
        );
        setFilms(uniqueFilms);
      } catch (err) {
        console.error(err);
        setError("Unable to load films. Please try again.");
      } finally {
        setLoading(prev => ({...prev, films: false}));
      }
    };
    fetchFilms();
  }, [selectedCinema]);

  // Fetch dates when film is selected
  useEffect(() => {
    if (!selectedFilm) return;

    const fetchDates = async () => {
      try {
        setLoading(prev => ({...prev, dates: true}));
        setError(null);
        const response = await fetch(
          `http://localhost:3000/fetch-showtimes?FilmID=${selectedFilm}`
        );
        if (!response.ok) throw new Error("Failed to fetch show dates");
        const data = await response.json();
        const uniqueDates = [...new Set(
          data.map(item => new Date(item.Showtime).toDateString())
        )].map(dateStr => new Date(dateStr).toISOString());
        setDates(uniqueDates);
      } catch (err) {
        console.error(err);
        setError("Unable to load show dates. Please try again.");
      } finally {
        setLoading(prev => ({...prev, dates: false}));
      }
    };
    fetchDates();
  }, [selectedFilm]);

  // Fetch times when date is selected
  useEffect(() => {
    if (!selectedDate || !selectedFilm || !selectedCinema) return;

    const fetchTimes = async () => {
      try {
        setLoading(prev => ({...prev, times: true}));
        setError(null);
        const dateObj = new Date(selectedDate);
        const nextDate = new Date(dateObj);
        nextDate.setDate(dateObj.getDate() + 1);

        const response = await fetch(
          `http://localhost:3000/fetch-dates?selectedDate=${dateObj.toISOString()}` +
          `&nextDate=${nextDate.toISOString()}&filmId=${selectedFilm}&cinemaId=${selectedCinema}`
        );
        if (!response.ok) throw new Error("Failed to fetch show times");
        const data = await response.json();
        setTimes(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load show times. Please try again.");
      } finally {
        setLoading(prev => ({...prev, times: false}));
      }
    };
    fetchTimes();
  }, [selectedDate, selectedFilm, selectedCinema]);

  // Fetch session details when time is selected
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

  const handleCinemaChange = (e) => {
    setSelectedCinema(e.target.value);
    setSelectedFilm("");
    setSelectedDate("");
    setSelectedTime("");
    setDates([]);
    setTimes([]);
    setSessionIdd(null);
    setScreenNumber(null);
    setError(null);
  };

  const handleFilmChange = (e) => {
    setSelectedFilm(e.target.value);
    setSelectedDate("");
    setSelectedTime("");
    setDates([]);
    setTimes([]);
    setSessionIdd(null);
    setScreenNumber(null);
    setError(null);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime("");
    setTimes([]);
    setSessionIdd(null);
    setScreenNumber(null);
    setError(null);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    setSessionIdd(null);
    setScreenNumber(null);
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
        showTime:selectedTime
      });
      console.log(selectedTime)

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
                  onChange={handleCinemaChange}
                  value={selectedCinema}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.cinemas}
                >
                  <option value="">Choose cinema</option>
                  {cinemas.map((cinema) => (
                    <option key={cinema.CinemaID} value={cinema.CinemaID}>
                      {cinema.Name}
                    </option>
                  ))}
                </select>
                {loading.cinemas && (
                  <div className="text-xs text-gray-500 mt-1">Loading cinemas...</div>
                )}
              </div>

              {/* Film Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Film className="inline mr-1" size={16} />
                  Select Movie
                </label>
                <select
                  onChange={handleFilmChange}
                  value={selectedFilm}
                  disabled={!selectedCinema || loading.films}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose movie</option>
                  {films.map((film) => (
                    <option key={film.FilmID} value={film.FilmID}>
                      {film.Title}
                    </option>
                  ))}
                </select>
                {loading.films && (
                  <div className="text-xs text-gray-500 mt-1">Loading movies...</div>
                )}
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline mr-1" size={16} />
                  Select Date
                </label>
                <select
                  onChange={handleDateChange}
                  value={selectedDate}
                  disabled={!selectedFilm || loading.dates}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose date</option>
                  {dates.map((date, index) => (
                    <option key={index} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
                {loading.dates && (
                  <div className="text-xs text-gray-500 mt-1">Loading dates...</div>
                )}
              </div>

              {/* Time Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline mr-1" size={16} />
                  Select Time
                </label>
                <select
                  onChange={handleTimeChange}
                  value={selectedTime}
                  disabled={!selectedDate || loading.times}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose time</option>
                  {times.map((session) => (
                    <option key={session.SessionId} value={session.Showtime}>
                      {formatTime(session.Showtime)}
                    </option>
                  ))}
                </select>
                {loading.times && (
                  <div className="text-xs text-gray-500 mt-1">Loading times...</div>
                )}
              </div>
            </div>

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