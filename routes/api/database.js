var mysql = require("mysql2");



// Load config file for database access
var config = require('config').get('dbConfig');

var connection = mysql.createPool({
    connectionLimit: 50,
    host: config.get('host'),
    user: config.get('username'),
    password: config.get('password'),
    database: config.get('dbname')
});


module.exports = connection;
