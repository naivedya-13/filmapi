

const express = require('express');
const filmRouter = require('./router/Film');
const cinemaRouter = require('./router/Cinema');
const screen = require('./router/Screen');
const session = require('./router/Session');
const fetchSessions = require('./router/fetchsessions');
const fetchCinema = require('./router/Fetchcinema');
const fetchfilm = require('./router/Fetchfilm');
const fetchscreen = require('./router/Fetchscreen');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors())

app.use('/', filmRouter);
app.use('/', cinemaRouter);
app.use('/', screen);
app.use('/', session);
app.use('/', fetchCinema);
app.use('/', fetchSessions);
app.use('/', fetchfilm);
app.use('/', fetchscreen);
app.get('/', (req, res) => {
  res.send('Welcome to the Cinema Booking System API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:3000`);
});