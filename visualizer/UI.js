class UI {
    constructor(visualizer, loader, ticker) {
        this.visualizer = visualizer;
        this.loader = loader;
        this.ticker = ticker;

        this.buttonPlay = document.getElementById('button-play');
        this.button2DExample = document.getElementById('btn-ex-2D');
        this.button3DExample = document.getElementById('btn-ex-3D');
        this.inputSPS = document.getElementById('number-sps');
        this.inputFile = document.getElementById('input-file');
        this.timeline = document.getElementById('time-slider');
        this.display = document.getElementById('display');
        this.divIds = ['plot-molecules', 'plot-energies', 'plot-total-potential', 'plot-vel-dist'];
        this.loading = document.getElementById('loading');

        this.addListeners();
        // this.visualizer.uiCallback = this.callback.bind(this);
    }

    addListeners() {
        var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';
        var example3DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_3D.json';

        this.inputFile.addEventListener('change', e => {
            var selectedFile = this.inputFile.files[0];
            this.loading.setAttribute('class', 'glyphicon glyphicon-refresh glyphicon-spin');
            this.loader.loadFile(selectedFile, this.simulationResultLoaded.bind(this));
        }, false);

        this.button2DExample.addEventListener('click', e => {
            this.loading.setAttribute('class', 'glyphicon glyphicon-refresh glyphicon-spin');
            this.loader.requestSimulationData(example2DUrl, this.simulationResultLoaded.bind(this));
        });
    }

    emptyDivs() {
        for (var divId of this.divIds) {
            document.getElementById(divId).innerHTML = '';
        }
    }

    simulationResultLoaded(simData) {
        this.emptyDivs();
        document.getElementById('time-slider').max = simData.length - 1;
        document.getElementById('time-slider').value = 0;
        this.visualizer.dataFileLoaded(simData);
        this.loading.setAttribute('class', '');
    }
}
