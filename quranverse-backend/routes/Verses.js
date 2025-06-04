router.get('/topic/:emotion', async (req, res) => {
  const emotion = req.params.emotion.toLowerCase();

  try {
    const verse = await Verse.findOne({ topic: emotion });
    if (!verse) {
      return res.status(404).json({ message: 'No verse found for this topic.' });
    }

    res.json(verse);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
