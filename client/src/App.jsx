import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CinemaList from "./components/cinemaList";
import ScreenList from "./components/ScreenList";
import ShowtimeFilter from "./components/session";
import BookingMovie from "./components/booking-movie";
import SeatBooking from "./components/Seat-booking";
import Quickbook from "./components/quickbook";
function App() {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/cinemas" />} />
        <Route path="/cinemas" element={<CinemaList />} />
        <Route path="/screen" element={<ScreenList/>} />
        <Route path="/session" element={<ShowtimeFilter/>}/>
        <Route path="/movie" element={<BookingMovie/>}/>
        <Route path="/seat-booking" element={<SeatBooking/>}/>
        <Route path="/quickbook" element={<Quickbook/>}/>
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  
  )
}
export default App;