const mongoose = require('mongoose');

const verseSchema = new mongoose.Schema({
  chapter: Number,
  verse: Number,
  text: String,
  topic: String
});

module.exports = mongoose.model("Verse", verseSchema);
