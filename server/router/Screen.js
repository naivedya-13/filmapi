const dotenv = require("dotenv");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const express = require("express");

dotenv.config();
const prisma = new PrismaClient();
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

// async function syncScreen() {
//   try {
//     const startTime = new Date(); // Define startTime here

//     const screenAttributes = await withRetry(
//       () => api.get("ScreenAttributes").then((res) => res.data.value),
//       "fetchScreen"
//     );

//     for (let i = 0; i < screenAttributes.length; i += CONFIG.batchSize) {
//       const batch = screenAttributes.slice(i, i + CONFIG.batchSize);

//       await Promise.all(
//         batch.map(async (screenAttr) => {
//           try {
//             // Fixed comparison logic - now using screenAttr instead of undefined variables
//             // Removed the condition as it was using undefined variables

//             const screenData = {
//               id: screenAttr.ID,
//               cinemaId: screenAttr.CinemaId,
//               screenNumber: screenAttr.ScreenNumber,
//               shortName: screenAttr.ShortName,
//               isConcept: screenAttr.IsConcept,
//               description: screenAttr.Description,
//               descriptionAlt: screenAttr.DescriptionAlt,
//             };
//             await prisma.screenAttribute.upsert({
//               where: {
//                 id: screenAttr.ID,
//                 screenNumber: screenAttr.ScreenNumber,
//               },
//               update: screenData,
//               create: screenData,
//             });
//           } catch (error) {
//             console.error(
//               `Error processing screen attribute ${screenAttr.ID}:`,
//               error.message
//             );
//           }
//         })
//       );
//     }

//     console.log(
//       `Screen sync completed in ${(new Date() - startTime) / 1000} seconds`
//     );
//   } catch (error) {
//     console.error("Screen sync failed:", error);
//     throw error;
//   }
// }
async function syncScreen() {
  try {
    const startTime = new Date();

    const screenAttributes = await withRetry(
      () => api.get("ScreenAttributes").then((res) => res.data.value),
      "fetchScreen"
    );

    for (let i = 0; i < screenAttributes.length; i += CONFIG.batchSize) {
      const batch = screenAttributes.slice(i, i + CONFIG.batchSize);

      await Promise.all(
        batch.map(async (screenAttr) => {
          try {
            const screenData = {
              id: screenAttr.ID,
              cinemaId: screenAttr.CinemaId,
              screenNumber: screenAttr.ScreenNumber,
              shortName: screenAttr.ShortName,
              isConcept: screenAttr.IsConcept,
              description: screenAttr.Description,
              descriptionAlt: screenAttr.DescriptionAlt,
            };

            // Find if the screen already exists using findFirst with composite condition
            const existingScreen = await prisma.screenAttribute.findFirst({
              where: {
                cinemaId: screenAttr.CinemaId,
                screenNumber: screenAttr.ScreenNumber,
              },
            });

            if (existingScreen) {
              // Update existing record
              await prisma.screenAttribute.update({
                where: {
                  mainID: existingScreen.mainID
                },
                data: screenData
              });
            } else {
              // Create new record
              await prisma.screenAttribute.create({
                data: screenData
              });
            }
          } catch (error) {
            console.error(
              `Error processing screen attribute ${screenAttr.ID}:`,
              error.message
            );
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
    res
      .status(200)
      .json({ message: "Screen attributes sync completed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Screen attributes sync failed: " + error.message });
  }
});

module.exports = router;
