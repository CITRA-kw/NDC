// FOR ALL POOR SOULS TRYING TO DEBUG MY CODE
// Good luck and happy debugging!


// TODO https://stackoverflow.com/questions/14949210/dynamically-update-a-table-using-javascript 


var statusColors = {
    connecting: '#adddce',
    active: '#70ae98',
    suspended: '#f0a35e',
    cancelled: '#ca7e8d',
    testing: '#e6b655',
}

function capitalize(s) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}


function drawStatusTable(row) {
    var data = '<table  class="col-md-6" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<th>Date</th>'+
            '<th>Time</th>'+
            '<th>Status</th>'+
        '</tr>';

    for (var i in row.history) {

        var d = moment(row.history[i].date);
        var status = row.history[i].status;


        data += '<tr>'+
            '<td style="color: #00008f">'+ d.format("DD-MM-YYYY") +'</td>'+
            '<td style="color: #00008f">'+ d.format("h:mm:ss a") +'</td>'+
            '<td style="color: '+statusColors[status]+'">'+ status +'</td>'+
        '</tr>'
    }

    data += '</table>';
    return data;
}


function rowCallback( tr, data ) {
    //find column with status.
    $(tr).find('td').each(function() {
        //stupid check, but if it's colorable, then color it!
        for (var key in statusColors) {
            if ($(this).html() == key) {
                $(this).html(data.status)
                $(this).css("color", statusColors[data.status])
                break;
            }
        }
    })
    // $('td:eq(6)', tr).html(data.status)
    // $('td:eq(6)', tr).css("color", statusColors[data.status])
}


