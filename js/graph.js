
var res;

// Function 3.1
// Depending on chosen mode will construct required graphs
function graph_init(res, id)
{
    res = res;

    // Only proceed if an array has been selected
    if (id != null && parsed == 0)
    {

        // Hide hint and 'How To' collapsible
        document.getElementById("chooseHint").style.display="none";
        document.getElementById("howToCol").classList.remove("active");
        document.getElementById("howToCol").nextElementSibling.style.maxHeight = null;

        // Remove old graphs
        removeGraphs();

        if (res == 'lad')
        {
            // Display the new doc
            document.getElementById("ladDoc").style.display = "block";

            // Google mobility graph
            multi_line_graph("/g_mobility/"+id+".csv", "#graphGMS", id);

            // Total COVID-19 deaths per week graph
            scatter_plot("/lad/total_covid_deaths/" + id + ".csv",
                                "#covidDTGraph",
                                "Total Covid-19 Deaths"
                            );

            // Total COVID-19 deaths by location
            bar_graph("/lad/loc_deaths/"+id+".csv", "#barGraph");
        }
        if (res == 'hbo')
        {
            // Display the new doc
            document.getElementById("hboDoc").style.display = "block";

            // Get selected health board
            var health_board = hboDistricts[id];

            // Total ICU Patients graph
            scatter_plot("/hbo/" + health_board + "_new_cases.csv",
                                "#newCasesGraph",
                                "New Cases"
                            );

            // Total ICU Patients graph
            scatter_plot("/hbo/" + health_board + "_icu.csv",
                                "#icuGraph",
                                "ICU Patients"
                            );

            // Total Hospital COVID-19 Patients graph
            scatter_plot("/hbo/" + health_board + "_hospital_covid.csv",
                                "#hospital_covidGraph",
                                "Total Hospital COVID-19 patients"
                            );

            // Total Cumulative COVID-19 Cases graph
            scatter_plot("/hbo/" + health_board + "_cases.csv",
                                "#casesGraph",
                                "Total Cumulative COVID-19 Patients");
        }
        if (res == 'nat')
        {
            // Display the new doc
            document.getElementById("natDoc").style.display = "block";

            // Get selected health board
            var health_board = hboDistricts["S12000018"];


            // Total COVID-19 deaths graph
            double_scatter_plot("/hbo/daily_deaths.csv",
                                "#daiyCOVIDDeaths",
                                "Daily COVID-19 Deaths"
                            );

            // Total pos tests graph
            scatter_plot("/hbo/daily_pos.csv",
                                "#totalCovidPosTests",
                                "Daily Positive Tests"
                            );

            // Stacked bar plot for positive vs negative tests
/*
            stacked_bar_graph("/hbo/daily_pos.csv",
                                "#stackedTests",
                                "Stacked Tests"
                            );
                            */
            parsed += 1;
        }
    }

}

// Function 3.2
// Gridlines in x axis function
function make_x_gridlines(x)
{
    return d3.axisBottom(x)
        .ticks(10)
}

// Function 3.3
// Gridlines in y axis function
function make_y_gridlines(y)
{
    return d3.axisLeft(y)
        .ticks(10)
}

// Function 3.4
// Remove all graph - regardless if they have been created or not
function removeGraphs()
{
    d3.select("#selectButton").selectAll("*").remove();
    d3.select("#graphGMS").select("svg").remove();
    d3.select("#covidDTGraph").select("svg").remove();
    d3.select("#graph").select("svg").remove();
    d3.select("#hospital_allGraph").select("svg").remove();
    d3.select("#icuGraph").select("svg").remove();
    d3.select("#hospital_covidGraph").select("svg").remove();
    d3.select("#casesGraph").select("svg").remove();
    d3.select("#barGraph").select("svg").remove();
    d3.select("#newCasesGraph").select("svg").remove();
    d3.select("#totalCovidCases").select("svg").remove();
    d3.select("#totalCovidPosTests").select("svg").remove();
    d3.select("#stackedTests").select("svg").remove();
    d3.select("#daiyCOVIDDeaths").select("svg").remove();

}

