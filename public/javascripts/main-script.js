// FOR ALL POOR SOULS TRYING TO DEBUG MY CODE
// Good luck and happy debugging!


// TODO https://stackoverflow.com/questions/14949210/dynamically-update-a-table-using-javascript 



$(document).ready(function () {
    console.log("** Loaded main-script.js");

    // ***************************************************************
    // Dynamically load table data
    // ***************************************************************    
    // Load ISP javascript
    if (document.location.href.indexOf("/isp") > -1) {

        // Load JS of ISP pages
        $.getScript("/javascripts/isp-pages.js");
    }
    // Load Provider javascript
    else if (document.location.href.indexOf("/provider") > -1) {

        // Load JS of Provider pages
        $.getScript("/javascripts/provider-pages.js");
    }



    // Do a JSON call and populate the form
    $.getJSON('/api/circuit-service/', function (json) {
        console.log("** Received circuit JSON info to populate form for", json);

        //make an array
        var data = [];

        for (var i in json) {
            var row = json[i];

            var datum = [row["id"], row["moc_id"], row["isp"], row["provider"], row["provision_speed"]];
            data.push(datum);
        }
        $('#example').DataTable({
            data: data,
            columns: [
                { title: "ID" },
                { title: "MOC ID" },
                { title: "ISP" },
                { title: "Provider" },
                { title: "Speed" },
            ]
        } );  //datatables init


    });


}); // end jQuery document 



// *************************************************************************
// *************************************************************************
// *************************************************************************
// FUNCTIONS
// ************************************************************************* 
// *************************************************************************
// *************************************************************************


// ***************************************************************
// Show message
// ***************************************************************  
function showMessage(msg) {
    var msgBox = '<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + msg + '</div>';
    $('#pageContent').prepend(msgBox);
    console.log("** Showing mesasge box: " + msg);

}
