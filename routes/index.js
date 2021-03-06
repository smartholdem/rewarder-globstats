const express = require('express');
const router = express.Router();
const sth = require("sthjs");
const level = require("level");
//const axios = require('axios');
const db = level('./.db', {valueEncoding: 'json'});
const crypto = require("crypto");
const DbUtils = require('../modules/dbUtils');
const dbUtils = new DbUtils();
const schedule = require('node-schedule');

// 0x - active delegates reward

class Helper {
    async verifyMessage(message, publicKey, signature) {
        // check for hexadecimal, otherwise the signature check would may fail
        const re = /[0-9A-Fa-f]{6}/g;
        if (!re.test(publicKey) || !re.test(signature)) {
            // return here already because the process will fail otherwise
            return false
        }
        let hash = crypto.createHash('sha256');
        hash = hash.update(Buffer.from(message, 'utf-8')).digest();
        const ecPair = sth.ECPair.fromPublicKeyBuffer(Buffer.from(publicKey, 'hex'));
        const ecSignature = sth.ECSignature.fromDER(Buffer.from(signature, 'hex'));
        return (ecPair.verify(hash, ecSignature))
    }

    async validateDelegate() {
        let delegates = await dbUtils.dbArray(db, '0','1');
        const tm = Math.floor(Date.now() / 1000) - 60 * 30;
        const tmRemove = Math.floor(Date.now() / 1000) - 60 * 60 * 24;
        for (let i=0; i < delegates.length; i++) {
            if (tm > delegates[i].timestamp) {
                delegates[i].status = false;
                await db.put('0x' + delegates[i].delegate.address, delegates[i]);
            }

            if (tmRemove > delegates[i].timestamp) {
                delegates[i].status = false;
                await db.del('0x' + delegates[i].delegate.address);
            }
        }
    }

}

const helper = new Helper();

/** CRON Delegate set inactive **/
schedule.scheduleJob("1 */29 * * * *", async () => {
    await helper.validateDelegate();
});

/* post: new rewarder activation notification */
router.post('/', async function (req, res, next) {
    //let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    //let ipArr = ip.split(':');
    //console.log(req.connection)
    //console.log(ipArr[ipArr.length - 1], req.body.info.delegate.username);
    let verification = await helper.verifyMessage(req.body.rndString, req.body.info.delegate.publicKey, req.body.sig);
    console.log('verification', verification, req.body.info.delegate.username);
    if (verification) {
        req.body.info.timestamp = Math.floor(Date.now() / 1000);
        /*
        req.body.info.net = {
          ip: ipArr[ipArr.length - 1],
          port: req.body.info.delegate.port
        };
         */
        await db.put('0x' + req.body.info.delegate.address, req.body.info);
    }
    await res.json(req.body);
});

router.get('/delegates', async function (req, res, next) {
    await res.json(await dbUtils.dbArray(db, '0', '1'));
});


/** read objs by keys **/
/*
router.get('/db/:from/:to', async function (req, res, next) {
    await res.json(await dbUtils.dbObj(db, req.params["from"], req.params["to"]));
});
 */


module.exports = router;
