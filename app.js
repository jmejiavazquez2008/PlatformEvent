var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var config = require('./config.js');
var nforce = require('nforce');
var faye = require('faye');

var routes = require('./routes/index');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
// get a reference to the socket once a client connects
var socket = io.sockets.on('connection', function (socket) { });

let SF_CLIENT_ID = process.env.SF_CLIENT_ID;
let SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET;
let SF_USER_NAME = process.env.SF_USER_NAME;
let SF_USER_PASSWORD = process.env.SF_USER_PASSWORD;
let SF_SECURITY_TOKEN = process.env.SF_SECURITY_TOKEN;

var org = nforce.createConnection({
  clientId: SF_CLIENT_ID,
  clientSecret: SF_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/oauth/_callback',
  mode: 'single',
  environment: 'sandbox',
  autoRefresh: true
});

var oauth;
org.authenticate({ username: SF_USER_NAME, password: SF_USER_PASSWORD, securityToken: SF_SECURITY_TOKEN }, function(err, res) {

  if(err) return console.log(err);
  oauth = res;
  if(!err) {
    console.log('*** Successfully connected to Salesforce ***');
  }
  var client = org.createStreamClient();
  
  //subscribe to oppty event
  var con = client.subscribe({topic:"event/Oppty_Test__e", isEvent: true, oauth: oauth});
  
  con.on('connect', function(){
    console.log('connected to topic: Oppty_test__c');
  });
  con.on('error', function(error){
    console.log('error received from topic: ' + error);
  });
  con.on('data', function(data) {
    console.log('received following from Oppty_Test__e---');
    console.log(data);
  });
  // subscribe to line item event
  var con1 = client.subscribe({topic:"event/Opportunity_Line_Item_Test__e", isEvent: true, oauth: oauth});
  
  con1.on('connect', function(){
    console.log('connected to topic: Opportunity_Line_Item_Test__e');
  });
  con1.on('error', function(error){
    console.log('error received from topic: ' + error);
  });
  con1.on('data', function(data) {
    console.log('received following from Opportunity_Line_Item_Test__e---');
    console.log(data);
  });
    //subscribe to subscription event
  var con2 = client.subscribe({topic:"event/Subscription_Test__e", isEvent: true, oauth: oauth});
  
  con2.on('connect', function(){
    console.log('connected to topic: Subscription_Test__e');
  });
  con2.on('error', function(error){
    console.log('error received from topic: ' + error);
  });
  con2.on('data', function(data) {
    console.log('received following from Subscription_Test__e---');
    console.log(data);
  });

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(function(req, res, next){
  res.io = io;
  next();
});

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
