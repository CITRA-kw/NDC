$(document).ready(function () {
    // ***************************************************************
// Dynamically load table data
// ***************************************************************    
    // 
    if ( document.location.href.indexOf("/isp") > -1 ) {    
        console.log("** Entering main-script.js");
        
        // Load JS of ISP pages
        $.getScript( "/javascripts/isp-pages.js");
    }
        
}); // end jQuery document

