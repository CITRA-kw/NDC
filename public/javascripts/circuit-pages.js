// If you change tabs to spaces, you'll be killed!

$(document).ready(function () {
    console.log("** Loaded circuit-pages.js");
    // Get list of circuits and print them
    updateList(service_name);
    updateFormISPList();
    updateFormProviderList();



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
            $("input#moc_id").attr("value", json[0].moc_id);
            $("select#interface_type").val(json[0].interface_type);
            $("input#provision_speed").attr("value", json[0].provision_speed);
            $("select#service").val(json[0].service);
            $("select#provider").val(json[0].provider);
            $("select#isp").val(json[0].isp);
            $("input#comment").attr("value", json[0].comment);
            console.log("** Received circuit JSON info to populate form for MOC ID " + json[0].moc_id);
        });

        // Update form is submitted 
        $('form').submit(function (e) {
            e.preventDefault();

            // Create circuit form data for JSON request
            var formData = {};
            formData.id = $("input#circuitId").val();
            formData.moc_id = $("input#moc_id").val();
            formData.interface_type = $("select#interface_type").val();
            console.log("** I T" + formData.interface_type);
            formData.provision_speed = $("input#provision_speed").val();
            formData.service = $("select#service").val();
            formData.provider = $("select#provider").val();
            formData.isp = $("select#isp").val();
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
            formData.moc_id = $("input#moc_id").val();
            formData.interface_type = $("select#interface_type").val();
            //console.log('** submitted interface type '+$("select#interface_type").val());
            formData.provision_speed = $("input#provision_speed").val();
            formData.service = $("select#service").val();
            formData.provider = $("select#provider").val();
            formData.isp = $("select#isp").val();
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



// ***************************************************************
// Populate SELECT values for Providers in the form
// ***************************************************************    
function updateFormProviderList() {
    // Do a JSON call and populate the form
    $.getJSON('/api/provider-service/', populateProviders);

    function populateProviders(list_data) {
        // Iterate and add each list_data to the list
        $.each(list_data, function () {
            $('#provider').append($('<option>', { 
                value: this.id,
                text : this.name
            }));
        });
    }
}


// ***************************************************************
// Populate SELECT values for ISPs in the form
// ***************************************************************    
function updateFormISPList() {
    // Do a JSON call and populate the form
    $.getJSON('/api/isp-service/', populateISP);

    function populateISP(list_data) {
        // Iterate and add each list_data to the list
        $.each(list_data, function () {
            $('#isp').append($('<option>', { 
                value: this.id,
                text : this.name
            }));
        });
    }
}
