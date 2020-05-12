
// gridlines in x axis function
function make_x_gridlines(x) {
    return d3.axisBottom(x)
        .ticks(10)
}

// gridlines in y axis function
function make_y_gridlines(y) {
    return d3.axisLeft(y)
        .ticks(10)
}

function removeGraphs(){
    d3.select("#selectButton").selectAll("*").remove();
    d3.select("#graphGMS").select("svg").remove();
    d3.select("#covidDTGraph").select("svg").remove();
    d3.select("#graph").select("svg").remove();
    d3.select("#hospital_allGraph").select("svg").remove();
    d3.select("#icuGraph").select("svg").remove();
    d3.select("#hospital_covidGraph").select("svg").remove();
    d3.select("#casesGraph").select("svg").remove();
    d3.select("#barGraph").select("svg").remove();
}

function graph_init(res, id){

    if (id != null){

        removeGraphs();

        if (res == 'lad'){
            document.getElementById("ladDoc").style.display = "block";
            multi_line_graph("/g_mobility/"+id+".csv", "#graphGMS");
            singe_line_graph("/lad/total_covid_deaths/"+ id+ ".csv", "#covidDTGraph", "Total Covid Deaths");
            bar_graph("/lad/loc_deaths/"+id+".csv", "#barGraph");
        }
        else{

            document.getElementById("hboDoc").style.display = "block";

            var health_board = hboDistricts[id];

            singe_line_graph("/hbo/" + health_board + "_hospital_all.csv", "#hospital_allGraph", "Total Hospital Patients");
            singe_line_graph("/hbo/" + health_board + "_icu.csv", "#icuGraph", "ICU Patients");
            singe_line_graph("/hbo/" + health_board + "_hospital_covid.csv", "#hospital_covidGraph", "Total Hospital COVID-19 patients");
            singe_line_graph("/hbo/" + health_board + "_cases.csv", "#casesGraph", "Total Cumulative COVID-19 Patients");
        }
    }

}

function singe_line_graph(file, graphID, graphName){

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 150, bottom: 70, left: 30},
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(graphID)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    //Read the data
    d3.csv("https://raw.githubusercontent.com/markjswan/covid-maps/master/data"+file,

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

        // Add X axis label
        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width + 40)
        .attr("y", height+6)
        .text("Days");

        // add the X gridlines
        svg.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(0," + height + ")")
          .call(make_x_gridlines(d3.scaleTime().range([0, width]))
              .tickSize(-height)
              .tickFormat("")
          )

        // Add Y axis
        var y = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) { return +d.value; })+5])
          .range([ height, 0 ]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // add the Y gridlines
        svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines(d3.scaleLinear().range([height, 0]))
          .tickSize(-width)
          .tickFormat("")
        )

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
        // Add the legend
        svg.append("circle").attr("cx",35).attr("cy",height+55).attr("r", 6).style("fill", "#ff867b");
        svg.append("text").attr("x", 45).attr("y", height+60).text(graphName).style("font-size", "15px").attr("alignment-baseline","middle");
    })

}

