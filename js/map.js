/*
TODO:
    [X] Add disclaimer in 'How it works' section
    [] Remove gridlines (?)
    [] Add national totals
*/

// get the width of the area we're displaying in
var width;

// but we're using the full window height
var height;

// variables for map drawing
var projection, svg, path, g;
var boundaries, units;

// variables for current stats of each district
var mapStats;

// Array to hold the IDs of the sorted districts
var sorted;

// current selected criteria
var criteria;

// resolution of the maps
var res;

// array to hold the interpolated
var interpolated;

// Allows topo_json to zoom
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

// Function 2.1
// Controls the zoom from the '+' and '-' buttons
function zoomedBUTTON()
{
    g.attr("transform",
        "translate(" + zoom.translate() + ")" +
        "scale(" + zoom.scale() + ")"
    );
}

// Function 2.2
// Controls the zoom when scrolling
function zoomed() {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function interpolateZoom (translate, scale) {
   var self = this;
   return d3.transition().duration(350).tween("zoom", function ()
   {
       var iTranslate = d3.interpolate(zoom.translate(), translate),
           iScale = d3.interpolate(zoom.scale(), scale);
       return function (t)
       {
           zoom
               .scale(iScale(t))
               .translate(iTranslate(t));
           zoomedBUTTON();
       };
   });
}

// Function 2.3
// Controls the zoom when double clicked
function zoomClick()
{
   var clicked = d3.event.target,
       direction = 1,
       factor = 0.4,
       target_zoom = 1,
       center = [width / 2, height / 2],
       extent = zoom.scaleExtent(),
       translate = zoom.translate(),
       translate0 = [],
       l = [],
       view = {x: translate[0], y: translate[1], k: zoom.scale()};

   d3.event.preventDefault();
   direction = (this.id === 'zoom_in') ? 1 : -1;
   target_zoom = zoom.scale() * (1 + factor * direction);

   if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

   translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
   view.k = target_zoom;
   l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

   view.x += center[0] - l[0];
   view.y += center[1] - l[1];

   interpolateZoom([view.x, view.y], view.k);
}

// Function 2.4
// Transforms the map scale when called
function transform()
{
    return d3.zoomIdentity
      .translate(width / 2.75, height / 2.75)
      .scale(1.2)
      .translate(-width/2.75, -height/2.75);
}

// Function 2.5
// Import and read the required JSON file
function readJSON(file)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://raw.githubusercontent.com/covidmaps/scotland/master/json/sco/"+ /*res*/ file +".json", false ); // false for synchronous request
    xmlHttp.send( null );
    mapStats = JSON.parse(xmlHttp.responseText);
}

// Function 2.6
// Set width and height with proportion to window size
function compute_size()
{
    var margin = 50;
    width = parseInt(d3.select("#map").style("width"));
    height = window.innerHeight - 2*margin;
}

// Function 2.7
// Remove any data when we lose selection of a map unit
function deselect()
{
    d3.selectAll(".selected")
        .attr("class", "area");
    d3.select("#data_table")
        .html("");

    // Update area select dropdown
    d3.select('#areaSelect').node().value = '-';

    document.getElementById('hoverText').innerHTML = '';
    document.getElementById('ladDoc').style.display = 'none';
    document.getElementById('hboDoc').style.display = 'none';

}

// Function 2.8
// Load and display the JSON map
function init(width, height)
{

    // Pretty boring projection
    projection = d3.geo.albers()
        .rotate([0, 0]);

    path = d3.geo.path()
        .projection(projection);

    // Create the svg element for drawing onto
    svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", '1000em');

    // Graphics go here
    g = svg.append("g");

    // Add zoom to svg
    svg.call(zoom).call(zoom.event);

    // Add a white rectangle as background to enable us
    // to deselect a map selection
    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "#fff")
        .on('click', deselect);
}

// Function 2.9
// Populate the death toll box and colour it depending on selected region
function populate_deathToll(id)
{

    // Get colour of district
    g.selectAll(".area").each(function(d)
    {
        if (id == d3.select(this).attr('id'))
        {
            district_color = d3.select(this).attr('fill');
        }
    });

    // Update text
    var deathTollText = mapStats["covid_deaths_total"][id];
    document.getElementById('deathTollText').innerHTML = deathTollText;

    // Update background
    document.getElementById('deathToll').style.backgroundColor = district_color;
}

