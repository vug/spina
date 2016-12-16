var inputFile = document.getElementById('input-file');
var numFrames;
var kin, pot, ene;
var data;

function loadFile(callback) {
    var selectedFile = inputFile.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var content = e.target.result;
        data = JSON.parse(content);
        callback();
    };
    console.log('loading:', selectedFile.name, selectedFile.size, selectedFile.type);
    reader.readAsText(selectedFile);    
}

function requestSimulationData(url, callback) {
    console.log('ajax request sent.');
    $.getJSON(url, function(json) {
        console.log('ajax response returned.');
        data = json;
        callback();
    });
}
