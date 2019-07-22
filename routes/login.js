var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//require('../config/passport')(passport);





// ***************************************************************
// Login page
// ***************************************************************
router.get('/login', function (req, res, next) {
    res.render('login', {
        title: req.app.get('appTitle'),
        pageName: 'Login Form',
        pageLeadText: '',
        pageID: "Login",
        service_name: ""
    });
    console.log("** Loading Login Page");
});


// ***************************************************************
// Login Process
// ***************************************************************
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login'
  }) (req, res, next);
});


/*
router.post('/authenticate',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    //res.redirect('/users/' + req.user.username);
    console.log("*********");
  });*/

// ***************************************************************
// To logout
// ***************************************************************
router.get('/logout', function(req, res){
  console.log('logging out');
  req.logout();
  res.redirect('/');
});

// ANOTHER WAY TO LOGOUT FOR REFERENCE
/*
// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});
*/

module.exports = router;

