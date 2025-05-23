// import { useLocation, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";

// function SeatBooking() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { seatData, params } = location.state || {};
//   const sessionId = params?.sessionId;
//   const cinemaId = params?.cinemaId;
  
//   if (!location.state) {
//     navigate("/");
//     return null;
//   }

//   const areas = seatData?.SeatLayoutData?.Areas || [];
//   const [selectedSeats, setSelectedSeats] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [screenNames, setScreenNames] = useState({});
//   const [prices, setPrices] = useState({});
//   const [customerName, setCustomerName] = useState("");
//   const [customerEmail, setCustomerEmail] = useState("");

//   const createSeatId = (areaIdx, rowIdx, seatId) => {
//     return `area${areaIdx}-row${rowIdx}-seat${seatId}`;
//   };

//   const handleSeatClick = (areaIdx, rowIdx, seat, rowName, area) => {
//     const uniqueSeatId = createSeatId(areaIdx, rowIdx, seat.Id);
//     setSelectedSeats((prev) => {
//       const existingSeat = prev.find((s) => s.uniqueId === uniqueSeatId);
//       if (existingSeat) {
//         return prev.filter((s) => s.uniqueId !== uniqueSeatId);
//       } else {
//         return [
//           ...prev,
//           {
//             uniqueId: uniqueSeatId,
//             id: seat.Id,
//             name: seat.Name,
//             row: rowName,
//             areaIdx,
//             rowIdx,
//             originalSeatId: seat.Id,
//             area,
//             price: prices[area] || 0,
//           },
//         ];
//       }
//     });
//   };

//   const handleScreen = async (area) => {
//     const response = await fetch(`http://localhost:3000/findscreen?area=${area}`);
//     const data = await response.json();
//     return data.name;
//   };

//   useEffect(() => {
//     const loadScreenNames = async () => {
//       const response = await fetch(
//         `http://localhost:3000/ticket?sessionId=${sessionId}&cinemaId=${cinemaId}`
//       );
//       const data = await response.json();
//       const names = {};
//       const areaPrice = {};

//       for (const area of areas) {
//         try {
//           const screenName = await handleScreen(area.AreaCategoryCode);
//           const ticketData = data.Tickets.find(
//             (t) => t.AreaCategoryCode === area.AreaCategoryCode && t.TicketCode === "DF"
//           );
//           if (ticketData) {
//             areaPrice[area.AreaCategoryCode] = ticketData.PriceInCents;
//           }
//           names[area.AreaCategoryCode] = screenName;
//         } catch (error) {
//           console.error(`Error loading screen name for ${area.AreaCategoryCode}:`, error);
//           names[area.AreaCategoryCode] = '';
//         }
//       }

//       setScreenNames(names);
//       setPrices(areaPrice);
//     };

//     if (areas.length > 0) {
//       loadScreenNames();
//     }
//   }, [areas, sessionId, cinemaId]);

//   const isSeatSelected = (areaIdx, rowIdx, seatId) => {
//     const uniqueSeatId = createSeatId(areaIdx, rowIdx, seatId);
//     return selectedSeats.some((s) => s.uniqueId === uniqueSeatId);
//   };

//   const calculateTotalAmount = () => {
//     return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
//   };

//   const proceedToPayment = () => {
//     if (selectedSeats.length === 0) {
//       alert("Please select at least one seat");
//       return;
//     }

//     if (!customerName.trim() || !customerEmail.trim()) {
//       alert("Please enter your name and email before proceeding.");
//       return;
//     }

//     setIsProcessing(true);
//     setTimeout(() => {
//       navigate("/payment", {
//         state: {
//           sessionId: sessionId,
//           seats: selectedSeats,
//           showDetails: params,
//           totalAmount: calculateTotalAmount(),
//           customer: {
//             name: customerName,
//             email: customerEmail,
//           },
//           showTime: params.showTime,
//           seatCount: selectedSeats.length,
//         },
//       });
//       setIsProcessing(false);
//     }, 500);
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-gray-800">
//       <div className="text-center mb-8">
//         <h1 className="text-3xl md:text-4xl font-bold mb-4">Select Your Seats</h1>
//         <div className="flex justify-center gap-6 mb-6 flex-wrap">
//           <div className="flex items-center gap-2">
//             <div className="w-6 h-6 bg-green-500 border border-green-600 rounded"></div>
//             <span>Available</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-6 h-6 bg-blue-500 border border-blue-600 rounded"></div>
//             <span>Selected</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-6 h-6 bg-gray-400 border border-gray-500 rounded"></div>
//             <span>Unavailable</span>
//           </div>
//         </div>
//       </div>

