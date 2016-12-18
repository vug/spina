var loader = new SimulationResultLoader();
var ticker = new Ticker();
var visualizer = new Visualizer(ticker);
var ui = new UI(visualizer, loader, ticker);

visualizer.uiCallback = function(stepNo) {
    // If an explicit change based on stepNo has to be made, put it here.
};

var vm = new Vue({
  el: '#vui',
  data: {
    stepsPerSecond: 30,
    playing: false,
    visualizer: visualizer
  },
  methods: {
      setSPS: function(event) {
          ticker.setStepsPerSecond(this.stepsPerSecond);
      },
      loadFile: function(event) {
          var file = event.target.files[0];
          loader.loadFile(file, ui.simulationResultLoaded.bind(ui));
      },
      playPause: function(event) {
        this.playing = !this.playing;
      },
  },
  watch: {
      playing: function(newPlaying) {
        visualizer.isPlaying = newPlaying;
        ticker.prevFrameTime = undefined;
        ticker.tickerTime = 0.0;
      },
  }
});
