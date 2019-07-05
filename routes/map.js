var express = require('express');
var router = express.Router();
var moment = require("moment");



/* GET users listing. */
router.get('/map', function (req, res, next) {
    
	res.render('map', {
        title: req.app.get('appTitle'),
        pageName: 'Map',
        pageLeadText: '',
        pageID: "map",
        service_name: "map-service",

    });
    console.log("** Loading Map Page");

});

module.exports = router;
