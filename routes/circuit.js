var express = require('express');
var router = express.Router();


// ***************************************************************
// Update Circuit Page Routing
// ***************************************************************
router.get('/circuit/updateform/:id', function (req, res, next) {

    var update_circuit_id = req.params.id;

    res.render('circuit', {
        title: req.app.get('appTitle'),
        pageName: 'Circuits',
        pageLeadText: '',
        pageID: "circuitUpdateForm",
        service_name: "circuit-service",
        circuitID: update_circuit_id
    });
    console.log("** Loading Circuit Update Page");

}); 


// ***************************************************************
// Main circuit Page Routing
// ***************************************************************
router.get('/circuit', function (req, res, next) {
    res.render('circuit', {
        title: req.app.get('appTitle'),
        pageName: 'Circuits',
        pageLeadText: '',
        pageID: "mainCircuit",
        service_name: "circuit-service"
    });
    console.log("** Loading Main Circuit Page");
});

module.exports = router; 
