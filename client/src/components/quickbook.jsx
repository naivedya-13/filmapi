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
  const [selectionPriority, setSelectionPriority] = useState([]);

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
      if (selectionPriority.length === 0) {
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

        selectionPriority.forEach(field => {
          if (field === 'cinema' && selectedCinema) {
            params.append('cinemaId', selectedCinema);
          } else if (field === 'film' && selectedFilm) {
            params.append('filmId', selectedFilm);
          } else if (field === 'date' && selectedDate) {
            params.append('selectedDate', selectedDate);
          }
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
  }, [selectedCinema, selectedFilm, selectedDate, selectionPriority, cinemas, allFilms, allDates]);

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
          if (data && data.length > 0) {
            setSessionId(data[0].SessionId);
            setScreenNumber(data[0].ScreenNumber);
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

    if (value === '') {
      const currentIndex = selectionPriority.indexOf(type);
      if (currentIndex !== -1) {
        const newPriority = selectionPriority.slice(0, currentIndex);
        setSelectionPriority(newPriority);
        
        const fieldsToReset = selectionPriority.slice(currentIndex);
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

    if (type === 'cinema') setSelectedCinema(value);
    else if (type === 'film') setSelectedFilm(value);
    else if (type === 'date') setSelectedDate(value);
    else if (type === 'time') setSelectedTime(value);
    if (type !== 'time') {
      const currentIndex = selectionPriority.indexOf(type);
      
      if (currentIndex === -1) {
        if (selectionPriority.length < 3) {
          setSelectionPriority(prev => [...prev, type]);
        }
      } else {
        const newPriority = selectionPriority.slice(0, currentIndex + 1);
        setSelectionPriority(newPriority);
        
        const fieldsToReset = selectionPriority.slice(currentIndex + 1);
        fieldsToReset.forEach(field => {
          if (field === 'cinema') setSelectedCinema('');
          else if (field === 'film') setSelectedFilm('');
          else if (field === 'date') setSelectedDate('');
        });
      }
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
    setSelectionPriority([]);
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

  const getSelectedValueDisplay = (field) => {
    if (field === 'cinema' && selectedCinema) {
      return cinemas.find(c => c.id == selectedCinema)?.name || 'Selected Cinema';
    } else if (field === 'film' && selectedFilm) {
      return allFilms.find(f => f.movie_id == selectedFilm)?.movie_title || 'Selected Movie';
    } else if (field === 'date' && selectedDate) {
      return formatDate(selectedDate);
    }
    return '';
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
            className="text-white hover:bg-blue-700 px-3 py-1 rounded flex items-center text-sm transition-colors"
          >
            <RotateCcw size={16} className="mr-1" />
            Reset All
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
          )}

          

          {loading.initial && (
            <div className="text-center text-gray-500 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Loading initial data...
            </div>
          )}

          {!loading.initial && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Cinema Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Film className="inline mr-1" size={16} />
                  Select Cinema
                
                </label>
                <select
                  onChange={e => handleSelectionChange('cinema', e.target.value)}
                  value={selectedCinema}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <div className="text-xs text-blue-500 mt-1 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                    Updating cinemas...
                  </div>
                )}
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-500">
                    Available: {availableCinemas.length} options
                  </div>
                  {availableCinemas.length === 0 && !loading.options && selectionPriority.length > 0 && (
                    <div className="text-xs text-orange-600">
                      No cinemas for current filters
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Film className="inline mr-1" size={16} />
                  Select Movie
                


                </label>
                <select
                  onChange={e => handleSelectionChange('film', e.target.value)}
                  value={selectedFilm}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <div className="text-xs text-blue-500 mt-1 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                    Updating movies...
                  </div>
                )}
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-500">
                    Available: {availableFilms.length} options
                  </div>
                  {availableFilms.length === 0 && !loading.options && selectionPriority.length > 0 && (
                    <div className="text-xs text-orange-600">
                      No movies for current filters
                    </div>
                  )}
                </div>
              </div>

              {/* Date Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-1" size={16} />
                  Select Date
              
                </label>
                <select
                  onChange={e => handleSelectionChange('date', e.target.value)}
                  value={selectedDate}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <div className="text-xs text-blue-500 mt-1 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500 mr-1"></div>
                    Updating dates...
                  </div>
                )}
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-500">
                    Available: {availableDates.length} options
                  </div>
                  {availableDates.length === 0 && !loading.options && selectionPriority.length > 0 && (
                    <div className="text-xs text-orange-600">
                      No dates for current filters
                    </div>
                  )}
                </div>
              </div>

              {/* Time Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline mr-1" size={16} />
                  Select Time
                </label>
                <select
                  onChange={e => handleSelectionChange('time', e.target.value)}
                  value={selectedTime}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
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
                      })} - Screen {session.screen_number}
                    </option>
                  ))}
                </select>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-gray-500">
                    Available: {times.length} time slots
                  </div>
                  {isTimeDisabled && (
                    <div className="text-xs text-yellow-600">
                      Complete all selections first
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Current Selection Summary */}
          {selectionPriority.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <ArrowRight className="mr-1" size={14} />
                Current Selection Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {selectionPriority.map((field, index) => {
                  const value = getSelectedValueDisplay(field);
                  return value ? (
                    <div key={field} className="flex items-center">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">
                        {index + 1}
                      </span>
                      <span className="text-gray-600">{getFieldName(field)}:</span>
                      <span className="ml-1 font-medium text-gray-800">{value}</span>
                    </div>
                  ) : null;
                })}
                {selectedTime && (
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs mr-2">
                      T
                    </span>
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-1 font-medium text-gray-800">
                      {new Date(selectedTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Book Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleBooking}
              disabled={!sessionId || !screenNumber || loading.session}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center font-medium shadow-md hover:shadow-lg"
            >
              {loading.session ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
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