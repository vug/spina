class Visualizer {
    constructor(ticker) {
        this.ticker = ticker;
        this.uiCallback = null;

        this.dimensions = 2;
        if (typeof document.location.search !== "undefined") {
            // temporary solution to set dimensionality.
            // TODO: Get this value from simulation results file.
            this.dimensions = parseInt(document.location.search.slice(1).split('dim=')[1]);
        }

        this.energyPlot = null;
        this.velocityHistogramPlot = null;
        this.moleculeVisualization = null;
        this.potentialVisualization = null;
        this.isPlaying = false;
        this.stepNo = 0;
        this.simData = null;
        this.numSteps = 0;
        this.animate();
    }

    createVisualizations() {
        this.energyPlot = new EnergiesLineChart('plot-energies');
        this.velocityHistogramPlot = new VelocityHistogram('plot-vel-dist');
        this.moleculeVisualization = new MoleculesVisualization2D('plot-molecules', 300);
        this.potentialVisualization = new TotalPotentialVisualization2D('plot-total-potential', 300);
    }

    animate() {
        if(this.isPlaying) {
            this.stepNo += this.ticker.tick();
            if( this.stepNo >= this.numSteps ) {
                this.stepNo = 0;
            }
            if(this.uiCallback) this.uiCallback(this.stepNo);
            this.render();
        }
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.moleculeVisualization.render(this.simData, this.stepNo);
        this.velocityHistogramPlot.updateDistribution(this.simData, this.stepNo);
        this.energyPlot.updateStepNoIndicator(this.stepNo);
        this.potentialVisualization.render(this.simData, this.stepNo);
    }

    dataFileLoaded(simData) {
        this.simData = simData;
        this.stepNo = 0;
        this.numSteps = this.simData.length;
        var kin = this.simData.map(step => step['kin']);
        var pot = this.simData.map(step => step['pot']);
        var ene = this.simData.map(step => step['ene']);
        this.createVisualizations();
        this.energyPlot.updateEnergyData(kin, pot, ene);
        this.velocityHistogramPlot.updateLayout(this.simData);
        this.potentialVisualization.updateData(this.simData);
        this.render();
    }
}

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
        document.getElementById('number-sps').addEventListener('change', function() {
            var sps = parseInt(this.value);
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

class App {
    constructor() {
        this.loader = new SimulationResultLoader();
        this.ticker = new Ticker();
        this.visualizer = new Visualizer(this.ticker);
        this.ui = new UI(this.visualizer, this.loader, this.ticker);
    }
}

var app = new App();
