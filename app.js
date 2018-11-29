var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config.js');
var nforce = require('nforce');

var routes = require('./routes/index');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
// get a reference to the socket once a client connects
var socket = io.sockets.on('connection', function (socket) { });

var org = nforce.createConnection({
  clientId: '3MVG9Vik22TUgUpheZzEWUZ9QDnGeMnM8OGZBaUuUXdFQvKfvju4EoT9hS1jgUQpO9pbtIxk37dIIn0thfEMF',
  clientSecret: '7984638764575275172',
  redirectUri: 'http://localhost:3000/oauth/_callback',
  mode: 'multi',
  environment: 'sandbox'
});
var oauth;
org.authenticate({ username: 'jmejiavazquez2@huronconsultinggroup.com', password: 'Interscope_2008' }, function(err, res) {

  if(err) return console.log(err);
  if(!err) {
    oauth = res;
    console.log('*** Successfully connected to Salesforce ***');
    // add any logic to perform after login
  }
  // subscribe to platform event
//     org.streaming.topic("/event/Oppty_Test__e").subscribe(function(message) {
//         console.log(message);
//    });
  // subscribe to a pushtopic
//   var str = org.stream({ topic: config.PUSH_TOPIC, oauth: oauth });

//   str.on('connect', function(){
//     console.log('Connected to pushtopic: ' + config.PUSH_TOPIC);
//   });

//   str.on('error', function(error) {
//     console.log('Error received from pushtopic: ' + error);
//   });

//   str.on('data', function(data) {
//     console.log('Received the following from pushtopic ---');
//     console.log(data);
//     // emit the record to be displayed on the page
//     socket.emit('record-processed', JSON.stringify(data));
//   });

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(function(req, res, next){
  res.io = io;
  next();
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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


module.exports = {app: app, server: server};
