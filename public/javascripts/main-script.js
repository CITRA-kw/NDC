// FOR ALL POOR SOULS TRYING TO DEBUG MY CODE
// Good luck and happy debugging!


// TODO https://stackoverflow.com/questions/14949210/dynamically-update-a-table-using-javascript 


var statusColors = {
    connecting: '#adddce',
    active: '#70ae98',
    suspended: '#f0a35e',
    cancelled: '#ca7e8d',
    testing: '#e6b655',
}

function capitalize(s) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}


function drawStatusTable(row) {
    var data = '<table  class="col-md-6" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<th>Date</th>'+
            '<th>Time</th>'+
            '<th>Status</th>'+
        '</tr>';

    for (var i in row.history) {

        var d = moment(row.history[i].date);
        var status = row.history[i].status;


        data += '<tr>'+
            '<td style="color: #00008f">'+ d.format("DD-MM-YYYY") +'</td>'+
            '<td style="color: #00008f">'+ d.format("h:mm:ss a") +'</td>'+
            '<td style="color: '+statusColors[status]+'">'+ status +'</td>'+
        '</tr>'
    }

    data += '</table>';
    return data;
}


function rowCallback( tr, data ) {
    //find column with status.
    $(tr).find('td').each(function() {
        //stupid check, but if it's colorable, then color it!
        for (var key in statusColors) {
            if ($(this).html() == key) {
                $(this).html(data.status)
                $(this).css("color", statusColors[data.status])
                break;
            }
        }
    })
    // $('td:eq(6)', tr).html(data.status)
    // $('td:eq(6)', tr).css("color", statusColors[data.status])
}


function addTableDropdown(table, json) {
        //expand row to show circuit status history and option to change status
    var rowDetails = function(row, rowData) {
        var data = '<div class="col-md-12"> ';

        data += '<div id="graph"></div>';
        //draw graph
        drawMap(rowData.circuit_num, 800, 300);

        // console.log(rowData);

        data += '<div id="statusTable">';

        if (rowData.history && rowData.history.length > 0) {
            data += drawStatusTable(rowData); 
        }

        data += '</div>';

        submitChange = function() {
            var selected = $("#damn").children("option:selected").val();

            if (selected && selected != "") {

                var formData = {
                    selected: selected
                };

                //disable submit button
                $("#submitButton").prop("disabled",true);

                // JSON call to add form data
                $.ajax({
                    url: "/api/changeStatus/" + rowData.circuit_num,
                    dataType: 'json',
                    data: formData,
                    type: "post",
                    success: function (data) {
                        // data = jQuery.parseJSON(data);
                        console.log("** Received after POST: ", data);

                        
                        // Compose the feedback message
                        var messageText = data.result;

                        // If we have messageAlert and messageText
                        if (messageText) {
                            // inject the alert to the div
                            showMessage(messageText, "success", "submitStatusError" + rowData.circuit_num );
                            console.log("** Success message should appear on page");
                        }

                        // Update Circuits list 
                        // updateList(service_name);
                        $("#submitButton").prop("disabled", false);

                        // json.data = data.data;

                        // table.ajax.reload();
                        // table.draw('full-reset');

                        //redraw the status table

                        rowData.status = selected;

                        $("#statusTable").empty();

                        if (!rowData.history) rowData.history = [];

                        rowData.history.unshift(data.data)
                        $("#statusTable").append(drawStatusTable(rowData));

                        //change status as well
                        rowCallback(row, rowData)



                    },
                    error: function (jqXHR,  textStatus,  errorThrown) {
                        console.log("** Error: There's an error on getJSON", jqXHR.responseJSON);
                        var data = jqXHR.responseJSON;

                        $("#submitButton").prop("disabled",false);

                        var messageText = data.result;

                        showMessage(messageText, "danger", "submitStatusError" + rowData.circuit_num );

                    }
                }); // end getJSON


            }
            
        }


        data += '<hr/><div class="col-md-12">' +
            '<select id="damn"><option></option>' +
            json.enums.map(function(entry) { return "<option value='"+ entry +"'>"+ capitalize(entry) +"</option>"}) +
            '<input type="submit" id="submitButton" onclick="return submitChange();"/> </select>' +
        '</div>';

        data += '<div id="submitStatusError'+ rowData.circuit_num +'"></div>'

        data += '</div>'
        return data;
    }


    table.on('click', 'td i#expandButton', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        var symbol = $(this).closest('i');

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            symbol.removeClass("fa-angle-down").addClass('fa-angle-right');
        }
        else {
            // Open this row
            row.child( rowDetails(tr, row.data()) ).show();
            tr.addClass('shown');
            symbol.removeClass("fa-angle-right").addClass('fa-angle-down');

        }
    } );
}