// Function 2.10
// Create a HTML table to display any properties about the selected item
function create_table(properties, id)
{
    table_string = "<table>";
    if (id != undefined)
    {
        var keys = Object.keys(mapStats);
        var covidKeys = [];
        var totalKeys = [];
        var ratios = [];

        // Extract each seperate property
        for (var i = 0; i < keys.length; i++)
        {
            if (keys[i].includes("covid") && !keys[i].includes("ratio"))
            {
                covidKeys.push(keys[i]);
            }
            else if (keys[i].includes("all") && !keys[i].includes("ratio"))
            {
                totalKeys.push(keys[i]);
            }
        }

        // Calculate ratios for each row in the table
        for (var i = 0; i < covidKeys.length; i++)
        {

            var percentage =
                    (mapStats[covidKeys[i]][id]/mapStats[totalKeys[i]][id])*100;

            // Round the percentage to 2 decimal places
            var ratio = Number(Math.round(percentage+'e2')+'e-2');
            if (Number.isNaN(ratio))
            {
                ratios.push('0');
            }
            else
            {
                ratios.push(ratio);
            }
        }
        // Add column headers
        table_string += "<th>Property</th><th>COVID-19</th>"
        table_string += "<th>Total Deaths (All causes)</th>"
        table_string += "<th>Ratio of COVID-19 to Total (%)</th>";

        // Add each row of properties
        for (var i = 0; i < covidKeys.length; i++)
        {
            table_string +=
                "<tr><td>" + prettify(covidKeys[i]) +
                "</td><td>" + mapStats[covidKeys[i]][id] +
                "</td><td>" + mapStats[totalKeys[i]][id] +
                "</td><td>" + ratios[i] +
                "</td></tr>";
        }
    }
    table_string += "</table>";

    document.getElementById("chooseHint").style.display="none";
    document.getElementById("howToCol").classList.remove("active");
    document.getElementById("howToCol").nextElementSibling.style.maxHeight
                                                                        = null;

    return table_string;
}

// Function 2.11
// Wrapper function for creating/calling required tables and graphs
function show_data(properties, id)
{

    // Hide google data dropdown select
    d3.select("#selectButton").style("display", "none");

    // Only proceed if a district has been selected
    if (id != null)
    {
        if (res == 'lad')
        {
                // Give Doc Name
                document.getElementById('graphTitleLAD').innerHTML = idToName[id];

                // Populate total deaths box
                populate_deathToll(id);

                // Construct required graphs (calling function 3.1)
                graph_init(res, id);

                return create_table(properties, id);
        }
        else
        {
            // Give Doc Name
            document.getElementById('graphTitleHBO').innerHTML = idToHBO[id];

            // Construct required graphs (calling function 3.1)
            graph_init(res, id);
        }
    }

}

// Function 2.12
// Returns a better looking version of given input
function prettify(input)
{
    str = input.toString();
    return prettyProps[input];
}

// Function 2.13
// Change selected area when dropdown is used
function select_from_dropdown()
{

    var area_select = document.getElementById('areaSelect');
    var id = area_select.options[area_select.selectedIndex].value;

    if (id == '-')
    {
        deselect();
    }
    g.selectAll(".area").each(function(d)
    {
        if (id == d3.select(this).attr('id'))
        {
            select(d);
        }
    });
}

// Function 2.14
// Select a map area
function select(d)
{
    // Get the id of the selected map area
    var id = "#" + d.id;
    // remove the selected class from any other selected areas
    d3.selectAll(".selected")
        .attr("class", "area");
    // and add it to this area
    d3.select(id)
        .attr("class", "selected area")

    // If HBO selected then highlight all other districts in that area
    if (res == 'hbo')
    {
        highlightBoard(d.id);
    }

    // Get ID that is associated with the selected HBO in dropdown
    var dropdownKey = healthBoardToID[hboDistricts[d.id]];

    // Update dropdown value to that associated ID
    d3.select('#areaSelect').node().value = dropdownKey;

    // Add the area properties to the data_table section
    d3.select("#data_table")
        .html(show_data(d.properties, d.id));
}

