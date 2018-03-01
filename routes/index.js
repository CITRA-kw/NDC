var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: req.app.get('appTitle'),
        pageName: 'Index',
        pageLeadText: 'Index and stuff'
    });
});

module.exports = router;
