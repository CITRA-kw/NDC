var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: '192.168.100.8',
    user: 'root',
    password: '1234',
    database: 'isp_links'
});

connection.connect();

// TODO Handle wrong ID



// ***************************************************************
// Get the whole list
// ***************************************************************
router.get('/api/provider-service', function (req, res) {
    console.log('** GET Providers');
    
    connection.query('select * from provider', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
    });

});


// ***************************************************************
// Add a Provider
// ***************************************************************

// TODO check if Provider name already exists
router.post('/api/provider-service', function (req, res) {
    var newProvider = req.body;
    console.log('** POST Single Provider: ' + newProvider.name);

    connection.query('INSERT INTO provider SET name=?, contact_name=?, contact_phone=?, contact_email=?', [newProvider.name, newProvider.contact_name, newProvider.contact_phone, newProvider.contact_email], function (error, results) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** POST Provider - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Insert Successful for " + newProvider.name
        }));
    });
});

// ***************************************************************
// Get a single Provider detail
// ***************************************************************
router.get('/api/provider-service/:id', function (req, res) {
    console.log('** GET Single Provider: select * from provider where id = ' + req.params.id);

    connection.query('select * from provider where id = ' + req.params.id, function (err, results, fields) {
        if (err) throw err;

        console.log(results);

        res.json(results);
    });
});

// ***************************************************************
// Update Provider
// ***************************************************************

router.put('/api/provider-service', function (req, res) {
    var update_provider = req.body;
    console.log("** PUT - update single Provider: " + update_provider.name);

    var query = connection.query('UPDATE provider SET name=?, contact_name=?, contact_phone=?, contact_email=? where id=?', [update_provider.name, update_provider.contact_name, update_provider.contact_phone, update_provider.contact_email, update_provider.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** PUT Provider - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Update Successful for " + update_provider.name
        }));
    });
});

// ***************************************************************
// Delete Provider
// ***************************************************************
router.delete('/api/provider-service/:id', function (req, res) {
    var delete_provider = req.body;
    console.log("** DELETE - delete Provider: " + delete_provider.id);

    connection.query('DELETE FROM provider WHERE id=?', [delete_provider.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** DELETE Provider - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Delete success for  " + delete_provider.name
        }));
    });
});

module.exports = router;
