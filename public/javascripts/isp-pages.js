// If you change tabs to spaces, you'll be killed!

$(document).ready(function () {
    console.log("** Loaded isp-pages.js");
    // Get list of ISPs and print them
    updateList(service_name);



    // ***************************************************************
    // Update ISP Form Page
    // ***************************************************************
    // When I'm in ISP update page, populate the form
    if (document.location.href.indexOf("/isp/updateform/") > -1) {
        console.log("** ISP update form");

        // Get ID of the hidden form element
        var ispID = $("input#ispId").attr("value");
        var ispData;

        // Do a JSON call and populate the form
        $.getJSON('/api/' + service_name + '/' + ispID, function (json) {
            $("input#name").attr("value", json[0].name);
            $("input#contact_name").attr("value", json[0].contact_name);
            $("input#contact_phone").attr("value", json[0].contact_phone);
            $("input#contact_email").attr("value", json[0].contact_email);
            $("input#isp_code").attr("value", json[0].code);
            console.log("** Received ISP JSON info to populate form for " + json[0].name);

        });

        // Update form is submitted 
        $('form').submit(function (e) {
            e.preventDefault();
            
            // Get this form element
            var form = this;
                
            // Now check the validity
            if (form.checkValidity() === false) {
                console.log("** Something is invalid in the form.");
                $(form).addClass('was-validated');
                return;
            }  
            $(form).addClass('was-validated');

            // Create ISP form data for JSON request
            var formData = {};
            formData.id = $("input#ispId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();
            formData.code = $("input#isp_code").val();

            console.log("** Sending PUT: " + JSON.stringify(formData));

            // JSON call to add form data
            $.getJSON({
                url: "/api/" + service_name,
                dataType: 'text',
                data: formData,
                type: "put",
                success: function (data) {
                    data = jQuery.parseJSON(data);
                    console.log("** Received after PUT: " + data.result);

                    // Remove the form
                    $('form').parent().empty();

                    // Compose the feedback message
                    var messageText = data.result;

                    // If we have messageAlert and messageText
                    if (messageText) {
                        // inject the alert to the div
                        showMessage(messageText);
                        console.log("** Success message should appear on page");
                    }

                    // Update ISP list 
                    updateList(service_name);
                },
                beforeSend: function () {
                    //$(".post_submitting").show().html("<center><img src='images/loading.gif'/></center>");
                },
                error: function () {
                    console.log("** Error: There's an error on getJSON");
                }
            }); // end getJSON

        }); // end submit

    }

    // ***************************************************************
    // Add new ISP Form Page (main page of ISP)
    // ***************************************************************
    // When I'm in update ISP page, populate the form initially
    else if (document.location.href.indexOf("/isp/") > -1) {
        console.log("** Main Add ISP form");

        // When the form is submitted
        $('form').submit(function (e) {
            e.preventDefault();
            
            // Get this form element
            var form = this;
                
            // Now check the validity
            if (form.checkValidity() === false) {
                console.log("** Something is invalid in the form.");
                $(form).addClass('was-validated');
                return;
            }  
            $(form).addClass('was-validated');
            

            // Create ISP form data for the JSON request
            var formData = {};
            formData.id = $("input#ispId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();
            formData.code = $("input#isp_code").val();

            console.log("** Sending POST: " + JSON.stringify(formData));

            // JSON call to add form data
            $.getJSON({
                url: "/api/" + service_name,
                dataType: 'text',
                data: formData,
                type: "post",
                success: function (data) {
                    data = jQuery.parseJSON(data);
                    console.log("** Received after POST: " + data.result);

                    // Remove the form
                    $('form').parent().empty();

                    // Compose the feedback message
                    var messageText = data.result;

                    // If we have messageAlert and messageText
                    if (messageText) {
                        // inject the alert to the div
                        showMessage(messageText);
                        console.log("** Success message should appear on page");
                    }

                    // Update ISP list 
                    updateList(service_name);
                },
                beforeSend: function () {
                    //$(".post_submitting").show().html("<center><img src='images/loading.gif'/></center>");
                },
                error: function () {
                    console.log("** Error: There's an error on getJSON");
                }
            }); // end getJSON

        }); // end submit

    }

}); // end jQuery document




