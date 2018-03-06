// If you change tabs to spaces, you'll be killed!

$(document).ready(function () {
    console.log("** Loaded circuit-pages.js");
    // Get list of circuits and print them
    updateList(service_name);



    // ***************************************************************
    // Update Circuit Form Page
    // ***************************************************************
    // When I'm in Circuit update page, populate the form
    if (document.location.href.indexOf("/circuit/updateform/") > -1) {
        console.log("** Circuits update form");

        // Get ID of the hidden form element
        var circuitID = $("input#circuitId").attr("value");
        var circuitData;

        // Do a JSON call and populate the form
        $.getJSON('/api/' + service_name + '/' + circuitID, function (json) {
            $("input#name").attr("value", json[0].name);
            $("input#contact_name").attr("value", json[0].contact_name);
            $("input#contact_phone").attr("value", json[0].contact_phone);
            $("input#contact_email").attr("value", json[0].contact_email);
            console.log("** Received circuit JSON info to populate form for " + json[0].name);
        });

        // Update form is submitted 
        $('form').submit(function (e) {
            e.preventDefault();

            // Create circuit form data for JSON request
            var formData = {};
            formData.id = $("input#circuitId").val();
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

                    // Update circuit list 
                    updateList();
                },
                beforeSend: function () {
                    //$(".post_submitting").show().html("<center><img src='images/loading.gif'/></center>");
                },
                error: function () {}
            }); // end getJSON

        }); // end submit

    }

    // ***************************************************************
    // Add new Circuit Form
    // ***************************************************************
    // When I'm in add circuits page which is also main page of circuits
    else if (document.location.href.indexOf("/circuit/") > -1) {
        console.log("** Add a circuit form - circuit main page");

        // When the form is submitted
        $('form').submit(function (e) {
            e.preventDefault();

            // Create circuit form data for the JSON request
            var formData = {};
            formData.id = $("input#circuitId").val();
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

                    // Update Circuits list 
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





