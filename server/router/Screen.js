require("dotenv").config();
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const router = express.Router();

const CONFIG = {
  baseURL: process.env.BASE_API_URL,
  timeout: 60000,
  batchSize: parseInt(process.env.BATCH_SIZE) || 20,
  maxRetries: 3,
  retryDelay: 2000,
};

const api = axios.create({
  baseURL: CONFIG.baseURL,
  timeout: CONFIG.timeout,
  headers: {
    connectApiToken: process.env.API_TOKEN,
    Accept: "application/json",
  },
});

async function withRetry(operation, context = "") {
  let attempt = 0;
  while (attempt < CONFIG.maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt === CONFIG.maxRetries) {
        console.error(`[${context}] Final attempt failed:`, error.message);
        throw error;
      }
      const delay = CONFIG.retryDelay * Math.pow(2, attempt - 1);
      console.warn(
        `[${context}] Attempt ${attempt} failed. Retrying in ${delay}ms...`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

async function syncScreen() {
  try {
    const startTime = new Date();
    const screenData = await withRetry(
      () => api.get("ScreenAttributes").then((res) => res.data.value),
      "fetchscreens"
    );

    for (let i = 0; i < screenData.length; i += CONFIG.batchSize) {
      const batch = screenData.slice(i, i + CONFIG.batchSize);

      await Promise.all(
        batch.map(async (screen) => {
          try {
            const existingScreen = await prisma.screen.findFirst({
              where: {
                CinemaId: screen.CinemaId,
                ScreenNumber: screen.ScreenNumber,
              },
            });
            if (existingScreen) {
              await prisma.screen.update({
                where: {
                  ScreenID: existingScreen.ScreenID,
                },
                data: {
                  AttributeID: screen.AttributeID,
                  CinemaId: screen.CinemaId,
                  ScreenNumber: screen.ScreenNumber,
                  ShortName: screen.ShortName,
                  IsConcept: screen.IsConcept.toString(),
                  Description: screen.Description,
                  DescriptionAlt: screen.DescriptionAlt,
                },
              });
            } else {
              await prisma.screen.create({
                data: {
                  ScreenID: screen.ID,
                  AttributeID: screen.AttributeID,
                  CinemaId: screen.CinemaId,
                  ScreenNumber: screen.ScreenNumber,
                  ShortName: screen.ShortName,
                  IsConcept: screen.IsConcept.toString(),
                  Description: screen.Description,
                  DescriptionAlt: screen.DescriptionAlt,
                },
              });
            }
          } catch (error) {
            console.error(`Error processing Screen ${screen.ID}:`, error);
          }
        })
      );
    }

    console.log(
      `Screen sync completed in ${(new Date() - startTime) / 1000} seconds`
    );
  } catch (error) {
    console.error("Screen sync failed:", error);
    throw error;
  }
}

router.get("/sync-screens", async (req, res) => {
  try {
    await syncScreen();
    res.status(200).json({ message: "Screen sync completed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Screen sync failed: " + error.message });
  }
});

module.exports = router;