// Function 2.15
// Removes the hover text box when no country is hovered over
function hoverLeave(d)
{
    document.getElementById('hoverText').style.display = 'none';
}

// Function 2.16
// Populates the hover text box when a country is hovered over
function hover(d)
{
    if (res == 'lad')
    {
        document.getElementById('hoverText').style.display = 'block';
        document.getElementById('hoverText').innerHTML = idToName[d.id];
    }
    else
    {
        document.getElementById('hoverText').style.display = 'block';
        document.getElementById('hoverText').innerHTML = idToHBO[d.id];
    }
}

// Function 2.17
// Highlights all districts in selected health board
function highlightBoard(id)
{
    // Get colour of current country
    var boardColour = hboColours[id];

    // Get all other countries in that district
    var matched = Object.keys(hboColours).filter(function(key)
    {
        return hboColours[key] === boardColour;
    });

    // Set all other districts in the health board as selected
    g.selectAll(".area").each(function(d)
    {
        if (matched.includes(d3.select(this).attr('id')))
        {
            d3.select(this).attr("class", "selected")
        }
    });
}

// Function 2.18
// Hides/Shows the docs depending on selected resolution
function toggle_doc()
{
    // Get elements
    var criteria_chooser = document.getElementById("criteria");
    var ladDoc = document.getElementById("ladDoc");
    var hboDoc = document.getElementById("hboDoc");
    var criteria_box = document.getElementById("criteriaBox");

    if (res === 'hbo') {
        criteria_chooser.style.display = "none";
        criteria_box.style.display = "none";
        ladDoc.style.display="none";
    }
    else {
        criteria_chooser.style.display = "inline-block";
        criteria_box.style.display = "inline-block";
        hboDoc.style.display="none";
    }
}

// Function 2.19
// Draw the map on the SVG element
function draw(boundaries)
{
    projection
        .scale(1)
        .translate([0,0]);

    // Compute the correct bounds and scaling from the topoJSON
    var b = path.bounds(topojson.feature(boundaries, boundaries.objects[units]));
    var s = .95 / Math.max((b[1][0]-b[0][0])/width, (b[1][1]-b[0][1]) / height);
    var t = [(width - s * (b[1][0]+b[0][0]))/2,(height-s*(b[1][1]+b[0][1]))/2];

    projection
        .scale(s)
        .translate(t);

    // Add an area for each feature in the topoJSON
    g.selectAll(".area")
        .data(topojson.feature(boundaries, boundaries.objects[units]).features)
        .enter().append("path")
        .attr("class", "area")
        .attr("id", function(d) {return d.id})
        .attr("properties_table", function(d) { return show_data(d.properties)})
        .attr("d", path)
        .on("click", function(d){ return select(d)})
        .on("mouseover", function(d){ return hover(d)})
        .on("mouseout", function(d){ return hoverLeave(d)});

    // Call function 2.21
    colourMap();

    if (res != 'hbo')
    {
        // Add a boundary between areas
        g.append("path")
            .datum(topojson.mesh(boundaries, boundaries.objects[units],
                function(a, b){ return a !== b }))
            .attr('d', path)
            .attr('class', 'boundary');
    }

}

// Function 2.20
// For given property return a sorted list of keys based on their values
function sort()
{
    dict = mapStats[criteria];

    var sortable = [];

    // Fill 'sortable' with each area and its value for the chosen criteria
    for (var area in mapStats[criteria])
    {
      sortable.push([area, mapStats[criteria][area]]);
    }

    // Arrange sortable from min to max
    sortable.sort(function(a,b)
    {
      return a[1] - b[1];
    });

    // Create array holding each areas ID only
    sortedID = [];
    for (var id in sortable)
    {
      sortedID.push(sortable[id][0]);
    }

    // Overwrite the global sorted array with the new one
    sorted = sortedID;
}

