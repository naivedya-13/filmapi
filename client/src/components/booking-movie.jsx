import { useState, useEffect } from "react";
import { Calendar, Clock, Film, Tag } from "lucide-react";
import { format, parseISO, isAfter, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import Quickbook from "./quickbook";

function BookingMovie() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilmId, setSelectedFilmId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [seats, setSeats] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState("today");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await fetch("http://localhost:3000/fetch-films");
        if (!response.ok) throw new Error("Failed to fetch films");
        const data = await response.json();
        setFilms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  const generateDateOptions = () => {
    const today = new Date();
    const options = [];

    for (let i = 0; i < 6; i++) {
      const date = addDays(today, i);
      const formattedDate = format(date, "yyyy-MM-dd");

      let label;
      if (i === 0) label = "Today";
      else if (i === 1) label = "Tomorrow";
      else label = format(date, "EEE, MMM d");

      options.push({ value: formattedDate, label });
    }

    return options;
  };

  const dateOptions = generateDateOptions();

  const filmSessions = films.reduce((acc, session) => {
    const sessionDate = parseISO(session.Showtime);
    const now = new Date();
    const sessionDateStr = format(sessionDate, "yyyy-MM-dd");
    const includeSession =
      isAfter(sessionDate, now) &&
      (selectedDate === "all" || sessionDateStr === selectedDate);

    if (includeSession) {
      const filmId = session.film.ID;
      if (!acc[filmId]) {
        acc[filmId] = {
          filmDetails: session.film,
          sessions: [],
        };
      }
      acc[filmId].sessions.push(session);
    }
    return acc;
  }, {});

  const formatDate = (dateString) =>
    format(parseISO(dateString), "EEE, MMM d • h:mm a");

  const handleFilmSelect = (filmId) => {
    setSelectedFilmId(filmId);
    setSelectedSession(null);
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
  };

  const handleBooking = async () => {
    if (!selectedSession) return;

    try {
      const params = new URLSearchParams({
        sessionId: selectedSession.SessionId,
        cinemaId: selectedSession.CinemaId,
        ScreenNumber: selectedSession.ScreenNumber,
        showTime: selectedSession.sessionDate
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

      setBookingSuccess(true);
      navigate("/seat-booking", {
        state: { seatData: data, params: paramsObject },
      });
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Cinema City Bookings
        </h1>
        <p className="text-center text-gray-600">
          Book your favorite movies with ease
        </p>
      </header>
      {<Quickbook/>}

      {bookingSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Booking successful! Check your email for confirmation.
        </div>
      )}

      <div className="mb-4 flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedDate("all")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${selectedDate === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
            }`}
        >
          All Dates
        </button>
        {dateOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedDate(option.value)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${selectedDate === option.value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Movie List */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Film className="mr-2 text-blue-500" size={20} />
            Now Showing
          </h2>
          {Object.keys(filmSessions).length === 0 ? (
            <p className="text-gray-500">
              No movies available for selected date.
            </p>
          ) : (
            <ul className="space-y-3">
              {Object.entries(filmSessions).map(
                ([filmId, { filmDetails, sessions }]) => (
                  <li
                    key={filmId}
                    className={`cursor-pointer p-3 rounded-lg transition-all ${selectedFilmId === filmId
                        ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
                        : "hover:bg-gray-50"
                      }`}
                    onClick={() => handleFilmSelect(filmId)}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {filmDetails.Title}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-flex items-center mr-3">
                            <Clock className="mr-1" size={14} />
                            {filmDetails.RunTime} mins
                          </span>
                          <span className="inline-flex items-center">
                            <Tag className="mr-1" size={14} />
                            {filmDetails.Rating}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {sessions.length}
                      </div>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
        <div className="md:col-span-2">
          {selectedFilmId && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-5 bg-gradient-to-r from-blue-50 to-gray-50">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filmSessions[selectedFilmId].filmDetails.Title}
                </h2>
                <p className="text-gray-700 mt-1">
                  {filmSessions[selectedFilmId].filmDetails.ShortSynopsis}
                </p>
              </div>

              <div className="p-5 border-b">
                <h3 className="font-medium text-lg mb-3 flex items-center">
                  <Calendar className="mr-2 text-blue-500" size={18} />
                  Available Showtimes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filmSessions[selectedFilmId].sessions.map((session) => (
                    <div
                      key={session.SessionId}
                      onClick={() => handleSessionSelect(session)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedSession?.SessionId === session.SessionId
                          ? "border-blue-400 bg-blue-50 shadow-md"
                          : "hover:border-gray-300 hover:shadow-sm"
                        }`}
                    >
                      <div className="font-medium text-gray-900">
                        {formatDate(session.Showtime)}
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>Screen {session.ScreenNumber}</span>
                        <span>{session.SeatsAvailable} seats left</span>
                      </div>
                      <div className="mt-2 text-sm font-medium">
                        {session.filFormat.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSession && (
                <div className="p-5">
                  <button
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    onClick={handleBooking}
                    disabled={seats > selectedSession.SeatsAvailable}
                  >
                    Book Now
                  </button>
                </div>
              )}
            </div>
          )}

          {!selectedFilmId && (
            <div className="text-center text-gray-500 mt-10">
              Please select a movie to see showtimes and book tickets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingMovie;