$(document).ready(function () {
    console.log("** Loaded main-script.js");

    // ***************************************************************
    // Dynamically load table data
    // ***************************************************************    
    // Load ISP page javascript
    if (document.location.href.indexOf("/isp") > -1) {

        // Load JS of ISP pages
        $.getScript("/javascripts/isp-pages.js");
    }
    // Load Provider page javascript
    else if (document.location.href.indexOf("/provider") > -1) {

        // Load JS of Provider pages
        $.getScript("/javascripts/provider-pages.js");
    }
    // Load Patch Panel page javascript
    else if (document.location.href.indexOf("/patch_panel") > -1) {

        // Load JS of Patch Panel pages
        $.getScript("/javascripts/patch_panel-pages.js");
    }
    // Load Circuit page javascript
    else if (document.location.href.indexOf("/circuit") > -1) {

        // Load JS of Circuit pages
        $.getScript("/javascripts/circuit-pages.js");
    }
    // Load Circuit page javascript
    else if (document.location.href.indexOf("/finance") > -1) {

        // Load JS of Circuit pages
        $.getScript("/javascripts/finance-pages.js");
    }
    // Load Circuit page javascript
    else if (document.location.href.indexOf("/map") > -1) {

        // Load JS of Circuit pages
        $.getScript("/javascripts/map-pages.js");
    }
    // Load login page javascript
    else if (document.location.href.indexOf("/authenticate") > -1) {
        //console.log("** LOGIN SECTION OF JS DYNAMIC LOADING");
        // Load JS of login pages
        //$.getScript("/javascripts/map-pages.js");
    }
    // Usually this is the main page - too lazy to make an IF statement just for it
    else {
        // Do a JSON call and populate the form
        $.getJSON('/api/circuit-service/', function (json) {
            console.log("** Received circuit JSON info to populate form for", json);
/*
            //make an array
            var data = []; 

            for (var i in json) {
                var row = json[i];

                var datum = [row["id"], row["moc_id"], row["isp_code"], row["provider_code"], row["provision_speed"], row["comment"]];
                data.push(datum);
            }
*/

            var colors = [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'dark',
                'light'
            ];

            var usedColors = {};
            var cursor = 0;


            var table = $('#circuitsTable').DataTable({
                data: json.data,
                pageLength: 100,
                columns: [
                    {
                        "orderable":      false,
                        "data":           null,
                        "defaultContent": '<i class="fas fa-angle-right" id="expandButton"></i>'
                    },
                    {
                        data: "id",
                        title: "ID",
                        width: '15%'

                    },
                    // {
                    //     data: "moc_id",
                    //     title: "MOC ID"
                    // },
                    {
                        data: "isp_code",
                        title: "ISP"
                    },
                    {
                        data: "provider_code",
                        title: "Provider"
                    },
                    {
                        data: "provision_speed",
                        title: "Speed"
                    },
                    {
                        data: "status",
                        title: "Status"
                    },
                    
                    {
                        data: "tags",
                        title: "Tags",
                        render: function(data, type, row, meta){
                            if (!data) return;
                            console.log(data);
                            str = "";

                            for (var key in data) {
                                var color = "secondary";


                                if (key in usedColors) {
                                    color = usedColors[key];
                                    // console.log(key, "reusing", color);
                                }
                                else {
                                    color = colors[cursor];
                                    // console.log("New color", color, cursor);
                                    usedColors[key] = color;
                                    cursor++;
                                    if (cursor >= colors.length) {
                                        cursor = 0;  //loop back to first color
                                        // console.log("rewinding");
                                    }
                                    // console.log(cursor);
                                }
                                str += '<span class="badge badge-pill badge-'+color+'">'+ key + ": " + data[key] +'</span> ';
                            }
                            return str;  
                        }
                    },
                    
                    {
                        data: "comment",
                        title: "Comments",
                        width: '20%'
                    },
                ],

                "order": [[1, 'asc']],

                "rowCallback": rowCallback


            }); //datatables init

            addTableDropdown(table, json);



        });
    }





}); // end jQuery document 



