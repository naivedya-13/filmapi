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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

            if (booking.status === "COMPLETED") {
              if (!booked.includes(seat.seatNumber)) {
                booked.push(seat.seatNumber);
              }
            } else if (booking.status === "PENDING") {
              if (!pending.includes(seat.seatNumber)) {
                pending.push(seat.seatNumber);
              }
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
      } catch (error) {
        console.error("Error fetching seats:", error);
        setBookingError("Seat availability check failed");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookedSeats();
  }, [filmId, showTime]);

  const toggleSeatSelection = (seatNumber) => {
    if (bookedSeats.includes(seatNumber) || pendingSeats.includes(seatNumber)) {
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((id) => id !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleBook = async (e) => {
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
      seatLength: selectedSeats.length,
    };
    console.log(selectedSeats.length);

    try {
      setIsSubmitting(true);
      setBookingError(null);
      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      const response = await fetch("http://localhost:3000/createpayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate payment");
      }

      const data = await response.json();

      const options = {
        key: "rzp_test_MfPQIlsLFbREB9",
        amount: data.amount,
        currency: data.currency,
        name: "Movie Booking",
        description: `Booking for ${movieTitle}`,
        order_id: data.id,
        handler: async function (response) {
          await await fetch("http://localhost:3000/verifypayment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          });
          alert("Payment Successful!");
        },

        prefill: {
          name: customerName,
          email: customerEmail,
        },
        notes: {
          bookingDetails: JSON.stringify(bookingData),
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowTimeSelect = (timeValue) => {
    setShowTime(timeValue);
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

        <form onSubmit={handleBook}>
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
                              className={`w-8 h-8 rounded flex items-center justify-center text-xs 
                                ${
                                  isBooked
                                    ? "bg-red-200 text-red-800 cursor-not-allowed"
                                    : isPending
                                    ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                                    : selectedSeats.includes(seatNumber)
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                              title={
                                isBooked
                                  ? "Already booked"
                                  : isPending
                                  ? "Pending confirmation"
                                  : seatNumber
                              }
                            >
                              {seatNumber}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-center gap-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 mr-1"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 mr-1"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-200 mr-1"></div>
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-200 mr-1"></div>
                      <span>Pending</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  </div>
                )}

                {bookingError && (
                  <p className="text-red-500 mt-2">{bookingError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  selectedSeats.length === 0 ||
                  !showTime ||
                  isLoading
                }
                className={`px-6 py-2 rounded-md text-white mt-4 md:mt-0
                  ${
                    isSubmitting ||
                    selectedSeats.length === 0 ||
                    !showTime ||
                    isLoading
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
