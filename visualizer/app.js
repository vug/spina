var timeline = document.getElementById('time-slider');
var buttonPlay = document.getElementById('button-play');
var button2DExample = document.getElementById('btn-ex-2D');
var display = document.getElementById('display');
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


function init() {
    if (typeof document.location.search !== "undefined") {
        // temporary solution to set dimensionality.
        // TODO: Get this value from simulation results file.
        dimensions = parseInt(document.location.search.slice(1).split('dim=')[1]);
    }
    addListeners();
    energyPlot = new EnergiesLineChart('plot-energies');
    velocityHistogramPlot = new VelocityHistogram('plot-vel-dist');
    moleculeVisualization = new MoleculesVisualization2D('canvas');
    requestAnimationFrame(play);    
}

function addListeners() {
    inputFile.addEventListener('change', e => loadFile(dataFileLoaded), false);
    var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';
    button2DExample.addEventListener('click', e => requestSimulationData(example2DUrl, dataFileLoaded));
    buttonPlay.addEventListener('click', function() { 
        isPlaying ? pause() : start(); 
    });
    timeline.addEventListener('input', function() { 
        stepNo = parseInt(timeline.value);
        render();
    });
    document.getElementById('number-sps').addEventListener('change', function() {
        var sps = parseInt(this.value);
        setStepsPerSecond(sps);
    });    
}

function dataFileLoaded() {
    stepNo = 0;
    numFrames = data.length;
    kin = data.map(step => step['kin']);
    pot = data.map(step => step['pot']);
    ene = data.map(step => step['ene']);
    timeline.max = numFrames - 1;
    potentialVisualization = new TotalPotentialVisualization2D('plot-total-potential', vertexShader, fragmentShader);
    energyPlot.updateEnergies(kin, pot, ene);
    velocityHistogramPlot.updateLayout(data);
    render();
}

function start() {
    isPlaying = true;
    buttonPlay.querySelector('span').classList.toggle('glyphicon-play');
    buttonPlay.querySelector('span').classList.toggle('glyphicon-pause');
}

function pause() {
    isPlaying = false;
    prevFrameTime = undefined;
    tickerTime = 0.0;
    buttonPlay.querySelector('span').classList.toggle('glyphicon-play');
    buttonPlay.querySelector('span').classList.toggle('glyphicon-pause');
}

function render() {
    writeInfo();
    moleculeVisualization.render(data, stepNo);
    velocityHistogramPlot.updateHistogram(data);
    energyPlot.updateEnergyStepLine(stepNo);
    potentialVisualization.render(data, stepNo);
}

function writeInfo() {
    display.innerText = 'Step: ' + stepNo.toString();
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
        timeline.value = stepNo;
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

init();
