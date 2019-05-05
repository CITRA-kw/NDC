var express = require('express');
var router = express.Router();
var mysql = require('mysql');
// Load config file for database access
var config = require('config').get('dbConfig');
var moment = require("moment");

//reuse code instead of copy-pasta
var circuitService = require("./circuit-service");

var connection = mysql.createConnection({
    host: config.get('host'),
    user: config.get('username'),
    password: config.get('password'),
    database: config.get('dbname')
});

connection.connect();


// ***************************************************************
// Get days the circuit is in service for that date
// ***************************************************************
router.get('/api/finance-service/:month/:year', function (req, res) {

    //TODO: need to input month
    let month = Number(req.params.month) || moment().month();
    let year  = Number(req.params.year) || moment().year();


    console.log(month, year);
    let beginningOfMonth = moment([year, month, 1]);
    let endOfMonth       = moment([year, month, 1]).endOf("month");

    console.log(beginningOfMonth.format());
    console.log(endOfMonth.format());
    circuitService.getCircuits(json => {

        //get the active days and append


        var data = json.data;

        for (let circuit of data) {
            circuit.daysInService = 0;

            //loop through each status.  They should be sorted by newest so we're gonna loop backwards

            if (circuit.history) {
                let lastStatus;
                let lastActiveDate;

                //loop backwards
                for (var i = circuit.history.length - 1; i >= 0; i--) {
                    let entry = circuit.history[i];

                    status = entry.status;
                    date = moment(entry.date);

                    //we beyond our month?  If so, break out.
                    if (date.isAfter(endOfMonth)) {
                        console.log(date.format(), "is after", endOfMonth.format(), "breaking out");
                        break;
                    }
                    //pointless
                    if (status == lastStatus) continue;

                    if (lastStatus != "active") {
                        //check the start
                        if (status == "active") {
                            //starting at
                            lastStatus = status;
                            lastActiveDate = date.isBefore(beginningOfMonth) ? beginningOfMonth : date;  //get the beginning of month if it's before that
                        }
                    }
                    else {
                        //did it change from active to something else?  If so, calculate number of days!
                        lastStatus = status;
                        circuit.daysInService += Math.max(date.diff(lastActiveDate, "days"), 0);
                    }
                }

                //still active?
                if (lastStatus == "active") {
                    circuit.daysInService += endOfMonth.diff(lastActiveDate, "days");

                    console.log("Still active", endOfMonth.format(), lastActiveDate.format());
                }
            }
        }

        res.json(json);
    });

});





module.exports = router;