// Function 3.5
// Generate a scatter plot with tootltip on mouse hover
function scatter_plot(file, graphID, graphName)
{
    // Set the dimensions and margins of the graph
    var margin = {top: 10, right: 40, bottom: 100, left: 40},
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%Y-%m-%d");
    var formatTime = d3.timeFormat("%e %B");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

    var div = d3.select(graphID).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select(graphID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("https://raw.githubusercontent.com/covidmaps/scotland/master/data"
            +file, function(error, data) {
      if (error) throw error;

      // format the data
      var previousDate;
      var previousVal;
      var dataTicks = 0;

      // If an intermediate data point is missing use the previous one
      data.forEach(function(d) {
          if (!isNaN(d.value))
          {
              d.date = parseTime(d.date);
              d.value = +d.value;
              previousDate = d.date;
              previousVal = d.value;
              dataTicks += 1;
          }
          else
          {
              d.date = previousDate;
              d.value = previousVal;
          }
      });

      // Remove any NaN's or values less than 0
      data = data.filter(function(d){
          if (isNaN(d.value) || d.value < 0){
              return false;
          }
          d.value = parseInt(d.value, 10);
          return true;
      });
      // scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })+10]);

      // Add the X gridlines
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines(d3.scaleTime().range([0, width]))
            .tickSize(-height)
            .tickFormat("")
        )

        // add the Y gridlines
        svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines(d3.scaleLinear().range([height, 0]))
          .tickSize(-width)
          .tickFormat("")
        )

      // add the valueline path.
      svg.append("path")
         .data([data])
         .attr("class", "line")
         .attr("d", valueline);

      // If retrieved data doesn't exist say:
      if (d3.max(data, function(d) { return +d.value; }) == null)
      {
             svg.append("text")
                 .attr("x", width/2 - 95)
                 .attr("y", height/2 - 7)
                 .text("Insignificant Data (less than 5)")
                 .style("font-size", "20px")
                 .attr("alignment-baseline","middle");
      }
      else
      {
          // add the dots with tooltips
          svg.selectAll("dot")
             .data(data)
           .enter().append("circle")
             .attr("fill", "#7bb2ff")
             .attr("r", 3.5)
             .attr("cx", function(d) { return x(d.date); })
             .attr("cy", function(d) { return y(d.value); })
             .on("mouseover", function(d) {
               div.transition()
                 .duration(200)
                 .style("opacity", .9);
               div.html(formatTime(d.date) + "<br/>" + d.value)
                 .style("left", (d3.event.pageX) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
               })
             .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
               });
        }

        // add the Y Axis
        svg.append("g")
           .call(d3.axisLeft(y));

         // LAD has different X axis scales
         if (res == 'lad')
         {
              // Add the X Axis
              svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x).ticks(5))
              .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-65)");

              // Add X axis label
              svg.append("text")
              .attr("class", "x label")
              .attr("text-anchor", "end")
              .attr("x", 250)
              .attr("y", height+60)
              .text("Week Beginning");
        }
        else
        {
              if (dataTicks > 10)
              {
                  dataTicks = 10;
              }
              // Add the X Axis
              svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x).ticks(dataTicks))
              .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.10em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-65)");

              // Add X axis label
              svg.append("text")
              .attr("class", "x label")
              .attr("text-anchor", "end")
              .attr("x", 225)
              .attr("y", height+60)
              .text("Day");
      }

      // Add the legend
      svg.append("circle")
          .attr("cx",150)
          .attr("cy",height+80)
          .attr("r", 6)
          .style("fill", "#ff867b");
      svg.append("text")
          .attr("x", 160)
          .attr("y", height+85)
          .text(graphName)
          .style("font-size", "15px")
          .attr("alignment-baseline","middle");
    });
}

