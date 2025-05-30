const axios = require("axios");
const {PrismaClient} = require('@prisma/client');
const router = require("./Film");
const prisma = new PrismaClient();

const url = "https://uatvista.novocinemas.com/WSVistaWebClient/film-formats";

const app = async (req, res) => {
  try {
    const response = await axios.get(url, {
      headers: {
        connectApiToken: '420077A0-BABD-43F8-9156-7E8C5E429061',
        Accept: "application/json"
      }
    });
    
    // console.log("Full response:", response.data);
    if (response.data && response.data.filmFormats) {
      const filmFormats = response.data.filmFormats;
      
      for (const format of filmFormats) {
        try {
          await prisma.filFormat.upsert({
            where: { code: format.code },
            update: {
              name: format.name,
              shortName: format.shortName,
              nameTranslations: format.nameTranslations || [],
              shortNameTranslations: format.shortNameTranslations || []
            },
            create: {
              code: format.code,
              name: format.name,
              shortName: format.shortName,
              nameTranslations: format.nameTranslations || [],
              shortNameTranslations: format.shortNameTranslations || []
            }
          });
        } catch (dbError) {
          console.error(`Error saving format ${format.code}:`, dbError);
        }
      }
      if (res) {
        res.json({
          success: true,
          message: `Processed ${filmFormats.length} film formats`,
          data: filmFormats
        });
      }
      
    } else {
      console.log("Unexpected response structure:", response.data);
      if (res) {
        res.status(400).json({
          success: false,
          message: "Unexpected response structure from API"
        });
      }
    }
    
  } catch (error) {
    console.error("Error fetching film formats:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    if (res) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch film formats",
        error: error.message
      });
    }
  } finally {
    await prisma.$disconnect();
  }
};

router.get('/filmformat',async(req,res)=>{
  await app()
  res.send('OK')
})

module.exports= router;