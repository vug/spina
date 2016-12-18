class UI {
    constructor(visualizer, loader, ticker) {
        this.visualizer = visualizer;
        this.loader = loader;
        this.ticker = ticker;

        this.button2DExample = document.getElementById('btn-ex-2D');
        this.button3DExample = document.getElementById('btn-ex-3D');

        this.addListeners();
    }

    addListeners() {
        var example2DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_2D.json';
        var example3DUrl = 'https://s3.amazonaws.com/ugur-fileserver/example_3D.json';

        this.button2DExample.addEventListener('click', e => {
            this.loader.requestSimulationData(example2DUrl, this.simulationResultLoaded.bind(this));
        });
    }




}
