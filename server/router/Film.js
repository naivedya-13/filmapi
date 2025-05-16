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
    const films = await withRetry(
      () => api.get("Films").then((res) => res.data.value),
      "fetchFilms"
    );

    for (let i = 0; i < films.length; i += CONFIG.batchSize) {
      const batch = films.slice(i, i + CONFIG.batchSize);

      await Promise.all(
        batch.map(async (film) => {
          const filmAgeHours =
            (new Date() - new Date(film.Showtime)) / (1000 * 60 * 60);
          if (filmAgeHours > 1) {
            try {
              await prisma.film.delete({ where: { id: film.ID } });
            } catch (error) {
              console.error(
                `Error deleting old film ${film.ID}:`,
                error.message
              );
            }
            return;
          }

          const processRelations = (translations) => ({
            create: (translations || []).map((trans) => ({
              languageTag: trans.LanguageTag,
              text: trans.Text,
            })),
          });

          const filmData = {
            id: film.ID,
            shortCode: film.ShortCode,
            title: film.Title,
            rating: film.Rating,
            ratingDescription: film.RatingDescription
              ? film.RatingDescription.slice(0, 100)
              : null,
            synopsis: film.Synopsis ? film.Synopsis.slice(0, 100) : null,
            synopsisAlt: film.SynopsisAlt
              ? film.SynopsisAlt.slice(0, 100)
              : null,
            shortSynopsis: film.ShortSynopsis
              ? film.ShortSynopsis.slice(0, 100)
              : null,
            shortSynopsisAlt: film.ShortSynopsisAlt
              ? film.ShortSynopsisAlt.slice(0, 100)
              : null,
            hoFilmCode: film.HOFilmCode,
            corporateFilmId: film.CorporateFilmId,
            runTime: film.RunTime,
            openingDate: film.OpeningDate,
            graphicUrl: film.GraphicUrl,
            filmNameUrl: film.FilmNameUrl,
            trailerUrl: film.TrailerUrl,
            isComingSoon: film.IsComingSoon,
            isScheduledAtCinema: film.IsScheduledAtCinema,
            titleAlt: film.TitleAlt,
            ratingAlt: film.RatingAlt,
            ratingDescriptionAlt: film.RatingDescriptionAlt
              ? film.RatingDescriptionAlt.slice(0, 100)
              : null,
            websiteUrl: film.WebsiteUrl,
            genreId: film.GenreId,
            genreId2: film.GenreId2,
            genreId3: film.GenreId3,
            ediCode: film.EDICode,
            twitterTag: film.TwitterTag,
            filmWebId: film.FilmWebId,
            movieXchangeCode: film.MovieXchangeCode,
            distributorName: film.DistributorName,
            governmentCode: film.GovernmentCode,
            synopsisTranslations: processRelations(film.SynopsisTranslations),
            titleTranslations: processRelations(film.TitleTranslations),
            shortSynopsisTranslations: processRelations(
              film.ShortSynopsisTranslations
            ),
            ratingDescriptionTranslations: processRelations(
              film.RatingDescriptionTranslations
            ),
            formatCodes: {
              create: (film.FormatCodes || []).map((code) => ({ code })),
            },
            additionalUrls: {
              create: (film.AdditionalUrls || []).map((url) => ({
                sequence: url.Sequence,
                description: url.Description,
                url: url.Url,
              })),
            },
          };
          try {
            await prisma.film.upsert({
              where: { id: film.ID },
              update: {
                ...filmData,
                formatCodes: {
                  deleteMany: {},
                  create: filmData.formatCodes.create,
                },
                additionalUrls: {
                  deleteMany: {},
                  create: filmData.additionalUrls.create,
                },
                synopsisTranslations: {
                  deleteMany: {},
                  create: filmData.synopsisTranslations.create,
                },
                titleTranslations: {
                  deleteMany: {},
                  create: filmData.titleTranslations.create,
                },
                shortSynopsisTranslations: {
                  deleteMany: {},
                  create: filmData.shortSynopsisTranslations.create,
                },
                ratingDescriptionTranslations: {
                  deleteMany: {},
                  create: filmData.ratingDescriptionTranslations.create,
                },
              },
              create: filmData,
            });
          } catch (error) {
            console.error(`Error processing film ${film.ID}:`, error.message);
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
    res
      .status(200)
      .json({ message: "Film attributes sync completed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Film attributes sync failed: " + error.message });
  }
});

module.exports = router;
