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
router.get('/api/patch_panel-service/patch_panel', function (req, res) {
    console.log('** Getting Patch Panel list. ');

    connection.query('select * from patch_panel', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
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

    connection.query('INSERT INTO patch_panel SET name=?, location=?', [newPatchPanel.name, newPatchPanel.location], function (error, results) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));
            throw error;
        }

        console.log("** POST Patch Panel - query result: " + JSON.stringify(results));
        newPatchPanelID = results.insertId;

        // Now insert the ports
        var result2 = insertPorts(newPatchPanelID);
        
        res.send(JSON.stringify({
            result: "Insert Successful for " + newPatchPanel.name
        }));


    });

    // Insert 24 ports for each patch panel we have added to the DB
    function insertPorts(forID) {
        // Create value string of the patch_panel_port
        var num = 24;
        var valuesString = '';
        for (var i = 0; i < num; i++) {
            if (i != 0) {
                valuesString += ', ';
            }
            var portId = parseInt(i) + 1;
            valuesString += '(' + portId + ', ' + forID + ', "# ' + portId + '")';
        }
        console.log("** Ports to insert " + valuesString);
        // Now insert the ports for this patch panel
        connection.query('INSERT INTO patch_panel_port (id, patch_panel_id, label) VALUES ' + valuesString, function (error, results) {
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
        //console.log("** Get Patch Panel Ports - query result: " + JSON.stringify(results));

    });
});

// ***************************************************************
// Get a single Patch Panel detail
// ***************************************************************
router.get('/api/patch_panel-service/patch_panel/:id', function (req, res) {
    console.log('** GET Single Patch Panel for ID ' + req.params.id);

    connection.query('select * from patch_panel where id = ?', [req.params.id], function (err, results, fields) {
        if (err) throw err;

        console.log(results);

        res.json(results);
    });
});

// ***************************************************************
// Update Patch Panel
// ***************************************************************

router.put('/api/patch_panel-service/patch_panel', function (req, res) {
    var update_patch_panel = req.body;
    console.log("** PUT - update single Patch Panel: " + update_patch_panel.name);

    var query = connection.query('UPDATE patch_panel SET name=?, location=? where id=?', [update_patch_panel.name, update_patch_panel.location, update_patch_panel.id], function (error, results, fields) {
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
