
function display_graphHBO(hb, filter){

    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 60, left: 60},
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#graph")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    //Read the data
    d3.csv("https://raw.githubusercontent.com/markjswan/covid-maps/master/data/hbo/" + hb + "_" + filter + ".csv",

      // When reading the csv, I must format variables:
      function(d){
        return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
      },

      // Now I can use this dataset:
      function(data) {

        // Add X axis --> it is a date format
        var x = d3.scaleTime()
          .domain(d3.extent(data, function(d) { return d.date; }))
          .range([ 0, width]);

          // Add the X Axis
          svg.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).ticks(10))
          .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");

        // Add X axis label /
        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("Days");


        // Add Y axis
        var y = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) { return +d.value; })])
          .range([ height, 0 ]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Add the line
        svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#ff867b")
          .attr("stroke-width", 4)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.value) })
            )

    })
}

function update_graph_title(filter)
{
    document.getElementById('graphTitle').innerHTML = prettifyFilter[filter];
}

function get_filter(){
    var filter_select = document.getElementById('filter');
    return filter_select.options[filter_select.selectedIndex].value;
}

function display_graphGGL(id){

    // show google dropdown select
    d3.select("#selectButton").style("display", "block");

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 100, bottom: 30, left: 30},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#graph")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("https://raw.githubusercontent.com/markjswan/covid-maps/master/data/google_mobility/"+id+".csv", function(data) {

        // List of groups (here I have one group per column)
        var allGroup = ["retail_and_recreation_percent_change_from_baseline", "grocery_and_pharmacy_percent_change_from_baseline",
         "parks_percent_change_from_baseline", "transit_stations_percent_change_from_baseline", "workplaces_percent_change_from_baseline",
          "residential_percent_change_from_baseline"]

        // add the options to the button
        d3.select("#selectButton")
          .selectAll('myOptions')
         	.data(allGroup)
          .enter()
        	.append('option')
          .text(function (d) { return d; }) // text showed in the menu
          .attr("value", function (d) { return d; }) // corresponding value returned by the button

        // A color scale: one color for each group
        var myColor = d3.scaleOrdinal()
          .domain(allGroup)
          .range(d3.schemeSet2);

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
          .domain([0,123])
          .range([ 0, width ]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
          .domain( [-90,50])
          .range([ height, 0 ]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Initialize line with group a
        var line = svg
          .append('g')
          .append("path")
            .datum(data)
            .attr("d", d3.line()
              .x(function(d) { return x(+d.time) })
              .y(function(d) { return y(+d.value) })
            )
            .attr("stroke", function(d){ return myColor("valueA") })
            .style("stroke-width", 4)
            .style("fill", "none");

        // A function that updates the chart
        function update(selectedGroup) {

          // Create new data with the selection?
          var dataFilter = data.map(function(d){return {time: d.time, value:d[selectedGroup]} })

          // Give these new data to update line
          line
              .datum(dataFilter)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
                .x(function(d) { return x(+d.time) })
                .y(function(d) { return y(+d.value) })
              )
              .attr("stroke", function(d){ return myColor(selectedGroup) })
        }

        update("retail_and_recreation_percent_change_from_baseline");

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
            update(selectedOption)
        })

    })
}

function graph_init(res, id){

    if (id != null){

        d3.select("#selectButton").selectAll("*").remove();
        d3.select("#graph").select("svg").remove();

        if (res == 'lad'){

            display_graphGGL(id);
        }
        else{

            var filter = get_filter();

            var health_board = hboDistricts[id];

            update_graph_title(filter);

            display_graphHBO(health_board, filter);
        }
    }

}

prettifyFilter = {"icu": "ICU Patients", "hospital_all": "Total Hospital Patients",
 "hospital_covid": "Total Hospital COVID-19 Patients", "cases": "Total Cumulative COVID-19 Cases"}

hboDistricts = { "S12000008": '1', "S12000021": '1', "S12000028": '1', // 1
                        "S12000026": '2', // 2
                        "S12000006": '3', // 3
                        "S12000013": '4', // 4
                        "S12000015": '5', // 5
                        "S12000030": '6', "S12000014": '6', 'S12000005': '6', // 6
                        "S12000033": '7', "S12000034": '7', "S12000020": '7', //7
                        "S12000045": '8', "S12000046": '8', "S12000038": '8', "S12000039": '8', "S12000018": '8', "S12000011": '8', // 8
                        "S12000017": '9', "S12000035": '9', // 9
                        "S12000044": '10', "S12000029": '10', // 10
                        "S12000010": '11', "S12000019": '11', "S12000036": '11', "S12000040": '11', // 11
                        "S12000023": '12', // 12
                        "S12000027": '13', // 13
                        "S12000024": '14', "S12000042": '14', "S12000041": '14'} // 14
