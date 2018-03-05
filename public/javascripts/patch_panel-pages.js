// If you change tabs to spaces, you'll be killed!

$(document).ready(function () {
    console.log("** Loaded patch_panel-pages.js");
    // Get list of Patch Panel and print them
    updateList(service_name);



    // ***************************************************************
    // Update Patch Panel Form Page
    // ***************************************************************
    // When I'm in Patch Panel update page, populate the form
    if (document.location.href.indexOf("/patch_panel/updateform/") > -1) {
        console.log("** Patch Panel update form");

        // Get ID of the hidden form element
        var patchPanelID = $("input#patchPanelId").attr("value");
        var patchPanelData;

        // Do a JSON call and populate the form
        $.getJSON('/api/' + service_name + '/' + patchPanelID, function (json) {
            $("input#name").attr("value", json[0].name);
            $("input#contact_name").attr("value", json[0].contact_name);
            $("input#contact_phone").attr("value", json[0].contact_phone);
            $("input#contact_email").attr("value", json[0].contact_email);
            console.log("** Received Patch Panel JSON info to populate form for " + json[0].name);

        });

        // Update form is submitted 
        $('form').submit(function (e) {
            e.preventDefault();

            // Create Patch Panel form data for JSON request
            var formData = {};
            formData.id = $("input#patchPanelId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();

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

                    // Compose the feedback message
                    var messageText = data.result;

                    // If we have messageAlert and messageText
                    if (messageText) {
                        // inject the alert to the div
                        showMessage(messageText);
                        console.log("** Success message should appear on page");
                    }

                    // Update Patch Panel list 
                    updateList(service_name);
                },
                beforeSend: function () {
                    //$(".post_submitting").show().html("<center><img src='images/loading.gif'/></center>");
                },
                error: function () {}
            }); // end getJSON

        }); // end submit

    }

    // ***************************************************************
    // Add new Patch Panel Form Page (main page of Patch Panel)
    // ***************************************************************
    // When I'm in update Patch Panel page, populate the form initially
    else if (document.location.href.indexOf("/patch_panel/") > -1) {
        console.log("** Main Add Patch Panel form");

        // When the form is submitted
        $('form').submit(function (e) {
            e.preventDefault();

            // Create Patch Panel form data for the JSON request
            var formData = {};
            formData.id = $("input#patchPanelId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();

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

                    // Compose the feedback message
                    var messageText = data.result;

                    // If we have messageAlert and messageText
                    if (messageText) {
                        // inject the alert to the div
                        showMessage(messageText);
                        console.log("** Success message should appear on page");
                    }

                    // Update Patch Panel list 
                    updateList(service_name);
                },
                beforeSend: function () {
                    //$(".post_submitting").show().html("<center><img src='images/loading.gif'/></center>");
                },
                error: function () {}
            }); // end getJSON

        }); // end submit

    }

}); // end jQuery document






