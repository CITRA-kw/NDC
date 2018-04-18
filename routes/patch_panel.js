var express = require('express');
var router = express.Router();


// ***************************************************************
// Update Patch Panel Page Routing
// ***************************************************************
router.get('/patch_panel/updateform/:id', function (req, res, next) {

    var update_patch_panel_id = req.params.id;

    res.render('patch_panel', {
        title: req.app.get('appTitle'),
        pageName: 'Patch Panel',
        pageLeadText: '',
        pageID: "patchPanelUpdateForm",
        service_name: "patch_panel-service/patch_panel",
        patchPanelID: update_patch_panel_id
    });
    console.log("** Loading Patch Panel Update Page");

}); 


// ***************************************************************
// Main Patch Panel Page Routing
// ***************************************************************
router.get('/patch_panel', function (req, res, next) {
    res.render('patch_panel', {
        title: req.app.get('appTitle'),
        pageName: 'Patch Panel',
        pageLeadText: '',
        pageID: "mainPatchPanel",
        service_name: "patch_panel-service/patch_panel"
    });
    console.log("** Loading Main Patch Panel Page");
});

module.exports = router;
