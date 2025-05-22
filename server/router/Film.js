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

async function syncFilms() {
  try {
    const startTime = new Date();
    const film = await withRetry(
      () => api.get("Films").then((res) => res.data.value),
      "fetchfilms"
    );
    const ticketPrice = 100;

    for (let i = 0; i < film.length; i += CONFIG.batchSize) {
      const batch = film.slice(i, i + CONFIG.batchSize);

      await Promise.all(
        batch.map(async (filmData) => {
          try {
            await prisma.$transaction(async (tx) => {
              await tx.film.upsert({
                where: { FilmID: filmData.ID },
                update: {
                  ShortCode: filmData.ShortCode,
                  Title: filmData.Title,
                  Rating: filmData.Rating,
                  RatingDescription: filmData.RatingDescription
                    ? filmData.RatingDescription.slice(0, 255)
                    : "null",
                  Synopsis: filmData.Synopsis
                    ? filmData.Synopsis.slice(0, 255)
                    : "null",
                  SynopsisAlt: filmData.SynopsisAlt
                    ? filmData.SynopsisAlt.slice(0, 255)
                    : "null",
                  ShortSynopsis: filmData.ShortSynopsis
                    ? filmData.ShortSynopsis.slice(0, 255)
                    : "null",
                  HOFilmCode: filmData.HOFilmCode,
                  CorporateFilmId: filmData.CorporateFilmId,
                  RunTime: filmData.RunTime,
                  OpeningDate: filmData.OpeningDate,
                  GraphicUrl: filmData.GraphicUrl,
                  FilmNameUrl: filmData.FilmNameUrl,
                  TrailerUrl: filmData.TrailerUrl,
                  IsComingSoon: filmData.IsComingSoon,
                  IsScheduledAtCinema: filmData.IsScheduledAtCinema,
                  TitleAlt: filmData.TitleAlt,
                  RatingAlt: filmData.RatingAlt,
                  RatingDescriptionAlt: filmData.RatingDescriptionAlt
                    ? filmData.RatingDescriptionAlt.slice(0, 255)
                    : "null",
                  ShortSynopsisAlt: filmData.ShortSynopsisAlt
                    ? filmData.ShortSynopsisAlt.slice(0, 255)
                    : "null",
                  WebsiteUrl: filmData.WebsiteUrl,
                  GenreId: filmData.GenreId,
                  GenreId2: filmData.GenreId2,
                  GenreId3: filmData.GenreId3,
                  EDICode: filmData.EDICode,
                  TwitterTag: filmData.TwitterTag,
                  FilmWebId: filmData.FilmWebId,
                  MovieXchangeCode: filmData.MovieXchangeCode,
                  DistributorName: filmData.DistributorName,
                  GovernmentCode: filmData.GovernmentCode,
                  SynopsisTranslations: filmData.SynopsisTranslations,
                  TitleTranslations: filmData.TitleTranslations,
                  ShortSynopsisTranslations: filmData.ShortSynopsisTranslations,
                  RatingDescriptionTranslations:
                    filmData.RatingDescriptionTranslations,
                  AdditionalUrls: filmData.AdditionalUrls,
                  FormatCodes: filmData.FormatCodes,
                  CustomerRatingStatistics: filmData.CustomerRatingStatistics,
                  CustomerRatingTrailerStatistics:
                    filmData.CustomerRatingTrailerStatistics,
                },
                create: {
                  FilmID: filmData.ID,
                  ShortCode: filmData.ShortCode,
                  Title: filmData.Title,
                  Rating: filmData.Rating,
                  RatingDescription: filmData.RatingDescription
                    ? filmData.RatingDescription.slice(0, 255)
                    : "null",
                  Synopsis: filmData.Synopsis
                    ? filmData.Synopsis.slice(0, 255)
                    : "null",
                  SynopsisAlt: filmData.SynopsisAlt
                    ? filmData.SynopsisAlt.slice(0, 255)
                    : "null",
                  ShortSynopsis: filmData.ShortSynopsis
                    ? filmData.ShortSynopsis.slice(0, 255)
                    : "null",
                  HOFilmCode: filmData.HOFilmCode,
                  CorporateFilmId: filmData.CorporateFilmId,
                  RunTime: filmData.RunTime,
                  OpeningDate: filmData.OpeningDate,
                  GraphicUrl: filmData.GraphicUrl,
                  FilmNameUrl: filmData.FilmNameUrl,
                  TrailerUrl: filmData.TrailerUrl,
                  IsComingSoon: filmData.IsComingSoon,
                  IsScheduledAtCinema: filmData.IsScheduledAtCinema,
                  TitleAlt: filmData.TitleAlt,
                  RatingAlt: filmData.RatingAlt,
                  RatingDescriptionAlt: filmData.RatingDescriptionAlt
                    ? filmData.RatingDescriptionAlt.slice(0, 255)
                    : "null",
                  ShortSynopsisAlt: filmData.ShortSynopsisAlt
                    ? filmData.ShortSynopsisAlt.slice(0, 255)
                    : "null",
                  WebsiteUrl: filmData.WebsiteUrl,
                  GenreId: filmData.GenreId,
                  GenreId2: filmData.GenreId2,
                  GenreId3: filmData.GenreId3,
                  EDICode: filmData.EDICode,
                  TwitterTag: filmData.TwitterTag,
                  FilmWebId: filmData.FilmWebId,
                  MovieXchangeCode: filmData.MovieXchangeCode,
                  DistributorName: filmData.DistributorName,
                  GovernmentCode: filmData.GovernmentCode,
                  SynopsisTranslations: filmData.SynopsisTranslations,
                  TitleTranslations: filmData.TitleTranslations,
                  ShortSynopsisTranslations: filmData.ShortSynopsisTranslations,
                  RatingDescriptionTranslations:
                    filmData.RatingDescriptionTranslations,
                  AdditionalUrls: filmData.AdditionalUrls,
                  FormatCodes: filmData.FormatCodes,
                  CustomerRatingStatistics: filmData.CustomerRatingStatistics,
                  ticketPrice:ticketPrice,
                  CustomerRatingTrailerStatistics:
                    filmData.CustomerRatingTrailerStatistics,
                },
              });
            });
          } catch (error) {
            console.error(`Error processing Film ${filmData.ID}:`, error);
          }
        })
      );
    }

    console.log(
      `Film sync completed in ${(new Date() - startTime) / 1000} seconds`
    );
  } catch (error) {
    console.error("Film sync failed:", error);
    throw error;
  }
}

router.get("/sync-films", async (req, res) => {
  try {
    await syncFilms();
    res.status(200).json({ message: "Film sync completed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Film sync failed: " + error.message });
  }
});

module.exports = router;