// Function 3.9
// Generate a double line scatter plot with tootlip on hover
function double_scatter_plot(file, graphID, graphName)
{
    // Set the dimensions and margins of the graph
    var margin = {top: 10, right: 40, bottom: 100, left: 40},
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%Y-%m-%d");
    var formatTime = d3.timeFormat("%e %B");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the 1st line
    var valueline = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.cases); });

    var div = d3.select(graphID).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Append the svg object to the body of the page
    var svg = d3.select(graphID)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 550 400")
      .classed("svg-content-responsive", true)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Get the data
    d3.csv("https://raw.githubusercontent.com/covidmaps/scotland/master/data"
            +file, function(error, data) {
      if (error) throw error;

      // format the data
      data.forEach(function(d) {
          d.date = parseTime(d.date);
          d.value = +d.value;
      });

      // scale the range of the data
      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain([0, d3.max(data, function(d) {
    	  return Math.max(d.cases+20, d.value+20); })]);

      // Add the X gridlines
      svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines(d3.scaleTime().range([0, width]))
            .tickSize(-height)
            .tickFormat("")
        )

        // add the Y gridlines
        svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines(d3.scaleLinear().range([height, 0]))
          .tickSize(-width)
          .tickFormat("")
        )

      // add the valueline path.
      svg.append("path")
         .data([data])
         .attr("fill", "#7bb2ff")
         .attr("class", "line")
         .attr("d", valueline);

     // add the valueline 2 path.
     svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline2);

      // add the dots with tooltips for line 1
      svg.selectAll("dot")
         .data(data)
       .enter().append("circle")
         .attr("fill", "#7bb2ff")
         .attr("r", 3.5)
         .attr("cx", function(d) { return x(d.date); })
         .attr("cy", function(d) { return y(d.value); })
         .on("mouseover", function(d) {
           div.transition()
             .duration(200)
             .style("opacity", .9);
           div.html(formatTime(d.date) + "<br/>" + d.value)
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
           })
         .on("mouseout", function(d) {
           div.transition()
             .duration(500)
             .style("opacity", 0);
           });

       // add the dots with tooltips for line 2
       svg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("fill", "#ff867b")
          .attr("r", 3.5)
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.cases); })
          .on("mouseover", function(d) {
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.html(formatTime(d.date) + "<br/>" + d.cases)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
            })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
            });

        // add the Y Axis
        svg.append("g")
           .call(d3.axisLeft(y));

         // LAD has different X axis scales
         if (res == 'lad')
         {
              // Add the X Axis
              svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x).ticks(5))
              .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-65)");
        }
        else
        {
              // Add the X Axis
              svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(x).ticks(10))
              .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.10em")
              .attr("dy", ".15em")
              .attr("transform", "rotate(-65)");
      }
      if (res != "hbo")
      {
          // Add X axis label
          svg.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "end")
          .attr("x", 280)
          .attr("y", height+60)
          .text("Week Beginning");
      }
      else
      {
          // Add X axis label
          svg.append("text")
          .attr("class", "x label")
          .attr("text-anchor", "end")
          .attr("x", 225)
          .attr("y", height+60)
          .text("Day");
      }


      // Add the legend
      svg.append("circle")
          .attr("cx",220)
          .attr("cy",height+80)
          .attr("r", 6)
          .style("fill", "#7bb2ff");
      svg.append("text")
          .attr("x", 230)
          .attr("y", height+85)
          .text(graphName)
          .style("font-size", "15px")
          .attr("alignment-baseline","middle");
      // Add the legend
      svg.append("circle")
          .attr("cx",40)
          .attr("cy",height+80)
          .attr("r", 6)
          .style("fill", "#ff867b");
      svg.append("text")
          .attr("x", 50)
          .attr("y", height+85)
          .text("Daily COVID-19 Cases")
          .style("font-size", "15px")
          .attr("alignment-baseline","middle");

      // If retrieved data doesn't exist say:
      if (d3.max(data, function(d) { return +d.value; }) == null)
      {
          svg.append("text")
              .attr("x", width/2 - 95)
              .attr("y", height/2 - 7)
              .text("Insignificant Data (less than 5)")
              .style("font-size", "20px")
              .attr("alignment-baseline","middle");
      }
    });
}

