const express = require('express');
const router = express.Router();
const Verse = require('../models/Verse');

// Get random verse
router.get('/random', async (req, res) => {
  try {
    const count = await Verse.countDocuments();
    const random = Math.floor(Math.random() * count);
    const verse = await Verse.findOne().skip(random);
    res.json(verse);
  } catch (err) {
    res.status(500).json({ message: "Error fetching verse" });
  }
});

// Get verse by topic
router.get('/topic/:keyword', async (req, res) => {
  try {
    const topic = req.params.keyword.toLowerCase();
    const verse = await Verse.findOne({ topic: topic });
    if (verse) {
      res.json(verse);
    } else {
      res.status(404).json({ message: "No verse found for that topic" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error finding verse by topic" });
  }
});

module.exports = router;
