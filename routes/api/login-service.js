var express = require('express');
var router = express.Router();
var mysql = global.mysql;
// Load config file for database access
var config = require('config').get('dbConfig');

var connection = mysql.createConnection({
    host: config.get('host'),
    user: config.get('username'),
    password: config.get('password'),
    database: config.get('dbname')
});

connection.connect();

// TODO Handle wrong ID

// DO I NEED THIS FILE?

// ***************************************************************
// 
// ***************************************************************
router.get('/api/login-service', function (req, res) {
    connection.query('select * from isp', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
    });

});


module.exports = router;
