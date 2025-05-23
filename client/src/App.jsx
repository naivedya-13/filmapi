import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import BookingMovie from "./components/booking-movie";
import SeatBooking from "./components/Seat-booking";
function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/movie" />} />
        <Route path="/movie" element={<BookingMovie/>}/>
        <Route path="/seat-booking" element={<SeatBooking/>}/>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  
  )
}
export default App;