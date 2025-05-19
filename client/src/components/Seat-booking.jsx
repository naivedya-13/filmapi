import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const SeatBooking = () => {
  const location = useLocation();
  const { movieTitle, openingDate, distributorName, filmId } =
    location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [pendingSeats, setPendingSeats] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showTime, setShowTime] = useState("");
  const [showTimeDisplay, setShowTimeDisplay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const rows = ["A", "B", "C", "D", "E"];
  const seatsPerRow = 8;
  const availableShowTimes = [
    { display: "10:00 AM", value: "10:00" },
    { display: "1:00 PM", value: "13:00" },
    { display: "4:00 PM", value: "16:00" },
    { display: "7:00 PM", value: "19:00" },
    { display: "10:00 PM", value: "22:00" },
  ];

  const TICKET_PRICE = 12.99;
  const totalAmount = selectedSeats.length * TICKET_PRICE;

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!filmId || !showTime) return;
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/fetchbookings");
        if (!response.ok) throw new Error("Failed to fetch bookings");
        const bookings = await response.json();
        const validBookings = bookings.filter(
          (b) => b?.filmId && b?.showTime && Array.isArray(b.seats)
        );
        const relevantBookings = validBookings.filter(
          (b) => b.filmId === filmId && b.showTime === showTime
        );
        const booked = [];
        const pending = [];
        relevantBookings.forEach((booking) => {
          booking.seats.forEach((seat) => {
            if (!seat?.seatNumber) return;
            if (
              booking.status === "COMPLETED" &&
              !booked.includes(seat.seatNumber)
            ) {
              booked.push(seat.seatNumber);
            } else if (
              booking.status === "PENDING" &&
              !pending.includes(seat.seatNumber)
            ) {
              pending.push(seat.seatNumber);
            }
          });
        });
        setBookedSeats(booked);
        setPendingSeats(pending);
        setSelectedSeats((prev) =>
          prev.filter(
            (seat) => !booked.includes(seat) && !pending.includes(seat)
          )
        );
      } catch {
        setBookingError("Seat availability check failed");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookedSeats();
  }, [filmId, showTime]);

  const toggleSeatSelection = (seatNumber) => {
    if (bookedSeats.includes(seatNumber) || pendingSeats.includes(seatNumber))
      return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((id) => id !== seatNumber)
        : [...prev, seatNumber]
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
      showTimeDisplay,
      totalAmount,
      status: "pending",
    };
    try {
      setIsSubmitting(true);
      setBookingError(null);
      const verifyResponse = await fetch("http://localhost:3000/fetchbookings");
      const allBookings = await verifyResponse.json();
      const conflictingBookings = allBookings.filter(
        (booking) =>
          booking.filmId === filmId &&
          booking.showTime === showTime &&
          booking.seats.some((seat) => selectedSeats.includes(seat))
      );
      if (conflictingBookings.length > 0) {
        throw new Error(
          "Some seats were just booked by another user. Please refresh and try again."
        );
      }
      const response = await fetch("http://localhost:3000/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok)
        throw new Error("Failed to book seats. Please try again.");
      setBookingSuccess(true);
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowTimeSelect = (timeValue, display) => {
    setShowTime(timeValue);
    setShowTimeDisplay(display);
    setSelectedSeats([]);
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
          <p className="mb-2">Show Time: {showTimeDisplay}</p>
          <p className="mb-2">Seats: {selectedSeats.join(", ")}</p>
          <p className="mb-4">Total Amount: ${totalAmount.toFixed(2)}</p>
          <p className="mb-4">
            A confirmation email has been sent to {customerEmail}
          </p>
          <button
            onClick={() =>
              (window.location.href = "http://localhost:5173/movie")
            }
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
                  onClick={() => handleShowTimeSelect(time.value, time.display)}
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
            {isLoading && showTime ? (
              <div className="text-center py-6">
                Loading seat availability...
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-md">
                  <div className="bg-gray-800 text-white text-center py-2 mb-6 rounded">
                    Screen
                  </div>
                  <div className="grid gap-2">
                    {rows.map((row) => (
                      <div key={row} className="flex justify-center gap-2">
                        {Array.from({ length: seatsPerRow }).map((_, index) => {
                          const seatNumber = `${row}${index + 1}`;
                          const isBooked = bookedSeats.includes(seatNumber);
                          const isPending = pendingSeats.includes(seatNumber);
                          return (
                            <button
                              type="button"
                              key={seatNumber}
                              onClick={() => toggleSeatSelection(seatNumber)}
                              disabled={isBooked || isPending}
                              className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                                isBooked
                                  ? "bg-red-200 text-red-800 cursor-not-allowed"
                                  : isPending
                                  ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                                  : selectedSeats.includes(seatNumber)
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                              title={seatNumber}
                            >
                              {seatNumber}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full mb-2 p-2 border rounded"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full mb-2 p-2 border rounded"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          {bookingError && (
            <p className="text-red-500 mb-4 text-center">{bookingError}</p>
          )}

          <div className="text-center">
            <button
              type="submit"
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeatBooking;