// *************************************************************************
// *************************************************************************
// *************************************************************************
// FUNCTIONS
// ************************************************************************* 
// *************************************************************************
// *************************************************************************


//get and draw map

function drawMap(circuitID, width, height) {

    width = width || 1000;
    height = height || 600;


    //if a circuit ID is provided, draw only nodes related to that circuit

    $.getJSON('/api/map-service/links', function (json) {
        console.log("** Received circuit JSON info to populate form for", json);

        const NODE_R = 3;
        let highlightNodes = [];
        // let highlightLink = null;
        let highlightLinks = [];

        let gData = {
            nodes: [],
            links: []
        };

        //source-target number of links 
        var numOfLinksBetweenNodes = {};



        //ok so each circuit is a link basically.
        for (var i in json.data) {
            var circuit = json.data[i];

            if (circuitID && circuit.circuit_num != circuitID) continue;

            var ports = circuit.ports.egress;

            var prevPort = null;


            for (var portIndex in ports) {

                var port = ports[portIndex];

                if (prevPort) {


                    var link = {
                        source: prevPort.id,
                        target: port.id,
                        sourceLabel: prevPort.label,
                        targetLabel: port.label,
                        label: prevPort.label + " <> " + port.label,
                        circuit_num: circuit.circuit_num,
                    }

                    var linkKey = link.source +"-"+ link.target;

                    

                    if (!numOfLinksBetweenNodes[linkKey]) {
                        numOfLinksBetweenNodes[linkKey] = 0;
                        if (link.source == link.target) link.curvature = 0.1;  //for self links.  they're invisible if there's no curvature
                    }
                    else {
                        var existingLinks = numOfLinksBetweenNodes[linkKey];

                        var sign = 1;

                        if (existingLinks % 2 == 1) {
                            sign = -1;
                        }

                        existingLinks = Math.ceil(existingLinks/2);
                        // console.log(existingLinks);
                        link.curvature = 0.2 * existingLinks * sign;
                    }


                    numOfLinksBetweenNodes[linkKey]++;

                    if (link.source != link.target) gData.links.push(link);

                }

                prevPort = port;
            }
        }

        //draw only the nodes with links.
        gData.nodes = json.nodes.filter(node => gData.links.some(link => node.id == link.source || node.id == link.target))
        if (circuitID) highlightLinks = gData.links;

        const elem = document.getElementById('graph');
        var graph = ForceGraph()(elem)
          .graphData(gData)
          .height(height)
          .width(width)  //this needs to be dynamic.  Right now it just goes off the screen if I resize.
          .backgroundColor("#EEEEEE")
          .enableZoomPanInteraction(false)
          .nodeRelSize(NODE_R)
          .nodeAutoColorBy("type")
          .linkCurvature('curvature')
          .zoom(3, 0)
          .onNodeHover(node => {
            highlightNodes = node ? [node] : [];
            elem.style.cursor = node ? '-webkit-grab' : null;
          })

          .linkWidth(link => highlightLinks.indexOf(link) !== -1 ? 5 : 1)
          // .linkDirectionalParticles(4)
          // .linkDirectionalParticleWidth(link => link === highlightLink ? 4 : 0)
          .nodeCanvasObjectMode(node => 'before')
          .nodeCanvasObject((node, ctx, globalScale) => {
            // add ring just for highlighted nodes
            if (highlightNodes.indexOf(node) !== -1) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
              ctx.fillStyle = 'red';
              ctx.fill();
            }

            const yPos = node.y - 6
            //add label on top
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, yPos - bckgDimensions[1] / 2, ...bckgDimensions);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, yPos);
          })
          .onLinkHover(link => {
            if (circuitID) return;

            // highlightLink = link;  //this is useless now
            highlightNodes = link ? graph.graphData().links.map(l => l.circuit_num == link.circuit_num ? l.source : false) : [];
            highlightLinks = link ? graph.graphData().links.filter(l => l.circuit_num == link.circuit_num) : [];

          })
          .linkCanvasObjectMode(() => circuitID > 0 || highlightLinks.length > 0 ? "after" : undefined)
          .linkCanvasObject((link, ctx) => {

            if (highlightLinks.indexOf(link) === -1) return;

            const MAX_FONT_SIZE = 4;
            const LABEL_NODE_MARGIN = graph.nodeRelSize() * 1.5;
            const start = link.source;
            const end = link.target;
            // ignore unbound links
            if (typeof start !== 'object' || typeof end !== 'object') return;
            //ignore self links for now
            // if (start === end) return;
            // console.log(start, end);
            // calculate label positioning
            const textPos = Object.assign(...['x', 'y'].map(c => ({
              [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
            })));
            const relLink = { x: end.x - start.x, y: end.y - start.y };

            // console.log(link);
                        // const yPos = link.y - 6

            const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;
            let textAngle = Math.atan2(relLink.y, relLink.x);
            // maintain label vertical orientation for legibility
            if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
            if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);
            const label = `${link.sourceLabel} - ${link.targetLabel} `;
            // estimate fontSize to fit in link length
            ctx.font = '1px Sans-Serif';
            var fontSize = Math.min(MAX_FONT_SIZE, maxTextLength / ctx.measureText(label).width);
            // fontSize -= 1;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
            // draw text label (with background rect)
            ctx.save();
            ctx.translate(textPos.x, textPos.y);
            ctx.rotate(textAngle);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, ...bckgDimensions);

            //source
            // ctx.translate(link.source.x, link.source.y);

            var sourceOnLeft = false;
            if (link.source.x < link.target.x) sourceOnLeft = true;

            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = sourceOnLeft ? link.target.color : link.source.color;
            ctx.fillText(sourceOnLeft ? link.targetLabel : link.sourceLabel, 2, 0);

            //target
            // ctx.translate(link.target.x, link.target.y);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = sourceOnLeft ? link.source.color : link.target.color;
            ctx.fillText(sourceOnLeft ? link.sourceLabel : link.targetLabel, -2, 0);


            ctx.restore();



          });

    });
}

