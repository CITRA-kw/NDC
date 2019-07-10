var express = require('express');
var router = express.Router();
var passport = require('passport');





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
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/success',
    failureRedirect:'/login'
  })(req, res, next);
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
router.get('/login/logout', function(req, res){
  console.log('logging out');
  req.logout();
  res.redirect('/');
});

module.exports = router;
