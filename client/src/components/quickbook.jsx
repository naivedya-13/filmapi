import { useEffect, useState } from 'react';
import { Film, Calendar, Clock, ArrowRight, RotateCcw } from 'lucide-react';

const formatDate = (dateString, locale = 'en-US') => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

const Quickbook = () => {
  const [cinemas, setCinemas] = useState([]);
  const [allFilms, setAllFilms] = useState([]);
  const [availableFilms, setAvailableFilms] = useState([]);
  const [allDates, setAllDates] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableCinemas, setAvailableCinemas] = useState([]);
  const [times, setTimes] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedFilm, setSelectedFilm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [screenNumber, setScreenNumber] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({
    initial: true,
    options: false,
    session: false,
  });
  const [selectionOrder, setSelectionOrder] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(prev => ({ ...prev, initial: true }));
        const response = await fetch('http://localhost:3000/booking-data');
        if (!response.ok) throw new Error('Failed to fetch initial data');
        const { data } = await response.json();
        setCinemas(data.cinemas || []);
        setAvailableCinemas(data.cinemas || []);
        setAllFilms(data.movies || []);
        setAvailableFilms(data.movies || []);
        setAllDates(data.dates || []);
        setAvailableDates(data.dates || []);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Unable to load initial data. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchFilteredOptions = async () => {
      if (selectionOrder.length === 0) {
        setAvailableCinemas(cinemas);
        setAvailableFilms(allFilms);
        setAvailableDates(allDates);
        setTimes([]);
        setSelectedTime('');
        setSessionId(null);
        setScreenNumber(null);
        return;
      }

      try {
        setLoading(prev => ({ ...prev, options: true }));
        const params = new URLSearchParams({ action: 'get-options' });
        selectionOrder.forEach(field => {
          if (field === 'cinema' && selectedCinema) params.append('cinemaId', selectedCinema);
          else if (field === 'film' && selectedFilm) params.append('filmId', selectedFilm);
          else if (field === 'date' && selectedDate) params.append('selectedDate', selectedDate);
        });

        const response = await fetch(`http://localhost:3000/booking-data?${params}`);
        if (!response.ok) throw new Error('Failed to fetch filtered options');
        const { data } = await response.json();

        setAvailableCinemas(data.cinemas || []);
        setAvailableFilms(data.movies || []);
        setAvailableDates(data.dates || []);
        if (selectedCinema && selectedFilm && selectedDate) {
          setTimes(data.sessions?.[selectedDate] || []);
        } else {
          setTimes([]);
          setSelectedTime('');
          setSessionId(null);
          setScreenNumber(null);
        }
      } catch (err) {
        console.error('Error fetching filtered options:', err);
        setError('Error updating available options. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
      }
    };

    fetchFilteredOptions();
  }, [selectedCinema, selectedFilm, selectedDate, selectionOrder, cinemas, allFilms, allDates]);

  useEffect(() => {
    if (selectedTime && selectedCinema && selectedFilm) {
      const fetchSession = async () => {
        try {
          setLoading(prev => ({ ...prev, session: true }));
          setError(null);
          const params = new URLSearchParams({
            action: 'get-session',
            selectedTime,
            cinemaId: selectedCinema,
            filmId: selectedFilm,
          });
          const response = await fetch(`http://localhost:3000/booking-data?${params}`);
          if (!response.ok) throw new Error('Failed to fetch session details');
          const data = await response.json();
          if (data?.SessionId) {
            setSessionId(data.SessionId);
            setScreenNumber(data.ScreenNumber);
          } else {
            throw new Error('No session found for the selected time');
          }
        } catch (err) {
          console.error('Error fetching session:', err);
          setError('Unable to load session details. Please try again.');
          setSessionId(null);
          setScreenNumber(null);
        } finally {
          setLoading(prev => ({ ...prev, session: false }));
        }
      };
      fetchSession();
    }
  }, [selectedTime, selectedCinema, selectedFilm]);

  const handleSelectionChange = (type, value) => {
    setError(null);

    // Reset if selecting "Choose" option
    if (value === '') {
      const fieldIndex = selectionOrder.indexOf(type);
      if (fieldIndex !== -1) {
        const newOrder = selectionOrder.slice(0, fieldIndex);
        setSelectionOrder(newOrder);
        const fieldsToReset = selectionOrder.slice(fieldIndex);
        fieldsToReset.forEach(field => {
          if (field === 'cinema') setSelectedCinema('');
          else if (field === 'film') setSelectedFilm('');
          else if (field === 'date') setSelectedDate('');
        });
      }
      setSelectedTime('');
      setSessionId(null);
      setScreenNumber(null);
      return;
    }

    // Update selection order
    const fieldIndex = selectionOrder.indexOf(type);
    if (fieldIndex === -1 && selectionOrder.length < 3) {
      setSelectionOrder(prev => [...prev, type]);
    } else if (fieldIndex !== -1) {
      const newOrder = selectionOrder.slice(0, fieldIndex + 1);
      setSelectionOrder(newOrder);
      const fieldsToReset = selectionOrder.slice(fieldIndex + 1);
      fieldsToReset.forEach(field => {
        if (field === 'cinema') setSelectedCinema('');
        else if (field === 'film') setSelectedFilm('');
        else if (field === 'date') setSelectedDate('');
      });
    }

    // Update selected value
    if (type === 'cinema') setSelectedCinema(value);
    else if (type === 'film') setSelectedFilm(value);
    else if (type === 'date') setSelectedDate(value);
    else if (type === 'time') setSelectedTime(value);

    // Reset time and session data if not changing time
    if (type !== 'time') {
      setSelectedTime('');
      setSessionId(null);
      setScreenNumber(null);
    }
  };

  const resetAllSelections = () => {
    setSelectedCinema('');
    setSelectedFilm('');
    setSelectedDate('');
    setSelectedTime('');
    setTimes([]);
    setSessionId(null);
    setScreenNumber(null);
    setSelectionOrder([]);
    setError(null);
  };

  const handleBooking = async () => {
    if (!sessionId || !screenNumber) {
      setError('Please select a valid session before booking.');
      return;
    }
    try {
      setLoading(prev => ({ ...prev, session: true }));
      const params = new URLSearchParams({
        sessionId,
        cinemaId: selectedCinema,
        ScreenNumber: screenNumber,
        showTime: selectedTime,
      });

      const response = await fetch(`http://localhost:3000/seatArrangement?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Booking failed');

      console.log('Booking successful:', { seatData: data, params: Object.fromEntries(params.entries()) });
      alert('Booking initiated! Check console for seat data.');
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(prev => ({ ...prev, session: false }));
    }
  };

  const isTimeDisabled = !selectedCinema || !selectedFilm || !selectedDate;

  const getPriorityNumber = field => {
    const index = selectionOrder.indexOf(field);
    return index !== -1 ? index + 1 : null;
  };

  const getFieldName = field => {
    switch (field) {
      case 'cinema':
        return 'Cinema';
      case 'film':
        return 'Movie';
      case 'date':
        return 'Date';
      default:
        return field;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ArrowRight className="mr-2" size={20} />
            Quick Book Your Tickets
          </h2>
          <button
            onClick={resetAllSelections}
            className="text-white hover:bg-blue-700 px-3 py-1 rounded flex items-center text-sm"
          >
            <RotateCcw size={16} className="mr-1" />
            Reset All
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
          )}

          {selectionOrder.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800 font-medium">
                Selection Priority:{' '}
                {selectionOrder.map((field, index) => (
                  <span key={field} className="ml-2 bg-green-200 px-2 py-1 rounded text-xs">
                    {getFieldName(field)}: {index + 1}
                  </span>
                ))}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Options are filtered based on your selection order. Changing a selection resets subsequent choices.
              </p>
            </div>
          )}

          {loading.initial && (
            <div className="text-center text-gray-500">Loading initial data...</div>
          )}

          {!loading.initial && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Film className="inline mr-1" size={16} />
                  Select Cinema
                  {getPriorityNumber('cinema') && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Priority {getPriorityNumber('cinema')}
                    </span>
                  )}
                </label>
                <select
                  onChange={e => handleSelectionChange('cinema', e.target.value)}
                  value={selectedCinema}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.options}
                >
                  <option value="">Choose cinema</option>
                  {availableCinemas.map(cinema => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </option>
                  ))}
                </select>
                {loading.options && (
                  <div className="text-xs text-gray-500 mt-1">Loading cinemas...</div>
                )}
                {availableCinemas.length === 0 && !loading.options && (selectedDate || selectedFilm) && (
                  <div className="text-xs text-orange-600 mt-1">
                    No cinemas available for selected filters
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Available: {availableCinemas.length} options
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Film className="inline mr-1" size={16} />
                  Select Movie
                  {getPriorityNumber('film') && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Priority {getPriorityNumber('film')}
                    </span>
                  )}
                </label>
                <select
                  onChange={e => handleSelectionChange('film', e.target.value)}
                  value={selectedFilm}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.options}
                >
                  <option value="">Choose movie</option>
                  {availableFilms.map(film => (
                    <option key={film.movie_id} value={film.movie_id}>
                      {film.movie_title}
                    </option>
                  ))}
                </select>
                {loading.options && (
                  <div className="text-xs text-gray-500 mt-1">Loading movies...</div>
                )}
                {availableFilms.length === 0 && !loading.options && (selectedDate || selectedCinema) && (
                  <div className="text-xs text-orange-600 mt-1">
                    No movies available for selected filters
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Available: {availableFilms.length} options
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline mr-1" size={16} />
                  Select Date
                  {getPriorityNumber('date') && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Priority {getPriorityNumber('date')}
                    </span>
                  )}
                </label>
                <select
                  onChange={e => handleSelectionChange('date', e.target.value)}
                  value={selectedDate}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading.options}
                >
                  <option value="">Choose date</option>
                  {availableDates.map((date, index) => (
                    <option key={index} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
                {loading.options && (
                  <div className="text-xs text-gray-500 mt-1">Loading dates...</div>
                )}
                {availableDates.length === 0 && !loading.options && (selectedCinema || selectedFilm) && (
                  <div className="text-xs text-orange-600 mt-1">
                    No dates available for selected filters
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Available: {availableDates.length} options
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline mr-1" size={16} />
                  Select Time
                </label>
                <select
                  onChange={e => handleSelectionChange('time', e.target.value)}
                  value={selectedTime}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isTimeDisabled || loading.options}
                >
                  <option value="">
                    {isTimeDisabled ? 'Select cinema, movie & date first' : 'Choose time'}
                  </option>
                  {times.map(session => (
                    <option key={session.session_id} value={session.show_time}>
                      {new Date(session.show_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </option>
                  ))}
                </select>
                {isTimeDisabled && !loading.options && (
                  <div className="text-xs text-yellow-600 mt-1">
                    Complete all selections to see available times
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Available: {times.length} time slots
                </div>
              </div>
            </div>
          )}

          {selectionOrder.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Current Selection:</strong>
                {selectionOrder
                  .map(field => {
                    let value = '';
                    if (field === 'cinema' && selectedCinema) {
                      value = cinemas.find(c => c.id == selectedCinema)?.name;
                    } else if (field === 'film' && selectedFilm) {
                      value = allFilms.find(f => f.movie_id == selectedFilm)?.movie_title;
                    } else if (field === 'date' && selectedDate) {
                      value = formatDate(selectedDate);
                    }
                    return value ? ` | ${getFieldName(field)}: ${value}` : '';
                  })
                  .join('')}
                {selectedTime &&
                  ` | Time: ${new Date(selectedTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Priority-based filtering: Options filtered by selection order (1 → 2 → 3)
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleBooking}
              disabled={!sessionId || !screenNumber || loading.session}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center"
            >
              {loading.session ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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
  );
};

export default Quickbook;