function multi_line_graph(file, graphID){

    // show google dropdown select
    d3.select("#selectButton").style("display", "block");

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 150, bottom: 70, left: 30},
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(graphID)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("https://raw.githubusercontent.com/markjswan/covid-maps/master/data"+file, function(data) {

        dict1 = {"Retail & Recreation Traffic Change From Baseline (%)":"retail_and_recreation_percent_change_from_baseline",
         "Grocery & Pharmacy Use Change From Baseline (%)":"grocery_and_pharmacy_percent_change_from_baseline",
         "Parks Traffic Change From Baseline (%)":"parks_percent_change_from_baseline",
         "Transit Stations Traffic Change From Baseline (%)":"transit_stations_percent_change_from_baseline",
        "Workplace Traffic Change From Baseline (%)":"workplaces_percent_change_from_baseline",
         "Residential Traffic Change From Baseline (%)":"residential_percent_change_from_baseline"};
         dict2 = {"retail_and_recreation_percent_change_from_baseline":"Retail & Recreation Traffic Change From Baseline (%)",
          "grocery_and_pharmacy_percent_change_from_baseline":"Grocery & Pharmacy Use Change From Baseline (%)",
          "parks_percent_change_from_baseline":"Parks Traffic Change From Baseline (%)",
          "transit_stations_percent_change_from_baseline":"Transit Stations Traffic Change From Baseline (%)",
          "workplaces_percent_change_from_baseline":"Workplace Traffic Change From Baseline (%)",
          "residential_percent_change_from_baseline":"Residential Traffic Change From Baseline (%)"};
        // List of groups (here I have one group per column)
        var allGroup = ["retail_and_recreation_percent_change_from_baseline", "grocery_and_pharmacy_percent_change_from_baseline",
         "parks_percent_change_from_baseline", "transit_stations_percent_change_from_baseline", "workplaces_percent_change_from_baseline",
          "residential_percent_change_from_baseline"]
        var noGroup = ["Retail & Recreation Traffic Change From Baseline (%)", "Grocery & Pharmacy Use Change From Baseline (%)",
           "Parks Traffic Change From Baseline (%)", "Transit Stations Traffic Change From Baseline (%)",
           "Workplace Traffic Change From Baseline (%)", "Residential Traffic Change From Baseline (%)"];

        // add the options to the button
        d3.select("#selectButton")
          .selectAll('myOptions')
         	.data(noGroup)
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
          .domain([d3.min(data, function(d) { return +d.time; }), d3.max(data, function(d) { return +d.time; })])
          .range([ 0, width]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add X axis label
        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width + 150)
        .attr("y", height+6)
        .text("Days Since 01/01/2020");

        // add the X gridlines
        svg.append("g")
          .attr("class", "grid")
          .attr("transform", "translate(0," + height + ")")
          .call(make_x_gridlines(d3.scaleTime().range([0, width]))
              .tickSize(-height)
              .tickFormat("")
          )

        // Add Y axis
        var y = d3.scaleLinear()
            .domain( [-100,100])
            .range([height, 0 ]);

        svg.append("g")
        .call(d3.axisLeft(y));

        // add the Y gridlines
        svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines(d3.scaleLinear().range([height, 0]))
            .tickSize(-width)
            .tickFormat("")
        )

        // Add the BASE path.
        var lineBase = svg
            .append("g")
            .append("path")
              .datum(data)
              .attr("d", d3.line()
                .x(function(d) { return x(+d.time) })
                .y(function(d) { return y(+d.uk_retail_and_recreation_percent_change_from_baseline)})
                )
                .attr("stroke", "#666666")
                .style("stroke-width", 2)
                .style("fill", "none");

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
            .style("stroke-width", 2)
            .style("fill", "none");



        // A function that updates the chart
        function update(selectedGroup) {

          // Create new data with the selection?
          var dataFilter = data.map(function(d){return {time: d.time, value:d[selectedGroup]} })
          var dataFilterBase = data.map(function(d){return {time: d.time, value:d["uk_"+selectedGroup]} })

          // Update base line
          lineBase
              .datum(dataFilterBase)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
                .x(function(d) { return x(+d.time) })
                .y(function(d) { return y(+d.value) })
              )
              .attr("stroke", function(d){ return "#666666" })

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

          svg.select("#lgndText").remove();
          svg.append("circle").transition()
              .duration(1000)
              .attr("id","lgndCircle")
              .attr("cx",width/2-50)
              .attr("cy",height+50)
              .attr("r", 6)
              .style("fill", myColor(selectedGroup));
          svg.append("text")
            .attr("id", "lgndText")
            .attr("x", width/2-40)
            .attr("y", height+55)
            .text(dict2[selectedGroup])
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");
        }

        svg.append("circle").attr("cx",25).attr("cy",height+50).attr("r", 6).style("fill", "#666666");
        svg.append("text").attr("x", 35).attr("y", height+55).text("UK Avg").style("font-size", "15px").attr("alignment-baseline","middle");

        update("retail_and_recreation_percent_change_from_baseline");

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d) {
            // recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
            update(dict1[selectedOption])
        })

    })
}

function bar_graph(file, graphID){
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 90, left: 40},
        width = 460 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(graphID)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv("https://raw.githubusercontent.com/markjswan/covid-maps/master/data"+file, function(data) {

    // X axis
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(data.map(function(d) { return d.Country; }))
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 13000])
      .range([ height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.Country); })
        .attr("width", x.bandwidth())
        .attr("fill", "#69b3a2")
        // no bar at the beginning thus:
        .attr("height", function(d) { return height - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); })

    // Animation
    svg.selectAll("rect")
      .transition()
      .duration(800)
      .attr("y", function(d) { return y(d.Value); })
      .attr("height", function(d) { return height - y(d.Value); })
      .delay(function(d,i){console.log(i) ; return(i*100)})

    })
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