// Function 2.21
// Goes through each district and assigns correct colour
function colourMap()
{
    if (res == "lad")
    {
        g.selectAll(".area").each(function(d)
        {
            d3.select(this)
                .attr('fill', colourGradient(d3.select(this).attr('id')));
        });
    }
    if (res == "hbo")
    {

        g.selectAll(".area").each(function(d)
        {
            d3.select(this)
                .attr('fill', hboColours[d3.select(this).attr('id')]);
        });
    }
}

// Function 2.22
// Returns the gradient associated with the given ID
function colourGradient(id)
{
    rgb = interpolated[sorted.indexOf(id)];
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

// Function 2.23
// Converts an RGB value to hex
function rgbToHex(r, g, b)
{
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Function 2.24
// Returns hex value of given int
function componentToHex(c)
{
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

// Function 2.25.2
function interpolateColor(color1, color2, factor)
{
    if (arguments.length < 3)
    {
        factor = 0.5;
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++)
    {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

// Function 2.25.1
// Returns an array of colours ranging from 'color1' to 'color2'
function interpolateColors(color1, color2, steps)
{
    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);

    for(var i = 0; i < steps; i++)
    {
        interpolatedColorArray.push(interpolateColor(color1,
                                                    color2, stepFactor * i));
    }

    return interpolatedColorArray;
}

// Function 2.26
// Gets current criteria selected
function update_criteria()
{
    var top_level_select = document.getElementById('criteria');
    criteria = top_level_select.options[top_level_select.selectedIndex].value;
}

// Function 2.27
// Called to redraw the map - removes map completely and starts from scratch
function redraw()
{
    compute_size();

    d3.select("svg").remove();

    init(width, height);
    draw(boundaries);
}

// Function 2.28
// Get the selected resolution
function get_resolution()
{
    var top_level_select = document.getElementById('resolution');
    res = top_level_select.options[top_level_select.selectedIndex].value;
}

// Compute size
compute_size();

// Initialise the map
init(width, height);

// Function 2.29
// Loads data from the given file and redraws the map
function load_data(filename, u)
{
    get_resolution();

    update_criteria();

    // Toggle the visibility of the key
    toggle_doc();

    // Clear any selection
    deselect();

    //Import the map data
    readJSON("new_test3");

    //Import the array of interpolated colors
    interpolated =
        interpolateColors("rgb(255, 0, 0)", "rgb(255, 225, 225)", 32).reverse();

    // Sort based on criteria
    sort();

    units = u;
    var f = filename;

    d3.json(f, function(error, b) {
        if (error) return console.error(error);
        boundaries = b;
        redraw();
    });
}

// When the window is resized, redraw the map
window.addEventListener('resize', redraw);

// Return a better looking version of property header
var prettyProps = {'lad':"District",
    "all_deaths_hospital": "Total Hospital Deaths",
    'all_deaths_carehome': "Total Carehome Deaths",
    'all_deaths_non-institution': "Total Non-Institution Deaths",
    'all_deaths_other': "Total Other Deaths",
    'all_deaths_total': "Total Deaths",
    'covid_deaths_hospital': "Hospital Deaths",
    'covid_deaths_carehome': "Carehome Deaths",
    'covid_deaths_non-institution': "Non-Institution Deaths",
    'covid_deaths_other': "Other Deaths",
    'covid_deaths_total': "Total Deaths",
    'ratio_hospital_death_covid': "COVID hospital deaths (%)",
    'ratio_carehome_death_covid': "COVID Carehome Deaths (%)",
    'ratio_total_death_covid': "Total COVID Deaths (%)"}

// Dictionary of what Health board each ID belongs to
var idToHBO = { "S12000008": 'NHS Ayrshire and Arran',
    "S12000021": 'NHS Ayrshire and Arran',
    "S12000028": 'NHS Ayrshire and Arran', // 1
    "S12000026": 'NHS Borders', // 2
    "S12000006": 'NHS Dumfries and Galloway', // 3
    "S12000013": 'NHS Western Isles ', // 4
    "S12000015": 'NHS Fife', // 5
    "S12000030": 'NHS Forth Valley',
    "S12000014": 'NHS Forth Valley',
    'S12000005': 'NHS Forth Valley', // 6
    "S12000033": 'NHS Grampian',
    "S12000034": 'NHS Grampian',
    "S12000020": 'NHS Grampian', //7
    "S12000045": 'NHS Greater Glasgow and Clyde',
    "S12000046": 'NHS Greater Glasgow and Clyde',
    "S12000038": 'NHS Greater Glasgow and Clyde',
    "S12000039": 'NHS Greater Glasgow and Clyde',
    "S12000018": 'NHS Greater Glasgow and Clyde',
    "S12000011": 'NHS Greater Glasgow and Clyde', // 8
    "S12000017": 'NHS Highland',
    "S12000035": 'NHS Highland', // 9
    "S12000044": 'NHS Lanarkshire',
    "S12000029": 'NHS Lanarkshire', // 10
    "S12000010": 'NHS Lothian',
    "S12000019": 'NHS Lothian',
    "S12000036": 'NHS Lothian',
    "S12000040": 'NHS Lothian', // 11
    "S12000023": 'NHS Orkney', // 12
    "S12000027": 'NHS Shetland', // 13
    "S12000024": 'NHS Tayside',
    "S12000042": 'NHS Tayside',
    "S12000041": 'NHS Tayside'} // 14

// Dictionary of ID for each distric with the district name
var idToName = {'S12000033': 'Aberdeen City',
 'S12000034': 'Aberdeenshire',
 'S12000041': 'Angus',
 'S12000035': 'Argyll and Bute',
 'S12000036': 'City of Edinburgh',
 'S12000005': 'Clackmannanshire',
 'S12000006': 'Dumfries and Galloway',
 'S12000042': 'Dundee City',
 'S12000008': 'East Ayrshire',
 'S12000045': 'East Dunbartonshire',
 'S12000010': 'East Lothian',
 'S12000011': 'East Renfrewshire',
 'S12000014': 'Falkirk',
 'S12000015': 'Fife',
 'S12000046': 'Glasgow City',
 'S12000017': 'Highland',
 'S12000018': 'Inverclyde',
 'S12000019': 'Midlothian',
 'S12000020': 'Moray',
 'S12000013': 'Na h-Eileanan Siar',
 'S12000021': 'North Ayrshire',
 'S12000044': 'North Lanarkshire',
 'S12000023': 'Orkney Islands',
 'S12000024': 'Perth and Kinross',
 'S12000038': 'Renfrewshire',
 'S12000026': 'Scottish Borders',
 'S12000027': 'Shetland Islands',
 'S12000028': 'South Ayrshire',
 'S12000029': 'South Lanarkshire',
 'S12000030': 'Stirling',
 'S12000039': 'West Dunbartonshire',
 'S12000040': 'West Lothian'}

// colours associated with each district
var hboColours = { "S12000008": '#5a6c71',
    "S12000021": '#5a6c71',
    "S12000028": '#5a6c71', // 1
    "S12000026": '#868d86', // 2
    "S12000006": '#f1b4b2', // 3
    "S12000013": '#808000', // 4
    "S12000015": '#daeabf', // 5
    "S12000030": '#98FB98',
    "S12000014": '#98FB98',
    'S12000005': '#98FB98', // 6
    "S12000033": '#f67c74',
    "S12000034": '#f67c74',
    "S12000020": '#f67c74', //7
    "S12000045": '#c27e9e',
    "S12000046": '#c27e9e',
    "S12000038": '#c27e9e',
    "S12000039": '#c27e9e',
    "S12000018": '#c27e9e',
    "S12000011": '#c27e9e', // 8
    "S12000017": '#f6d186',
    "S12000035": '#f6d186', // 9
    "S12000044": '#ECF210',
    "S12000029": '#ECF210', // 10
    "S12000010": '#EFCC44',
    "S12000019": '#EFCC44',
    "S12000036": '#EFCC44',
    "S12000040": '#EFCC44', // 11
    "S12000023": '#F05E23', // 12
    "S12000027": '#9DC183', // 13
    "S12000024": '#875F9A',
    "S12000042": '#875F9A',
    "S12000041": '#875F9A'} // 14
