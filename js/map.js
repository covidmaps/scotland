/*
TODO:
 [] reformat table to have columns of COVID,  Non-INST, OTHER etc
 [] Add more grid lines to single line graphs
 [] vertical lines to indicate when lockdown started (i.e at day 70 after jan1st or whenever it started) might be something i'd consider if they were my graphs
 [] Cite sources
 [X] Add comparison to criteria selection for what the ratio is
 [] remove dropshadows (?)
 [X] Fix LHS table height not changing
 [] All caps inconsitency
 [] Scroll broken (?)
 [] Move map selectors to RHS
 [] Hide 'How To' once country selected
 [] Don't have report names look like link
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

// Variables to only have the page scroll once per mode select lifetime
var hboScrolled, ladScrolled;

// array to hold the interpolated
var interpolated;

// Allows topo_json to zoom
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

function zoomed() {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// import and read the required JSON file
function readJSON(file) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://raw.githubusercontent.com/covidmaps/scotland/master/json/sco/"+ /*res*/ file +".json", false ); // false for synchronous request
    xmlHttp.send( null );
    mapStats = JSON.parse(xmlHttp.responseText);
}

function compute_size() {
    var margin = 50;
    width = parseInt(d3.select("#map").style("width"));
    height = window.innerHeight - 2*margin;
}

compute_size();
// initialise the map
init(width, height);

// remove any data when we lose selection of a map unit
function deselect() {
    d3.selectAll(".selected")
        .attr("class", "area");
    d3.select("#data_table")
        .html("");
    document.getElementById('hoverText').innerHTML = '';

}


function init(width, height) {

    // pretty boring projection
    projection = d3.geo.albers()
        .rotate([0, 0]);

    path = d3.geo.path()
        .projection(projection);

    // create the svg element for drawing onto
    svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", '1000em');

    // graphics go here
    g = svg.append("g");

    // add zoom to svg
    svg.call(zoom).call(zoom.event);

    // add a white rectangle as background to enable us to deselect a map selection
    g.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "#fff")
        .on('click', deselect);
}

// create a HTML table to display any properties about the selected item
function create_table(properties, id)
{
    table_string = "<table>";
    if (id != undefined){
        var keys = Object.keys(mapStats);
        table_string += "<th>Property</th><th>Value</th>";
        for (var i = 0; i < keys.length; i++) {
            table_string += "<tr><td>" + prettify(keys[i]) + "</td><td>" + mapStats[keys[i]][id] + "</td></tr>";
        }
    }
    table_string += "</table>";
    document.getElementById("chooseHint").style.display="none";
    document.getElementById("howTo").style.display="none";
    return table_string;
}

function show_data(properties, id) {

    // Hide google data dropdown select
    d3.select("#selectButton").style("display", "none");
    if (id != null){
        if (res == 'lad')
        {
                // Give Doc Name
                document.getElementById('graphTitleLAD').innerHTML = idToName[id];

                // remove any existing graphs
                d3.select("#graph").select("svg").remove();

                graph_init(res, id);
                console.log(hboScrolled, ladScrolled);

                if (!ladScrolled){
                    ladScrolled = true;
                    document.getElementById("ladDoc").scrollIntoView({ behavior: 'smooth'});
                }
                return create_table(properties, id);
        }
        else
        {
            // Give Doc Name
            // TODO: Get dict of ID to HBO name
            console.log(idToHBO[id]);
            document.getElementById('graphTitleHBO').innerHTML = idToHBO[id];
            console.log(hboScrolled, ladScrolled);

            graph_init(res, id);
        }
    }

}

function prettify(input){
    str = input.toString();
    return prettyProps[input];
}

// select a map area
function select(d) {
    // get the id of the selected map area
    var id = "#" + d.id;
    // remove the selected class from any other selected areas
    d3.selectAll(".selected")
        .attr("class", "area");
    // and add it to this area
    d3.select(id)
        .attr("class", "selected area")
    // If HBO selected then highlight all other districts in that area
    if (res == 'hbo'){
        highlightBoard(d.id);
    }

    // add the area properties to the data_table section
    d3.select("#data_table")
        .html(show_data(d.properties, d.id));

    // Only scroll to HBO title if not already done so
    if(!hboScrolled){
        console.log("hbo scroll beginss")
        hboScrolled = true;
        document.getElementById("hboDoc").scrollIntoView({ behavior: 'smooth'});
    }
}

