require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const API_KEY = process.env.TMDB_API_KEY;

// Genre mapping
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

// Webhook endpoint for Dialogflow
app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  let genre = req.body.queryResult.parameters.genre;

  if (intent === "Genre Recommendation Intent") {
    try {
      // Handle array or undefined input
      if (Array.isArray(genre)) {
        genre = genre[0];
      }
      if (!genre) {
        return res.json({
          fulfillmentText: "What genre are you interested in? 🎬"
        });
      }

      const normalizedGenre = genre.toLowerCase();
      const genreId = genreMap[normalizedGenre];

      if (!genreId) {
        return res.json({
          fulfillmentText: `Hmm, I don’t know that genre. Try comedy, action, romance, etc.`
        });
      }

      // Call TMDb API
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`
      );

      const movies = response.data.results;
      if (!movies || movies.length === 0) {
        return res.json({
          fulfillmentText: `Sorry, I couldn’t find any good ${genre} movies right now. 😢`
        });
      }

      const randomMovie = movies[Math.floor(Math.random() * movies.length)];

      return res.json({
        fulfillmentText: `How about "${randomMovie.title}"? ⭐ It's a popular ${normalizedGenre} movie!`
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

// ✅ Fix for Render (use dynamic port)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Webhook running on port ${PORT}`));
