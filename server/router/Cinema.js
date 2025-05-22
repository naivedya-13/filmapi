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

async function syncCinemas() {
  try {
    const startTime = new Date();
    const cinemas = await withRetry(
      () => api.get("Cinemas").then((res) => res.data.value),
      "fetchCinemas"
    );

    for (let i = 0; i < cinemas.length; i += CONFIG.batchSize) {
      const batch = cinemas.slice(i, i + CONFIG.batchSize);

      await Promise.all(
        batch.map(async (cinemaData) => {
          try {
            await prisma.$transaction(async (tx) => {
              await tx.cinema.upsert({
                where: { CinemaID: cinemaData.ID },
                update: {
                  CinemaNationalId: cinemaData.CinemaNationalId,
                  Name: cinemaData.Name,
                  NameAlt: cinemaData.NameAlt,
                  ScheduledFilm: cinemaData.ScheduledFilm,
                  MinimumTicketPriceInCents:
                    cinemaData.MinimumTicketPriceInCents,
                  Showtime: cinemaData.Showtime,
                  IsAllocatedSeating: cinemaData.IsAllocatedSeating,
                  AllowChildAdmits: cinemaData.AllowChildAdmits,
                  SeatsAvailable: cinemaData.SeatsAvailable,
                  AllowComplimentaryTickets:
                    cinemaData.AllowComplimentaryTickets,
                  EventId: cinemaData.EventId,
                  GlobalEventId: cinemaData.GlobalEventId,
                  PriceGroupCode: cinemaData.PriceGroupCode,
                  ScreenName: cinemaData.ScreenName,
                  ScreenNameAlt: cinemaData.ScreenNameAlt,
                  ScreenNumber: cinemaData.ScreenNumber,
                  CinemaOperatorCode: cinemaData.CinemaOperatorCode,
                  FormatCode: cinemaData.FormatCode,
                  FormatHOPK: cinemaData.FormatHOPK,
                  SalesChannels: cinemaData.SalesChannels,
                  Attributes: cinemaData.Attributes,
                  ShortNameTranslations: cinemaData.ShortNameTranslations,
                  MessageTranslations: cinemaData.MessageTranslations,
                  SessionAttributeCinemaIDs:
                    cinemaData.SessionAttributeCinemaIDs,
                  IsPromoted: cinemaData.IsPromoted,
                  SessionAttributesNames: cinemaData.SessionAttributesNames,
                  ConceptAttributesNames: cinemaData.ConceptAttributesNames,
                  AllowTicketSales: cinemaData.AllowTicketSales,
                  HasDynamicallyPricedTicketsAvailable:
                    cinemaData.HasDynamicallyPricedTicketsAvailable,
                  PlayThroughId: cinemaData.PlayThroughId,
                  SessionBusinessDate: cinemaData.SessionBusinessDate,
                  SessionDisplayPriority: cinemaData.SessionDisplayPriority,
                  GroupSessionsByAttribute: cinemaData.GroupSessionsByAttribute,
                  SoldoutStatus: cinemaData.SoldoutStatus,
                  TypeCode: cinemaData.TypeCode,
                  InSeatDeliveryFee: cinemaData.InSeatDeliveryFee,
                  FirstDaysSessions: cinemaData.FirstDaysSessions,
                },
                create: {
                  CinemaID: cinemaData.ID,
                  CinemaNationalId: cinemaData.CinemaNationalId,
                  Name: cinemaData.Name,
                  NameAlt: cinemaData.NameAlt,
                  ScheduledFilm: cinemaData.ScheduledFilm,
                  MinimumTicketPriceInCents:
                    cinemaData.MinimumTicketPriceInCents,
                  Showtime: cinemaData.Showtime,
                  IsAllocatedSeating: cinemaData.IsAllocatedSeating,
                  AllowChildAdmits: cinemaData.AllowChildAdmits,
                  SeatsAvailable: cinemaData.SeatsAvailable,
                  AllowComplimentaryTickets:
                    cinemaData.AllowComplimentaryTickets,
                  EventId: cinemaData.EventId,
                  GlobalEventId: cinemaData.GlobalEventId,
                  PriceGroupCode: cinemaData.PriceGroupCode,
                  ScreenName: cinemaData.ScreenName,
                  ScreenNameAlt: cinemaData.ScreenNameAlt,
                  ScreenNumber: cinemaData.ScreenNumber,
                  CinemaOperatorCode: cinemaData.CinemaOperatorCode,
                  FormatCode: cinemaData.FormatCode,
                  FormatHOPK: cinemaData.FormatHOPK,
                  SalesChannels: cinemaData.SalesChannels,
                  Attributes: cinemaData.Attributes,
                  ShortNameTranslations: cinemaData.ShortNameTranslations,
                  MessageTranslations: cinemaData.MessageTranslations,
                  SessionAttributeCinemaIDs:
                    cinemaData.SessionAttributeCinemaIDs,
                  IsPromoted: cinemaData.IsPromoted,
                  SessionAttributesNames: cinemaData.SessionAttributesNames,
                  ConceptAttributesNames: cinemaData.ConceptAttributesNames,
                  AllowTicketSales: cinemaData.AllowTicketSales,
                  HasDynamicallyPricedTicketsAvailable:
                    cinemaData.HasDynamicallyPricedTicketsAvailable,
                  PlayThroughId: cinemaData.PlayThroughId,
                  SessionBusinessDate: cinemaData.SessionBusinessDate,
                  SessionDisplayPriority: cinemaData.SessionDisplayPriority,
                  GroupSessionsByAttribute: cinemaData.GroupSessionsByAttribute,
                  SoldoutStatus: cinemaData.SoldoutStatus,
                  TypeCode: cinemaData.TypeCode,
                  InSeatDeliveryFee: cinemaData.InSeatDeliveryFee,
                  FirstDaysSessions: cinemaData.FirstDaysSessions,
                },
              });
            });
          } catch (error) {
            console.error(`Error processing cinema ${cinemaData.ID}:`, error);
          }
        })
      );
    }

    console.log(
      `Cinema sync completed in ${(new Date() - startTime) / 1000} seconds`
    );
  } catch (error) {
    console.error("Cinema sync failed:", error);
    throw error;
  }
}

router.get("/sync-cinemas", async (req, res) => {
  try {
    await syncCinemas();
    res.status(200).json({ message: "Cinema sync completed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Cinema sync failed: " + error.message });
  }
});

module.exports = router;
