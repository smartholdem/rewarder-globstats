const express = require('express');
const router = express.Router();

/* post: new rewarder activation notification */
router.post('/', async function(req, res, next) {
  res.send(req.body)
});

module.exports = router;
