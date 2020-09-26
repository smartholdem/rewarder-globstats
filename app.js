const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const jsonFile = require('jsonfile');
const port = jsonFile.readFileSync('./config.json').port; // конфиг

process.env.PORT = port;
console.log("Running on port:", process.env.PORT);

const indexRouter = require('./routes/index');
const delegatesRouter = require('./routes/delegates');
const apiRouter = require('./routes/api');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', indexRouter);
app.use('/delegates', delegatesRouter);
app.use('/api', apiRouter);

module.exports = app;
