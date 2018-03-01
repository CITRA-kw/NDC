var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

    res.render('index', {
        title: req.app.get('appTitle'),
        pageName: '',
        pageLeadText: 'Tabular Data',
        pageID: "main"

    });
    console.log("** Loading ISP Update Page");

});

module.exports = router;
