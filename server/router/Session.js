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

async function syncSession() {
  try {
    const startTime = new Date();
    const session = await withRetry(
      () => api.get("Sessions").then((res) => res.data.value),
      "fetchsession"
    );

    for (let i = 0; i < session.length; i += CONFIG.batchSize) {
      const batch = session.slice(i, i + CONFIG.batchSize);

      await Promise.all(
        batch.map(async (sessionData) => {
          try {
            await prisma.$transaction(async (tx) => {
              await tx.session.upsert({
                where: { ID: sessionData.ID },
                update: {
                  CinemaId:sessionData.CinemaId,
                  cinema: sessionData.cinema,
                  ScheduledFilmId: sessionData.ScheduledFilmId,
                  SessionId: sessionData.SessionId,
                  AreaCategoryCodes: sessionData.AreaCategoryCodes,
                  MinimumTicketPriceInCents:
                    sessionData.MinimumTicketPriceInCents,
                  Showtime: sessionData.Showtime,
                  IsAllocatedSeating: sessionData.IsAllocatedSeating.toString(),
                  AllowChildAdmits: sessionData.AllowChildAdmits.toString(),
                  SeatsAvailable: sessionData.SeatsAvailable,
                  AllowComplimentaryTickets:
                    sessionData.AllowComplimentaryTickets.toString(),
                  EventId: sessionData.EventId,
                  GlobalEventId: sessionData.GlobalEventId,
                  PriceGroupCode: sessionData.PriceGroupCode,
                  ScreenName: sessionData.ScreenName,
                  ScreenNameAlt: sessionData.ScreenNameAlt,
                  ScreenNumber: sessionData.ScreenNumber,
                  CinemaOperatorCode: sessionData.CinemaOperatorCode,
                  FormatCode: sessionData.FormatCode,
                  FormatHOPK: sessionData.FormatHOPK,
                  SalesChannels: sessionData.SalesChannels,
                  Attributes: sessionData.Attributes,
                  SessionAttributesNames: sessionData.SessionAttributesNames,
                  ConceptAttributesNames: sessionData.ConceptAttributesNames,
                  AllowTicketSales: sessionData.AllowTicketSales.toString(),
                  HasDynamicallyPricedTicketsAvailable:
                    sessionData.HasDynamicallyPricedTicketsAvailable.toString(),
                  PlayThroughId: sessionData.PlayThroughId,
                  SessionBusinessDate: sessionData.SessionBusinessDate,
                  SessionDisplayPriority: sessionData.SessionDisplayPriority.toString(),
                  GroupSessionsByAttribute:
                    sessionData.GroupSessionsByAttribute.toString(),
                  SoldoutStatus: sessionData.SoldoutStatus,
                  TypeCode: sessionData.TypeCode,
                  InSeatDeliveryFee: sessionData.InSeatDeliveryFee,
                },
                create: {
                  ID: sessionData.ID,
                  CinemaId: sessionData.CinemaId,
                  cinema: sessionData.cinema,
                  ScheduledFilmId: sessionData.ScheduledFilmId,
                  SessionId: sessionData.SessionId,
                  AreaCategoryCodes: sessionData.AreaCategoryCodes,
                  MinimumTicketPriceInCents:
                    sessionData.MinimumTicketPriceInCents,
                  Showtime: sessionData.Showtime,
                  IsAllocatedSeating: sessionData.IsAllocatedSeating.toString(),
                  AllowChildAdmits: sessionData.AllowChildAdmits.toString(),
                  SeatsAvailable: sessionData.SeatsAvailable,
                  AllowComplimentaryTickets:
                    sessionData.AllowComplimentaryTickets.toString(),
                  EventId: sessionData.EventId,
                  GlobalEventId: sessionData.GlobalEventId,
                  PriceGroupCode: sessionData.PriceGroupCode,
                  ScreenName: sessionData.ScreenName,
                  ScreenNameAlt: sessionData.ScreenNameAlt,
                  ScreenNumber: sessionData.ScreenNumber,
                  CinemaOperatorCode: sessionData.CinemaOperatorCode,
                  FormatCode: sessionData.FormatCode,
                  FormatHOPK: sessionData.FormatHOPK,
                  SalesChannels: sessionData.SalesChannels,
                  Attributes: sessionData.Attributes,
                  SessionAttributesNames: sessionData.SessionAttributesNames,
                  ConceptAttributesNames: sessionData.ConceptAttributesNames,
                  AllowTicketSales: sessionData.AllowTicketSales.toString(),
                  HasDynamicallyPricedTicketsAvailable:
                    sessionData.HasDynamicallyPricedTicketsAvailable.toString(),
                  PlayThroughId: sessionData.PlayThroughId,
                  SessionBusinessDate: sessionData.SessionBusinessDate,
                  SessionDisplayPriority: sessionData.SessionDisplayPriority.toString(),
                  GroupSessionsByAttribute:
                    sessionData.GroupSessionsByAttribute.toString(),
                  SoldoutStatus: sessionData.SoldoutStatus,
                  TypeCode: sessionData.TypeCode,
                  InSeatDeliveryFee: sessionData.InSeatDeliveryFee,
                },
              });
            });
          } catch (error) {
            console.error(`Error processing Film ${sessionData.ID}:`, error);
          }
        })
      );
    }

    console.log(
      `Session sync completed in ${(new Date() - startTime) / 1000} seconds`
    );
  } catch (error) {
    console.error("Session sync failed:", error);
    throw error;
  }
}

router.get("/sync-sessions", async (req, res) => {
  try {
    await syncSession();
    res.status(200).json({ message: "Film sync completed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Film sync failed: " + error.message });
  }
});

module.exports = router;

