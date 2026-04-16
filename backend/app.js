var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); // <-- 1. Adicione esta linha

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var membrosRouter = require('./routes/membros');

var app = express();

app.use(cors()); // <-- 2. Adicione esta linha (antes das rotas!)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/membros', membrosRouter);

module.exports = app;
