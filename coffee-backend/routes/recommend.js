const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

router.get("/", async (req, res) => {
  try {
    const {
      lat,
      lon,
      mood,
      intensity,
    } = req.query;


    const hour = new Date().getHours();
    const month = new Date().getMonth();


    let weatherMain = "Clear";
    let temp = 20;


    // ================= WEATHER =================

    if (lat && lon && WEATHER_API_KEY) {
      try {
        const wRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        );


        const wData = await wRes.json();


        weatherMain =
          wData.weather?.[0]?.main || "Clear";


        temp =
          wData.main?.temp ?? 20;


      } catch (weatherError) {
        console.log(
          "WEATHER ERROR:",
          weatherError.message
        );
      }
    }



    const products = await Product.find();



    if (!products.length) {
      return res.json({
        reason: "No products available yet.",
        weather: weatherMain,
        temp,
        suggestion: null,
      });
    }



    let category = "Coffee";
    let reason = "";



    // ==================================================
    //                 MOOD RECOMMENDATION
    // ==================================================

    if (mood) {

      switch (mood.toLowerCase()) {


        case "tired":

          category = "Latte";

          reason =
            "You look tired — a smooth latte can give you a relaxing boost.";

          break;



        case "working":

          category = "Coffee";

          reason =
            "Focus mode activated — a strong coffee fits your work session.";

          break;



        case "happy":

          category = "Dessert";

          reason =
            "Great mood deserves a sweet treat with your coffee.";

          break;



        case "relaxing":

          category = "Tea";

          reason =
            "Relax and enjoy something calm and refreshing.";

          break;



        default:

          category = "Coffee";

          reason =
            "Here is something we think you will enjoy.";

      }


    } 
    
    // ==================================================
    //              WEATHER + TIME SYSTEM
    // ==================================================

    else {


      if (
        ["Rain", "Drizzle", "Thunderstorm"]
          .includes(weatherMain)
      ) {


        category = "Latte";

        reason =
          "It's raining today — try something warm and comforting.";


      } else if (temp >= 28) {


        category = "Tea";

        reason =
          "It's hot outside — something refreshing might hit the spot.";


      } else if (hour < 11) {


        category = "Coffee";

        reason =
          "Good morning — start your day with a classic coffee.";


      } else if (hour >= 15 && hour < 18) {


        category = "Dessert";

        reason =
          "Afternoon slump — pair your drink with something sweet.";


      } else if (month >= 11 || month <= 1) {


        category = "Latte";

        reason =
          "Cold season calls for something warm.";


      } else {


        reason =
          "Here's something we think you'll enjoy.";

      }

    }



    // Find products matching recommendation

    const matches = products.filter(
      (p) =>
        p.category?.toLowerCase() === category.toLowerCase()
    );



    const suggestion =
      matches.length > 0
        ? matches[
            Math.floor(Math.random() * matches.length)
          ]
        : products[
            Math.floor(Math.random() * products.length)
          ];



    res.json({

      reason,

      mood: mood || null,

      intensity: intensity || null,

      weather: weatherMain,

      temp,

      category,

      suggestion,

    });



  } catch (err) {


    console.log(
      "RECOMMEND ERROR:",
      err
    );


    res.status(500).json({

      message: err.message,

    });


  }
});


module.exports = router;