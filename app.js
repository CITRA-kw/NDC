var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Passport and authentication stuff
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs'); // npm install --save bcrypt-nodejs && npm uninstall --save bcrypt
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var sqlite3 = require('sqlite3');
// Passport Config
require('./config/passport')(passport);



var app = express();

// Session for Passport
app.use(session({
    secret: 'Mr. Robot rocks!',
    resave: false,
    saveUninitialized: true,
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

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
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static('./public'));

// Global variables set
app.set('appTitle', 'National Data Circuits');

// All pages routing
// Every page has user information included
// TO DO: Secure API requests
app.get('*', function (req, res, next) {
    res.locals.username = "n3al";

    return next();
    // Get username and store it in res.locals.user
    // Make sure it's not API call otherwise you'll get error
    if (!req.url.includes("api"))
        res.locals.username = req.user || null;

    // If I'm going to login then go to next route to proceed to login
    if (req.url === '/login') return next();

    // If authenticated go to next route
    if (req.isAuthenticated()) {
        next();
    }
    
    // Redirect to login page if not authenticated from above and it's not an API request, otherwise you'll get an error
    if (!req.url.includes("api")) {
        res.redirect('/login');
    }
});


// Routing
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

// Now the actual routing
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


// APIs
app.use(require('./routes/api/isp-service'));
app.use(require('./routes/api/provider-service'));
app.use(require('./routes/api/circuit-service'));
app.use(require('./routes/api/patch_panel-service'));
app.use(require('./routes/api/circuit-service'));
app.use(require('./routes/api/finance-service'));
app.use(require('./routes/api/map-service'));
app.use(require('./routes/api/login-service'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
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









module.exports = app;
