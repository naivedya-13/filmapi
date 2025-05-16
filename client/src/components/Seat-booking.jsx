import { useLocation } from "react-router-dom";
import { useState } from "react";

const SeatBooking = () => {
  const location = useLocation();
  const { movieTitle, openingDate, distributorName } = location.state || {};
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Mock seat data - in a real app, this would come from an API
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 8;

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId) 
        : [...prev, seatId]
    );
  };

  const handleBooking = () => {
    alert(`Booking confirmed for ${selectedSeats.length} seats for ${movieTitle}`);
    // Here you would typically send the booking to your backend
  };

  if (!location.state) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">No movie selected</h2>
        <p>Please go back and select a movie to book seats</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Seat Booking</h1>
        
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Movie Details</h2>
          <p><span className="font-medium">Title:</span> {movieTitle}</p>
          <p><span className="font-medium">Release Date:</span> {new Date(openingDate).toLocaleDateString()}</p>
          <p><span className="font-medium">Distributor:</span> {distributorName}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Select Your Seats</h2>
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-md">
              {/* Screen representation */}
              <div className="bg-gray-800 text-white text-center py-2 mb-6 rounded">
                Screen
              </div>
              
              {/* Seat grid */}
              <div className="grid gap-2">
                {rows.map(row => (
                  <div key={row} className="flex justify-center gap-2">
                    {Array.from({ length: seatsPerRow }).map((_, index) => {
                      const seatId = `${row}${index + 1}`;
                      return (
                        <button
                          key={seatId}
                          onClick={() => toggleSeatSelection(seatId)}
                          className={`w-8 h-8 rounded flex items-center justify-center 
                            ${selectedSeats.includes(seatId) 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          {seatId}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div>
            {selectedSeats.length > 0 && (
              <p className="font-medium">
                Selected seats: {selectedSeats.join(', ')}
              </p>
            )}
          </div>
          <button
            onClick={handleBooking}
            disabled={selectedSeats.length === 0}
            className={`px-6 py-2 rounded-md text-white 
              ${selectedSeats.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'}`}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;