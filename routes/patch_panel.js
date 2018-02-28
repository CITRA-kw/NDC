var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('patch_panel', {
        title: req.app.get('appTitle'),
        pageName: 'Patch Panels',
        pageLeadText: 'To update patch panel information.'
    });
});

module.exports = router;
