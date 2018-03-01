var express = require('express');
var router = express.Router();
var mysql = require('mysql');


//TODO: use a connection pool global to the app

var connection = mysql.createConnection({
    host: '192.168.100.8',
    user: 'root',
    password: '1234',
    database: 'isp_links'
});

connection.connect();





// ***************************************************************
// Get the whole list
// ***************************************************************
router.get('/api/circuit-service', function (req, res) {
    connection.query('select * from circuit', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
    });

});


module.exports = router;