//       <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-8 shadow-sm">
//         {areas.map((area, areaIdx) => (
//           <div key={`area-${areaIdx}`} className="mb-8 last:mb-0">
//             <h2 className="text-center text-lg md:text-xl font-semibold mb-4">
//               {area.Description} {screenNames[area.AreaCategoryCode] || ''}{" "}
//               {prices[area.AreaCategoryCode] && (
//                 <span className="ml-2 text-green-600">${prices[area.AreaCategoryCode]}</span>
//               )}
//             </h2>
//             <div className="text-center italic text-gray-500 mb-6">
//               <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-2"></div>
//               <span>Screen This Way</span>
//             </div>
//             <div className="space-y-3">
//               {area.Rows.map((row, rowIdx) =>
//                 row.PhysicalName ? (
//                   <div key={`row-${areaIdx}-${rowIdx}`} className="flex items-center gap-4">
//                     <span className="min-w-8 font-bold text-sm md:text-base">{row.PhysicalName}</span>
//                     <div className="flex gap-2 flex-wrap">
//                       {row.Seats.map((seat, seatIdx) => {
//                         const isAvailable = seat.Status === 0;
//                         const isSelected = isSeatSelected(areaIdx, rowIdx, seat.Id);
//                         return (
//                           <button
//                             key={`seat-${areaIdx}-${rowIdx}-${seat.Id}-${seatIdx}`}
//                             onClick={() =>
//                               isAvailable &&
//                               handleSeatClick(areaIdx, rowIdx, seat, row.PhysicalName, area.AreaCategoryCode)
//                             }
//                             disabled={!isAvailable}
//                             className={`
//                               w-8 h-8 rounded flex items-center justify-center text-xs font-bold
//                               ${
//                                 isAvailable
//                                   ? isSelected
//                                     ? "bg-blue-500 text-white transform scale-105 shadow-md"
//                                     : "bg-green-500 text-white hover:bg-green-600 hover:scale-105"
//                                   : "bg-gray-400 text-gray-600 cursor-not-allowed"
//                               }
//                             `}
//                           >
//                             {seat.Id}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 ) : null
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm">
//         <div className="flex flex-col lg:flex-row gap-8">
//           <div className="flex-1">
//             <h3 className="mb-4 text-lg md:text-xl font-semibold">Selected Seats</h3>

//             <div className="mb-6">
//               <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
//               <input
//                 type="text"
//                 value={customerName}
//                 onChange={(e) => setCustomerName(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded"
//                 placeholder="Enter your full name"
//               />
//             </div>

//             <div className="mb-6">
//               <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
//               <input
//                 type="email"
//                 value={customerEmail}
//                 onChange={(e) => setCustomerEmail(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded"
//                 placeholder="Enter your email address"
//               />
//             </div>

//             {selectedSeats.length > 0 ? (
//               <div className="space-y-2">
//                 {selectedSeats.map((seat) => (
//                   <div key={seat.uniqueId} className="flex justify-between items-center bg-blue-100 text-blue-800 px-3 py-2 rounded">
//                     <span>{seat.row}-{seat.name || seat.id}</span>
//                     <span>{seat.price}</span>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-500 italic">No seats selected yet</p>
//             )}
//           </div>

