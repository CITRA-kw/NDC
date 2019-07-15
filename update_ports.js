
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

function updateDevice(patch_panel_id, data) {
    console.log('** GET crap');


    connection.query('DELETE FROM patch_panel_port WHERE patch_panel_id = ?', [patch_panel_id], (err, results, fields)  => {
    	console.log(results);

    	let id = 0;

    	for (let slot in data) {
    		let info = data[slot];

    		for (let i = 0; i < info.num_ports; i++) {

    			let insertData = {
    				id: id,
    				patch_panel_id: patch_panel_id,
    				label: slot + "/" + (i+info.starting_number) + " in",
    				port_type: info.port_type,
    				port_protocol: info.port_protocol,
    			}

		    	connection.query('INSERT INTO patch_panel_port SET ?', insertData);

    			id++;

		    	insertData.label = slot + "/" + (i+info.starting_number) + " out";
		    	insertData.id = id;

		    	connection.query('INSERT INTO patch_panel_port SET ?', insertData);
		    	id++;

    		}
    	}
	});
}

function updatePanelWithRows(patch_panel_id, data) {

	connection.query('DELETE FROM patch_panel_port WHERE patch_panel_id = ?', [patch_panel_id], (err, results, fields)  => {
    	console.log(results);

    	let id = 0;

    	for (let row in data) {
    		let info = data[row];

    		for (let i = 0; i < info.num_ports; i++) {

    			let insertData = {
    				id: id,
    				patch_panel_id: patch_panel_id,
    				label: "Column " + row + ", row " + (i+info.starting_number),
    				port_type: info.port_type,
    				port_protocol: info.port_protocol,
    			}

		    	connection.query('INSERT INTO patch_panel_port SET ?', insertData);

    			id++;
    		}
    	}
	});
}



//Huawei OTN

/*
data = {
	"9B 5/1": {
		num_ports: 5,
		port_type: "LC",
		port_protocol: "10G multiservice",
		starting_number: 1
	},
	"9B 5/2": {
		num_ports: 5,
		port_type: "LC",
		port_protocol: "10G multiservice",
		starting_number: 1
	},
	"9B 5/3": {
		num_ports: 5,
		port_type: "LC",
		port_protocol: "10G multiservice",
		starting_number: 1
	},
	"9B 5/4": {
		num_ports: 5,
		port_type: "LC",
		port_protocol: "10G multiservice",
		starting_number: 1
	},
	"9B 5/5": {
		num_ports: 5,
		port_type: "LC",
		port_protocol: "10G multiservice",
		starting_number: 1
	},
}
*/

//FPP1-8FL-TO-1FL-KIG

data = {
	"A": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"B": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"C": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"D": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"E": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"F": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"G": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"H": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"I": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"J": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"K": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
	"L": {
		num_ports: 12,
		port_type: "SC",
		port_protocol: "patch",
		starting_number: 1
	},
}


//Sandvine
/*
data = {
	"1": {
		num_ports: 8,
		port_type: "LC",
		port_protocol: "10G",
		starting_number: 1
	},

	"2": {
		num_ports: 16,
		port_type: "LC",
		port_protocol: "10G",
		starting_number: 1
	},

}
*/

updatePanelWithRows(58, data);
updatePanelWithRows(59, data);



