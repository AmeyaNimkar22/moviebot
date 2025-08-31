require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const API_KEY = process.env.TMDB_API_KEY;


// Webhook endpoint for Dialogflow
app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const genre = req.body.queryResult.parameters.genre; // captured from Dialogflow

  if (intent === "Genre Recommendation Intent") {
    try {
      // Map genre names to TMDb genre IDs
      const genreMap = {
        action: 28,
        comedy: 35,
        romance: 10749,
        horror: 27,
        drama: 18,
        thriller: 53,
        fantasy: 14,
        animation: 16,
        scifi: 878
      };

      const genreId = genreMap[genre.toLowerCase()] || 35; // default comedy

      // Call TMDb API for popular movies in that genre
      const response = await axios.get(
  `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`
);


      const movies = response.data.results;
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];

      return res.json({
        fulfillmentText: `How about "${randomMovie.title}"? ⭐ It's a popular ${genre} movie!`
      });
    } catch (error) {
      console.error(error);
      return res.json({
        fulfillmentText: "Sorry, I couldn’t fetch a movie right now. 😢"
      });
    }
  } else {
    return res.json({ fulfillmentText: "Intent not handled." });
  }
});

app.listen(5000, () => console.log("🚀 Webhook running on port 5000"));
