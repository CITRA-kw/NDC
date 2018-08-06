var express = require('express');
var router = express.Router();
var mysql = require('mysql');
// Load config file for database access
var config = require('config').get('dbConfig');;

var connection = mysql.createConnection({
    host: config.get('host'),
    user: config.get('username'),
    password: config.get('password'),
    database: config.get('dbname')
});

connection.connect();

// TODO Handle wrong ID



// ***************************************************************
// Get the whole list
// ***************************************************************
router.get('/api/isp-service', function (req, res) {
    connection.query('select * from isp', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
    });

});


// ***************************************************************
// Add an ISP
// ***************************************************************

// TODO check if ISP name already exists
router.post('/api/isp-service', function (req, res) {
    var newISP = req.body;
    console.log('** POST Single ISP: ' + newISP.name);

    connection.query('INSERT INTO isp SET name=?, contact_name=?, contact_phone=?, contact_email=?, code=?', [newISP.name, newISP.contact_name, newISP.contact_phone, newISP.contact_email, newISP.code], function (error, results) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** POST ISP - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Insert Successful for " + newISP.name
        }));
    });
});

// ***************************************************************
// Get a single ISP detail
// ***************************************************************
router.get('/api/isp-service/:id', function (req, res) {
    console.log('** GET Single ISP: select * from isp where id = ' + req.params.id);

    connection.query('select * from isp where id = ?',[req.params.id] , function (err, results, fields) {
        if (err) throw err;

        console.log(results);

        res.json(results);
    });
});

// ***************************************************************
// Update ISP
// ***************************************************************

router.put('/api/isp-service', function (req, res) {
    var update_isp = req.body;
    console.log("** PUT - update single ISP: " + update_isp.name);

    var query = connection.query('UPDATE isp SET name=?, contact_name=?, contact_phone=?, contact_email=?, code=? where id=?', [update_isp.name, update_isp.contact_name, update_isp.contact_phone, update_isp.contact_email, update_isp.code, update_isp.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** PUT ISP - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Update Successful for " + update_isp.name
        }));
    });
});


// ***************************************************************
// Delete ISP
// ***************************************************************
router.delete('/api/isp-service/:id', function (req, res) {
    var delete_isp = req.body;
    console.log("** DELETE - delete ISP: " + delete_isp.id);

    connection.query('DELETE FROM isp WHERE id=?', [delete_isp.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** DELETE ISP - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Delete success for  " + delete_isp.name
        }));
    });
});

module.exports = router;
