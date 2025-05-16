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

async function syncSession() {
  try {
    const startTime = new Date();
    const sessions = await withRetry(() =>
      api.get("Sessions").then((res) => res.data.value), "fetchSessions"
    );

    for (let i = 0; i < sessions.length; i += CONFIG.batchSize) {
      const batch = sessions.slice(i, i + CONFIG.batchSize);

      await Promise.all(
        batch.map(async (session) => {
          try {

            // Handle nested SessionInSeatDeliveryFee if available
            let inSeatDeliveryFeeId = null;
            if (session.InSeatDeliveryFee) {
              const fee = await prisma.sessionInSeatDeliveryFee.create({
                data: {
                  priceType: session.InSeatDeliveryFee.PriceType,
                  fixedPriceInCents: session.InSeatDeliveryFee.FixedPriceInCents,
                },
              });
              inSeatDeliveryFeeId = fee.id;
            }

            const sessionData = {
              id: session.ID,
              cinemaId: session.CinemaId,
              scheduledFilmId: session.ScheduledFilmId,
              sessionId: session.SessionId,
              showtime: new Date(session.Showtime),
              isAllocatedSeating: session.IsAllocatedSeating,
              allowChildAdmits: session.AllowChildAdmits,
              seatsAvailable: session.SeatsAvailable,
              allowComplimentaryTickets: session.AllowComplimentaryTickets,
              eventId: session.EventId,
              globalEventId: session.GlobalEventId,
              priceGroupCode: session.PriceGroupCode,
              screenName: session.ScreenName,
              screenNameAlt: session.ScreenNameAlt,
              screenNumber: session.ScreenNumber,
              cinemaOperatorCode: session.CinemaOperatorCode,
              formatCode: session.FormatCode,
              formatHOPK: session.FormatHOPK,
              salesChannels: session.SalesChannels,
              allowTicketSales: session.AllowTicketSales,
              hasDynamicallyPricedTickets: session.HasDynamicallyPricedTicketsAvailable,
              playThroughId: session.PlayThroughId,
              sessionBusinessDate: session.SessionBusinessDate,
              sessionDisplayPriority: session.SessionDisplayPriority,
              groupSessionsByAttribute: session.GroupSessionsByAttribute,
              soldoutStatus: session.SoldoutStatus,
              typeCode: session.TypeCode,
              minimumTicketPriceInCents: session.MinimumTicketPriceInCents,
              inSeatDeliveryFeeId,
            };

            await prisma.session.upsert({
              where: { id: session.ID },
              update: sessionData,
              create: sessionData,
            });

            // Handle Area Categories
            await prisma.sessionAreaCategory.deleteMany({
              where: { sessionId: session.ID },
            });
            if (session.AreaCategoryCodes?.length) {
              await prisma.sessionAreaCategory.createMany({
                data: session.AreaCategoryCodes.map((code) => ({
                  sessionId: session.ID,
                  code,
                })),
              });
            }

            // Handle Attributes
            for (const attr of session.Attributes || []) {
              await prisma.attribute.upsert({
                where: { id: attr.ID },
                update: {
                  description: attr.Description,
                  shortName: attr.ShortName,
                  altDescription: attr.AltDescription,
                  altShortName: attr.AltShortName,
                  message: attr.Message,
                  messageAlt: attr.MessageAlt,
                  warningMessage: attr.WarningMessage,
                  warningMessageAlt: attr.WarningMessageAlt,
                  salesChannels: attr.SalesChannels,
                  isUsedForConcepts: attr.IsUsedForConcepts,
                  isUsedForSessionAdvertising: attr.IsUsedForSessionAdvertising,
                  displayPriority: attr.DisplayPriority,
                  isPromoted: attr.IsPromoted,
                },
                create: {
                  id: attr.ID,
                  description: attr.Description,
                  shortName: attr.ShortName,
                  altDescription: attr.AltDescription,
                  altShortName: attr.AltShortName,
                  message: attr.Message,
                  messageAlt: attr.MessageAlt,
                  warningMessage: attr.WarningMessage,
                  warningMessageAlt: attr.WarningMessageAlt,
                  salesChannels: attr.SalesChannels,
                  isUsedForConcepts: attr.IsUsedForConcepts,
                  isUsedForSessionAdvertising: attr.IsUsedForSessionAdvertising,
                  displayPriority: attr.DisplayPriority,
                  isPromoted: attr.IsPromoted,
                },
              });

              await prisma.session.update({
                where: { id: session.ID },
                data: {
                  attributes: {
                    connect: { id: attr.ID },
                  },
                },
              });
            }

          } catch (error) {
            console.error(`Error processing session ${session.ID}:`, error.message);
          }
        })
      );
    }

    console.log(`Session sync completed in ${(new Date() - startTime) / 1000} seconds`);
  } catch (error) {
    console.error("Session sync failed:", error);
    throw error;
  }
}


router.get("/sync-sessions", async (req, res) => {
  try {
    await syncSession();
    res
      .status(200)
      .json({ message: "Sessions sync completed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Screen attributes sync failed: " + error.message });
  }
});

module.exports = router;
