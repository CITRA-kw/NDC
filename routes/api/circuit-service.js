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
router.get('/api/circuit-service', function (req, res) {
    console.log('** GET Circuits');
    
    connection.query('select * from circuit', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
    });

});


// ***************************************************************
// Add a Circuit
// ***************************************************************

// TODO check if Circuit already exists
router.post('/api/circuit-service', function (req, res) {
    var newCiruit = req.body;
    console.log('** POST Single Circuit: ' + newCiruit.moc_id);

    var query = connection.query('INSERT INTO circuit SET moc_id=?, interface_type=?, provision_speed=?, service=?, provider=?, isp=?, comment=?', [newCiruit.moc_id, newCiruit.interface_type, newCiruit.provision_speed, newCiruit.service, newCiruit.provider, newCiruit.isp, newCiruit.comment], function (error, results) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!",
                sql: query.sql
            }));

            throw error;
        }

        console.log("** POST Circuit - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Insert Successful for MoC ID " + newCiruit.moc_id
        }));
    });
});

// ***************************************************************
// Get a single Circuit detail
// ***************************************************************
router.get('/api/circuit-service/:id', function (req, res) {
    console.log('** GET Single Circuit: select * from circuit where id = ' + req.params.id);

    connection.query('select * from circuit where id = "' + req.params.id + '"', function (err, results, fields) {
        if (err) throw err;

        console.log(results);

        res.json(results);
    });
});

// ***************************************************************
// Update Circuit
// ***************************************************************

router.put('/api/circuit-service', function (req, res) {
    var update_circuit = req.body;
    console.log("** PUT - update single Circuit Circuit ID: " + update_circuit.id);

    var query = connection.query('UPDATE circuit SET moc_id=?, interface_type=?, provision_speed=?, service=?, provider=?, isp=?, comment=? where id=?', [update_circuit.moc_id, update_circuit.interface_type, update_circuit.provision_speed, update_circuit.service, update_circuit.provider, update_circuit.isp, update_circuit.comment, update_circuit.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!",
                sql: query.sql
            }));

            throw error;
        }

        console.log("** PUT Circuit - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Update Successful for Circuit ID" + update_circuit.id
        }));
    });
});

// ***************************************************************
// Delete Circuit
// ***************************************************************
router.delete('/api/circuit-service/:id', function (req, res) {
    var delete_circuit = req.body;
    console.log("** DELETE - delete Circuit ID: " + delete_circuit.id);

    connection.query('DELETE FROM circuit WHERE id=?', [delete_circuit.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** DELETE Circuit - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Delete success for Circuit ID " + delete_circuit.id
        }));
    });
});

module.exports = router;
