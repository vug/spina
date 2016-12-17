class App {
    constructor() {
        this.loader = new SimulationResultLoader();
        this.ticker = new Ticker();
        this.visualizer = new Visualizer(this.ticker);
        this.ui = new UI(this.visualizer, this.loader, this.ticker);
    }
}

var app = new App();
