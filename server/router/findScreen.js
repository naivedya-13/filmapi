const express = require("express");
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

const router = express.Router();

router.get("/findscreen", async (req, res) => {
  console.log("Request Query:", req.query);
  const { area } = req.query;
  console.log(area)

  try {
    const response = await prisma.filFormat.findFirst({
        where:{
            code:area
        },
        select:{
            name:true
        }
    })

    console.log("Response:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Server error",
    });
  }
});

module.exports = router;
