// If you change tabs to spaces, you'll be killed!

$(document).ready(function () {
    console.log("** Loaded provider-pages.js");
    // Get list of providers and print them
    updateProviderList();



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
        $.getJSON('/api/provider-service/' + providerID, function (json) {
            $("input#name").attr("value", json[0].name);
            $("input#contact_name").attr("value", json[0].contact_name);
            $("input#contact_phone").attr("value", json[0].contact_phone);
            $("input#contact_email").attr("value", json[0].contact_email);
            console.log("** Received provider JSON info to populate form for " + json[0].name);
        });

        // Update form is submitted 
        $('form').submit(function (e) {
            e.preventDefault();

            // Create provider form data for JSON request
            var formData = {};
            formData.id = $("input#providerId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();

            console.log("** Sending PUT: " + JSON.stringify(formData));

            // JSON call to add form data
            $.getJSON({
                url: "/api/provider-service",
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

                    // Update provider list 
                    updateProviderList();
                },
                beforeSend: function () {
                    //$(".post_submitting").show().html("<center><img src='images/loading.gif'/></center>");
                },
                error: function () {}
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

            // Create provider form data for the JSON request
            var formData = {};
            formData.id = $("input#providerId").val();
            formData.name = $("input#name").val();
            formData.contact_name = $("input#contact_name").val();
            formData.contact_phone = $("input#contact_phone").val();
            formData.contact_email = $("input#contact_email").val();

            console.log("** Sending POST: " + JSON.stringify(formData));

            // JSON call to add form data
            $.getJSON({
                url: "/api/provider-service",
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

                    // Update Providers list 
                    updateProviderList();
                },
                beforeSend: function () {
                    //$(".post_submitting").show().html("<center><img src='images/loading.gif'/></center>");
                },
                error: function () {}
            }); // end getJSON

        }); // end submit

    }

    // ***************************************************************
    // When "Delete Provider Confirm" button is clicked
    // ***************************************************************    
    $('.delete-provider-btn-confirm').click(function () {
        // If this comment is removed the program will blow up 
        console.log("** Delete Confirmed clicked for Provider ID " + $(this).data('provider_id') + " and name " + $(this).data('provider_name'));

        // Create JSON data for delete request
        var delete_data = {};
        delete_data.id = $(this).data('provider_id');
        delete_data.name = $(this).data('provider_name');

        // Create a new instance of ladda for the specified button
        // will be used later to start and stop the loading animation
        var buttonLoading = Ladda.create(this);


        // JSON call to delete
        $.getJSON({
            url: "/api/provider-service/" + delete_data.id,
            dataType: 'text',
            data: delete_data,
            type: "delete",
            success: function (data) {
                data = jQuery.parseJSON(data);
                console.log("** Received after DELETE: " + data.result);

                // stop button loading animation
                buttonLoading.stop();

                // Hide the confirmation window
                $('#deleteProviderModal').modal('hide');


                // Compose the feedback message
                var messageText = data.result;

                // If we have messageAlert and messageText
                if (messageText) {
                    // inject the alert to the div
                    showMessage(messageText);
                    console.log("** Delete success should appear on page");
                }

                // Update Provider list 
                updateProviderList();
            },
            beforeSend: function () {
                // Start button loading animation
                buttonLoading.start(); // Button loading start
            },
            error: function () {}
        }); // end getJSON

    }); // end click

}); // end jQuery document




// ***************************************************************
// Print list of Providers on the list
// ***************************************************************  
function updateProviderList() {
    // Get list of Providers and print them
    $.getJSON('/api/provider-service/', printProviders);
}

function printProviders(provider) {
    console.log("** Printing Providers List");

    // Clear provider list on the UI
    $('#provider_list').empty();

    // Iterate and add each provider to the list
    $.each(provider, function () {
        // no comments for you
        // it was hard to write
        // so it should be hard to read
        $('<li>').addClass('list-group-item d-flex justify-content-between lh-condensed').appendTo('#provider_list');
        $('<div>').appendTo('#provider_list>li:last-child');
        $('<h6>').addClass('my-0').text(this.name).appendTo('#provider_list>li:last-child>div:last-child');
        $('<small>').addClass('text-muted').appendTo('#provider_list>li:last-child');
        $('<a class="btn btn-link btn-sm" href="/provider/updateform/' + this.id + '">').text('update').appendTo('#provider_list>li:last-child>small');
        $('#provider_list>li:last-child>small').append(' | ');
        //$('<a href="#" class="btn" data-toggle="confirmation" data-title="Are you sure?">').text('delete').appendTo('#provider_list>li:last-child>small');
        $('<button type="button" class="btn btn-link btn-sm" data-toggle="modal" data-target="#deleteproviderModal" data-delete_provider_id="' + this.id + '" data-delete_provider_name="' + this.name + '">delete</button>').appendTo('#provider_list>li:last-child>small');
    });
    $('#provider_num').html(provider.length);

    // Adding confirmation functionality when clicking the delete link of each provider
    $('#deleteProviderModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var delete_provider_id = button.data('delete_provider_id');
        var delete_provider_name = button.data('delete_provider_name');
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback)
        var modal = $(this);
        //modal.find('.modal-title').text('New message to ' + recipient);
        modal.find('.modal-body span').text(delete_provider_name);
        modal.find('.delete-provider-btn-confirm').data('provider_id', delete_provider_id); // Adding data to be used on click
        modal.find('.delete-provider-btn-confirm').data('provider_name', delete_provider_name); // Adding data to be used on click

    });


}
