// If you change tabs to spaces, you'll be killed!

$(document).ready(function () {
    console.log("** Loaded provider-pages.js");
    // Get list of providers and print them
    updateList(service_name);



    // ***************************************************************
    // Update Provider Form Page
    // ***************************************************************
    // When I'm in Provider update page, populate the form
    if (document.location.href.indexOf("/provider/updateform/") > -1) {
        console.log("** Providers update form");

        // Get ID of the hidden form element
        var providerID = $("input#providerId").attr("value");
        var providerData;

        // Do a JSON call and populate the form
        $.getJSON('/api/' + service_name + '/' + providerID, function (json) {
            $("input#name").attr("value", json[0].name);
            $("input#contact_name").attr("value", json[0].contact_name);
            $("input#contact_phone").attr("value", json[0].contact_phone);
            $("input#contact_email").attr("value", json[0].contact_email);
            $("input#provider_code").attr("value", json[0].code);
            console.log("** Received provider JSON info to populate form for " + json[0].name);
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

            // Create provider form data for JSON request
            var formData = {};
            formData.id = $("input#providerId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();
            formData.code = $("input#provider_code").val();

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
                    //$('form')[0].reset();
                    
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

                    // Update provider list 
                    updateList();
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
    // Add new Provider Form
    // ***************************************************************
    // When I'm in add providers page which is also main page of providers
    else if (document.location.href.indexOf("/provider/") > -1) {
        console.log("** Add a provider form - provider main page");

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

            // Create provider form data for the JSON request
            var formData = {};
            formData.id = $("input#providerId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();
            formData.code = $("input#provider_code").val();

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

                    // Reset the form
                    //$('form').parent().empty();
                    $('form')[0].reset();

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

                    // Update Providers list 
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





