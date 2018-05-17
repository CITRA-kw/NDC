var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sql@Citra2018',
    database: 'isp_links'
});

connection.connect();

// TODO Handle wrong ID



// ***************************************************************
// Get the whole list
// ***************************************************************
router.get('/api/circuit-service', function (req, res) {
    console.log('** GET Circuits');

    connection.query('SELECT c.*, p.code AS provider_code, i.code AS isp_code FROM circuit c INNER JOIN provider p ON c.provider = p.id INNER JOIN isp i ON c.isp = i.id WHERE c.active = true', function (err, results, fields) {
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

    // Using Transactions so we can rollback if failed in any step
    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }
        var query = connection.query('INSERT INTO circuit SET moc_id=?, interface_type=?, provision_speed=?, service=?, provider=?, isp=?, comment=?', [newCircuit.moc_id, newCircuit.interface_type, newCircuit.provision_speed, newCircuit.service, newCircuit.provider, newCircuit.isp, newCircuit.comment], function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    res.send(JSON.stringify({
                        result: "Epic Fail!",
                        sql: query.sql
                    }));
                    console.log('MySQL rolling back!');
                    throw error;
                });
            }
            console.log("** POST Circuit - query result: " + JSON.stringify(results));
            res.set('Content-Type', 'application/json');

            //-------------------------------------------
            // Creating the value string for MySQL insert
            // ------------------------------------------

            // Get the inserted CircuitId from the pr[evious insert
            var circuit_num = results.insertId; // CHANGE: Get actual ID
            var valuesString = "";
            // Make sure the following variables are an Array, otherwise turn them into an array of single value
            var patch_panel_ids = newCircuit['patch_panel[]'] ? (Array.isArray(newCircuit['patch_panel[]']) ? newCircuit['patch_panel[]'] : [newCircuit['patch_panel[]']]) : [];
            var port_ids = newCircuit['port[]'] ? (Array.isArray(newCircuit['port[]']) ? newCircuit['port[]'] : [newCircuit['port[]']]) : [];
            console.log("** Number of circuit connections: " + patch_panel_ids.length);


            // Create the SQL sinsert sequence 
            for (var i = 0; i < patch_panel_ids.length; i++) {
                valuesString += "(" + circuit_num + ", " + port_ids[i] + ", " + patch_panel_ids[i] + ", " + i + ")";
                if (i != patch_panel_ids.length - 1) {
                    valuesString += ", ";
                }
            }

            var query2 = connection.query('INSERT INTO ports_circuit (circuit_num, port_id, patch_panel_id, sequence) VALUES ' + valuesString, function (error, results2, fields) {
                if (error) {
                    return connection.rollback(function () {
                        res.send(JSON.stringify({
                            result: "Epic Fail!",
                            sql: query2.sql
                        }));
                        console.log('MySQL rolling back #2!');
                        throw error;
                    });
                }
                connection.commit(function (err) {
                    if (err) {
                        return connection.rollback(function () {
                            res.send(JSON.stringify({
                                result: "Epic Fail!",
                                sql: query2.sql
                            }));

                            throw err;
                        });
                    }
                    console.log("** POST also added " + port_ids.length + " ports");
                    console.log("The ports_circuit SQL is: " + JSON.stringify(results2));
                    res.send(JSON.stringify({
                        result: "Insert Successful for (MoC ID " + newCircuit.moc_id + ") "
                    }));

                });
            });
        });
    });

});

// ***************************************************************
// Get a single Circuit detail
// ***************************************************************
router.get('/api/circuit-service/:id', function (req, res) {
    console.log('** GET Single Circuit id = ' + req.params.id);

    var toSend;

    // First, get a specific circuit data
    connection.query('SELECT * FROM circuit WHERE circuit_num = "' + req.params.id + '"', function (err, results, fields) {
        if (err) throw err;

        console.log(this.sql);
        console.log('** Result from first query: ');
        console.log(results);
        toSend = results;

    });

    // Second, get the connection of that specific circuit
    connection.query('SELECT *  FROM ports_circuit INNER JOIN patch_panel_port ON ports_circuit.port_id = patch_panel_port.id AND ports_circuit.patch_panel_id = patch_panel_port.patch_panel_id INNER JOIN patch_panel ON patch_panel.id = ports_circuit.patch_panel_id WHERE ports_circuit.circuit_num = ? ORDER BY ports_circuit.sequence ASC', [req.params.id], function (err, results, fields) {
        if (err) throw err;

        console.log(this.sql);

        console.log('** Result from second query: ');
        console.log(results);

        toSend[1] = results;
        console.log('** Send back the following info: ');
        console.log(toSend);

        res.json(toSend);
    });

});

