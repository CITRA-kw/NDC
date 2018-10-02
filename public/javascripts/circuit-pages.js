// If you change tabs to spaces, you'll be killed!


$(document).ready(function () {
    console.log("** Loaded circuit-pages.js");
    // Get list of circuits and print them
    updateList(service_name);
    updateFormISPList();
    updateFormProviderList();
    formDynamicField();

    // Make the connection fields sortable
    $("ol.ordered-circuit-conn-egress-fields").sortable();
    $("ol.ordered-circuit-conn-ingress-fields").sortable();
    // The template one is not droppable so it'll always be the last element
    $("#optionTemplate").sortable({
        drop: false
    });






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
            console.log("** The data is: " + JSON.stringify(json));

            // Populate the circuit connection dropdowns            
            // Starting from 1 because 0 is reserved for the other form data
            //console.log("** First patch panel name: " + json[1][0].label);
            console.log("** Number of connections to be added " + json[1].length);
            var i;
            for (i = 0; i < json[1].length; i++) {
                //console.log("** Adding connection # " + i);
                addButtonClicked("ingress", json[1][i].patch_panel_id, json[1][i].name, json[1][i].port_id, json[1][i].label);
            }
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

            // Get circuit selection array from the form
            addPatchPanelData(".ordered-circuit-conn-ingress-fields", "ingress", formData);
            addPatchPanelData(".ordered-circuit-conn-egress-fields", "egress", formData);

            console.log(formData);

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



            addPatchPanelData(".ordered-circuit-conn-ingress-fields", "ingress", formData);
            addPatchPanelData(".ordered-circuit-conn-egress-fields", "egress", formData);

            console.log(formData);

            /*
            // Check duplicates
            var duplicate = false;
            for (var i = 0; i < formData.port.length; i++) {
                for (var j = 0; j < formData.port.length; j++) {
                    if (i == j) continue;
                    if (formData.port[i] == formData.port[j] &&
                        formData.patch_panel[i] == formData.patch_panel[j]) {
                        duplicate = true;
                        break;
                    }
                }
            }
            if (duplicate) {
                showMessage('Error - Duplicate found in Circuit Connection');
                console.log('Submission stopped - Duplicate(s) found!');
                return;
            }
            */
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
                },
                error: function () {}
            }); // end getJSON

        }); // end submit

    }

}); // end jQuery document

// ***************************************************************
// Populate the Providers dropdown
// ***************************************************************    
function updateFormProviderList() {
    // Do a JSON call and populate the form
    $.getJSON('/api/provider-service/', populateProviders);

    function populateProviders(list_data) {
        // Iterate and add each list_data to the list
        $.each(list_data, function () {
            $('#provider').append($('<option>', {
                value: this.id,
                text: this.name
            }));
        });
    }
}

// ***************************************************************
// Populate ISPs dropdown
// ***************************************************************    
function updateFormISPList() {
    // Do a JSON call and populate the form
    $.getJSON('/api/isp-service/', populateISP);

    function populateISP(list_data) {
        // Iterate and add each list_data to the list
        $.each(list_data, function () {
            $('#isp').append($('<option>', {
                value: this.id,
                text: this.name
            }));
        });
    }
}

// ***************************************************************
// Program the dynamic field for circuit connections
// ***************************************************************    
// Got this code from http://formvalidation.io/examples/adding-dynamic-field/
// It's using the old Bootstrap hide so I changed it to use "d-none" for Bootstrap4
// 
// For bookmarking and future reference here's other examples
// https://bootsnipp.com/snippets/XaXB0
// https://bootsnipp.com/snippets/featured/dynamic-form-fields-add-amp-remove
function formDynamicField() {

    // The maximum number of options
    var MAX_OPTIONS = 5;


    $('form')
        // The click handler of the add button
        .on('click', '.addButtonIngress', function () {
            addButtonClicked("ingress");

            // TODO review this
            //$('form').formValidation('addField', $option);
        })

        .on('click', '.addButtonEgress', function () {
            addButtonClicked("egress");

        })

        // The click handler of the remove button
        .on('click', '.removeButton', function () {
            console.log("** Remove button clicked ");
            var $row = $(this).parents('.form-group');

            // Remove element containing the option
            $row.remove();

            // TODO review this
            //$('form').formValidation('removeField', $option);
        })

        // TODO This is not being called. Will do in the future because I'm receving pressure to finish the project very soon
        // Called after adding new field
        .on('added.field.fv', function (e, data) {
            console.log('** + ');


            if (data.field === 'option[]') {
                if ($('form').find(':visible[name="option[]"]').length >= MAX_OPTIONS) {
                    $('form').find('.addButton').attr('disabled', 'disabled');
                }
            }
        })

        // Called after removing the field
        .on('removed.field.fv', function (e, data) {
            console.log('** - ');
            if (data.field === 'option[]') {
                if ($('form').find(':visible[name="option[]"]').length < MAX_OPTIONS) {
                    $('form').find('.addButton').removeAttr('disabled');
                }
            }
        });
    populatePatchPanelDropDown();
}


