var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('patch_panel_port', { title: req.app.get('appTitle'),
                    pageName: 'Patch Panel Port',
                    pageLeadText: 'To update ports that belong to patch panels.'});
});

module.exports = router;
