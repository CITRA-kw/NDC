var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var isp = require('./routes/isp');
var circuit = require('./routes/circuit');
var patch_panel = require('./routes/patch_panel');
var patch_panel_port = require('./routes/patch_panel_port');
var provider = require('./routes/provider');
var finance = require('./routes/finance');
var map = require('./routes/map');
var login = require('./routes/login');




var app = express();

// Page reload plugin
//var reload = require('reload');
//reload(app);

// Raven (Sentry) for error reporting to developers dashboard
var Raven = require('raven');
Raven.config('https://19f12b14d1bb4f4f8b331e63c9c16edc@sentry.io/1261883').install();

// set listening port for server
app.set(require('config').get('webport'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static('./public'));

// Global variables set
app.set('appTitle', 'National Data Circuits');

// All pages routing
app.use(index);
app.use(users);
app.use(isp);
app.use(circuit);
app.use(patch_panel);
app.use(patch_panel_port);
app.use(provider);
app.use(finance);
app.use(map);
app.use(login);


// API
app.use(require('./routes/api/isp-service'));
app.use(require('./routes/api/provider-service'));
app.use(require('./routes/api/circuit-service'));
app.use(require('./routes/api/patch_panel-service'));
app.use(require('./routes/api/circuit-service'));
app.use(require('./routes/api/finance-service'));
app.use(require('./routes/api/map-service'));
app.use(require('./routes/api/login-service'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
}); 

// error handler
app.use(function(err, req, res, next) {
    console.log("** Error");
    console.log("*********************");
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.error(err.stack);
    
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// ********************************************* //
// Passport authentication section
// ********************************************* //

var passport = require('passport');
var bcrypt = require('bcrypt-nodejs'); // npm install --save bcrypt-nodejs && npm uninstall --save bcrypt
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var sqlite3 = require('sqlite3');


// following this tutorial for passport https://blog.risingstack.com/node-hero-node-js-authentication-passport-js/
// Tutorial for Passport.js authentication in a Node.js Express application https://www.jokecamp.com/tutorial-passportjs-authentication-in-nodejs/
// Helps me understanding how to structure the passport in the express framework https://andrejgajdos.com/authenticating-users-in-single-page-applications-using-node-passport-react-and-redux/
// Building a NodeJS Web App Using PassportJS for Authentication https://dev.to/gm456742/building-a-nodejs-web-app-using-passportjs-for-authentication-3ge2
var user = {
  username: 'test-user',
  passwordHash: bcrypt.hashSync("aa", bcrypt.genSaltSync(10)),
  id: 1
} 

app.use(session({
 secret: 'keyboard cat',
 resave: false,
 saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(
 (username, password, done) => {
    console.log("** Authentication **");     
    findUser(username, (err, user) => {
      if (err) {
        console.log("** Authenticate - Error... "); 
        return done(err)
      }

      // User not found
      if (!user) {
        console.log("** Authenticate - username not found - user: " + username); 
        return done(null, false);
      }

      // Always use hashed passwords and fixed time comparison
      bcrypt.compare(password, user.passwordHash, (err, isValid) => {
        if (err) {
          return done(err)
        }
        if (!isValid) {
          return done(null, false);
        }
        console.log("** Authenticate - Login success for user: " + username);  
        return done(null, user);
      })
    })
  }
));







module.exports = app;
