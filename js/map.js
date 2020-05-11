/*
TODO:
 [] change key in HBO mode
 [] remove LAD borders in HBO mode
 [X] Add multiple districts to be highlighted in hover mode
 [] Improve how countries are sorted by health district
 perhaps this can be done by having two dicts (1. board No. to colour
2. district to board no.)
 []
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

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

function zoomed() {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

//
function readJSON() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://markjswan.github.io/covid-maps/json/sco/"+ /*res*/ "new_test3" +".json", false ); // false for synchronous request
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
        .attr("height", height)
        /* UNEXPECTED '.' WHEN LOADING PAGE
        .call(d3.zoom().on("zoom", function () {
           svg.attr("transform", d3.event.transform)
       })) */
       ;

    // graphics go here
    g = svg.append("g");


    svg
        .call(zoom)
        .call(zoom.event);

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
function create_table(properties, id) {
    table_string = "<table>";
    if (id != undefined){
        var keys = Object.keys(mapStats);
        table_string += "<th>Property</th><th>Value</th>";
        for (var i = 0; i < keys.length; i++) {
            table_string += "<tr><td>" + prettify(keys[i]) + "</td><td>" + mapStats[keys[i]][id] + "</td></tr>";
        }
    }
    table_string += "</table>";
    return table_string;
}

// Return a better looking version of property
var prettyProps = {'lad':"District", "all_deaths_hospital": "Hospital Deaths", 'all_deaths_carehome': "Carehome Deaths",
                'all_deaths_non-institution': "Non-Institution Deaths", 'all_deaths_other': "Other Deaths",
            'all_deaths_total': "Total Deaths", 'covid_deaths_hospital': "COVID Hospital Deaths",
        'covid_deaths_carehome': "COVID Carehome Deaths", 'covid_deaths_non-institution': "COVID Non-Institution Deaths",
    'covid_deaths_other': "COVID Other Deaths", 'covid_deaths_total': "COVID Total Deaths",
    'ratio_hospital_death_covid': "Ratio of COVID hospital deaths", 'ratio_carehome_death_covid': "Ratio of COVID Carehome Deaths",
    'ratio_total_death_covid': "Ratio of Total COVID Deaths"}

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
        .html(create_table(d.properties, d.id));
        //TODO: SELECT ALL OTHER DISTRICTS IN THE SAME HBO
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
  var x = document.getElementById("key");
  if (res === 'hbo') {
    x.style.display = "none";
  }
  else {
    x.style.display = "block";
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
        .attr("properties_table", function(d) { return create_table(d.properties)})
        .attr("d", path)
        .on("mouseover", function(d){ return select(d)});


    colourMap();

    // add a boundary between areas
    g.append("path")
        .datum(topojson.mesh(boundaries, boundaries.objects[units], function(a, b){ return a !== b }))
        .attr('d', path)
        .attr('class', 'boundary');
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

hboColours = { "S12000008": '#1261A0', "S12000021": '#1261A0', "S12000028": '#1261A0', // 1
            "S12000026": '#FF0000', // 2
            "S12000006": '#654321', // 3
            "S12000013": '#708238', // 4
            "S12000015": '#00FFFF', // 5
            "S12000030": '#A45A52', "S12000014": '#A45A52', 'S12000005': '#A45A52', // 6
            "S12000033": '#FF8D1E', "S12000034": '#FF8D1E', "S12000020": '#FF8D1E', //7
            "S12000045": '#00FF00', "S12000046": '#00FF00', "S12000038": '#00FF00', "S12000039": '#00FF00', "S12000018": '#00FF00', "S12000011": '#00FF00', // 8
            "S12000017": '#9F00FF', "S12000035": '#9F00FF', // 9
            "S12000044": '#ECF210', "S12000029": '#ECF210', // 10
            "S12000010": '#4B0082', "S12000019": '#4B0082', "S12000036": '#4B0082', "S12000040": '#4B0082', // 11
            "S12000023": '#F05E23', // 12
            "S12000027": '#9DC183', // 13
            "S12000024": '#EFCC44', "S12000042": '#EFCC44', "S12000041": '#EFCC44'} // 14

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

function get_resolution(){
    var top_level_select = document.getElementById('resolution');
    res = top_level_select.options[top_level_select.selectedIndex].value;
}

// loads data from the given file and redraws the map
function load_data(filename, u) {

    get_resolution();

    update_criteria();

    // Toggle the visibility of the key
    toggle_key();

    // clear any selection
    deselect();

    //Import the map data
    readJSON();

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