// Function 3.6
// Generate a multi-line graph with a dropdown
function multi_line_graph(file, graphID, id)
{
    // Show google dropdown select
    d3.select("#selectButton").style("display", "block");

    // Set the dimensions and margins of the graph
    var margin = {top: 10, right: 40, bottom: 130, left: 40},
        width = 500 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select(graphID)
      .append("svg")
       .attr("preserveAspectRatio", "xMinYMin meet")
       .attr("viewBox", "0 0 550 400")
       .classed("svg-content-responsive", true)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Read the data
    d3.csv("https://raw.githubusercontent.com/covidmaps/scotland/master/data"
            +file, function(data)
     {

        // List of groups (columns)
        var allGroup = [
            "retail_and_recreation_percent_change_from_baseline",
            "grocery_and_pharmacy_percent_change_from_baseline",
            "parks_percent_change_from_baseline",
            "transit_stations_percent_change_from_baseline",
            "workplaces_percent_change_from_baseline",
            "residential_percent_change_from_baseline"
        ];
        var noGroup = [
            "Retail & Recreation Traffic Change From Baseline (%)",
            "Grocery & Pharmacy Use Change From Baseline (%)",
            "Parks Traffic Change From Baseline (%)",
            "Transit Stations Traffic Change From Baseline (%)",
            "Workplace Traffic Change From Baseline (%)",
            "Residential Traffic Change From Baseline (%)"
        ];

        // Add the options to the dropdown
        d3.select("#selectButton")
          .selectAll('myOptions')
         	.data(noGroup)
          .enter()
        	.append('option')
          .text(function (d) { return d; })
          .attr("value", function (d) { return d; })

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
        .attr("x", width/2+50)
        .attr("y", height+40)
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

        // Add the Y gridlines
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
                .y(function(d)
                {
                return y(+d.uk_retail_and_recreation_percent_change_from_baseline)
                })
                )
                .attr("stroke", "#666666")
                .style("stroke-width", 2)
                .style("fill", "none");

        // Add line for when lockdown began
        /*
        var lineLockdown = svg
            .append("g")
            .append("path")
              .datum(data)
              .attr("d", d3.line()
                .x(function(d) { return x('83') })
                .y(function(d)
                {
                return y(+d.uk_retail_and_recreation_percent_change_from_baseline)
                })
                )
                .attr("stroke", "#b14d49")
                .style("stroke-width", 2)
                .style("fill", "none");
        */

        // Add line for when phase 1 began
        var linePhaseOne = svg
            .append("g")
            .append("path")
              .datum(data)
              .attr("d", d3.line()
                .x(function(d) { return x('144') })
                .y(function(d)
                {
                return y(+d.uk_retail_and_recreation_percent_change_from_baseline)
                })
                )
                .attr("stroke", "#ff564f")
                .style("stroke-width", 2)
                .style("fill", "none");

        // Add line for when phase 2 began
        var linePhaseTwo = svg
            .append("g")
            .append("path")
              .datum(data)
              .attr("d", d3.line()
                .x(function(d) { return x('164') })
                .y(function(d)
                {
                return y(+d.uk_retail_and_recreation_percent_change_from_baseline)
                })
                )
                .attr("stroke", "#fbc7c7")
                .style("stroke-width", 2)
                .style("fill", "none");


        // Initialize line with group a
        var line = svg
          .append('g')
          .append("path")
            .datum(data)
            .attr("d", d3.line()
              .x(function(d) { return x(+d.time) })
              .y(function(d)
              {
                 return y(+d.retail_and_recreation_percent_change_from_baseline)
              })
            )
            .attr("stroke", function(d)
            {
            return myColor("retail_and_recreation_percent_change_from_baseline")
            })
            .style("stroke-width", 2)
            .style("fill", "none");

        // A function that updates the chart
        function update(selectedGroup)
        {

          // Create new data with the selection?
          var dataFilter = data.map(function(d)
          {
                return {time: d.time, value:d[selectedGroup]}
          })
          var dataFilterBase = data.map(function(d)
          {
              return {time: d.time, value:d["uk_"+selectedGroup]}
          })

          // Update base line (UK Avg)
          lineBase
              .datum(dataFilterBase)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
                .x(function(d) { return x(+d.time) })
                .y(function(d) { return y(+d.value) })
              )
              .attr("stroke", function(d){ return "#666666" })

          // Give these new data to update line (Chosen criteria)
          line
              .datum(dataFilter)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
                .x(function(d) { return x(+d.time) })
                .y(function(d) { return y(+d.value) })
              )
              .attr("stroke", function(d){ return myColor(selectedGroup) })

          // Update lockdown line
          /*
          lineLockdown.datum(dataFilterBase)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
                .x(function(d) { return x('83') })
                .y(function(d) { return y(+d.value) })
              )
          */

          // Update phase 1 line
          linePhaseOne.datum(dataFilterBase)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
                .x(function(d) { return x('144') })
                .y(function(d) { return y(+d.value) })
              )

          // Update phase 2 line
          linePhaseTwo.datum(dataFilterBase)
              .transition()
              .duration(1000)
              .attr("d", d3.line()
                .x(function(d) { return x('164') })
                .y(function(d) { return y(+d.value) })
              )

          // Update legend chosen region circle colour
          svg.append("circle").transition()
              .duration(1000)
              .attr("id","lgndCircle")
              .attr("cx",width/2-50)
              .attr("cy",height+80)
              .attr("r", 6)
              .style("fill", myColor(selectedGroup));
        }

        // Add legend (selected area)
        svg.append("circle").transition()
            .duration(1000)
            .attr("id","lgndCircle")
            .attr("cx",width/2-50)
            .attr("cy",height+80)
            .attr("r", 6)
            .style("fill", myColor(allGroup[0]));

        svg.append("text")
          .attr("id", "lgndText")
          .attr("x", width/2-40)
          .attr("y", height+85)
          .text(idToName[id])
          .style("font-size", "15px")
          .attr("alignment-baseline","middle");

        // Add legend (UK Avg)
        svg.append("circle")
            .attr("cx",25)
            .attr("cy",height+80)
            .attr("r", 6)
            .style("fill", "#666666");
        svg.append("text")
            .attr("x", 35)
            .attr("y", height+85)
            .text("UK Avg")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");

        // Update legend (Lockdown begins)
        /*
        svg.append("circle")
            .attr("cx",25)
            .attr("cy",height+100)
            .attr("r", 6)
            .style("fill", "#b14d49");
        svg.append("text")
            .attr("x", 35)
            .attr("y", height+105)
            .text("Lockdown Begins")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");
        */

        // Update legend (Phase 1 begins)
        svg.append("circle")
            .attr("cx", 25 )
            .attr("cy", height+100)
            .attr("r", 6)
            .style("fill", "#ff564f");
        svg.append("text")
            .attr("x", 35 )
            .attr("y", height+105)
            .text("Phase 1 Begins")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");

        // Update legend (Phase 2 begins)
        svg.append("circle")
            .attr("cx",width/2-50)
            .attr("cy",height+100)
            .attr("r", 6)
            .style("fill", "#fbc7c7");
        svg.append("text")
            .attr("x", width/2-40)
            .attr("y", height+105)
            .text("Phase 2 Begins")
            .style("font-size", "15px")
            .attr("alignment-baseline","middle");

        // When the button is changed, run the updateChart function
        d3.select("#selectButton").on("change", function(d)
        {
            // Recover the option that has been chosen
            var selectedOption = d3.select(this).property("value")

            // Run the updateChart function with this selected option
            update(dict1[selectedOption])
        })

    })
}

