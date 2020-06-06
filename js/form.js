area = 'sco'
lad='national'
parsed = 0

// Function 1.2
// Toggle the collapsible 'How To'
function toggle_collapse()
{
    var coll = document.getElementById("howToCol");
    coll.classList.toggle("active");

    var content = coll.nextElementSibling;

    if (content.style.maxHeight)
    {
        content.style.maxHeight = null;
    }
    else
    {
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

// Function 1.3
// Selects the LAD JSON for Scotland
function update_lad_select()
{
    options_string = '<option value="national">National</option><option disabled>──────────</option>';
    for (var key in s_lads) {
        if (s_lads.hasOwnProperty(key)) {
            options_string += '<option value=' + key + '>' + s_lads[key] + '</option>';
        }
    }
    d3.select('#lad').html(options_string);
}

// Function 1.1
// Reponsible for loading the map and toggling initial visibilities when LAD
// or HBO are selected
function change_area()
{
    // Remove all previous content from webpage
    d3.selectAll("*").select("svg").remove();

    // Populate the dropdown to select an area
    populate_res_select();

    document.getElementById("chooseHint").style.display="block";
    document.getElementById("ladDoc").style.display="none";
    document.getElementById('hoverText').style.display = 'none';
    document.getElementById("howToCol").classList.toggle("active");

    var howToCol = document.getElementById("howToCol").nextElementSibling;
    howToCol.style.maxHeight = howToCol.scrollHeight + "px";


    d3.select('#download').html("");

    // Load defualt values (hard coded for specific JSON even when units = HBO)
    var units = 'lad';
    var area = 'sco'
    var f = 'json/' + area + '/topo_' + units + '.json';
    d3.select('#download').attr('href', f).attr('target', '_blank').text('download topoJSON');
    load_data(f, units);
}

// Function 1.4
// Remove all options in the dropdown for area select
function clean_select()
{
    var len = document.getElementById("areaSelect").length;

    for (var i = len-1; i >= 0; --i)
    {
        document.getElementById("areaSelect").remove(i);
    }
}

// Function 1.5
// Populate all options in the select menu
function populate_res_select()
{
    document.getElementById('selectedArea').style.display = 'block';

    get_resolution();
    clean_select();

    // Null options
    var districts = ['-'];
    var keys = ['-'];

    if (res == 'lad')
    {
        districtList = Object.values(idToName);
        keysList = Object.keys(idToName);
        districts = districts.concat(districtList);
        keys = keys.concat(keysList);
    }
    if (res == 'hbo')
    {
        var messyKeys = Object.keys(idToHBO);

        // Create unique arrays
        for (var i = 0; i < messyKeys.length; ++i)
        {
            if (!districts.includes(idToHBO[messyKeys[i]]))
            {
                keys.push(messyKeys[i]);
                districts.push(idToHBO[messyKeys[i]]);
            }
        }
    }
    // Hide the 'Selected Area' dropdown as not needed
    if (res == 'nat')
    {
        document.getElementById('selectedArea').style.display = 'none';
    }

    for (var i = 0; i < districts.length; ++i)
    {
        // Create an Option object
        var opt = document.createElement("option");

        // Assign text and value to Option object
        opt.text = districts[i];
        opt.value = keys[i];

        // Add an Option object to Drop Down List Box
        document.getElementById('areaSelect').options.add(opt);
    }
}

d3.select('#lad').on('change', function(){
    change_area();
});

d3.select("#top_level").on('change', function(){
    update_lad_select();
    change_area();
});

d3.select("#resolution").on('change', function(){
    change_area();
    populate_res_select();
    parsed = 0
});

d3.select("#areaSelect").on('change', function(){
    select_from_dropdown();
});

d3.select("#criteria").on('change', function(){
    change_area();
});

d3.select("#filter").on('change', function(){
    change_area();
});

d3.selectAll('button').on('click', zoomClick);

update_lad_select();
change_area();

healthBoardToID = {
    0: "-",
    1: "S12000008",
    2: "S12000026",
    3: "S12000006",
    4: "S12000013",
    5: "S12000015",
    6: "S12000030",
    7: "S12000033",
    8: "S12000045",
    9: "S12000017",
    10: "S12000044",
    11: "S12000010",
    12: "S12000023",
    13: "S12000027",
    14: "S12000024"
}
