const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// Get all screens with optional filtering
router.get("/screens", async (req, res) => {
  try {
    const { cinemaId, screenNumber, shortName, isConcept } = req.query;

    const filters = {};
    
    // Apply filters only if they are provided
    if (cinemaId) {
      filters.cinemaId = cinemaId;
    }
    
    if (screenNumber && !isNaN(parseInt(screenNumber))) {
      filters.screenNumber = parseInt(screenNumber);
    }
    
    if (shortName) {
      // MySQL string search using LIKE
      filters.shortName = { 
        contains: shortName 
      };
    }
    
    if (isConcept !== undefined && isConcept !== "") {
      filters.isConcept = isConcept === "true";
    }

    const screens = await prisma.screenAttribute.findMany({
      where: filters,
      orderBy: {
        screenNumber: "asc",
      },
    });

    res.status(200).json(screens);
  } catch (error) {
    console.error("Failed to fetch screens:", error.message);
    res.status(500).json({ error: "Failed to fetch screen attributes" });
  }
});

// Get a single screen by ID
router.get("/screens/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const screen = await prisma.screenAttribute.findUnique({
      where: { id },
    });
    
    if (!screen) {
      return res.status(404).json({ error: "Screen not found" });
    }
    
    res.status(200).json(screen);
  } catch (error) {
    console.error(`Failed to fetch screen ${req.params.id}:`, error.message);
    res.status(500).json({ error: "Failed to fetch screen attribute" });
  }
});

// Graceful shutdown handler for Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = router;