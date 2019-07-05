var express = require('express');
var router = express.Router();
var mysql = require('mysql');
// Load config file for database access
var config = require('config').get('dbConfig');
var moment = require("moment");

//reuse code instead of copy-pasta
var circuitService = require("./circuit-service");

var connection = mysql.createConnection({
    host: config.get('host'),
    user: config.get('username'),
    password: config.get('password'),
    database: config.get('dbname')
});

connection.connect();


// ***************************************************************
// Get days the circuit is in service for that date
// ***************************************************************
router.get('/api/map-service/links', function (req, res) {

});



module.exports = router;