// Removes the hover text box when no country is hovered over
function hoverLeave(d){
    document.getElementById('hoverText').style.display = "";
}

// Populates the hover text box when a country is hovered over
function hover(d) {
    if (res == 'lad'){
        document.getElementById('hoverText').style.display = 'block';
        document.getElementById('hoverText').innerHTML = idToName[d.id];
    }
    else{
        document.getElementById('hoverText').style.display = 'block';
        document.getElementById('hoverText').innerHTML = idToHBO[d.id];
    }
}

// Highlights all districts in selected health board
function highlightBoard(id){
    // Get colour of current country
    var boardColour = hboColours[id];

    // Get all other countries in that district
    var matched = Object.keys(hboColours).filter(function(key) {
        return hboColours[key] === boardColour;
    });

    // Set all other districts in the health board as selected
    g.selectAll(".area").each(function(d) {
        if (matched.includes(d3.select(this).attr('id'))){
            d3.select(this).attr("class", "selected")
        }
    });
}

// Hides/Shows the key depending on selected resolution
function toggle_key(){

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

// draw our map on the SVG element
function draw(boundaries) {

    projection
        .scale(1)
        .translate([0,0]);

    // compute the correct bounds and scaling from the topoJSON
    var b = path.bounds(topojson.feature(boundaries, boundaries.objects[units]));
    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
        .scale(s)
        .translate(t);

    // add an area for each feature in the topoJSON
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


    colourMap();

    if (res != 'hbo'){
        // add a boundary between areas
        g.append("path")
            .datum(topojson.mesh(boundaries, boundaries.objects[units], function(a, b){ return a !== b }))
            .attr('d', path)
            .attr('class', 'boundary');
    }

}

// For given property return a sorted list of keys based on their values
function sort() {
    dict = mapStats[criteria];
    var sortable = [];
    for (var area in mapStats[criteria]) {
      sortable.push([area, mapStats[criteria][area]]);
    }

    sortable.sort(function(a,b) {
      return a[1] - b[1];
    });

    sortedID = [];
    for (var id in sortable) {
      sortedID.push(sortable[id][0]);
    }
    //Overwrite the global sorted array with the new one
    sorted = sortedID;
}

// Goes through each district and assigns correct colour
function colourMap()
{
    if (res == "lad")
    {
        g.selectAll(".area").each(function(d) {
            d3.select(this).attr('fill', colourGradient(d3.select(this).attr('id')));
        });
    }
    if (res == "hbo")
    {

        g.selectAll(".area").each(function(d) {
            d3.select(this).attr('fill', hboColours[d3.select(this).attr('id')]);
        });
    }
}

// Selects the gradient associated with the ID
function colourGradient(id)
{
    rgb = interpolated[sorted.indexOf(id)];
    return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

// Converts an RGB value to hex
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) {
        factor = 0.5;
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

function interpolateColors(color1, color2, steps) {
    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);

    for(var i = 0; i < steps; i++) {
        interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
    }

    return interpolatedColorArray;
}

// Gets the current criteria selected
function update_criteria(){
    var top_level_select = document.getElementById('criteria');
    criteria = top_level_select.options[top_level_select.selectedIndex].value;
}


// called to redraw the map - removes map completely and starts from scratch
function redraw() {
    compute_size();
    //width = parseInt(d3.select("#map").style("width"));
    //height = window.innerHeight - margin;

    d3.select("svg").remove();

    init(width, height);
    draw(boundaries);
}

// get the selected resolution
function get_resolution(){
    var top_level_select = document.getElementById('resolution');
    res = top_level_select.options[top_level_select.selectedIndex].value;
}

// loads data from the given file and redraws the map
function load_data(filename, u) {

    ladScrolled = false;
    hboScrolled = false;

    get_resolution();

    update_criteria();

    // Toggle the visibility of the key
    toggle_key();

    // clear any selection
    deselect();

    //Import the map data
    readJSON("new_test3");

    //Import the array of interpolated colors
    interpolated = interpolateColors("rgb(255, 0, 0)", "rgb(255, 225, 225)", 32).reverse();

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

// when the window is resized, redraw the map
window.addEventListener('resize', redraw);

// Return a better looking version of property header
var prettyProps = {'lad':"District", "all_deaths_hospital": "Total Hospital Deaths", 'all_deaths_carehome': "Total Carehome Deaths",
                'all_deaths_non-institution': "Total Non-Institution Deaths", 'all_deaths_other': "Total Other Deaths",
            'all_deaths_total': "Total Deaths", 'covid_deaths_hospital': "COVID Hospital Deaths",
        'covid_deaths_carehome': "COVID Carehome Deaths", 'covid_deaths_non-institution': "COVID Non-Institution Deaths",
    'covid_deaths_other': "COVID Other Deaths", 'covid_deaths_total': "COVID Total Deaths",
    'ratio_hospital_death_covid': "COVID hospital deaths (%)", 'ratio_carehome_death_covid': "COVID Carehome Deaths (%)",
    'ratio_total_death_covid': "Total COVID Deaths (%)"}

// Dictionary of what Health board each ID belongs to
var idToHBO = { "S12000008": 'NHS Ayrshire and Arran', "S12000021": 'NHS Ayrshire and Arran', "S12000028": 'NHS Ayrshire and Arran', // 1
           "S12000026": 'NHS Borders', // 2
           "S12000006": 'NHS Dumfries and Galloway', // 3
           "S12000013": 'NHS Western Isles ', // 4
           "S12000015": 'NHS Fife', // 5
           "S12000030": 'NHS Forth Valley', "S12000014": 'NHS Forth Valley', 'S12000005': 'NHS Forth Valley', // 6
           "S12000033": 'NHS Grampian', "S12000034": 'NHS Grampian', "S12000020": 'NHS Grampian', //7
           "S12000045": 'NHS Greater Glasgow and Clyde', "S12000046": 'NHS Greater Glasgow and Clyde', "S12000038": 'NHS Greater Glasgow and Clyde',
            "S12000039": 'NHS Greater Glasgow and Clyde', "S12000018": 'NHS Greater Glasgow and Clyde', "S12000011": 'NHS Greater Glasgow and Clyde', // 8
           "S12000017": 'NHS Highland', "S12000035": 'NHS Highland', // 9
           "S12000044": 'NHS Lanarkshire', "S12000029": 'NHS Lanarkshire', // 10
           "S12000010": 'NHS Lothian', "S12000019": 'NHS Lothian', "S12000036": 'NHS Lothian', "S12000040": 'NHS Lothian', // 11
           "S12000023": 'NHS Orkney', // 12
           "S12000027": 'NHS Shetland', // 13
           "S12000024": 'NHS Tayside', "S12000042": 'NHS Tayside', "S12000041": 'NHS Tayside'} // 14

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
var hboColours = { "S12000008": '#5a6c71', "S12000021": '#5a6c71', "S12000028": '#5a6c71', // 1
           "S12000026": '#868d86', // 2
           "S12000006": '#f1b4b2', // 3
           "S12000013": '#808000', // 4
           "S12000015": '#daeabf', // 5
           "S12000030": '#98FB98', "S12000014": '#98FB98', 'S12000005': '#98FB98', // 6
           "S12000033": '#f67c74', "S12000034": '#f67c74', "S12000020": '#f67c74', //7
           "S12000045": '#c27e9e', "S12000046": '#c27e9e', "S12000038": '#c27e9e', "S12000039": '#c27e9e', "S12000018": '#c27e9e', "S12000011": '#c27e9e', // 8
           "S12000017": '#f6d186', "S12000035": '#f6d186', // 9
           "S12000044": '#ECF210', "S12000029": '#ECF210', // 10
           "S12000010": '#EFCC44', "S12000019": '#EFCC44', "S12000036": '#EFCC44', "S12000040": '#EFCC44', // 11
           "S12000023": '#F05E23', // 12
           "S12000027": '#9DC183', // 13
           "S12000024": '#875F9A', "S12000042": '#875F9A', "S12000041": '#875F9A'} // 14
