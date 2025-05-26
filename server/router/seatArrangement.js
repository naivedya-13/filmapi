const axios = require("axios");
const express = require("express");

const router = express.Router();

router.get("/seatArrangement", async (req, res) => {
  console.log("Request Query:", req.query);
  const { sessionId, cinemaId, ScreenNumber } = req.query;

  try {
    const url = `https://uatvista.novocinemas.com/WSVistaWebClient/RESTData.svc/cinemas/${cinemaId}/screens/${ScreenNumber}/seat-plan`;

    const response = await axios.get(url, {
      headers: {
        connectApiToken: "420077A0-BABD-43F8-9156-7E8C5E429061",
        "Content-Type": "application/json",
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Server error",
    });
  }
});

router.get("/ticket", async (req, res) => {
  const { sessionId, cinemaId } = req.query;

  try {
    const url = `https://uatvista.novocinemas.com/WSVistaWebClient/RESTData.svc/cinemas/${cinemaId}/sessions/${sessionId}/tickets`;

    const response = await axios.get(url, {
      headers: {
        connectApiToken: "420077A0-BABD-43F8-9156-7E8C5E429061",
        "Content-Type": "application/json",
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Server error",
    });
  }
});

module.exports = router;