function addTableDropdown(table, json) {
        //expand row to show circuit status history and option to change status
    var rowDetails = function(row, rowData) {
        var data = '<div class="col-md-12"> ';

        data += '<div id="graph"></div>';
        //draw graph

        data += '<div id="statusTable">';

        if (rowData.history && rowData.history.length > 0) {
            data += drawStatusTable(rowData); 
        }

        data += '</div>';

        submitChange = function() {
            var selected = $("#damn").children("option:selected").val();

            if (selected && selected != "") {

                var formData = {
                    selected: selected
                };

                //disable submit button
                $("#submitButton").prop("disabled",true);

                // JSON call to add form data
                $.ajax({
                    url: "/api/changeStatus/" + rowData.circuit_num,
                    dataType: 'json',
                    data: formData,
                    type: "post",
                    success: function (data) {
                        // data = jQuery.parseJSON(data);
                        console.log("** Received after POST: ", data);

                        
                        // Compose the feedback message
                        var messageText = data.result;

                        // If we have messageAlert and messageText
                        if (messageText) {
                            // inject the alert to the div
                            showMessage(messageText, "success", "submitStatusError" + rowData.circuit_num );
                            console.log("** Success message should appear on page");
                        }

                        // Update Circuits list 
                        // updateList(service_name);
                        $("#submitButton").prop("disabled", false);

                        // json.data = data.data;

                        // table.ajax.reload();
                        // table.draw('full-reset');

                        //redraw the status table

                        rowData.status = selected;

                        $("#statusTable").empty();

                        if (!rowData.history) rowData.history = [];

                        rowData.history.unshift(data.data)
                        $("#statusTable").append(drawStatusTable(rowData));

                        //change status as well
                        rowCallback(row, rowData)



                    },
                    error: function (jqXHR,  textStatus,  errorThrown) {
                        console.log("** Error: There's an error on getJSON", jqXHR.responseJSON);
                        var data = jqXHR.responseJSON;

                        $("#submitButton").prop("disabled",false);

                        var messageText = data.result;

                        showMessage(messageText, "danger", "submitStatusError" + rowData.circuit_num );

                    }
                }); // end getJSON


            }
            
        }


        data += '<hr/><div class="col-md-12">' +
            '<select id="damn"><option></option>' +
            json.enums.map(function(entry) { return "<option value='"+ entry +"'>"+ capitalize(entry) +"</option>"}) +
            '<input type="submit" id="submitButton" onclick="return submitChange();"/> </select>' +
        '</div>';

        data += '<div id="submitStatusError'+ rowData.circuit_num +'"></div>'

        data += '</div>'
        return data;
    }


    table.on('click', 'td i#expandButton', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        var symbol = $(this).closest('i');

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            symbol.removeClass("fa-angle-down").addClass('fa-angle-right');
        }
        else {
            // Open this row
            row.child( rowDetails(tr, row.data()) ).show();
            tr.addClass('shown');
            symbol.removeClass("fa-angle-right").addClass('fa-angle-down');

        }
    } );
}

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
    // Load Circuit page javascript
    else if (document.location.href.indexOf("/finance") > -1) {

        // Load JS of Circuit pages
        $.getScript("/javascripts/finance-pages.js");
    }
    // Load Circuit page javascript
    else if (document.location.href.indexOf("/map") > -1) {

        // Load JS of Circuit pages
        $.getScript("/javascripts/map-pages.js");
    }
    // Usually this is the main page - too lazy to make an IF statement just for it
    else {
        // Do a JSON call and populate the form
        $.getJSON('/api/circuit-service/', function (json) {
            console.log("** Received circuit JSON info to populate form for", json);
/*
            //make an array
            var data = []; 

            for (var i in json) {
                var row = json[i];

                var datum = [row["id"], row["moc_id"], row["isp_code"], row["provider_code"], row["provision_speed"], row["comment"]];
                data.push(datum);
            }
*/





            var table = $('#circuitsTable').DataTable({
                data: json.data,
                pageLength: 100,
                columns: [
                    {
                        "orderable":      false,
                        "data":           null,
                        "defaultContent": '<i class="fas fa-angle-right" id="expandButton"></i>'
                    },
                    {
                        data: "id",
                        title: "ID"
                    },
                    {
                        data: "moc_id",
                        title: "MOC ID"
                    },
                    {
                        data: "isp_code",
                        title: "ISP"
                    },
                    {
                        data: "provider_code",
                        title: "Provider"
                    },
                    {
                        data: "provision_speed",
                        title: "Speed"
                    },
                    {
                        data: "status",
                        title: "Status"
                    },
                    {
                        data: "comment",
                        title: "Comments"
                    },
                ],

                "order": [[1, 'asc']],

                "rowCallback": rowCallback


            }); //datatables init

            addTableDropdown(table, json);



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
function showMessage(msg, type, elementID) {
    type = type || "warning";
    elementID = elementID || "pageContent";
    var msgBox = '<div class="alert alert-'+type+' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + msg + '</div>';
    $('#'+elementID).prepend(msgBox);
    console.log("** Showing mesasge box: " + msg);

}


// ***************************************************************
// Print a list of delete/update 
// ***************************************************************
function printList(list_data) {
    console.log("** Printing the list");

    // Clear the  list on the UI
    $('#some_list').empty();
    
    // If there is data sub-array then this is a Circuit in our case and we use the data sub-Array
    if(list_data.data) list_data = list_data.data;

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
        
        // If has location preppend it to the name, location is available for patch panels
        if(this.location) {
            this.name = this.location + " - " + this.name;
        }

        // strike it or not? This is used for Circuit page, if the circuit has been deleted then strike the circuit name
        var strikeIt = "<span>";
        if(this.active == 0) {
            strikeIt = "<s>";
        }  
        // Now add the elements to page DOM
        $('<li>').addClass('list-group-item d-flex justify-content-between lh-condensed p-1').appendTo('#some_list');
        $('<div>').addClass('my-auto').appendTo('#some_list>li:last-child');
        $(strikeIt).addClass('').text(this.name).appendTo('#some_list>li:last-child>div:last-child');
        $('<small>').addClass('text-muted float-sm-right').appendTo('#some_list>li:last-child');
        //console.log("**** Printing a single row to list " + this.name);
      


        // Check the link and make sure we don't have /updateform/ already on the page link
        var updateLink;
        if (document.location.href.indexOf("updateform") > -1) {
            updateLink = "";
        } else {
            updateLink = "updateform/";
        }

        // Adding edit link
        $('<a class="btn btn-link btn-sm p-0" href="' + updateLink + this.id + '"><i class="fas fa-xs fa-edit"></i></a>').appendTo('#some_list>li:last-child>small')
        $('#some_list>li:last-child>small').append(' ');

        // Adding remove link
        $('<button type="button" class="btn btn-link btn-sm p-0" data-toggle="modal" data-target="#deleteModal" data-delete_id="' + this.id + '" data-delete_name="' + this.name + '"><i class="fas fa-xs fa-trash-alt"></i></button>').appendTo('#some_list>li:last-child>small');
    });
    $('#list_num').text(list_data.length);

    // Adding confirmation functionality when clicking delete link of each item on the list
    $('#deleteModal').on('show.bs.modal', function (event) {
        console.log("** Delete button clicked");
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

// ***************************************************************
// Force lower characters on Code fields
// ***************************************************************
function forceLower(strInput) 
{
    strInput.value=strInput.value.toLowerCase();
}
