const express = require("express");
const https = require("https");
const router = express.Router();
const { persistance } = require("../persistance");

var randomThemes=[
    "taylor swift",
    "selena gomez",
    "puppy",
    "cat",
    "kitten",
    "dog",
    "flower",
    "bees",
    "book",
    "robot",
    "computer",
    "car",
    "love",
    "mexico",
    "australia",
    "games",
    "music",
    "dance",
    "justin bieber",
    "lady gaga",
    "barbie",
    "sponge bob",
    "elmo",
    "superman",
    "spiderman",
    "jungle",
    "batman",
    "ironman",
    "joker",
    "penguin",
    "bird",
    "kangaroo",
    "tiger",
    "lion",
    "bear",
    "spring",
    "nature",
    "nintendo",
    "art",
    "paint",
    "food",
    "pizza",
    "soup",
    "restaurant",
    "bread",
    "summer",
    "turtle",
    "ocean",
    "octopus",
    "party",
    "panda",
    "forest",
    "sushi",
    "cosplay",
    "ice cream",
    "ice",
    "hockey",
    "soccer",
    "marathon",
    "guitar",
    "piano",
    "star wars"
]

function random_item(randomThemes)
{
  
return randomThemes[Math.floor(Math.random()*randomThemes.length)];
     
}

// Route
router.get("/", async (req, res) => {
  theme = random_item(randomThemes);
  cardKey = `CardKey:${theme}`;
  persistance(res, theme, cardKey);
});


module.exports = router;