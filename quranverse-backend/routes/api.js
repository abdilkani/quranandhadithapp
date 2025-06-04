app.post("./api/verse", (req, res) => {
  const { feeling } = req.body;

  if (!feeling || typeof feeling !== "string") {
    return res.status(400).json({ verse: "Please enter a feeling." });
  }

  const userFeeling = feeling.trim().toLowerCase();

  const match = verses.find(v =>
    v.feelings.includes(userFeeling)
  );

  if (match) {
    res.json({ verse: match.verse });
  } else {
    res.status(404).json({ verse: "Sorry, no verse found for that feeling." });
  }
});
