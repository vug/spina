class Visualizer {
    constructor() {
        if (typeof document.location.search !== "undefined") {
            // temporary solution to set dimensionality.
            // TODO: Get this value from simulation results file.
            dimensions = parseInt(document.location.search.slice(1).split('dim=')[1]);
        }
        this.timeline = document.getElementById('time-slider');
        this.buttonPlay = document.getElementById('button-play');
        this.display = document.getElementById('display');
        this.divIds = ['plot-molecules', 'plot-energies', 'plot-total-potential', 'plot-vel-dist'];
        this.energyPlot = null;
        this.velocityHistogramPlot = null;
        this.moleculeVisualization = null;
        this.potentialVisualization = null;
        this.isPlaying = false;
        this.stepNo = 0;
        this.addListeners();
        this.animate();
    }

    addListeners() {
        var button2DExample = document.getElementById('btn-ex-2D');
        var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';

        inputFile.addEventListener('change', e => loader.loadFile(this.dataFileLoaded.bind(this)), false);

        button2DExample.addEventListener('click', e => loader.requestSimulationData(example2DUrl, this.dataFileLoaded.bind(this)));
        this.buttonPlay.addEventListener('click', () => {
            this.isPlaying ? this.pause() : this.play();
        });
        this.timeline.addEventListener('input', () => {
            this.stepNo = parseInt(this.timeline.value);
            if (data) this.render();
        });
        document.getElementById('number-sps').addEventListener('change', function() {
            var sps = parseInt(this.value);
            ticker.setStepsPerSecond(sps);
        });
    }

    writeInfo() {
        this.display.innerText = 'Step: ' + this.stepNo.toString();
    }

    emptyDivs() {
        for (var divId of this.divIds) {
            document.getElementById(divId).innerHTML = '';
        }
    }

    createVisualizations() {
        this.energyPlot = new EnergiesLineChart('plot-energies');
        this.velocityHistogramPlot = new VelocityHistogram('plot-vel-dist');
        this.moleculeVisualization = new MoleculesVisualization2D('plot-molecules', 300);
        this.potentialVisualization = new TotalPotentialVisualization2D('plot-total-potential', 300);
    }

    play() {
        this.isPlaying = true;
        this.buttonPlay.querySelector('span').classList.toggle('glyphicon-play');
        this.buttonPlay.querySelector('span').classList.toggle('glyphicon-pause');
    }

    pause() {
        this.isPlaying = false;
        ticker.prevFrameTime = undefined;
        ticker.tickerTime = 0.0;
        this.buttonPlay.querySelector('span').classList.toggle('glyphicon-play');
        this.buttonPlay.querySelector('span').classList.toggle('glyphicon-pause');
    }

    animate() {
        if(this.isPlaying) {
            this.stepNo += ticker.tick();
            if( this.stepNo >= numFrames ) {
                this.stepNo = 0;
            }
            this.timeline.value = this.stepNo;
            this.render();
        }
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.writeInfo();
        this.moleculeVisualization.render(data, this.stepNo);
        this.velocityHistogramPlot.updateDistribution(data, this.stepNo);
        this.energyPlot.updateStepNoIndicator(this.stepNo);
        this.potentialVisualization.render(data, this.stepNo);
    }

    dataFileLoaded(simData) {
        data = simData;
        this.stepNo = 0;
        numFrames = data.length;
        kin = data.map(step => step['kin']);
        pot = data.map(step => step['pot']);
        ene = data.map(step => step['ene']);
        this.timeline.max = numFrames - 1;
        this.emptyDivs();
        this.createVisualizations();
        this.energyPlot.updateEnergyData(kin, pot, ene);
        this.velocityHistogramPlot.updateLayout(data);
        this.potentialVisualization.updateData(data);
        this.render();
    }
}

var inputFile = document.getElementById('input-file');
var data;
var dimensions = 2;
var numFrames;
var kin, pot, ene;

var vis = new Visualizer();
var ticker = new Ticker();
var loader = new SimulationResultLoader();


