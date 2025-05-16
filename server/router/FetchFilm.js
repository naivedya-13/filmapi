const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/films/search", async (req, res) => {
  try {
    const { title, from, page = 1, limit = 10 } = req.body;

    const filters = {};
    if (title?.trim()) {
      filters.title = {
        contains: title.trim(),
      };
    }
    if (from?.trim()) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        const dateStr = fromDate.toISOString().split("T")[0];
        filters.openingDate = {
          gte: dateStr,
        };
      }
    }

    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const films = await prisma.film.findMany({
      where: filters,
      orderBy: { title: "asc" },
      skip,
      take: parsedLimit,
      select: {
        id: true,
        title: true,
        rating: true,
        isComingSoon: true,
        isScheduledAtCinema: true,
        distributorName: true,
        openingDate: true,
        synopsis: true,
      },
    });

    const total = await prisma.film.count({ where: filters });

    res.status(200).json({
      data: films,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error("Error in /films/search:", error);
    res.status(500).json({
      error: "Failed to search films",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
