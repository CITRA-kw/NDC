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
            $("select#location").val(json[0].location);
            $("input#portsNum").val(json[0].portsNum);
            $("input#odf").val(json[0].odf);
            $("textarea#comment").val(json[0].comment);
            $("select#ports_type").val(json[0].ports_type);
            console.log("** Received Patch Panel JSON info to populate form for " + json[0].name + " location " + json[0].location);

        }); 

        // Update form is submitted 
        $('form').submit(function (e) {
            e.preventDefault();

            // Create Patch Panel form data for JSON request
            var formData = {};
            formData.id = $("input#patchPanelId").val();
            formData.name = $("input#name").val();
            formData.location = $("select#location").val();
            formData.portsNum = $("input#portsNum").val();
            formData.ports_type = $("select#ports_type").val();
            formData.odf = $("input#odf").val();
            formData.comment = $("textarea#comment").val();

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
            formData.location = $("select#location").val();
            formData.portsNum = $("input#portsNum").val();
            formData.ports_type = $("select#ports_type").val();
            formData.odf = $("input#odf").val();
            formData.comment = $("textarea#comment").val();

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






