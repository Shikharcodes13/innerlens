const express = require('express');
const questions = require('../data/questions');

const router = express.Router();

router.get('/', (req, res) => {
  // Strip `direction` so the client never receives the scoring key.
  const publicQuestions = questions.map(({ id, text, trait }) => ({ id, text, trait }));
  res.json(publicQuestions);
});

module.exports = router;