// Function 3.7
// Generates a bar graph
function bar_graph(file, graphID)
{
    // Set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 170, left: 40},
        width = 460 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select(graphID)
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 550 370")
      .classed("svg-content-responsive", true)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    var colorScale = d3.scale.category10().domain([0, 1, 2]);

    // Parse the Data
    d3.csv(
        "https://raw.githubusercontent.com/covidmaps/scotland/master/data"+file,
         function(data) {

    colorScale.domain(data.map(function (d){ return d["Country"]; }));

    // Add X axis
    var x = d3.scaleBand()
      .range([ 0, width ])
      .domain(data.map(function(d) { return d.Country; }))
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "center");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, 290])
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
        .attr("fill", function (d){ return colorScale(d["Country"]); })
        // no bar at the beginning thus:
        .attr("height", function(d) { return height - y(0); })
        .attr("y", function(d) { return y(0); })

    // Animation
    svg.selectAll("rect")
      .transition()
      .duration(800)
      .attr("y", function(d) { return y(d.Value); })
      .attr("height", function(d) { return height - y(d.Value); })
      .delay(function(d,i){return(i*100)})

    })

}

// Function 3.8
// Generates a stacked bar graph
function stacked_bar_graph(file, graphID)
{
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select(graphID)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    d3.csv("https://raw.githubusercontent.com/covidmaps/scotland/master/data/hbo/daily_tests.csv", function(data) {

      // List of subgroups = header of the csv files = soil condition here
      var subgroups = data.columns.slice(1)

      // List of groups = species here = value of the first column called group -> I show them on the X axis
      var groups = d3.map(data, function(d){return(d.date)}).keys()

      // Add X axis
      var x = d3.scaleBand()
          .domain(groups)
          .range([0, width])
          .padding([0.2])
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, 200])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // color palette = one color per subgroup
      var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#e41a1c','#377eb8','#4daf4a'])

      //stack the data? --> stack per subgroup
      var stackedData = d3.stack()
        .keys(subgroups)
        (data)

      // Show the bars
      svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
          .attr("fill", function(d) { return color(d.key); })
          .selectAll("rect")
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data(function(d) { return d; })
          .enter().append("rect")
            .attr("x", function(d) { return x(d.data.group); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("height", function(d) { return y(d[0]) - y(d[1]); })
            .attr("width",x.bandwidth())
    })
}


