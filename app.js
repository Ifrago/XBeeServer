var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');//Para tokens
var fs = require('fs');//Abrir archivos del sistema
var mongoose = require('mongoose');//BBDD

//Rutas Javascrypt
var routes = require('./routes/index');
var users = require('./routes/users');
var xbees = require('./routes/xbees');
var app = express();

// Mongodb connection
mongoose.connect('mongodb://localhost/server', function(err, res){
  if(err) throw err;
  console.log('Connected to database.js');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req,res, next){
  console.log("Body request: ");
  console.log(req.body);
  console.log("Method request: "+req.method);
  console.log("URL Request: "+ req.url);
  next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/xbees', xbees);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//CORS filter
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control.Allow-Headers", "Origin, X-Requested, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;