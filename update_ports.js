
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

function update(patch_panel_id, data) {
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
    				label: slot + "-" + (i+info.startingNumber) + " in",
    				port_type: info.port_type,
    				port_protocol: info.port_protocol,
    			}

		    	connection.query('INSERT INTO patch_panel_port SET ?', insertData);

    			id++;

		    	insertData.label = slot + "-" + (i+info.startingNumber) + " out";
		    	insertData.id = id;

		    	connection.query('INSERT INTO patch_panel_port SET ?', insertData);
		    	id++;

    		}
    	}
	});
}


data = {
	"5": {
		num_ports: 16,
		port_type: "LC",
		port_protocol: "2.5G multiservice",
		startingNumber: 1
	},

	"6": {
		num_ports: 4,
		port_type: "LC",
		port_protocol: "10G multiservice",
		startingNumber: 1
	},

	"16": {
		num_ports: 16,
		port_type: "LC",
		port_protocol: "2.5G multiservice",
		startingNumber: 1
	},

	"22": {
		num_ports: 10,
		port_type: "LC",
		port_protocol: "10G multiservice",
		startingNumber: 1
	},
	"23": {
		num_ports: 16,
		port_type: "LC",
		port_protocol: "2.5G multiservice",
		startingNumber: 1
	}
}

update(1, data);