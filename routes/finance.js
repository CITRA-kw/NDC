var express = require('express');
var router = express.Router();
var moment = require("moment");



/* GET users listing. */
router.get('/finance', function (req, res, next) {
    
	res.render('finance', {
        title: req.app.get('appTitle'),
        pageName: 'Finance',
        pageLeadText: '',
        pageID: "finance",
        service_name: "finance-service",

    });
    console.log("** Loading Finance Page");



});

module.exports = router;
