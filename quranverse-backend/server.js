const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let quranData;
let quranDataArabic;
let hadithData = [];

try {
  const rawQuran = fs.readFileSync('./data/quran.json', 'utf-8');
  const rawQuranAr = fs.readFileSync('./data/quranDataArabic.json', 'utf-8');
  const rawHadith = fs.readFileSync('./data/hadiths.json', 'utf-8');

  quranData = JSON.parse(rawQuran);
  quranDataArabic = JSON.parse(rawQuranAr);
  const parsedHadith = JSON.parse(rawHadith);
  hadithData = parsedHadith.hadiths?.data || [];

  console.log('✅ Quran and Hadith data loaded.');
} catch (err) {
  console.error('❌ Failed to load data:', err.message);
  process.exit(1);
}

// Emotion keyword mapping
const keywordMap = {
  stress: ['stress', 'pressure', 'tense', 'tired'],
  sadness: ['sad', 'grief', 'depressed','heartbroken'],
  anxiety: ['anxious', 'worry', 'nervous'],
  hope: ['hope', 'trust', 'faith'],
  peace: ['peace', 'calm', 'serene'],
  joy: ['happy', 'joy', 'delighted'],
  love: ['love', 'affection', 'compassion'],
  anger: ['angry', 'rage', 'annoyed'],
  shame: ['shame', 'guilt', 'embarrassed'],
  confusion: ['confused', 'lost', 'uncertain'],
  gratitude: ['grateful', 'thankful'],
  courage: ['brave', 'strong', 'fearless'],
  sickness: ['pain', 'sick', 'illness', 'anxious'],
  life: ['life', 'living', 'existence', 'healthy', 'success', 'fail']
};

function getRelevantKeywords(input) {
  const found = [];
  for (const group of Object.values(keywordMap)) {
    for (const word of group) {
      if (input.toLowerCase().includes(word)) {
        found.push(word);
      }
    }
  }
  return found;
}

function findBestQuranMatch(keywords) {
  const results = [];

  quranData.data.surahs.forEach((surah, surahIndex) => {
    const arabicSurah = quranDataArabic.data.surahs[surahIndex];
    surah.ayahs.forEach((ayah, i) => {
      const matches = keywords.filter(kw =>
        ayah.text.toLowerCase().includes(kw)
      );
      if (matches.length > 0) {
        results.push({
          surah: surah.englishName,
          surahArabic: arabicSurah.name,
          verse: ayah.numberInSurah,
          english: ayah.text,
          arabic: arabicSurah.ayahs[i].text,
          matches: matches.length
        });
      }
    });
  });

  results.sort((a, b) => b.matches - a.matches);
  return results[0] || null;
}

function findBestHadithMatchLocally(keyword) {
  const matches = hadithData.filter(h =>
    h.hadithEnglish?.toLowerCase().includes(keyword.toLowerCase()) ||
    h.englishNarrator?.toLowerCase().includes(keyword.toLowerCase())
  );

  if (matches.length === 0) return null;

  const best = matches[0];
  return {
    hadithEnglish: best.hadithEnglish,
    hadithArabic: best.hadithArabic || '',
    book: 'Unknown Book',
    narrator: best.englishNarrator || 'Narrator unknown',
    reference: best.hadithNumber || 'N/A'
  };
}

// 🧠 Therapy endpoint
app.post('/api/therapy', async (req, res) => {
  const userInput = req.body.input;
  console.log("🟢 Received input:", userInput);

  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).json({ message: 'Input must be a string.' });
  }

  const keywords = getRelevantKeywords(userInput);
  if (keywords.length === 0) {
    return res.status(404).json({ message: 'No matching keywords found.' });
  }

  const quranMatch = findBestQuranMatch(keywords);
  const hadithMatch = findBestHadithMatchLocally(keywords[0]);

  res.json({ quranMatch, hadithMatch });
});

// 📖 Random verse endpoint
app.get('/api/verses/random', (req, res) => {
  try {
    const surahs = quranData.data.surahs;
    const arabicSurahs = quranDataArabic.data.surahs;

    const surahIndex = Math.floor(Math.random() * surahs.length);
    const surah = surahs[surahIndex];
    const arabicSurah = arabicSurahs[surahIndex];

    const ayahIndex = Math.floor(Math.random() * surah.ayahs.length);
    const ayah = surah.ayahs[ayahIndex];
    const arabicAyah = arabicSurah.ayahs[ayahIndex];

    res.json({
      chapter: surah.englishName,
      verse: ayah.numberInSurah,
      text: `${ayah.text} / ${arabicAyah.text}`
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch verse" });
  }
});

// ✅ Surah names list (for auto-complete)
app.get('/api/surah-names', (req, res) => {
  const surahNames = quranData.data.surahs.map((surah) => ({
    english: surah.englishName,
    arabic: surah.name,
  }));
  res.json(surahNames);
});

// ✅ Full surah by English name
app.post('/api/surah', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Surah name is required.' });
  }

  const index = quranData.data.surahs.findIndex(
    (surah) => surah.englishName.toLowerCase() === name.toLowerCase()
  );

  if (index === -1) {
    return res.status(404).json({ message: 'Surah not found.' });
  }

  const englishSurah = quranData.data.surahs[index];
  const arabicSurah = quranDataArabic.data.surahs[index];

  const verses = englishSurah.ayahs.map((ayah, i) => ({
    numberInSurah: ayah.numberInSurah,
    arabicText: arabicSurah.ayahs[i].text,
    englishText: ayah.text,
  }));

  res.json({
    surahNameEnglish: englishSurah.englishName,
    surahNameArabic: arabicSurah.name,
    revelationType: englishSurah.revelationType,
    verses,
  });
});



// ✅ Return all available hadith keywords for autocomplete
app.get('/api/hadith-keywords', (req, res) => {
  const keywords = [...new Set(hadithData.map(h => h.keyword).filter(Boolean))];
  res.json(keywords);
});

// ✅ Return hadiths by keyword
app.post('/api/hadith', (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ message: 'Keyword is required.' });
  }

  const results = hadithData.filter(h =>
    h.hadithEnglish?.toLowerCase().includes(keyword.toLowerCase()) ||
    h.englishNarrator?.toLowerCase().includes(keyword.toLowerCase())
  );

  if (results.length === 0) {
    return res.status(404).json({ message: 'No hadiths found.' });
  }

  res.json({ results });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
