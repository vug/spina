var loader = new SimulationResultLoader();
var ticker = new Ticker();
var visualizer = new Visualizer(ticker);

visualizer.uiCallback = function (stepNo) {
    // If an explicit change based on stepNo has to be made, put it here.
};

function resizeVisualization(name) {
    var size = parseInt(vm.layout[name].style.width.split('px')[0]);

    // Sleeping 50 ms before calling newPlot is a hack. Should find a more robust solution.
    switch(name) {
        case 'mol':
            if (visualizer.dimensions === 3) {
                visualizer.moleculeVisualization.setSize(size);
            }
            else {
                visualizer.moleculeVisualization = new MoleculesVisualization2D('plot-molecules', size);
                visualizer.moleculeVisualization.render(visualizer.simData, visualizer.stepNo);
            }
            break;
        case 'pot':
            visualizer.potentialVisualization.setSize(size);
            break;
        case 'ene':
            // visualizer.energyPlot.newPlot();
            setTimeout(() => visualizer.energyPlot.newPlot(), 50);
            break;
        case 'vel':
            setTimeout(() => visualizer.velocityHistogramPlot.newPlot(), 50);
            break;
    }
}

var mainLayout = {
    mol: {show: true, zoomed: false, showInfo: false, label: 'Molecule', name: 'mol',
        style: {width: '300px', height: '300px', position: 'absolute', 'top': '25px', 'left': '25px'}},
    pot: {show: true, zoomed: false, showInfo: false, label: 'Potential', name: 'pot',
        style: {width: '300px', height: '300px', position: 'absolute', 'top': '350px', 'left': '25px'}},
    ene: {show: true, zoomed: false, showInfo: false, label: 'Energy', name: 'ene',
        style: {width: '400px', height: '300px', position: 'absolute', 'top': '25px', 'left': '350px'}},
    vel: {show: true, zoomed: false, showInfo: false, label: 'Velocity', name: 'vel',
        style: {width: '400px', height: '300px', position: 'absolute', 'top': '350px', 'left': '350px'}}
};

var vm = new Vue({
    el: '#vui',
    data: {
        stepsPerSecond: 30,
        playing: false,
        visualizer: visualizer,
        loading: false,
        layout: JSON.parse(JSON.stringify(mainLayout))  // hackish way of deep-copying an object
    },
    methods: {
        setSPS: function (event) {
            ticker.setStepsPerSecond(this.stepsPerSecond);
        },
        loadFile: function (event) {
            var file = event.target.files[0];
            this.loading = true;
            loader.loadFile(file, this.simulationResultLoaded);
        },
        playPause: function (event) {
            this.playing = !this.playing;
        },
        simulationResultLoaded: function (simData) {
            this.emptyDivs();
            document.getElementById('time-slider').max = simData.length - 1;
            document.getElementById('time-slider').value = 0;
            visualizer.dataFileLoaded(simData);
            this.loading = false;
        },
        emptyDivs: function () {
            var divIds = ['plot-molecules', 'plot-energies', 'plot-total-potential', 'plot-vel-dist'];
            for (var divId of divIds) {
                document.getElementById(divId).innerHTML = '';
            }
        },
        loadExample: function (url) {
            this.loading = true;
            loader.requestSimulationData(url, this.simulationResultLoaded);
        },
        zoomIn: function(name) {
            var zoomStyle = {width: '600px', height: '600px', position: 'absolute', 'top': '25px', 'left': '25px'};
            this.layout.mol.show = false;
            this.layout.pot.show = false;
            this.layout.ene.show = false;
            this.layout.vel.show = false;

            this.layout[name].style = zoomStyle;
            this.layout[name].show = true;
            this.layout[name].zoomed = true;
            resizeVisualization(name);
        },
        zoomOut: function(name) {
            this.layout = JSON.parse(JSON.stringify(mainLayout));
            this.layout[name].zoomed = false;
            resizeVisualization(name);
        },
        zoom: function(name) {
            this.layout[name].zoomed ? this.zoomOut(name) : this.zoomIn(name);
        }
    },
    watch: {
        playing: function (newPlaying) {
            visualizer.isPlaying = newPlaying;
            ticker.prevFrameTime = undefined;
            ticker.tickerTime = 0.0;
        },
    }
});
