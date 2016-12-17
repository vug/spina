class UI {
    constructor(visualizer, loader, ticker) {
        this.visualizer = visualizer;
        this.loader = loader;
        this.ticker = ticker;

        this.buttonPlay = document.getElementById('button-play');
        this.inputFile = document.getElementById('input-file');
        this.timeline = document.getElementById('time-slider');
        this.display = document.getElementById('display');
        this.divIds = ['plot-molecules', 'plot-energies', 'plot-total-potential', 'plot-vel-dist'];

        this.addListeners();
        this.visualizer.uiCallback = this.callback.bind(this);
    }

    addListeners() {
        var button2DExample = document.getElementById('btn-ex-2D');
        var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';
        var inputSPS = document.getElementById('number-sps');

        this.inputFile.addEventListener('change', e => {
            var selectedFile = this.inputFile.files[0];
            this.loader.loadFile(selectedFile, this.simulationResultLoaded.bind(this));
        }, false);

        button2DExample.addEventListener('click', e => {
            this.loader.requestSimulationData(example2DUrl, this.visualizer.dataFileLoaded.bind(this.visualizer))
        });
        this.buttonPlay.addEventListener('click', () => {
            this.visualizer.isPlaying ? this.pause() : this.play();
        });
        this.timeline.addEventListener('input', () => {
            this.visualizer.stepNo = parseInt(this.timeline.value);
            if (this.visualizer.simData) this.visualizer.render();
        });
        inputSPS.addEventListener('change', () => {
            var sps = parseInt(inputSPS.value);
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
        this.visualizer.dataFileLoaded(simData);
    }

    callback(stepNo) {
        this.timeline.value = stepNo;
        this.display.innerText = 'Step: ' + stepNo.toString();
    }
}
