var express = require('express');
var router = express.Router();


// ***************************************************************
// Update Providers Page Routing
// ***************************************************************
router.get('/provider/updateform/:id', function (req, res, next) {

    var update_provider_id = req.params.id;

    res.render('provider', {
        title: req.app.get('appTitle'),
        pageName: 'Data Providers',
        pageLeadText: '',
        pageID: "providerUpdateForm",
        service_name: "provider-service",
        providerID: update_provider_id
    });
    console.log("** Loading Providers Update Page");

}); 


// ***************************************************************
// Main Providers Page Routing
// ***************************************************************
router.get('/provider', function (req, res, next) {
    res.render('provider', {
        title: req.app.get('appTitle'),
        pageName: 'Data Providers',
        pageLeadText: '',
        pageID: "mainProvider",
        service_name: "provider-service"
    });
    console.log("** Loading Main Providers Page");
});

module.exports = router;
