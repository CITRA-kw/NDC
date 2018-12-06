var express = require('express');
var router = express.Router();
var mysql = require('mysql');
// Load config file for database access
var config = require('config').get('dbConfig');

var connection = mysql.createConnection({
    host: config.get('host'),
    user: config.get('username'),
    password: config.get('password'),
    database: config.get('dbname'),
    multipleStatements: true
});

connection.connect();

// TODO Handle wrong ID



// ***************************************************************
// Get the whole list
// ***************************************************************
router.get('/api/patch_panel-service/patch_panel', function (req, res) {
    console.log('** Getting Patch Panel list. ');

    connection.query('select * from patch_panel', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
        console.log("** Get Patch Panel list - query result: " + JSON.stringify(results));
    });

});


// ***************************************************************
// Add a Patch Panel
// ***************************************************************

// TODO check if Patch Panel name already exists
router.post('/api/patch_panel-service/patch_panel', function (req, res) {
    var newPatchPanel = req.body;
    console.log('** POST Single Patch Panel: ' + newPatchPanel.name);

    //console.log('** POST Received: ' + newPatchPanel);

    connection.query('INSERT INTO patch_panel SET name=?, location=?, odf=?, comment=?', [newPatchPanel.name, newPatchPanel.location, newPatchPanel.odf, newPatchPanel.comment], function (error, results) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));
            throw error;
        }

        console.log("** POST Patch Panel - query result: " + JSON.stringify(results));
        newPatchPanelID = results.insertId;

        // Now insert the ports
        var result2 = insertPorts(newPatchPanelID, newPatchPanel.portsNum, newPatchPanel.ports_type);

        res.send(JSON.stringify({
            result: "Insert Successful for " + newPatchPanel.name
        }));
    });


    // Insert ports for each patch panel we have added to the DB
    function insertPorts(forID, num, ports_type) {
        console.log("** Creating string for SQL ports insert for patch panel ID " + forID + ", number of ports " + num + ", type " + ports_type);
        // Create value string of the patch_panel_port
        var valuesString = '';
        for (var i = 0; i < num; i++) {
            if (i != 0) {
                valuesString += ', ';
            }
            var portId = parseInt(i) + 1;
            valuesString += '(' + portId + ', ' + forID + ', "# ' + portId + '", "' + ports_type + '")';
        }
        console.log("** Ports to insert " + valuesString);
        // Now insert the ports for this patch panel
        connection.query('INSERT INTO patch_panel_port (id, patch_panel_id, label, port_type) VALUES ' + valuesString, function (error, results) {
            if (error) {
                throw error;
            }

            console.log("** POST Also added " + num + " ports");
            return "Insert Successful for " + num + " ports";
        });
    }
});



// ***************************************************************
// Get ports of a Patch Panel
// ***************************************************************
router.get('/api/patch_panel-service/ports/:id', function (req, res) {
    var patch_panel_id = req.params.id;
    console.log('** GET ports of Patch Panel ID ' + patch_panel_id);
    /*
SELECT ppp.*, cc.id, cc.active, IF(EXISTS(SELECT null FROM ports_circuit AS pc2 WHERE pc2.port_id = ppp.id AND pc2.patch_panel_id = ppp.patch_panel_id), TRUE, FALSE) as used 
FROM patch_panel_port AS ppp LEFT JOIN 
	(SELECT c.active, pc.patch_panel_id, pc.port_id, c.id FROM ports_circuit AS pc INNER JOIN circuit AS c ON c.circuit_num = pc.circuit_num) AS cc 
    ON cc.port_id = ppp.id AND cc.patch_panel_id = ppp.patch_panel_id
WHERE ppp.patch_panel_id=1 AND cc.active=1 ORDER BY ppp.id
    */

    //connection.query('SELECT * FROM patch_panel_port WHERE patch_panel_id=? && CONCAT_WS(" ", patch_panel_id, id) NOT IN (SELECT CONCAT_WS(" ", patch_panel_id, port_id) FROM ports_circuit)', [patch_panel_id], function (error, results, fields) {
    connection.query('SELECT ppp.*, cc.id, cc.active, cc.moc_id, IF(EXISTS(SELECT null FROM ports_circuit AS pc2 WHERE pc2.port_id = ppp.id AND pc2.patch_panel_id = ppp.patch_panel_id), FALSE, TRUE) as used FROM patch_panel_port AS ppp LEFT JOIN (SELECT c.active, pc.patch_panel_id, pc.port_id, c.id, c.moc_id FROM ports_circuit AS pc LEFT JOIN circuit AS c ON c.circuit_num = pc.circuit_num) AS cc ON cc.port_id = ppp.id AND cc.patch_panel_id = ppp.patch_panel_id WHERE ppp.patch_panel_id=? ORDER BY ppp.id', [patch_panel_id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));
            throw error;
        }

        res.json(results);
        console.log("** Get Patch Panel Ports - query result: " + JSON.stringify(results));

    });
});

