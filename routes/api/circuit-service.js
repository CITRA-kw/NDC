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

    connection.query('SELECT * from circuit WHERE active = TRUE', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
    });

});


// ***************************************************************
// Add a Circuit
// ***************************************************************

// TODO check if Circuit already exists
router.post('/api/circuit-service', function (req, res) {
    var newCircuit = req.body;
    console.log('** POST Single Circuit for MOC ID: ' + newCircuit.moc_id);

    console.log(newCircuit);




    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }
        var query = connection.query('INSERT INTO circuit SET moc_id=?, interface_type=?, provision_speed=?, service=?, provider=?, isp=?, comment=?', [newCircuit.moc_id, newCircuit.interface_type, newCircuit.provision_speed, newCircuit.service, newCircuit.provider, newCircuit.isp, newCircuit.comment], function (error, results, fields) {
            if (error) {
                res.send(JSON.stringify({
                    result: "Epic Fail!",
                    sql: query.sql
                }));
                return connection.rollback(function () {
                    throw error;
                });
            }
            console.log("** POST Circuit - query result: " + JSON.stringify(results));
            res.set('Content-Type', 'application/json');

            // ---------- REACHED HERE

            var arr = newCircuit['patch_panel[]'];
            for (var val in arr) {
                console.log('iteration');
                console.log(val);
            }



            var result2 = insertCircuitPorts(newCircuit['patch_panel[]'], newCircuit['port[]'], result.insertId);

            res.send(JSON.stringify({
                result: "Insert Successful for MoC ID " + newCircuit.moc_id + "\n\n " + result2
            }));

            var log = 'Post ' + results.insertId + ' added';

            connection.query('INSERT INTO log SET data=?', log, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        throw error;
                    });
                }
                connection.commit(function (err) {
                    if (err) {
                        return connection.rollback(function () {
                            throw err;
                        });
                    }
                    console.log('success!');
                });
            });
        });
    });

    function insertCircuitPorts(patch_panel, port, circuitID) {
        var arr = newCircuit['patch_panel[]'];
        for (var val in arr) {
            console.log('iteration');
            console.log(val);
        }

        console.log("** Inserting the ports now for that Circuit");
        // Now insert the ports for this patch panel
        connection.query('INSERT INTO patch_panel_port (id, patch_panel_id, label) VALUES ' + valuesString, function (error, results) {
            if (error) {
                throw error;
            }

            console.log("** POST Also added " + num + " ports");
            return "Insert Successful for " + num + " ports";
        });
    }









    /*for(var i = 0; i < newCircuit.patch_panel.length; i ++) {
        console.log('iteration');
        console.log(newCircuit.patch_panel[i]);
    } */


    /*
    Finding this solution caused me lots of troubles and chain of changes both in the DB and in the codebase. Be thankful that I've done this not you!
    
    I've used BEFORE INSERT trigger on the database (table: circuit) to set the ID of each row as a combination of ISP and Provider and Circuit_NUM    
    */

    /*
    var query = connection.query('INSERT INTO circuit SET moc_id=?, interface_type=?, provision_speed=?, service=?, provider=?, isp=?, comment=?', [newCircuit.moc_id, newCircuit.interface_type, newCircuit.provision_speed, newCircuit.service, newCircuit.provider, newCircuit.isp, newCircuit.comment], function (error, results) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!",
                sql: query.sql
            }));

            throw error;
        }

        console.log("** POST Circuit - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        
        var result2 = insertCircuitPorts(newCircuit['patch_panel[]'], newCircuit['port[]'], result.insertId);
        
        res.send(JSON.stringify({
            result: "Insert Successful for MoC ID " + newCircuit.moc_id + "\n\n " + result2
        }));
    });
    */


});

// ***************************************************************
// Get a single Circuit detail
// ***************************************************************
router.get('/api/circuit-service/:id', function (req, res) {
    console.log('** GET Single Circuit: select * from circuit where id = ' + req.params.id);

    connection.query('SELECT * FROM circuit WHERE id = "' + req.params.id + '"', function (err, results, fields) {
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

    var query = connection.query('UPDATE circuit SET active = "0" where id=?', [update_circuit.id], function (error, results, fields) {
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
