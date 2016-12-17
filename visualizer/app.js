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
        this.addListeners();
        requestAnimationFrame(animate);
    }

    addListeners() {
        var button2DExample = document.getElementById('btn-ex-2D');
        var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';

        inputFile.addEventListener('change', e => loadFile(dataFileLoaded), false);

        button2DExample.addEventListener('click', e => requestSimulationData(example2DUrl, dataFileLoaded));
        this.buttonPlay.addEventListener('click', function() {
            isPlaying ? pause() : play();
        });
        this.timeline.addEventListener('input', () => {
            stepNo = parseInt(this.timeline.value);
            if (data) render();
        });
        document.getElementById('number-sps').addEventListener('change', function() {
            var sps = parseInt(this.value);
            setStepsPerSecond(sps);
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
}

var vis = new Visualizer();


var isPlaying = false;
var stepNo = 0;
var prevFrameTime = undefined;
var tickerTime = 0.0;
var stepsPerSecond = 30;
var stepDuration = 1000 / stepsPerSecond;
var dimensions = 2;

function dataFileLoaded() {
    stepNo = 0;
    numFrames = data.length;
    kin = data.map(step => step['kin']);
    pot = data.map(step => step['pot']);
    ene = data.map(step => step['ene']);
    vis.timeline.max = numFrames - 1;
    vis.emptyDivs();
    vis.createVisualizations();
    vis.energyPlot.updateEnergyData(kin, pot, ene);
    vis.velocityHistogramPlot.updateLayout(data);
    vis.potentialVisualization.updateData(data);
    render();
}

function play() {
    isPlaying = true;
    vis.buttonPlay.querySelector('span').classList.toggle('glyphicon-play');
    vis.buttonPlay.querySelector('span').classList.toggle('glyphicon-pause');
}

function pause() {
    isPlaying = false;
    prevFrameTime = undefined;
    tickerTime = 0.0;
    vis.buttonPlay.querySelector('span').classList.toggle('glyphicon-play');
    vis.buttonPlay.querySelector('span').classList.toggle('glyphicon-pause');
}

function render() {
    vis.writeInfo();
    vis.moleculeVisualization.render(data, stepNo);
    vis.velocityHistogramPlot.updateDistribution(data, stepNo);
    vis.energyPlot.updateStepNoIndicator(stepNo);
    vis.potentialVisualization.render(data, stepNo);
}

function setStepsPerSecond(sps) {
    stepsPerSecond = sps;
    stepDuration = 1000 / sps;
    tickerTime = 0.0;
}

function animate() {
    if(isPlaying) {
        tick();
        if( stepNo >= numFrames ) {
            stepNo = 0;
        }       
        vis.timeline.value = stepNo;
        render();
    }
    requestAnimationFrame(animate)
}

function tick() {
    var now = performance.now();
    var dt = now - (prevFrameTime || now);  // in milliseconds
    if (tickerTime >= 1000 / stepsPerSecond) {
        var quotient = tickerTime / stepDuration;
        stepNo += Math.floor(quotient);
        tickerTime %= stepDuration;
    }
    tickerTime += dt;
    prevFrameTime = now;
}
