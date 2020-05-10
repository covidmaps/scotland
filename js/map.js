/*
TODO:
 - change key in HBO mode
 - remove LAD borders in HBO mode
 - Add multiple districts to be highlighted in hover mode
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

//
function readJSON() {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://markjswan.github.io/covid-maps/json/sco/"+ /*res*/ "new_test3" +".json", false ); // false for synchronous request
    xmlHttp.send( null );
    mapStats = JSON.parse(xmlHttp.responseText);
    console.log(mapStats);
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
        .attr("height", height);
        /* UNEXPECTED '.' WHEN LOADING PAGE
        .call(d3.zoom().on("zoom", function () {
           svg.attr("transform", d3.event.transform)
        }))
        */

    // graphics go here
    g = svg.append("g");

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
    // add the area properties to the data_table section
    d3.select("#data_table")
        .html(create_table(d.properties, d.id));
        //TODO: SELECT ALL OTHER DISTRICTS IN THE SAME HBO
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
    console.log(mapStats);
    console.log(criteria);
    console.log(dict);
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
    console.log(res);
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
    console.log(id);
    console.log(sorted.indexOf(id));
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

hboColours = { "S12000008": '#a43829', "S12000021": '#a43829', "S12000028": '#a43829', // 1
            "S12000026": '#1d168e', // 2
            "S12000006": '#d51654', // 3
            "S12000013": '#6e27b8', // 4
            "S12000015": '#e66d66', // 5
            "S12000030": '#42cc82', "S12000014": '#42cc82', 'S12000005': '#42cc82', // 6
            "S12000033": '#655a79', "S12000034": '#655a79', "S12000020": '#655a79', //7
            "S12000045": '#df4d2e', "S12000046": '#df4d2e', "S12000038": '#df4d2e', "S12000039": '#df4d2e', "S12000018": '#df4d2e', "S12000011": '#df4d2e', // 8
            "S12000017": '#93d7c0', "S12000035": '#93d7c0', // 9
            "S12000044": '#85bf1d', "S12000029": '#85bf1d', // 10
            "S12000010": '#ff0000', "S12000019": '#ff0000', "S12000036": '#ff0000', "S12000040": '#ff0000', // 11
            "S12000023": '#ffff00', // 12
            "S12000027": '#ff00f2', // 13
            "S12000024": '#0800ff', "S12000042": '#0800ff', "S12000041": '#0800ff'} // 14

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