// ***************************************************************
// Print the list
// ***************************************************************  
function updateList(service_name) {
    // Get list of ISPs and print them
    $.getJSON('/api/' + service_name + '/', printList);

}


// ***************************************************************
// Show message
// ***************************************************************  
function showMessage(msg, type, elementID) {
    type = type || "warning";
    elementID = elementID || "pageContent";
    var msgBox = '<div class="alert alert-'+type+' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + msg + '</div>';
    $('#'+elementID).prepend(msgBox);
    console.log("** Showing mesasge box: " + msg);

}


// ***************************************************************
// Print a list of delete/update 
// ***************************************************************
function printList(list_data) {
    console.log("** Printing the list");

    // Clear the  list on the UI
    $('#some_list').empty();
    
    // If there is data sub-array then this is a Circuit in our case and we use the data sub-Array
    if(list_data.data) list_data = list_data.data;

    // Iterate and add each list_data to the list
    $.each(list_data, function () {
        
        // no comments for you
        // it was hard to write
        // so it should be hard to read

        // Circuit has no names so I'm using its MOC ID and circuit_num instead
        if (!this.name) {
            this.name = this.moc_id;
            this.id = this.circuit_num;
        }
        
        // If has location preppend it to the name, location is available for patch panels
        if(this.location) {
            this.name = this.location + " - " + this.name;
        }

        // strike it or not? This is used for Circuit page, if the circuit has been deleted then strike the circuit name
        var strikeIt = "<span>";
        if(this.active == 0) {
            strikeIt = "<s>";
        }  
        // Now add the elements to page DOM
        $('<li>').addClass('list-group-item d-flex justify-content-between lh-condensed p-1').appendTo('#some_list');
        $('<div>').addClass('my-auto').appendTo('#some_list>li:last-child');
        $(strikeIt).addClass('').text(this.name).appendTo('#some_list>li:last-child>div:last-child');
        $('<small>').addClass('text-muted float-sm-right').appendTo('#some_list>li:last-child');
        //console.log("**** Printing a single row to list " + this.name);
      


        // Check the link and make sure we don't have /updateform/ already on the page link
        var updateLink;
        if (document.location.href.indexOf("updateform") > -1) {
            updateLink = "";
        } else {
            updateLink = "updateform/";
        }

        // Adding edit link
        $('<a class="btn btn-link btn-sm p-0" href="' + updateLink + this.id + '"><i class="fas fa-xs fa-edit"></i></a>').appendTo('#some_list>li:last-child>small')
        $('#some_list>li:last-child>small').append(' ');

        // Adding remove link
        $('<button type="button" class="btn btn-link btn-sm p-0" data-toggle="modal" data-target="#deleteModal" data-delete_id="' + this.id + '" data-delete_name="' + this.name + '"><i class="fas fa-xs fa-trash-alt"></i></button>').appendTo('#some_list>li:last-child>small');
    });
    $('#list_num').text(list_data.length);

    // Adding confirmation functionality when clicking delete link of each item on the list
    $('#deleteModal').on('show.bs.modal', function (event) {
        console.log("** Delete button clicked");
        var button = $(event.relatedTarget) // Button that triggers the modal
        var delete_id = button.data('delete_id');
        var delete_name = button.data('delete_name');

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback)
        var modal = $(this);
        modal.find('.modal-body span').text(delete_name);
        modal.find('.delete-btn-confirm').data('id', delete_id); // Adding data to be used on click
        modal.find('.delete-btn-confirm').data('name', delete_name); // Adding data to be used on click

    });
}