// ***************************************************************
// Update Circuit
// ***************************************************************

router.put('/api/circuit-service', function (req, res) {
    var update_circuit = req.body;
    console.log("** PUT - update single Circuit Circuit ID: " + update_circuit.id);

    /*
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
    */


    // ----------------- USING MYSQL TRANSACTIONS INSTEAD --------
    // Using Transactions so we can rollback if failed in any step
    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }

        var query = connection.query('UPDATE circuit SET moc_id=?, interface_type=?, provision_speed=?, service=?, provider=?, isp=?, comment=? where id=?', [update_circuit.moc_id, update_circuit.interface_type, update_circuit.provision_speed, update_circuit.service, update_circuit.provider, update_circuit.isp, update_circuit.comment, update_circuit.id], function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    res.send(JSON.stringify({
                        result: "Epic Fail!",
                        sql: query.sql
                    }));
                    console.log('MySQL rolling back!');
                    throw error;
                });
            }
            console.log("** PUT Circuit - query result: " + JSON.stringify(results));
            res.set('Content-Type', 'application/json');

            //-----------------------------------------------
            // Delete all connections related to this circuit
            // ----------------------------------------------

            var query2 = connection.query('DELETE FROM ports_circuit WHERE circuit_num = ?', [update_circuit.id], function (error, results2, fields) {
                if (error) {
                    return connection.rollback(function () {
                        res.send(JSON.stringify({
                            result: "Epic Fail!",
                            sql: query2.sql
                        }));
                        console.log('MySQL rolling back from #2!');
                        throw error;
                    });
                }
                //-----------------------------------------------
                // Insert the circuit connections
                // ----------------------------------------------   
                // Get the inserted CircuitId
                var circuit_num = update_circuit.id;
                var valuesString = "";
                // Make sure the following variables are an Array, otherwise turn them into an array of single value
                var patch_panel_ids = update_circuit['patch_panel[]'] ? (Array.isArray(update_circuit['patch_panel[]']) ? update_circuit['patch_panel[]'] : [update_circuit['patch_panel[]']]) : [];
                var port_ids = update_circuit['port[]'] ? (Array.isArray(update_circuit['port[]']) ? update_circuit['port[]'] : [update_circuit['port[]']]) : [];
                console.log("** Number of circuit connections: " + patch_panel_ids.length);

                // Create the SQL sinsert sequence 
                for (var i = 0; i < patch_panel_ids.length; i++) {
                    valuesString += "(" + circuit_num + ", " + port_ids[i] + ", " + patch_panel_ids[i] + ", " + i + ")";
                    if (i != patch_panel_ids.length - 1) {
                        valuesString += ", ";
                    }
                }
                var query3 = connection.query('INSERT INTO ports_circuit (circuit_num, port_id, patch_panel_id, sequence) VALUES ' + valuesString, function (error, results2, fields) {
                    if (error) {
                        return connection.rollback(function () {
                            res.send(JSON.stringify({
                                result: "Epic Fail!",
                                sql: query3.sql
                            }));
                            console.log('MySQL rolling back from #3!');
                            throw error;
                        });
                    }


                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                res.send(JSON.stringify({
                                    result: "Epic Fail!",
                                    sql: query2.sql
                                }));

                                throw err;
                            });
                        }
                        console.log("** PUT also added " + port_ids.length + " ports");
                        console.log("The ports_circuit SQL is: " + JSON.stringify(query3.sql));
                        res.send(JSON.stringify({
                            result: "Insert Successful for (MoC ID " + update_circuit.moc_id + ") "
                        }));

                    });
                });


            });
        });
    });
});

// ***************************************************************
// Delete Circuit
// ***************************************************************
// TODO delete also circuit_port and use Transactions
router.delete('/api/circuit-service/:id', function (req, res) {
    var delete_circuit = req.body;
    console.log("** DELETE - delete circuit_num: " + delete_circuit.id);

    var query = connection.query('UPDATE circuit SET active = "0" where circuit_num=?', [delete_circuit.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** DELETE Circuit - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Delete success for circuit_num " + delete_circuit.id
        }));
    });
});

module.exports = router;
