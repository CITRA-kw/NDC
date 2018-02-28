var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('circuit', {
        title: req.app.get('appTitle'),
        pageName: 'Data Circuits',
        pageLeadText: 'Below is where you update data circuits between providers and ISPs.'
    });
});

module.exports = router;
