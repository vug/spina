var loader = new SimulationResultLoader();
var ticker = new Ticker();
var visualizer = new Visualizer(ticker);

visualizer.uiCallback = function (stepNo) {
    // If an explicit change based on stepNo has to be made, put it here.
};

var vm = new Vue({
    el: '#vui',
    data: {
        stepsPerSecond: 30,
        playing: false,
        visualizer: visualizer,
        loading: false,
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
