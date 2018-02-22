$(document).ready(function () {
    // Get list of ISPs and print them
    $.getJSON('/api/isp-service/', printISPs);
            
    //console.log($("input#name").attr("value", ispID));

    /*$('form').submit(function (e) {
        e.preventDefault();
        $.post('/dictionary-api', {term: $('#term').val(), defined: $('#defined').val()}, printISPs);
        this.reset();
    });*/

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
        
        // Form 
        $('form').submit(function (e) {
            e.preventDefault();
            //s$('form').checkValidity();
            
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
// Delete an ISP Page
// ***************************************************************    
    // When I'm in ISP update page, populate the form
    if ( document.location.href.indexOf("/isp/deleteform/") > -1 ) {    
        console.log("** Entering ISP delete form");
    }
        
}); // end jQuery document


/* for insert
        $('form').submit(function (e) {
            e.preventDefault();
            $.post('/api/isp-service/', function(data) {
                
                // Update ISP list 
                $.getJSON('/api/isp-service/', printISPs);

            });
            this.reset();
        });     
*/






function printISPs(isp) {
    $('#isp_list').empty();
    
    $.each(isp, function () {
        $('<li>').addClass('list-group-item d-flex justify-content-between lh-condensed').appendTo('#isp_list');
        $('<div>').appendTo('#isp_list>li:last-child');
        $('<h6>').addClass('my-0').text(this.name).appendTo('#isp_list>li:last-child>div:last-child');
        $('<small>').addClass('text-muted').appendTo('#isp_list>li:last-child');
        $('<a href="/isp/updateform/'+ this.id +'">').text('update').appendTo('#isp_list>li:last-child>small');
        $('#isp_list>li:last-child>small').append(' | ');
        $('<a href="#" class="btn" data-toggle="confirmation" data-title="Are you sure?">').text('delete').appendTo('#isp_list>li:last-child>small');
        
        $('#isp_list>li:last-child>small>a').popover({
            html: true,
            title: "Double Checking",
            content: "Are you sure?",
            trigger: "focus"
        });
    });
}
    
function getISPInfo(id) {
    var isp;
    $.getJSON('/api/isp-service/' + id, function(ispData) {
        isp = ispData;       
    });    
}

















    /*$.each(terms, function () {
        $('<dt>').text(this.term).appendTo('#isp_list>ul');
        $('<dd>').text(this.defined).appendTo('#isp_list>ul');
    });    
    
    $('dt').off('dblclick').dblclick(function() {
        $.ajax({
            url: '/dictionary-api/' + $(this).text(),
            type: 'DELETE',
            success: printTerms
        });
    });
}*/














var update_isp_button = document.getElementById('isp-update-click');

// When ISP update button clicked
update_isp_button.addEventListener('click', function () {/*
    fetch('/api/isp-service', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'isp-name': '',
            'isp-contact': ''
        }, function () {
            
        });
    }).then(function(response) {
        //console.log('Update response: ', response.status);
    }).catch(function(err) {
    });*/
});
    

