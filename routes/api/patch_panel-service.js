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

    connection.query('SELECT * FROM patch_panel_port WHERE patch_panel_id=? && CONCAT_WS(patch_panel_id, " ", id) NOT IN (SELECT CONCAT_WS(patch_panel_id, " ", port_id) FROM ports_circuit)', [patch_panel_id], function (error, results, fields) {
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

    var query = connection.query('UPDATE patch_panel SET name=?, location=?, odf=?, comment=? where id=?', [update_patch_panel.name, update_patch_panel.location, update_patch_panel.odf, update_patch_panel.comment, update_patch_panel.id], function (error, results, fields) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** PUT Patch Panel - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Update Successful for " + update_patch_panel.name
        }));
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
