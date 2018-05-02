// FOR ALL POOR SOULS TRYING TO DEBUG MY CODE
// Good luck and happy debugging!


// TODO https://stackoverflow.com/questions/14949210/dynamically-update-a-table-using-javascript 




$(document).ready(function () {
    console.log("** Loaded main-script.js");

    // ***************************************************************
    // Dynamically load table data
    // ***************************************************************    
    // Load ISP page javascript
    if (document.location.href.indexOf("/isp") > -1) {

        // Load JS of ISP pages
        $.getScript("/javascripts/isp-pages.js");
    }
    // Load Provider page javascript
    else if (document.location.href.indexOf("/provider") > -1) {

        // Load JS of Provider pages
        $.getScript("/javascripts/provider-pages.js");
    }
    // Load Patch Panel page javascript
    else if (document.location.href.indexOf("/patch_panel") > -1) {

        // Load JS of Patch Panel pages
        $.getScript("/javascripts/patch_panel-pages.js");
    }
    // Load Circuit page javascript
    else if (document.location.href.indexOf("/circuit") > -1) {

        // Load JS of Circuit pages
        $.getScript("/javascripts/circuit-pages.js");
    }
    // Usually this is the main page - too lazy to make an IF statement just for it
    else {
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
                    {
                        title: "ID"
                    },
                    {
                        title: "MOC ID"
                    },
                    {
                        title: "ISP"
                    },
                    {
                        title: "Provider"
                    },
                    {
                        title: "Speed"
                    },
                ]
            }); //datatables init


        });
    }





}); // end jQuery document 



// *************************************************************************
// *************************************************************************
// *************************************************************************
// FUNCTIONS
// ************************************************************************* 
// *************************************************************************
// *************************************************************************


// ***************************************************************
// Print the list
// ***************************************************************  
function updateList(service_name) {
    // Get list of ISPs and print them
    $.getJSON('/api/' + service_name + '/', printList);

}


// ***************************************************************
// Show message
// ***************************************************************  
function showMessage(msg) {
    var msgBox = '<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + msg + '</div>';
    $('#pageContent').prepend(msgBox);
    console.log("** Showing mesasge box: " + msg);

}


// ***************************************************************
// Print a list
// ***************************************************************
function printList(list_data) {
    console.log("** Printing the list");

    // Clear the  list on the UI
    $('#some_list').empty();

    // Iterate and add each list_data to the list
    $.each(list_data, function () {
        // no comments for you
        // it was hard to write
        // so it should be hard to read

        // Circuit has no names so I'm using its MOC ID and circuit_num instead
        if (!this.name) {
            this.name = this.moc_id;
            this.id = this.circuit_num;
        }

        $('<li>').addClass('list-group-item d-flex justify-content-between lh-condensed').appendTo('#some_list');
        $('<div>').appendTo('#some_list>li:last-child');
        $('<h6>').addClass('my-0').text(this.name).appendTo('#some_list>li:last-child>div:last-child');
        $('<small>').addClass('text-muted').appendTo('#some_list>li:last-child');

        // Check the link and make sure we don't have /updateform/ already on the page link
        var updateLink;
        if (document.location.href.indexOf("updateform") > -1) {
            updateLink = "";
        } else {
            updateLink = "updateform/";
        }

        $('<a class="btn btn-link btn-sm" href="' + updateLink + this.id + '">').text('update').appendTo('#some_list>li:last-child>small');
        $('#some_list>li:last-child>small').append(' | ');

        $('<button type="button" class="btn btn-link btn-sm" data-toggle="modal" data-target="#deleteModal" data-delete_id="' + this.id + '" data-delete_name="' + this.name + '">delete</button>').appendTo('#some_list>li:last-child>small');
    });
    $('#list_num').html(list_data.length);

    // Adding confirmation functionality when clicking delete link of each item on the list
    $('#deleteModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggers the modal
        var delete_id = button.data('delete_id');
        var delete_name = button.data('delete_name');

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback)
        var modal = $(this);
        modal.find('.modal-body span').text(delete_name);
        modal.find('.delete-btn-confirm').data('id', delete_id); // Adding data to be used on click
        modal.find('.delete-btn-confirm').data('name', delete_name); // Adding data to be used on click

    });
}

// ***************************************************************
// When "Delete Confirm" button is clicked
// ***************************************************************
$('.delete-btn-confirm').click(function () {
    // If this comment is removed the program will blow up 
    console.log("** Delete Confirmed clicked for ID " + $(this).data('id') + " and name " + $(this).data('name'));

    // Create JSON data for delete request
    var delete_data = {};
    delete_data.id = $(this).data('id');
    delete_data.name = $(this).data('name');

    // Create a new instance of ladda for the specified button
    // will be used later to start and stop the loading animation
    var buttonLoading = Ladda.create(this);


    // JSON call to delete
    $.getJSON({
        url: '/api/' + service_name + '/' + delete_data.id,
        dataType: 'text',
        data: delete_data,
        type: "delete",
        success: function (data) {
            data = jQuery.parseJSON(data);
            console.log("** Received after DELETE: " + data.result);

            // stop button loading animation
            buttonLoading.stop();

            // Hide the confirmation window
            $('#deleteModal').modal('hide');


            // Compose the feedback message
            var messageText = data.result;

            // If we have messageAlert and messageText
            if (messageText) {
                // inject the alert to the div
                showMessage(messageText);
                console.log("** Delete success should appear on page");
            }

            // Update ISP list 
            updateList(service_name);
        },
        beforeSend: function () {
            // Start button loading animation
            buttonLoading.start(); // Button loading start
        },
        error: function () {}
    }); // end getJSON

}); // end click
