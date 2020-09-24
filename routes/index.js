const express = require('express');
const router = express.Router();

/* post: new rewarder activation notification */
router.post('/', async function(req, res, next) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let ipArr = ip.split(':');
  //console.log(req.connection)
  console.log(ipArr[ipArr.length - 1])
  await res.json(req.body)
});

module.exports = router;
