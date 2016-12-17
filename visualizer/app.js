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
        this.addListeners();
        requestAnimationFrame(play);
    }

    addListeners() {
        var button2DExample = document.getElementById('btn-ex-2D');
        var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';

        inputFile.addEventListener('change', e => loadFile(dataFileLoaded), false);

        button2DExample.addEventListener('click', e => requestSimulationData(example2DUrl, dataFileLoaded));
        this.buttonPlay.addEventListener('click', function() {
            isPlaying ? pause() : start();
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
}

var vis = new Visualizer();


var isPlaying = false;
var stepNo = 0;
var prevFrameTime = undefined;
var tickerTime = 0.0;
var stepsPerSecond = 30;
var stepDuration = 1000 / stepsPerSecond;
var dimensions = 2;

var energyPlot;
var velocityHistogramPlot;
var moleculeVisualization;
var potentialVisualization;


function dataFileLoaded() {
    stepNo = 0;
    numFrames = data.length;
    kin = data.map(step => step['kin']);
    pot = data.map(step => step['pot']);
    ene = data.map(step => step['ene']);
    vis.timeline.max = numFrames - 1;
    vis.emptyDivs();
    createVisualizations();
    energyPlot.updateEnergyData(kin, pot, ene);
    velocityHistogramPlot.updateLayout(data);
    potentialVisualization.updateData(data);
    render();
}

function createVisualizations() {
    energyPlot = new EnergiesLineChart('plot-energies');
    velocityHistogramPlot = new VelocityHistogram('plot-vel-dist');
    moleculeVisualization = new MoleculesVisualization2D('plot-molecules', 300);
    potentialVisualization = new TotalPotentialVisualization2D('plot-total-potential', 300);
}

function start() {
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
    moleculeVisualization.render(data, stepNo);
    velocityHistogramPlot.updateDistribution(data, stepNo);
    energyPlot.updateStepNoIndicator(stepNo);
    potentialVisualization.render(data, stepNo);
}

function setStepsPerSecond(sps) {
    stepsPerSecond = sps;
    stepDuration = 1000 / sps;
    tickerTime = 0.0;
}

function play() {
    if(isPlaying) {
        tick();
        if( stepNo >= numFrames ) {
            stepNo = 0;
        }       
        vis.timeline.value = stepNo;
        render();
    }
    requestAnimationFrame(play)
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
