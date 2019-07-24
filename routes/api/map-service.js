var express = require('express');
var router = express.Router();

// Load database connectivity
var connection = require('./database.js');

var moment = require("moment");

//reuse code instead of copy-pasta
var circuitService = require("./circuit-service");
var panelService = require("./patch_panel-service");




// ***************************************************************
// Get days the circuit is in service for that date
// ***************************************************************
router.get('/api/map-service/links', function (req, res) {

	let ports = {};



    circuitService.getCircuits(json => {

    	//I need this to look up circuits by its number.
    	circuitByNum = {};
    	for (let circuit of json.data) {
    		circuitByNum[circuit.circuit_num] = circuit;
    	}

    	console.log(circuitByNum);

// | circuit_num | port_id | patch_panel_id | sequence | direction | id  | patch_panel_id | label          | port_type | port_protocol    | id | name                      | location | ODF     | comment
    	//add the patch panel port for each circuit.
    	connection.query(`SELECT * FROM ports_circuit 
    		              JOIN patch_panel_port ON ports_circuit.port_id = patch_panel_port.id AND ports_circuit.patch_panel_id = patch_panel_port.patch_panel_id 
    					  JOIN patch_panel ON patch_panel.id = ports_circuit.patch_panel_id 
    					  ORDER BY circuit_id, sequence`, function (err, results, fields) {


    		// console.log(err, results);
    		for (let result of results) {
    			let circuit = circuitByNum[result.circuit_num];
    			//does it have a ports object?
    			// console.log(circuit);
    			if (!circuit.ports) {
                    circuit.ports = {};
                }

    			//does it have the direction array?  (ingress, egress)
    			if (!circuit.ports[result.direction]) circuit.ports[result.direction] = [];

    			circuit.ports[result.direction].push(result);

    		}

    		//get patch panels as nodes

		    panelService.getPanels((results) => {
				json.nodes = results;

		    	res.json(json);
		    })
    	});
    });
});



module.exports = router;
