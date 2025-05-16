const express = require("express");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const app = express();
app.use(express.json());
const router = express.Router();

router.get("/fetchcinema", async (req, res) => {
  try {
    const { name, isGiftStore, timeZoneId } = req.query;
    const filters = {};

    if (name) {
      filters.name = { contains: name, mode: "insensitive" };
    }
    if (isGiftStore !== undefined) {
      filters.isGiftStore = isGiftStore === "true";
    }
    if (timeZoneId) {
      filters.timeZoneId = { contains: timeZoneId, mode: "insensitive" };
    }
    const cinemas = await prisma.cinema.findMany({
      where: filters,
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        isGiftStore: true,
        allowOnlineVoucherValidation: true,
        timeZoneId: true,
      },
    });

    res.json(cinemas);
  } catch (error) {
    console.error("Error fetching cinemas:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
