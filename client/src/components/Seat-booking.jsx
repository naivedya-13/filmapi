import { useLocation } from "react-router-dom";
import { useState } from "react";

const SeatBooking = () => {
  const location = useLocation();
  const { movieTitle, openingDate, distributorName, filmId } =
    location.state || {};
  console.log(filmId);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showTime, setShowTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const rows = ["A", "B", "C", "D", "E"];
  const seatsPerRow = 8;

  const createShowTimeDate = (hours, minutes) => {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };
  const availableShowTimes = [
    { display: "10:00 AM", value: createShowTimeDate(10, 0) },
    { display: "1:00 PM", value: createShowTimeDate(13, 0) },
    { display: "4:00 PM", value: createShowTimeDate(16, 0) },
    { display: "7:00 PM", value: createShowTimeDate(19, 0) },
    { display: "10:00 PM", value: createShowTimeDate(22, 0) },
  ];
  const TICKET_PRICE = 12.99;
  const totalAmount = selectedSeats.length * TICKET_PRICE;

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (
      !customerName ||
      !customerEmail ||
      !showTime ||
      selectedSeats.length === 0
    ) {
      setBookingError(
        "Please fill all required fields and select at least one seat"
      );
      return;
    }

    const bookingData = {
      filmId,
      customerName,
      customerEmail,
      seats: selectedSeats,
      showTime,
      totalAmount,
    };

    try {
      setIsSubmitting(true);
      setBookingError(null);

      const response = await fetch("http://localhost:3000/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to book seats. Please try again.");
      }

      const data = await response.json();
      console.log("Booking confirmed:", data);
      setBookingSuccess(true);
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!location.state) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">No movie selected</h2>
        <p>Please go back and select a movie to book seats</p>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Booking Confirmed!
          </h1>
          <p className="mb-2">Thank you for your booking, {customerName}.</p>
          <p className="mb-2">Movie: {movieTitle}</p>
          <p className="mb-2">Show Time: {showTime}</p>
          <p className="mb-2">Seats: {selectedSeats.join(", ")}</p>
          <p className="mb-4">Total Amount: ${totalAmount.toFixed(2)}</p>
          <p className="mb-4">
            A confirmation email has been sent to {customerEmail}
          </p>
          <button
            onClick={() => (window.location.href = "/movie")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Seat Booking</h1>

        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Movie Details</h2>
          <p>
            <span className="font-medium">Title:</span> {movieTitle}
          </p>
          <p>
            <span className="font-medium">Release Date:</span>{" "}
            {new Date(openingDate).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Distributor:</span> {distributorName}
          </p>
        </div>

        <form onSubmit={handleBooking}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Select Show Time</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {availableShowTimes.map((time) => (
                <button
                  type="button"
                  key={time.value} 
                  onClick={() => setShowTime(time.value)}
                  className={`p-2 border rounded-md ${
                    showTime === time.value
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {time.display}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Select Your Seats
            </h2>
            <div className="flex justify-center mb-4">
              <div className="w-full max-w-md">
                <div className="bg-gray-800 text-white text-center py-2 mb-6 rounded">
                  Screen
                </div>
                <div className="grid gap-2">
                  {rows.map((row) => (
                    <div key={row} className="flex justify-center gap-2">
                      {Array.from({ length: seatsPerRow }).map((_, index) => {
                        const seatId = `${row}${index + 1}`;
                        return (
                          <button
                            type="button"
                            key={seatId}
                            onClick={() => toggleSeatSelection(seatId)}
                            className={`w-8 h-8 rounded flex items-center justify-center 
                              ${
                                selectedSeats.includes(seatId)
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
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

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                {selectedSeats.length > 0 && (
                  <div>
                    <p className="font-medium">
                      Selected seats: {selectedSeats.join(", ")}
                    </p>
                    <p className="font-medium text-lg">
                      Total: ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                )}

                {bookingError && (
                  <p className="text-red-500 mt-2">{bookingError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting || selectedSeats.length === 0 || !showTime
                }
                className={`px-6 py-2 rounded-md text-white mt-4 md:mt-0
                  ${
                    isSubmitting || selectedSeats.length === 0 || !showTime
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {isSubmitting ? "Processing..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeatBooking;
