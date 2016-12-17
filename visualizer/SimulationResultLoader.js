class SimulationResultLoader {
    loadFile(file, callback) {
        var reader = new FileReader();
        reader.onload = e => {
            var content = e.target.result;
            var data = JSON.parse(content);
            callback(data);
        };
        console.log('loading:', file.name, file.size, file.type);
        reader.readAsText(file);
    }

    requestSimulationData(url, callback) {
        console.log('ajax request sent.');
        $.getJSON(url, function(jsonData) {
            console.log('ajax response returned.');
            callback(jsonData);
        });
    }
}
