// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const cors = require('cors');

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());




// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("❌ MongoDB error:", err));

// const verseRoutes = require('./routes/verseRoutes');
// app.use('/api/verses', verseRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


// Localhost no data base
const express = require("express");
const cors = require("cors");



const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Example verses
app.get('/verses/:feeling', (req, res) => {
  const feeling = req.params.feeling.toLowerCase();

  const verses = {
    stress: {
      chapter: '94',
      verse: '6',
      text: 'Indeed, with hardship comes ease.'
    },
    sadness: {
      chapter: '94',
      verse: '5',
      text: 'So verily, with the hardship, there is relief.'
    },
    fear: {
      chapter: '20',
      verse: '46',
      text: 'Do not fear, I am with you all the time.'
    }
    // Add more as needed
  };

  const result = verses[feeling];

  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ message: 'Verse not found for that feeling.' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
