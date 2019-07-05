var express = require('express');
var router = express.Router();
var mysql = require('mysql');
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


// ***************************************************************
// Get the whole list
// ***************************************************************

function getCircuits(callback) {
    console.log('** GET Circuits');

    connection.query('SELECT c.*, p.code AS provider_code, i.code AS isp_code FROM circuit c INNER JOIN provider p ON c.provider = p.id INNER JOIN isp i ON c.isp = i.id', function (err, results, fields) {
        if (err) throw err;

        var circuits = {};


        for (var i = results.length - 1; i >= 0; i--) {
            var result = results[i];
            result.status = "-";

            circuits[result.circuit_num] = result;
        }

        //get all status audit
        connection.query('SELECT * FROM circuit_audit ORDER BY `date`', function (err, audit_rows) {
            if (err) throw err;

            for (var i = audit_rows.length - 1; i >= 0; i--) {
                var row = audit_rows[i];
                var circuit = circuits[row.circuit_id];

                if (!circuit.history) circuit.history = [];

                circuit.history.push(row);

                //stupid and inefficient bas shasawy
                if (circuit.status == "-") circuit.status = row.status;
            }

            //get types of ENUM
            connection.query('SHOW COLUMNS FROM circuit_audit LIKE "status"', function (err, r) {
                if (err) throw err;
                // console.log(err, enums);

                var enums = r[0].Type.match(/\'(.*?)\'/g).map(result => result.replace(/\'/g, ""));
                var json = {
                    data: results,
                    enums: enums
                };

                callback(json);
            });
        });
    });
}

//export it so we can use it in other functions
router.getCircuits = getCircuits;


router.get('/api/circuit-service', function(req, res) {
    getCircuits(result => {
        res.json(result);
    });

});

router.post('/api/changeStatus/:id', async function (req, res) {
    console.log('** Add status change = ', req.params.id, req.body);

    var status = req.body.selected;

    var id = req.params.id;


    //check, is the state the same?
    //get last status audit
    connection.query('SELECT * FROM circuit_audit WHERE circuit_id = ? ORDER BY `date` DESC LIMIT 1', [id], function (err, audit_rows) {

        console.log(audit_rows);
        if (audit_rows.length > 0) {
            var row = audit_rows[0];
            if (row.status == status) {
                return res.status(400).json({
                    result: `Duplicate status '${status}'`
                });
            }
            
        }







        connection.query('INSERT INTO circuit_audit SET circuit_id=?, status=?, date=NOW()', [id, status], function (error, results, fields) {

            console.log(error, results, fields);

            // return req.redirect('/api/circuit-service');
            // return getCircuits(req, res);


            connection.query('SELECT * FROM circuit_audit WHERE circuit_id = ? ORDER BY `date` DESC LIMIT 1', [id], function (err, audit_rows) {

                var row = audit_rows[0];
                res.json({
                    result: "success",
                    data: row
                });

            });
        });
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
        var query = connection.query('INSERT INTO circuit SET id=?, moc_id=?, interface_type=?, provision_speed=?, service=?, provider=?, isp=?, comment=?', [newCircuit.id, newCircuit.moc_id, newCircuit.interface_type, newCircuit.provision_speed, newCircuit.service, newCircuit.provider, newCircuit.isp, newCircuit.comment], function (error, results, fields) {
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

            
            // Get the inserted CircuitId from the pr[evious insert
            var circuit_num = results.insertId; // CHANGE: Get actual ID
            // var valuesString = "";

            var rows = [];


            // Make sure the following variables are an Array, otherwise turn them into an array of single value
            addPatchPanelData("ingress", rows, newCircuit, circuit_num);
            addPatchPanelData("egress", rows, newCircuit, circuit_num);

            console.log(rows);

            var query2 = connection.query('INSERT INTO ports_circuit VALUES ? ', [rows], function (error, results2, fields) {
                console.log(query2.sql);
                if (error) {
                    console.log(error);

                    return connection.rollback(function () {
                        res.send(JSON.stringify({
                            result: error.sqlMessage,
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
                                result: error.sqlMessage,
                                sql: query2.sql
                            }));

                            throw err;
                        });
                    }
                    // console.log("** POST also added " + port_ids.length + " ports");
                    console.log("The ports_circuit SQL is: " + JSON.stringify(results2));
                    res.send(JSON.stringify({
                        result: "Insert Successful for (MoC ID " + newCircuit.moc_id + ") "
                    }));

                });
            });
        });
    });

});

