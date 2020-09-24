const express = require('express');
const router = express.Router();

/* post: new rewarder activation notification */
router.post('/', async function(req, res, next) {
  await res.json(req.body)
});

module.exports = router;
