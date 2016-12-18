class UI {
    constructor(visualizer, loader, ticker) {
        this.visualizer = visualizer;
        this.loader = loader;
        this.ticker = ticker;

        this.buttonPlay = document.getElementById('button-play');
        this.button2DExample = document.getElementById('btn-ex-2D');
        this.inputSPS = document.getElementById('number-sps');
        this.inputFile = document.getElementById('input-file');
        this.timeline = document.getElementById('time-slider');
        this.display = document.getElementById('display');
        this.divIds = ['plot-molecules', 'plot-energies', 'plot-total-potential', 'plot-vel-dist'];
        this.loading = document.getElementById('loading');

        this.addListeners();
        this.visualizer.uiCallback = this.callback.bind(this);
    }

    addListeners() {
        var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';

        this.inputFile.addEventListener('change', e => {
            var selectedFile = this.inputFile.files[0];
            this.loading.setAttribute('class', 'glyphicon glyphicon-refresh glyphicon-spin');
            this.loader.loadFile(selectedFile, this.simulationResultLoaded.bind(this));
        }, false);

        this.button2DExample.addEventListener('click', e => {
            this.loading.setAttribute('class', 'glyphicon glyphicon-refresh glyphicon-spin');
            this.loader.requestSimulationData(example2DUrl, this.simulationResultLoaded.bind(this));
        });
        this.buttonPlay.addEventListener('click', () => {
            this.visualizer.isPlaying ? this.pause() : this.play();
        });
        this.timeline.addEventListener('input', () => {
            this.visualizer.stepNo = parseInt(this.timeline.value);
            this.display.innerText = 'Step: ' + this.visualizer.stepNo.toString();
            if (this.visualizer.simData) this.visualizer.render();
        });
        this.inputSPS.addEventListener('change', () => {
            var sps = parseInt(this.inputSPS.value);
            this.ticker.setStepsPerSecond(sps);
        });
    }

    play() {
        this.visualizer.isPlaying = true;
        this.buttonPlay.querySelector('span').classList.toggle('glyphicon-play');
        this.buttonPlay.querySelector('span').classList.toggle('glyphicon-pause');
    }

    pause() {
        this.visualizer.isPlaying = false;
        this.ticker.prevFrameTime = undefined;
        this.ticker.tickerTime = 0.0;
        this.buttonPlay.querySelector('span').classList.toggle('glyphicon-play');
        this.buttonPlay.querySelector('span').classList.toggle('glyphicon-pause');
    }

    emptyDivs() {
        for (var divId of this.divIds) {
            document.getElementById(divId).innerHTML = '';
        }
    }

    simulationResultLoaded(simData) {
        this.emptyDivs();
        this.timeline.max = simData.length - 1;
        this.timeline.value = 0;
        this.visualizer.dataFileLoaded(simData);
        this.loading.setAttribute('class', '');
    }

    callback(stepNo) {
        this.timeline.value = stepNo;
        this.display.innerText = 'Step: ' + stepNo.toString();
    }
}
