const express = require('express');
const router = express.Router();

router.get('/ip', async function (req, res, next) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await res.json({
        ip: ip,
    })
});

module.exports = router;
