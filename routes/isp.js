var express = require('express');
var router = express.Router();
var request = require('request');


// ***************************************************************
// Update ISP Page Routing
// ***************************************************************
router.get('/isp/updateform/:id', function(req, res, next) {
    // HANDLE WRONG ID
    
    var update_isp_id = req.params.id;
    
    res.render('isp', { title: req.app.get('appTitle'),
                    pageName: 'Internet Service Providers',
                    pageLeadText: 'Add, remove, or update ISP data.',
                    pageID: "ispUpdateForm",
                    ispID: update_isp_id });
    console.log("** Loading ISP Update Page");

});


// ***************************************************************
// Main ISP Page Routing
// ***************************************************************
router.get('/isp', function(req, res, next) {
    res.render('isp', { title: req.app.get('appTitle'),
                    pageName: 'Internet Service Providers',
                    pageLeadText: 'Below is where you update ISP data.',
                    pageID: "mainISP"});
    console.log("** Loading Main ISP Page");
});


module.exports = router;
