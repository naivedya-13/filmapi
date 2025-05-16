import React, { useState, useEffect } from "react";

const ShowtimeFilter = () => {
  const [sessions, setSessions] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    dates: [],
    times: [],
    films: [],
    seatsRange: { min: 0, max: 0 }
  });
  
  // Filter state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedFilm, setSelectedFilm] = useState("");
  const [minSeats, setMinSeats] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchFilterOptions();
    fetchSessions();
  }, []);
  useEffect(() => {
    fetchSessions();
  }, [selectedDate, selectedTime, selectedFilm, minSeats]);
  
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("http://localhost:3000/sessions/filters");
      const data = await response.json();
      setFilterOptions(data);
      if (data.seatsRange && data.seatsRange.min !== undefined) {
        setMinSeats(data.seatsRange.min);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };
  
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedTime) params.append("time", selectedTime);
      if (selectedFilm) params.append("scheduledFilmId", selectedFilm);
      if (minSeats > 0) params.append("minSeats", minSeats);
      
      const response = await fetch(`http://localhost:3000/sessions?${params.toString()}`);
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setSelectedDate("");
    setSelectedTime("");
    setSelectedFilm("");
    setMinSeats(filterOptions.seatsRange.min || 0);
  };
  
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Movie Showtimes</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Showtimes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Dates</option>
              {filterOptions.dates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          
          {/* Time Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <select 
              value={selectedTime} 
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Times</option>
              {filterOptions.times.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          {/* Film Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Movie</label>
            <select 
              value={selectedFilm} 
              onChange={(e) => setSelectedFilm(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Movies</option>
              {filterOptions.films.map(film => (
                <option key={film.id} value={film.id}>{film.title}</option>
              ))}
            </select>
          </div>
          
          {/* Seats Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Min Seats Available: {minSeats}
            </label>
            <input 
              type="range" 
              min={filterOptions.seatsRange.min || 0} 
              max={filterOptions.seatsRange.max || 100} 
              value={minSeats} 
              onChange={(e) => setMinSeats(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button 
            onClick={handleReset}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Results Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-4">No sessions found matching your criteria</div>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Movie</th>
                <th className="py-2 px-4 border">Showtime</th>
                <th className="py-2 px-4 border">Seats Available</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.sessionId}>
                  <td className="py-2 px-4 border">{session.matchedFilmTitle}</td>
                  <td className="py-2 px-4 border">{formatDateTime(session.showtime)}</td>
                  <td className="py-2 px-4 border">
                    {session.seatsAvailable > 10 ? (
                      <span className="text-green-600">{session.seatsAvailable}</span>
                    ) : session.seatsAvailable > 0 ? (
                      <span className="text-orange-500">{session.seatsAvailable} (Limited)</span>
                    ) : (
                      <span className="text-red-600">Sold Out</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ShowtimeFilter;