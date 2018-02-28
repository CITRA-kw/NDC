var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('provider', {
        title: req.app.get('appTitle'),
        pageName: 'International Providers',
        pageLeadText: 'International providers that connects with Kuwait IXP.'
    });
});

module.exports = router;
