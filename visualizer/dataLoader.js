var inputFile = document.getElementById('input-file');
var numFrames;
var kin, pot, ene;

function loadFile(callback) {
    var selectedFile = inputFile.files[0];
    var reader = new FileReader();
    reader.onload = e => {
        var content = e.target.result;
        var data = JSON.parse(content);
        callback(data);
    };
    console.log('loading:', selectedFile.name, selectedFile.size, selectedFile.type);
    reader.readAsText(selectedFile);    
}

function requestSimulationData(url, callback) {
    console.log('ajax request sent.');
    $.getJSON(url, function(jsonData) {
        console.log('ajax response returned.');
        callback(jsonData);
    });
}
