//n3al



$(document).ready(function () {


    // function monthChanged(value) {

    // }

    function getData(theDate) {

        theDate = theDate.split("/");

        var selectedMonth = theDate[0];
        var selectedYear  = theDate[1];

        $.getJSON('/api/finance-service/'+selectedMonth+'/'+selectedYear, function (json) {
            console.log("** Received circuit JSON info to populate form for", json);
    

            if ( $.fn.DataTable.isDataTable('#circuitsTable') ) {
                $('#circuitsTable').off();
                $('#circuitsTable').DataTable().destroy();
            }

            var table = $('#circuitsTable').DataTable({
                dom: 'Bfrtip',

                data: json.data,
                pageLength: 100,
                "order": [[1, 'asc']],
                "rowCallback": rowCallback,
                buttons: ['csv'],
                columns: [
                    {
                        "orderable":      false,
                        "data":           null,
                        "defaultContent": '<i class="fas fa-angle-right" id="expandButton"></i>'
                    },
                    {
                        data: "id",
                        title: "ID"
                    },
                    {
                        data: "status",
                        title: "Status"
                    },
                    {
                        data: "daysInService",
                        title: "Days in Service"
                    }
                ]
            }); //datatables init


            //TODO:  do not show months in the future, and also show years.
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            var years = [];

            for (var i = 2017; i <= moment().year(); i++) {
                years.push(i);
            }
            // var startingMonth = 2;


             $('<div class="pull-right">' +
                    '<select id="monthSelector" class="form-control">'+
                        years.map(function(year){
                            return months.map(function(monthName, month) { 
                                // console.log(i, selectedMonth)
                                var selected = month == Number(selectedMonth) && year == moment().year() ? "selected" : "";
                                return '<option value="'+month + '/' + year+'" '+selected+'>'+monthName+ ' ' + year + '</option>'
                            })
                        })+
                    '</select>' + 
                    '</div>').appendTo("#pageContent .dataTables_filter"); //example is our table id

             $(".dataTables_filter label").addClass("pull-right");

            $('#monthSelector').on('change', function() { getData(this.value) });


            addTableDropdown(table, json);


        });

    }

    getData(moment().month() + "/" + moment().year());
    
}); // end jQuery document 



function capitalize(s) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}



// ***************************************************************
// Force lower characters on Code fields
// ***************************************************************
function forceLower(strInput) 
{
    strInput.value=strInput.value.toLowerCase();
}