// ***************************************************************
// Get a single Patch Panel detail
// ***************************************************************
router.get('/api/patch_panel-service/patch_panel/:id', function (req, res) {
    console.log('** GET Single Patch Panel for ID ' + req.params.id);

    var toSend;

    // First get patch panel details
    connection.query('SELECT pp.id, pp.name, pp.location, pp.comment, count(ppp.patch_panel_id) AS portsNum, ppp.port_type AS ports_type, pp.odf FROM patch_panel AS pp LEFT JOIN patch_panel_port AS ppp ON pp.id = ppp.patch_panel_id WHERE pp.id = ? GROUP BY ppp.port_type', [req.params.id], function (err, results, fields) {
        if (err) throw err;

        console.log("** Get a single Patch Panel - query result: " + JSON.stringify(results));

        toSend = results;
    });

    // Now get all ports of a patch panel
    connection.query('SELECT * FROM patch_panel_port WHERE patch_panel_id = "' + req.params.id + '"', function (error, results) {
        if (error) {
            throw error;
        }

        toSend[1] = results;
        console.log('** Sending back the following info: ');
        console.log(toSend);

        res.json(toSend);
    });
});

// ***************************************************************
// Update Patch Panel
// ***************************************************************
router.put('/api/patch_panel-service/patch_panel', function (req, res) {
    var update_patch_panel = req.body;
    console.log("** PUT - update single Patch Panel: " + update_patch_panel.name);


    // ----------------- USING MYSQL TRANSACTIONS  ---------------
    // Using Transactions so we can rollback if failed in any step
    connection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }

        var query = connection.query('UPDATE patch_panel SET name=?, location=?, odf=?, comment=? where id=?', [update_patch_panel.name, update_patch_panel.location, update_patch_panel.odf, update_patch_panel.comment, update_patch_panel.id], function (error, results, fields) {
            console.log("** First SQL Transaction query: " + query.sql);
            if (error) {
                return connection.rollback(function () {
                    res.send(JSON.stringify({
                        result: "Epic Fail!",
                        sql: query.sql
                    }));
                    console.log('MySQL rolling back query #1!');
                    throw error;
                });
            }
            console.log("** PUT Patch Panel - query result: " + JSON.stringify(results));
            res.set('Content-Type', 'application/json');

            //-----------------------------------------------
            // Now update the labels
            // ----------------------------------------------

            // First create array of port labels and ids
            var ports_label_vals = update_patch_panel['ports_label_val[]'] ? (Array.isArray(update_patch_panel['ports_label_val[]']) ? update_patch_panel['ports_label_val[]'] : [update_patch_panel['ports_label_val[]']]) : [];
            var ports_label_ids = update_patch_panel['ports_label_id[]'] ? (Array.isArray(update_patch_panel['ports_label_id[]']) ? update_patch_panel['ports_label_id[]'] : [update_patch_panel['ports_label_id[]']]) : [];
            var ports_label_patch_panel_ids = update_patch_panel['ports_label_patch_panel_id[]'] ? (Array.isArray(update_patch_panel['ports_label_patch_panel_id[]']) ? update_patch_panel['ports_label_patch_panel_id[]'] : [update_patch_panel['ports_label_patch_panel_id[]']]) : [];

            var update_query = '';

            for (var i = 0; i < ports_label_vals.length; i++) {
                update_query += 'UPDATE patch_panel_port SET label = "' + ports_label_vals[i] + '" WHERE id = "' + ports_label_ids[i] + '" AND patch_panel_id = "' + ports_label_patch_panel_ids[i] + '";';
            }

            var query2 = connection.query(update_query, function (error, results2, fields) {
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

                console.log("The ports label update SQL is: " + JSON.stringify(query2.sql));

                // Now commit the transaction
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


                    res.send(JSON.stringify({
                        result: "Update patch panel successful for (" + update_patch_panel.name + ") "
                    }));


                });


            });
        });
    });

});


// ***************************************************************
// Delete Patch Panel
// ***************************************************************
router.delete('/api/patch_panel-service/patch_panel/:id', function (req, res) {
    var delete_patch_panel = req.body;
    console.log("** DELETE - delete Patch Panel: " + delete_patch_panel.id);

    // Start deleting the patch panel first
    connection.query('DELETE FROM patch_panel WHERE id=?', [delete_patch_panel.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** DELETE Patch Panel - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Delete success for  " + delete_patch_panel.name
        }));
    });

    // Now delete ports under that patch panel
    connection.query('DELETE FROM patch_panel_port WHERE patch_panel_id=?', [delete_patch_panel.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** DELETE Patch Panel Ports - query result: " + JSON.stringify(results));

    });
});







module.exports = router;
