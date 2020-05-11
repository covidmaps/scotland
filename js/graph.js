
// import and read the required csv file
function readGraph(file) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", "https://markjswan.github.io/covid-maps/json/sco/"+ /*res*/ file +".json", false ); // false for synchronous request
    xmlHttp.send( null );
    mapStats = JSON.parse(xmlHttp.responseText);
}

function graph_init(id){

    var health_board = hboDistricts[id];

    console.log("ID: " + id);
    console.log("Health Board " + health_board);
}

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