prettifyFilter = {
    "icu": "ICU Patients",
    "hospital_all": "Total Hospital Patients",
    "hospital_covid": "Total Hospital COVID-19 Patients",
    "cases": "Total Cumulative COVID-19 Cases"
    }

hboDistricts = {
    "S12000008": '1',
    "S12000021": '1',
    "S12000028": '1', // 1
    "S12000026": '2', // 2
    "S12000006": '3', // 3
    "S12000013": '4', // 4
    "S12000015": '5', // 5
    "S12000030": '6',
    "S12000014": '6',
    'S12000005': '6', // 6
    "S12000033": '7',
    "S12000034": '7',
    "S12000020": '7', //7
    "S12000045": '8',
    "S12000046": '8',
    "S12000038": '8',
    "S12000039": '8',
    "S12000018": '8',
    "S12000011": '8', // 8
    "S12000017": '9',
    "S12000035": '9', // 9
    "S12000044": '10',
    "S12000029": '10', // 10
    "S12000010": '11',
    "S12000019": '11',
    "S12000036": '11',
    "S12000040": '11', // 11
    "S12000023": '12', // 12
    "S12000027": '13', // 13
    "S12000024": '14',
    "S12000042": '14',
    "S12000041": '14'} // 14

// Mapping of pretty name to  csv column name
dict1 = {
"Retail & Recreation Traffic Change From Baseline (%)":"retail_and_recreation_percent_change_from_baseline",
"Grocery & Pharmacy Use Change From Baseline (%)":"grocery_and_pharmacy_percent_change_from_baseline",
"Parks Traffic Change From Baseline (%)":"parks_percent_change_from_baseline",
"Transit Stations Traffic Change From Baseline (%)":"transit_stations_percent_change_from_baseline",
"Workplace Traffic Change From Baseline (%)":"workplaces_percent_change_from_baseline",
"Residential Traffic Change From Baseline (%)":"residential_percent_change_from_baseline"
};

// Mapping of csv column name to pretty name
dict2 = {
"retail_and_recreation_percent_change_from_baseline":"Retail & Recreation Traffic Change From Baseline (%)",
"grocery_and_pharmacy_percent_change_from_baseline":"Grocery & Pharmacy Use Change From Baseline (%)",
"parks_percent_change_from_baseline":"Parks Traffic Change From Baseline (%)",
"transit_stations_percent_change_from_baseline":"Transit Stations Traffic Change From Baseline (%)",
"workplaces_percent_change_from_baseline":"Workplace Traffic Change From Baseline (%)",
"residential_percent_change_from_baseline":"Residential Traffic Change From Baseline (%)"
};
