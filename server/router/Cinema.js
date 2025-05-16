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
              // Helper function for translations
              const processTranslations = (translations) =>
                translations?.map((t) => ({
                  languageTag: t.LanguageTag,
                  text: t.Text,
                })) || [];

              // Upsert main cinema record
              const cinema = await tx.cinema.upsert({
                where: { id: cinemaData.ID },
                update: {
                  cinemaNationalId: cinemaData.CinemaNationalId,
                  name: cinemaData.Name,
                  nameAlt: cinemaData.NameAlt,
                  phoneNumber: cinemaData.PhoneNumber,
                  emailAddress: cinemaData.EmailAddress,
                  address1: cinemaData.Address1,
                  address2: cinemaData.Address2,
                  city: cinemaData.City,
                  latitude: parseFloat(cinemaData.Latitude),
                  longitude: parseFloat(cinemaData.Longitude),
                  parkingInfo: cinemaData.ParkingInfo,
                  loyaltyCode: cinemaData.LoyaltyCode,
                  isGiftStore: cinemaData.IsGiftStore,
                  description: cinemaData.Description?.slice(0, 255),
                  descriptionAlt: cinemaData.DescriptionAlt?.slice(0, 255),
                  publicTransport: cinemaData.PublicTransport,
                  currencyCode: cinemaData.CurrencyCode,
                  allowPrintAtHomeBookings: cinemaData.AllowPrintAtHomeBookings,
                  allowOnlineVoucherValidation:
                    cinemaData.AllowOnlineVoucherValidation,
                  displaySofaSeats: cinemaData.DisplaySofaSeats,
                  timeZoneId: cinemaData.TimeZoneId,
                  hopk: cinemaData.HOPK,
                  tipsCompulsory: cinemaData.TipsCompulsory,
                  tipPercentages: cinemaData.TipPercentages,
                  serverName: cinemaData.ServerName,
                  primaryDataLanguage: cinemaData.PrimaryDataLanguage,
                  alternateDataLanguage1: cinemaData.AlternateDataLanguage1,
                  alternateDataLanguage2: cinemaData.AlternateDataLanguage2,
                  alternateDataLanguage3: cinemaData.AlternateDataLanguage3,
                  hasConcessions: cinemaData.HasConcessions,
                },
                create: {
                  id: cinemaData.ID,
                  cinemaNationalId: cinemaData.CinemaNationalId,
                  name: cinemaData.Name,
                  nameAlt: cinemaData.NameAlt,
                  phoneNumber: cinemaData.PhoneNumber,
                  emailAddress: cinemaData.EmailAddress,
                  address1: cinemaData.Address1,
                  address2: cinemaData.Address2,
                  city: cinemaData.City,
                  latitude: parseFloat(cinemaData.Latitude),
                  longitude: parseFloat(cinemaData.Longitude),
                  parkingInfo: cinemaData.ParkingInfo,
                  loyaltyCode: cinemaData.LoyaltyCode,
                  isGiftStore: cinemaData.IsGiftStore,
                  description: cinemaData.Description?.slice(0, 255),
                  descriptionAlt: cinemaData.DescriptionAlt?.slice(0, 255),
                  publicTransport: cinemaData.PublicTransport,
                  currencyCode: cinemaData.CurrencyCode,
                  allowPrintAtHomeBookings: cinemaData.AllowPrintAtHomeBookings,
                  allowOnlineVoucherValidation:
                    cinemaData.AllowOnlineVoucherValidation,
                  displaySofaSeats: cinemaData.DisplaySofaSeats,
                  timeZoneId: cinemaData.TimeZoneId,
                  hopk: cinemaData.HOPK,
                  tipsCompulsory: cinemaData.TipsCompulsory,
                  tipPercentages: cinemaData.TipPercentages,
                  serverName: cinemaData.ServerName,
                  primaryDataLanguage: cinemaData.PrimaryDataLanguage,
                  alternateDataLanguage1: cinemaData.AlternateDataLanguage1,
                  alternateDataLanguage2: cinemaData.AlternateDataLanguage2,
                  alternateDataLanguage3: cinemaData.AlternateDataLanguage3,
                  hasConcessions: cinemaData.HasConcessions,
                },
              });

              const translationCreates = [];

              // Name translations
              if (cinemaData.NameTranslations?.length) {
                translationCreates.push(
                  ...cinemaData.NameTranslations.map((t) =>
                    tx.translation.create({
                      data: {
                        languageTag: t.LanguageTag,
                        text: t.Text,
                        cinemaName: { connect: { id: cinema.id } },
                      },
                    })
                  )
                );
              }

              // Description translations
              if (cinemaData.DescriptionTranslations?.length) {
                translationCreates.push(
                  ...cinemaData.DescriptionTranslations.map((t) =>
                    tx.translation.create({
                      data: {
                        languageTag: t.LanguageTag,
                        text: t.Text,
                        cinemaDescription: { connect: { id: cinema.id } },
                      },
                    })
                  )
                );
              }

              if (translationCreates.length > 0) {
                await Promise.all(translationCreates);
              }

              // Process Screen Attributes
              await tx.screenAttribute.deleteMany({
                where: { cinemaId: cinema.id },
              });
              if (cinemaData.ScreenAttributes?.length) {
                await tx.screenAttribute.createMany({
                  data: cinemaData.ScreenAttributes.map((sa) => ({
                    id: sa.ID,
                    cinemaId: cinema.id,
                    attributeId: sa.AttributeID,
                    screenNumber: sa.ScreenNumber,
                    shortName: sa.ShortName,
                    isConcept: sa.IsConcept,
                    description: sa.Description,
                    descriptionAlt: sa.DescriptionAlt,
                  })),
                });
              }

              // Process Concept Attributes
              const conceptAttributes = cinemaData.ConceptAttributes || [];
              for (const attr of conceptAttributes) {
                await tx.attribute.upsert({
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
                    isUsedForSessionAdvertising:
                      attr.IsUsedForSessionAdvertising,
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
                    isUsedForSessionAdvertising:
                      attr.IsUsedForSessionAdvertising,
                    displayPriority: attr.DisplayPriority,
                    isPromoted: attr.IsPromoted,
                  },
                });
              }

              // Process Cinema Operators
              await tx.cinemaOperator.deleteMany({
                where: { cinemaId: cinema.id },
              });
              if (cinemaData.CinemaOperators?.length) {
                await tx.cinemaOperator.createMany({
                  data: cinemaData.CinemaOperators.map((co) => ({
                    id: co.ID,
                    cinemaId: cinema.id,
                    code: co.Code,
                    name: co.Name,
                    shortName: co.ShortName,
                    isDefault: co.IsDefault,
                    hoOperatorCode: co.HoOperatorCode,
                  })),
                });
              }

              // Process Scheduled Films
              for (const sf of cinemaData.ScheduledFilms || []) {
                const scheduledFilm = await tx.scheduledFilm.upsert({
                  where: { id: sf.ID },
                  update: {
                    title: sf.Title,
                    titleAlt: sf.TitleAlt,
                    distributor: sf.Distributor,
                    rating: sf.Rating,
                    ratingAlt: sf.RatingAlt,
                    synopsis: sf.Synopsis?.slice(0, 255),
                    synopsisAlt: sf.SynopsisAlt?.slice(0, 255),
                    openingDate: sf.OpeningDate
                      ? new Date(sf.OpeningDate)
                      : null,
                    filmHopk: sf.FilmHOPK,
                    filmHoCode: sf.FilmHOCode,
                    shortCode: sf.ShortCode,
                    runTime: sf.RunTime,
                    trailerUrl: sf.TrailerUrl,
                    loyaltyAdvanceBookingDate: sf.LoyaltyAdvanceBookingDate
                      ? new Date(sf.LoyaltyAdvanceBookingDate)
                      : null,
                    advanceBookingDate: sf.AdvanceBookingDate
                      ? new Date(sf.AdvanceBookingDate)
                      : null,
                    hasDynamicallyPricedTickets: sf.HasDynamicallyPricedTickets,
                    isPlayThroughMarketingFilm: sf.IsPlayThroughMarketingFilm,
                  },
                  create: {
                    id: sf.ID,
                    cinemaId: cinema.id,
                     title: sf.Title,
                    titleAlt: sf.TitleAlt,
                    distributor: sf.Distributor,
                    rating: sf.Rating,
                    ratingAlt: sf.RatingAlt,
                    synopsis: sf.Synopsis?.slice(0, 255),
                    synopsisAlt: sf.SynopsisAlt?.slice(0, 255),
                    openingDate: sf.OpeningDate
                      ? new Date(sf.OpeningDate)
                      : null,
                    filmHopk: sf.FilmHOPK,
                    filmHoCode: sf.FilmHOCode,
                    shortCode: sf.ShortCode,
                    runTime: sf.RunTime,
                    trailerUrl: sf.TrailerUrl,
                    loyaltyAdvanceBookingDate: sf.LoyaltyAdvanceBookingDate
                      ? new Date(sf.LoyaltyAdvanceBookingDate)
                      : null,
                    advanceBookingDate: sf.AdvanceBookingDate
                      ? new Date(sf.AdvanceBookingDate)
                      : null,
                    hasDynamicallyPricedTickets: sf.HasDynamicallyPricedTickets,
                    isPlayThroughMarketingFilm: sf.IsPlayThroughMarketingFilm,
                  },
                });

                // Process Sessions
                const sessions = [
                  ...(sf.Sessions || []),
                  ...(sf.FirstDaysSessions || []),
                  ...(sf.FutureSessions || []),
                ];

                for (const session of sessions) {
                  await tx.session.upsert({
                    where: { id: session.ID },
                    update: {
                      sessionId: session.SessionId,
                      showtime: new Date(session.Showtime),
                      isAllocatedSeating: session.IsAllocatedSeating,
                      allowChildAdmits: session.AllowChildAdmits,
                      seatsAvailable: session.SeatsAvailable,
                      allowComplimentaryTickets:
                        session.AllowComplimentaryTickets,
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
                      hasDynamicallyPricedTickets:
                        session.HasDynamicallyPricedTickets,
                      playThroughId: session.PlayThroughId,
                      sessionBusinessDate: session.SessionBusinessDate,
                      sessionDisplayPriority: session.SessionDisplayPriority,
                      groupSessionsByAttribute:
                        session.GroupSessionsByAttribute,
                      soldoutStatus: session.SoldoutStatus,
                      typeCode: session.TypeCode,
                      minimumTicketPriceInCents:
                        session.MinimumTicketPriceInCents,
                    },
                    create: {
                      id: session.ID,
                      cinemaId: cinema.id,
                      scheduledFilmId: scheduledFilm.id,
                    },
                  });
                }
              }
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