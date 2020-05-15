area = 'sco'
lad='national'

function toggle_collapse(){
    var coll = document.getElementById("howToCol");
    coll.classList.toggle("active");
    var content = coll.nextElementSibling;
    if (content.style.maxHeight){
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

function update_lad_select() {
    /*
    var top_level_select = document.getElementById('top_level');
    var area = top_level_select.options[top_level_select.selectedIndex].value;
    */
    options_string = '<option value="national">National</option><option disabled>──────────</option>';
    for (var key in s_lads) {
        if (s_lads.hasOwnProperty(key)) {
            options_string += '<option value=' + key + '>' + s_lads[key] + '</option>';
        }
    }
        /*
    } else if(area === 'wal') {
        for (var key in w_lads) {
            if (w_lads.hasOwnProperty(key)) {
                options_string += '<option value=' + key + '>' + w_lads[key] + '</option>';
            }
        }
    }
    */
    d3.select('#lad').html(options_string);
}


function update_resolution_select() {
    //var top_level_select = document.getElementById('top_level');
    //var area = top_level_select.options[top_level_select.selectedIndex].value;

    var lad_select = 'national'
    //var lad = lad_select.options[lad_select.selectedIndex].value;

    options_string = '';
    options_string += '<option value="eer">European Electoral Regions</option><option value="wpc">Westminster Parliamentary Constituencies</option><option value="wards">Westminster Parliamentary Wards</option><option value="lad">Local Authority Districts</option>';
    //Currently only Scotland being used
    /*
    if(area === 'wal') {
        options_string += '<option value = "nawc">National Assembly Wales Constituencies</option>';
        options_string += '<option value = "nawer">National Assembly Wales Electoral Regions</option>';
    } else if(area === 'sco') {
        */
        options_string += '<option value = "spc">Scottish Parliament Constituencies</option>';
        options_string += '<option value = "sper">Scottish Parliament Electoral Regions</option>';
        /*
    } else if (area === 'ni') {
        options_string = '<option value="wpc">Westminster Parliamentary Constituencies</option><option value="wards">Westminster Parliamentary Wards</option><option value="lgd">Local Government Districts</option>';
    }
    */
    //options_string += '<option value="oa">Output Areas</option>';
    d3.select('#resolution').html(options_string);

    p
}


function change_area() {
    // remove all previous content from webpage
    d3.selectAll("*").select("svg").remove();

    populate_res_select();

    document.getElementById("chooseHint").style.display="block";
    document.getElementById("ladDoc").style.display="none";
    document.getElementById('hoverText').style.display = 'none';
    document.getElementById("howToCol").classList.toggle("active");
    document.getElementById("howToCol").nextElementSibling.style.maxHeight = document.getElementById("howToCol").nextElementSibling.scrollHeight + "px";


    d3.select('#download').html("");
    //var resolution_select = document.getElementById('resolution');
    //units = resolution_select.options[resolution_select.selectedIndex].value;
    units = 'lad';

    var area = 'sco'
    var f = 'json/' + area + '/topo_' + units + '.json';
    d3.select('#download').attr('href', f).attr('target', '_blank').text('download topoJSON');
    load_data(f, units);
}

function populate_res_select()
{
    var districts = Object.values(idToName);
    var keys = Object.keys(idToName);

    for (var i = 0; i < districts.length; ++i) {
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
    update_resolution_select();
    change_area();
});

d3.select("#top_level").on('change', function(){
    update_lad_select();
    update_resolution_select();
    change_area();
});

d3.select("#resolution").on('change', function(){
    change_area();
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