//           <div className="min-w-64 lg:border-l lg:border-gray-200 lg:pl-8 border-t pt-8 lg:pt-0">
//             <div className="space-y-2 mb-4">
//               <div className="flex justify-between text-sm md:text-base">
//                 <span>Show Time</span>
//                 <span>{params.showTime}</span>
//               </div>
//               <div className="flex justify-between text-sm md:text-base">
//                 <span>Number of Seats</span>
//                 <span>{selectedSeats.length}</span>
//               </div>
//               <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
//                 <span>Total Amount</span>
//                 <span>{calculateTotalAmount()}</span>
//               </div>
//             </div>
//             <button
//               onClick={proceedToPayment}
//               disabled={selectedSeats.length === 0 || isProcessing}
//               className={`w-full px-4 py-3 rounded font-bold ${
//                 selectedSeats.length === 0 || isProcessing
//                   ? "bg-gray-400 text-gray-600 cursor-not-allowed"
//                   : "bg-blue-500 text-white hover:bg-blue-600"
//               }`}
//             >
//               {isProcessing ? "Processing..." : "Proceed to Payment"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SeatBooking;

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function SeatBooking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { seatData, params } = location.state || {};
  const sessionId = params?.sessionId;
  const cinemaId = params?.cinemaId;
  
  if (!location.state) {
    navigate("/");
    return null;
  }

  const areas = seatData?.SeatLayoutData?.Areas || [];
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [screenNames, setScreenNames] = useState({});
  const [prices, setPrices] = useState({});
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const createSeatId = (areaIdx, rowIdx, seatId) => {
    return `area${areaIdx}-row${rowIdx}-seat${seatId}`;
  };

  const handleSeatClick = (areaIdx, rowIdx, seat, rowName, area) => {
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
            area,
            price: prices[area] || 0,
          },
        ];
      }
    });
  };

  const handleScreen = async (area) => {
    const response = await fetch(`http://localhost:3000/findscreen?area=${area}`);
    const data = await response.json();
    return data.name;
  };

  useEffect(() => {
    const loadScreenNames = async () => {
      const response = await fetch(
        `http://localhost:3000/ticket?sessionId=${sessionId}&cinemaId=${cinemaId}`
      );
      const data = await response.json();
      const names = {};
      const areaPrice = {};

      for (const area of areas) {
        try {
          const screenName = await handleScreen(area.AreaCategoryCode);
          const ticketData = data.Tickets.find(
            (t) => t.AreaCategoryCode === area.AreaCategoryCode && t.TicketCode === "DF"
          );
          if (ticketData) {
            areaPrice[area.AreaCategoryCode] = ticketData.PriceInCents;
          }
          names[area.AreaCategoryCode] = screenName;
        } catch (error) {
          console.error(`Error loading screen name for ${area.AreaCategoryCode}:`, error);
          names[area.AreaCategoryCode] = '';
        }
      }

      setScreenNames(names);
      setPrices(areaPrice);
    };

    if (areas.length > 0) {
      loadScreenNames();
    }
  }, [areas, sessionId, cinemaId]);

  const isSeatSelected = (areaIdx, rowIdx, seatId) => {
    const uniqueSeatId = createSeatId(areaIdx, rowIdx, seatId);
    return selectedSeats.some((s) => s.uniqueId === uniqueSeatId);
  };

  const calculateTotalAmount = () => {
    return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  };

  const proceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      alert("Please enter your name and email before proceeding.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create payment order
      const response = await fetch('http://localhost:3000/createpayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seats: selectedSeats,
          showDetails: params,
          totalAmount: calculateTotalAmount(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          SessionId: sessionId,
          showTime: params.showTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const paymentData = await response.json();
      
      // Navigate to payment page with order details
      navigate("/payment", {
        state: {
          sessionId: sessionId,
          seats: selectedSeats,
          showDetails: params,
          totalAmount: calculateTotalAmount(),
          customer: {
            name: customerName,
            email: customerEmail,
          },
          showTime: params.showTime,
          seatCount: selectedSeats.length,
          paymentOrder: paymentData, // Include payment order details
        },
      });
    } catch (error) {
      console.error('Error creating payment order:', error);
      alert('Failed to proceed to payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans text-gray-800">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Select Your Seats</h1>
        <div className="flex justify-center gap-6 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 border border-green-600 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 border border-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 border border-gray-500 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-8 shadow-sm">
        {areas.map((area, areaIdx) => (
          <div key={`area-${areaIdx}`} className="mb-8 last:mb-0">
            <h2 className="text-center text-lg md:text-xl font-semibold mb-4">
              {area.Description} {screenNames[area.AreaCategoryCode] || ''}{" "}
              {prices[area.AreaCategoryCode] && (
                <span className="ml-2 text-green-600">${prices[area.AreaCategoryCode]}</span>
              )}
            </h2>
            <div className="text-center italic text-gray-500 mb-6">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-2"></div>
              <span>Screen This Way</span>
            </div>
            <div className="space-y-3">
              {area.Rows.map((row, rowIdx) =>
                row.PhysicalName ? (
                  <div key={`row-${areaIdx}-${rowIdx}`} className="flex items-center gap-4">
                    <span className="min-w-8 font-bold text-sm md:text-base">{row.PhysicalName}</span>
                    <div className="flex gap-2 flex-wrap">
                      {row.Seats.map((seat, seatIdx) => {
                        const isAvailable = seat.Status === 0;
                        const isSelected = isSeatSelected(areaIdx, rowIdx, seat.Id);
                        return (
                          <button
                            key={`seat-${areaIdx}-${rowIdx}-${seat.Id}-${seatIdx}`}
                            onClick={() =>
                              isAvailable &&
                              handleSeatClick(areaIdx, rowIdx, seat, row.PhysicalName, area.AreaCategoryCode)
                            }
                            disabled={!isAvailable}
                            className={`
                              w-8 h-8 rounded flex items-center justify-center text-xs font-bold
                              ${
                                isAvailable
                                  ? isSelected
                                    ? "bg-blue-500 text-white transform scale-105 shadow-md"
                                    : "bg-green-500 text-white hover:bg-green-600 hover:scale-105"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                              }
                            `}
                          >
                            {seat.Id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 md:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h3 className="mb-4 text-lg md:text-xl font-semibold">Selected Seats</h3>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter your full name"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter your email address"
              />
            </div>

            {selectedSeats.length > 0 ? (
              <div className="space-y-2">
                {selectedSeats.map((seat) => (
                  <div key={seat.uniqueId} className="flex justify-between items-center bg-blue-100 text-blue-800 px-3 py-2 rounded">
                    <span>{seat.row}-{seat.name || seat.id}</span>
                    <span>{seat.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No seats selected yet</p>
            )}
          </div>

          <div className="min-w-64 lg:border-l lg:border-gray-200 lg:pl-8 border-t pt-8 lg:pt-0">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm md:text-base">
                <span>Show Time</span>
                <span>{params.showTime}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span>Number of Seats</span>
                <span>{selectedSeats.length}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span>{calculateTotalAmount()}</span>
              </div>
            </div>
            <button
              onClick={proceedToPayment}
              disabled={selectedSeats.length === 0 || isProcessing}
              className={`w-full px-4 py-3 rounded font-bold ${
                selectedSeats.length === 0 || isProcessing
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
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