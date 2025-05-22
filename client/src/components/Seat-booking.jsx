import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function SeatBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { seatData, params } = location.state || {};
  if (!location.state) {
    navigate("/");
    return null;
  }

  const areas = seatData?.SeatLayoutData?.Areas || [];
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const createSeatId = (areaIdx, rowIdx, seatId) => {
    return `area${areaIdx}-row${rowIdx}-seat${seatId}`;
  };

  const handleSeatClick = (areaIdx, rowIdx, seat, rowName) => {
    const uniqueSeatId = createSeatId(areaIdx, rowIdx, seat.Id);

    setSelectedSeats((prev) => {
      const existingSeat = prev.find((s) => s.uniqueId === uniqueSeatId);

      if (existingSeat) {
        return prev.filter((s) => s.uniqueId !== uniqueSeatId);
      } else {
        return [
          ...prev,
          {
            uniqueId: uniqueSeatId,
            id: seat.Id,
            name: seat.Name,
            row: rowName,
            areaIdx,
            rowIdx,
            originalSeatId: seat.Id,
          },
        ];
      }
    });
  };

  const isSeatSelected = (areaIdx, rowIdx, seatId) => {
    const uniqueSeatId = createSeatId(areaIdx, rowIdx, seatId);
    return selectedSeats.some((s) => s.uniqueId === uniqueSeatId);
  };

  const proceedToPayment = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      navigate("/payment", {
        state: {
          seats: selectedSeats,
          showDetails: params,
          totalAmount: selectedSeats.length * 100,
        },
      });
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-gray-800 text-3xl md:text-4xl font-bold mb-4">
          Select Your Seats
        </h1>
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 border border-green-600 rounded"></div>
            <span className="text-sm md:text-base">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 border border-blue-600 rounded"></div>
            <span className="text-sm md:text-base">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 border border-gray-500 rounded"></div>
            <span className="text-sm md:text-base">Unavailable</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-8 shadow-sm">
        {areas.map((area, areaIdx) => (
          <div key={`area-${areaIdx}`} className="mb-8 last:mb-0">
            <h2 className="text-center text-gray-800 mb-4 text-lg md:text-xl font-semibold">
              {area.Description}
            </h2>
            <div className="text-center italic text-gray-500 mb-6 relative">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-2"></div>
              <span className="text-sm md:text-base">Screen This Way</span>
            </div>
            <div className="space-y-3">
              {area.Rows.map(
                (row, rowIdx) =>
                  row.PhysicalName && (
                    <div
                      key={`row-${areaIdx}-${rowIdx}`}
                      className="flex items-center gap-4"
                    >
                      <span className="min-w-8 font-bold text-gray-700 text-sm md:text-base">
                        {row.PhysicalName}
                      </span>

                      <div className="flex gap-2 flex-wrap">
                        {row.Seats.map((seat, seatIdx) => {
                          const isAvailable = seat.Status === 0;
                          const isSelected = isSeatSelected(
                            areaIdx,
                            rowIdx,
                            seat.Id
                          );

                          return (
                            <button
                              key={`seat-${areaIdx}-${rowIdx}-${seat.Id}-${seatIdx}`}
                              onClick={() =>
                                isAvailable &&
                                handleSeatClick(
                                  areaIdx,
                                  rowIdx,
                                  seat,
                                  row.PhysicalName
                                )
                              }
                              disabled={!isAvailable}
                              className={`
                              w-8 h-8 rounded flex items-center justify-center text-xs font-bold
                              transition-all duration-200 border-none outline-none focus:ring-2 focus:ring-blue-300
                              ${
                                isAvailable
                                  ? isSelected
                                    ? "bg-blue-500 text-white transform scale-105 shadow-md cursor-pointer"
                                    : "bg-green-500 text-white hover:bg-green-600 hover:transform hover:scale-105 cursor-pointer"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                              }
                            `}
                              aria-label={`Seat ${row.PhysicalName}-${
                                seat.Id
                              } ${isAvailable ? "available" : "unavailable"}`}
                              title={`Row ${row.PhysicalName}, Seat ${
                                seat.Id
                              } - ${isAvailable ? "Available" : "Unavailable"}`}
                            >
                              {seat.Id}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <h3 className="mb-4 text-gray-800 text-lg md:text-xl font-semibold">
              Selected Seats
            </h3>

            {selectedSeats.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat, index) => (
                  <span
                    key={seat.uniqueId}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium"
                  >
                    {seat.row}-{seat.name || seat.id}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No seats selected yet</p>
            )}
          </div>
          <div className="min-w-64 lg:border-l lg:border-gray-200 lg:pl-8 border-t lg:border-t-0 border-gray-200 pt-8 lg:pt-0">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm md:text-base">
                <span>Seats ({selectedSeats.length})</span>
                <span>₹{selectedSeats.length * 100}</span>
              </div>

              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span>₹{selectedSeats.length * 100}</span>
              </div>
            </div>

            <button
              onClick={proceedToPayment}
              disabled={selectedSeats.length === 0 || isProcessing}
              className={`
                w-full px-4 py-3 rounded font-bold transition-colors duration-200
                ${
                  selectedSeats.length === 0 || isProcessing
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                }
              `}
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatBooking;