// When add button clicked for circuit connections - to add an extra circuit field
function addButtonClicked(direction, patch_panel_id, patch_panel_name, port_id, port_name) {
    //console.log('**************************************');
    //console.log("** addButtonClicked() with values: ");
    //console.log("**** Patch Panel ID: " + patch_panel_id);
    //console.log("**** Patch Panel Name: " + patch_panel_name);
    //console.log("**** Port ID: " + port_id);
    //console.log("**** Port Name: " + port_name);
    var $template = $(`#${direction}OptionTemplate`),
        $clone = $template
        .clone()
        .removeClass('d-none')
        .removeAttr('id')
        .insertBefore($template);
    populatePatchPanelDropDown(patch_panel_id, patch_panel_name, port_id, port_name);


}

// ***************************************************************
// Populate the patch_panel dynamic fields
// ***************************************************************
function populatePatchPanelDropDown(patch_panel_value, patch_panel_name, port_value, port_name) {
    console.log("** populatePatchPanelDropDown() called! -- Passed values " + patch_panel_value + " " + patch_panel_name + " " + port_value + " " + port_name);

    // How to get array of fields https://stackoverflow.com/questions/7880619/multiple-inputs-with-same-name-through-post-in-php
    // http://www.dreamincode.net/forums/topic/245179-how-to-insert-data-using-multiple-input-with-same-name/

    // Obviously selector for the patch_panel dropdown!
    // Before the last because last one is the hidden template
    var dropdown = $("form select[name='patch_panel[]']").eq(-2); // FIX THIS SELECTOR

    // First remove change
    $(dropdown).off('change');

    // TODO: Service name/link should be dynamic
    // Do a JSON call and populate the dropdown
    $.getJSON('/api/patch_panel-service/patch_panel', function (list_data) {
        console.log("** JSON received on populatePatchPanelDropDown() - Populating the dropdown");
        dropdown.empty();
        $.each(list_data, function () {
            if (typeof patch_panel_value !== 'undefined' && patch_panel_value == this.id) {
                dropdown.append($("<option />").val(this.id).text(this.name).attr('selected', 'selected'));
            } else {
                dropdown.append($("<option />").val(this.id).text(this.name));
            }
        });
    }).done(function () {
        // Manually trigger a first change so ports dropdown will be automatically updated and select first value
        $(dropdown).trigger('change', [{
            port_value: port_value,
            port_name: port_name
        }]);

    });
    

    // Add onChange() again
    $(dropdown).on('change', dropdown, function (evnet, obj) {
        console.log("** Circuit dropdown Change called!");
        if (typeof obj !== 'undefined') {
            populatePortsDropDown(dropdown, obj.port_value, obj.port_name);
        } else {
            populatePortsDropDown(dropdown);
        }
    });


}

// ***************************************************************
// Populate the ports dynamic dropdowns
// **************************************************************
function populatePortsDropDown(portField, port_value, port_name) {
    console.log("** populatePortsDropDown() called! -- Passed values " + port_value + " " + port_name);

    // Do a JSON call and populate the dropdown select field
    // TODO: Service name/link should be dynamic
    $.getJSON('/api/patch_panel-service/ports/' + $(portField).val(), function (list_data) {
        portField = $(portField).parent().parent().next().find("select");
        $(portField).empty();
        $.each(list_data, function () {
            $(portField).append($("<option />").val(this.id).text(this.label));
        });
        if (typeof port_value !== 'undefined') {
            $(portField).prepend($("<option />").val(port_value).text(port_name).attr('selected', 'selected'));
            console.log("*** Activating a port dropdown select for: " + port_name);
        }
    });
}



// ***************************************************************
// Populate the patch panel dropdowns
// **************************************************************
function addPatchPanelData(className, prefix, formData) {
    // Get circuit selection array from the form
    var patch_panel = new Array();
    $(`${className} select[name="patch_panel[]"]`).each(function () {
        patch_panel.push($(this).val());
    });
    var port = new Array();
    $(`${className} select[name="port[]"]`).each(function () {
        port.push($(this).val());
    });

    // Pop last value which is the hidden field
    patch_panel.pop();
    port.pop();

    formData[prefix + "_patch_panel"] = patch_panel;
    formData[prefix + "_port"] = port;
}