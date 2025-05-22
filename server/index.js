

const express = require('express');
const filmRouter = require('./router/Film');
const cinemaRouter = require('./router/Cinema');
const screen = require('./router/Screen');
const session = require('./router/Session');
const fetchfilm = require('./router/FetchFilm');
const bookingRoute = require('./router/booking');
const payment = require('./router/payment');
const transaction = require('./router/transaction')
const seatArrangement = require('./router/seatArrangement')
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors())
const axios = require('axios');

setInterval(async () => {
  try {
    await axios.get('http://localhost:3000/sync-cinemas');
    await axios.get('http://localhost:3000/sync-films');
    await axios.get('http://localhost:3000/sync-screens');
    await axios.get('http://localhost:3000/sync-sessions');
    console.log('Routes called at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('Error calling routes:', error.message);
  }
}, 5 * 60 * 1000); // 5 minutes

app.use('/', filmRouter);
app.use('/', cinemaRouter);
app.use('/', screen);
app.use('/', session);
app.use('/', fetchfilm);
app.use('/',bookingRoute);
app.use('/',payment)
app.use('/',transaction)
app.use('/',seatArrangement)
app.get('/', (req, res) => {
  res.send('Welcome to the Cinema Booking System API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:3000`);
});