var express = require('express');
var router = express.Router();


// Load database connectivity
var connection = require('./database.js');

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