// ***************************************************************
// When "Delete Confirm" button is clicked
// ***************************************************************
$('.delete-btn-confirm').click(function () {
    // If this comment is removed the program will blow up 
    console.log("** Delete Confirmed clicked for ID " + $(this).data('id') + " and name " + $(this).data('name'));

    // Create JSON data for delete request
    var delete_data = {};
    delete_data.id = $(this).data('id');
    delete_data.name = $(this).data('name');

    // Create a new instance of ladda for the specified button
    // will be used later to start and stop the loading animation
    var buttonLoading = Ladda.create(this);


    // JSON call to delete
    $.getJSON({
        url: '/api/' + service_name + '/' + delete_data.id,
        dataType: 'text',
        data: delete_data,
        type: "delete",
        success: function (data) {
            data = jQuery.parseJSON(data);
            console.log("** Received after DELETE: " + data.result);

            // stop button loading animation
            buttonLoading.stop();

            // Hide the confirmation window
            $('#deleteModal').modal('hide');


            // Compose the feedback message
            var messageText = data.result;

            // If we have messageAlert and messageText
            if (messageText) {
                // inject the alert to the div
                showMessage(messageText);
                console.log("** Delete success should appear on page");
            }

            // Update ISP list 
            updateList(service_name);
        },
        beforeSend: function () {
            // Start button loading animation
            buttonLoading.start(); // Button loading start
        },
        error: function () {}
    }); // end getJSON

}); // end click

// ***************************************************************
// Force lower characters on Code fields
// ***************************************************************
function forceLower(strInput) 
{
    strInput.value=strInput.value.toLowerCase();
}
