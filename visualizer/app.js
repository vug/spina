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
        this.addListeners();
        this.animate();
    }

    addListeners() {
        var button2DExample = document.getElementById('btn-ex-2D');
        var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';

        inputFile.addEventListener('change', e => loadFile(this.dataFileLoaded.bind(this)), false);

        button2DExample.addEventListener('click', e => requestSimulationData(example2DUrl, this.dataFileLoaded.bind(this)));
        this.buttonPlay.addEventListener('click', () => {
            this.isPlaying ? this.pause() : this.play();
        });
        this.timeline.addEventListener('input', () => {
            stepNo = parseInt(this.timeline.value);
            if (data) this.render();
        });
        document.getElementById('number-sps').addEventListener('change', function() {
            var sps = parseInt(this.value);
            ticker.setStepsPerSecond(sps);
        });
    }

    writeInfo() {
        this.display.innerText = 'Step: ' + stepNo.toString();
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
            stepNo += ticker.tick();
            if( stepNo >= numFrames ) {
                stepNo = 0;
            }
            this.timeline.value = stepNo;
            this.render();
        }
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.writeInfo();
        this.moleculeVisualization.render(data, stepNo);
        this.velocityHistogramPlot.updateDistribution(data, stepNo);
        this.energyPlot.updateStepNoIndicator(stepNo);
        this.potentialVisualization.render(data, stepNo);
    }

    dataFileLoaded(simData) {
        data = simData;
        stepNo = 0;
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

class Ticker {
    constructor() {
        this.stepsPerSecond = 30;
        this.stepDuration = 1000 / this.stepsPerSecond;
        this.prevFrameTime = undefined;
        this.tickerTime = 0.0;
    }

    tick() {
        var now = performance.now();
        var dt = now - (this.prevFrameTime || now);  // in milliseconds
        var deltaStepNo = 0;
        if (this.tickerTime >= 1000 / this.stepsPerSecond) {
            var quotient = this.tickerTime / this.stepDuration;
            deltaStepNo = Math.floor(quotient);
            this.tickerTime %= this.stepDuration;
        }
        this.tickerTime += dt;
        this.prevFrameTime = now;
        return deltaStepNo;
    }

    setStepsPerSecond(sps) {
        this.stepsPerSecond = sps;
        this.stepDuration = 1000 / sps;
        this.tickerTime = 0.0;
    }
}

var vis = new Visualizer();
var ticker = new Ticker();

var stepNo = 0;
var data;
var dimensions = 2;
