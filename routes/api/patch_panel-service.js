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
router.get('/api/patch_panel-service', function (req, res) {
    connection.query('select * from patch_panel', function (err, results, fields) {
        if (err) throw err;

        res.json(results);
    });

});


// ***************************************************************
// Add a Patch Panel
// ***************************************************************

// TODO check if Patch Panel name already exists
router.post('/api/patch_panel-service', function (req, res) {
    var newPatchPanel = req.body;
    console.log('** POST Single Patch Panel: ' + newPatchPanel.name);

    connection.query('INSERT INTO patch_panel SET name=?', [newPatchPanel.name], function (error, results) {
        if (error) {
            res.send(JSON.stringify({
                result: "Epic Fail!"
            }));

            throw error;
        }

        console.log("** POST Patch Panel - query result: " + JSON.stringify(results));
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            result: "Insert Successful for " + newPatchPanel.name
        }));
    });
});

// ***************************************************************
// Get a single Patch Panel detail
// ***************************************************************
router.get('/api/patch_panel-service/:id', function (req, res) {
    console.log('** GET Single Patch Panel: select * from patch_panel where id = ' + req.params.id);

    connection.query('select * from patch_panel where id = ' + req.params.id, function (err, results, fields) {
        if (err) throw err;

        console.log(results);

        res.json(results);
    });
});

// ***************************************************************
// Update Patch Panel
// ***************************************************************

router.put('/api/patch_panel-service', function (req, res) {
    var update_patch_panel = req.body;
    console.log("** PUT - update single Patch Panel: " + update_patch_panel.name);

    var query = connection.query('UPDATE patch_panel SET name=? where id=?', [update_patch_panel.name, update_patch_panel.id], function (error, results, fields) {
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
router.delete('/api/patch_panel-service/:id', function (req, res) {
    var delete_patch_panel = req.body;
    console.log("** DELETE - delete Patch Panel: " + delete_patch_panel.id);

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
});

module.exports = router;
