var timeline = document.getElementById('time-slider');
var buttonPlay = document.getElementById('button-play');
var display = document.getElementById('display');
var isPlaying = false;
var stepNo = 0;
var prevFrameTime = undefined;
var tickerTime = 0.0;
var stepsPerSecond = 30;
var stepDuration = 1000 / stepsPerSecond;

function init() {
    addListeners();
    createVelocityHistogram();
    createEnergyPlot();    
    requestAnimationFrame(play);    
}

function addListeners() {
    inputFile.addEventListener('change', e => loadFile(dataFileLoaded), false);
    buttonPlay.addEventListener('click', function() { 
        isPlaying ? pause() : start(); 
    });
    timeline.addEventListener('input', function() { 
        stepNo = parseInt(timeline.value);
        render();
    });
    document.getElementById('number-sps').addEventListener('change', function(e) {
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
    updateEnergies();
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
    visualizeMolecules();
    updateVelocityHistogram();
    updateEnergyStepLine();
}

function writeInfo() {
    var infoText = 'Step: ' + stepNo.toString();
    display.innerText = infoText;
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
