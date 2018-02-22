$(document).ready(function () {
    console.log("** Entering isp-pages.js");
    // Get list of ISPs and print them
    $.getJSON('/api/isp-service/', printISPs);
            


// ***************************************************************
// Update ISP Form Page
// ***************************************************************
    // When I'm in ISP update page, populate the form
    if ( document.location.href.indexOf("/isp/updateform/") > -1 ) {    
        console.log("** Entering ISP update form");
        
        // Get ID of the hidden form element
        var ispID = $("input#ispId").attr("value");
        var ispData;
        
        // Do a JSON call and populate the form
        $.getJSON('/api/isp-service/' + ispID, function(json) {
            $("input#name").attr("value", json[0].name);
            $("input#contact_name").attr("value", json[0].contact_name);
            $("input#contact_phone").attr("value", json[0].contact_phone);
            $("input#contact_email").attr("value", json[0].contact_email);
            console.log("** Received ISP JSON info to populate form for " + json[0].name);
            
        });
        
        // Update form is submitted 
        $('form').submit(function (e) {
            e.preventDefault();
            
            var formData = {};
            formData.id = $("input#ispId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();
                
            
            console.log("** Sending PUT: " + JSON.stringify(formData)); 

            
            $.getJSON({
                url: "/api/isp-service",        
                dataType: 'text',
                data: formData,
                type: "put",
                success: function(data) {
                        data = jQuery.parseJSON(data);
                        console.log("** Received after PUT: " + data.result); 
                        // Update ISP list 
                        $.getJSON('/api/isp-service/', printISPs);

                        // Remove the form
                        $('form').parent().empty();
                        //$('form')[0].reset();

                        // Compose the feedback message
                        var messageText = data.result;
                        var alertBox = '<div class="alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';

                        // If we have messageAlert and messageText
                        if (messageText) {
                            // inject the alert to the div
                            $('#pageContent').html(alertBox);
                            console.log("Success message should appear on page");
                        }                    
                    },
                beforeSend : function() {
                          //$(".post_submitting").show().html("<center><img src='images/loading.gif'/></center>");
                    },
                error: function() {}  
            }); // end ajax


            
        }); // end submit
        
    }
// ***************************************************************
// Delete ISP Confirm Button Clicked
// ***************************************************************    
    $('.delete-isp-btn-confirm').click(function() {
            console.log("** Trying to delete ISP ID: " + $(this).data('isp_id'));
        });
        
}); // end jQuery document




// ***************************************************************
// ***************************************************************
// ***************************************************************
// Delete an ISP Page
// *************************************************************** 
// ***************************************************************
// ***************************************************************



// ***************************************************************
// Print list of ISPs on the list
// ***************************************************************  
function printISPs(isp) {
    $('#isp_list').empty();
    
    $.each(isp, function () {
        $('<li>').addClass('list-group-item d-flex justify-content-between lh-condensed').appendTo('#isp_list');
        $('<div>').appendTo('#isp_list>li:last-child');
        $('<h6>').addClass('my-0').text(this.name).appendTo('#isp_list>li:last-child>div:last-child');
        $('<small>').addClass('text-muted').appendTo('#isp_list>li:last-child');
        $('<a class="btn btn-link btn-sm" href="/isp/updateform/'+ this.id +'">').text('update').appendTo('#isp_list>li:last-child>small');
        $('#isp_list>li:last-child>small').append(' | ');
        //$('<a href="#" class="btn" data-toggle="confirmation" data-title="Are you sure?">').text('delete').appendTo('#isp_list>li:last-child>small');
        $('<button type="button" class="btn btn-link btn-sm" data-toggle="modal" data-target="#deleteISPModal" data-delete_isp_id="'+this.id+'" data-delete_isp_name="'+this.name+'">delete</button>').appendTo('#isp_list>li:last-child>small');
        
        $('#isp_list>li:last-child>small>a').popover({
            html: true,
            title: "Warning",
            content: "Are you sure?",
            trigger: "focus"
        });
    });
    
    // Adding functionality when clicking delete link of each ISP
    $('#deleteISPModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var delete_isp_id = button.data('delete_isp_id'); 
        var delete_isp_name = button.data('delete_isp_name');
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback)
        var modal = $(this);
        //modal.find('.modal-title').text('New message to ' + recipient);
        modal.find('.modal-body span').text(delete_isp_name);
        modal.find('.delete-isp-btn-confirm').data('isp_id', delete_isp_id);
    });
}
    







    