// Create rows string to be inserted for patch panel ports
function addPatchPanelData(direction, rows, newCircuit, circuit_num) {

    var patch_panel_ids = newCircuit[direction+'_patch_panel[]'] ? (Array.isArray(newCircuit[direction+'_patch_panel[]']) ? newCircuit[direction+'_patch_panel[]'] : [newCircuit[direction+'_patch_panel[]']]) : [];
    var port_ids = newCircuit[direction+'_port[]'] ? (Array.isArray(newCircuit[direction+'_port[]']) ? newCircuit[direction+'_port[]'] : [newCircuit[direction+'_port[]']]) : [];
    console.log("** Number of circuit connections for " + direction + ": " + patch_panel_ids.length);

    for (var i = 0; i < patch_panel_ids.length; i++) {

        var row = [circuit_num, port_ids[i], patch_panel_ids[i], i, direction];

        rows.push(row);
    }
}

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
    console.log("** PUT - update single Circuit circuit_num: " + update_circuit.circuit_num);

    // ----------------- USING MYSQL TRANSACTIONS  ---------------
    // Using Transactions so we can rollback if failed in any step
    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }

        var query = connection.query('UPDATE circuit SET id=?, moc_id=?, interface_type=?, provision_speed=?, service=?, provider=?, isp=?, comment=? where circuit_num=?', [update_circuit.id, update_circuit.moc_id, update_circuit.interface_type, update_circuit.provision_speed, update_circuit.service, update_circuit.provider, update_circuit.isp, update_circuit.comment, update_circuit.circuit_num], function (error, results, fields) {
            console.log("** First SQL Transaction query: " + query.sql);
            if (error) {
                return connection.rollback(function () {
                    res.send(JSON.stringify({
                        result: error.sqlMessage,
                        sql: query.sql
                    }));
                    console.log('MySQL rolling back query #1!');
                    throw error;
                });
            }
            console.log("** PUT Circuit - query result: " + JSON.stringify(results));
            res.set('Content-Type', 'application/json');

            //-----------------------------------------------
            // Delete all connections related to this circuit before inserting new connections
            // ----------------------------------------------

            var query2 = connection.query('DELETE FROM ports_circuit WHERE circuit_num = ?', [update_circuit.circuit_num], function (error, results2, fields) {
                if (error) {
                    return connection.rollback(function () {
                        res.send(JSON.stringify({
                            result: "Epic Fail!",
                            sql: query2.sql
                        }));
                        console.log('MySQL rolling back from query #2!');
                        throw error;
                    });
                }
                //-----------------------------------------------
                // Insert the circuit connections
                // ----------------------------------------------   
                // Get the inserted circuit_num
                var circuit_num = update_circuit.circuit_num;
                var rows = [];


                // Make sure the following variables are an Array, otherwise turn them into an array of single value
                addPatchPanelData("ingress", rows, update_circuit, circuit_num);
                addPatchPanelData("egress", rows, update_circuit, circuit_num);

                console.log(rows);

                var query3 = connection.query('INSERT INTO ports_circuit VALUES ? ', [rows], function (error, results2, fields) {
                    console.log(query3.sql);

                    if (error) {
                        return connection.rollback(function () {
                            res.send(JSON.stringify({
                                result: "Epic Fail!",
                                sql: query3.sql
                            }));
                            console.log('MySQL rolling back from query #3!');
                            throw error;
                        });
                    }


                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                res.send(JSON.stringify({
                                    result: "Epic Fail!",
                                    sql: query3.sql
                                }));

                                throw err;
                            });
                        }
                        // console.log("** PUT also added " + port_ids.length + " ports");
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
