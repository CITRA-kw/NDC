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





// ***************************************************************
// Get the whole list
// ***************************************************************
router.get('/api/isp-service', function(req, res) {   
    connection.query('select * from isp', function(err, results, fields) {
        if(err) throw err;

        res.json(results);
    });
    
});


// ***************************************************************
// Add an ISP
// ***************************************************************
router.post('/api/isp-service', function (req, res) {
    var newISP = req.body;
    console.log('** POST Single ISP: ');
    
    connection.query('insert into isp SET ?', req.params.id, function (err, result) {
    if (err) throw err;
    console.log('** ' + result);

    res.end("1 record inserted: " + result);
    });
});

// ***************************************************************
// Get a single ISP detail
// ***************************************************************
router.get('/api/isp-service/:id', function (req, res) { 
    console.log('** GET Single ISP: select * from isp where id = ' + req.params.id);
    
    connection.query('select * from isp where id = ' + req.params.id, function(err, results, fields) {
        if(err) throw err;
        
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

    var query = connection.query('UPDATE isp SET name=?, contact_name=?, contact_phone=?, contact_email=? where id=?', 
                     [update_isp.name, update_isp.contact_name, update_isp.contact_phone, update_isp.contact_email, update_isp.id], function (error, results, fields) {
        if (error) throw error;
        
        //console.log("** PUT ISP - query text: " + query.sql);        
        console.log("** PUT ISP - query result: " + JSON.stringify(results));    
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({result: "Update Successful"}));    
    });
});

// ***************************************************************
// Delete ISP
// ***************************************************************
router.delete('/api/isp-service/:id', function (req, res) {
   connection.query('DELETE FROM isp WHERE id=?', [req.body.id], function (error, results, fields) {
       if (error) throw error;
       res.end('Record has been deleted!');   
   });
});

module.exports = router;
    