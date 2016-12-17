class Visualizer {
    constructor(ticker) {
        this.ticker = ticker;
        this.uiCallback = null;

        this.dimensions = 2;
        if (typeof document.location.search !== "undefined") {
            // temporary solution to set dimensionality.
            // TODO: Get this value from simulation results file.
            this.dimensions = parseInt(document.location.search.slice(1).split('dim=')[1]);
        }

        this.energyPlot = null;
        this.velocityHistogramPlot = null;
        this.moleculeVisualization = null;
        this.potentialVisualization = null;
        this.isPlaying = false;
        this.stepNo = 0;
        this.simData = null;
        this.numSteps = 0;
        this.animate();
    }

    createVisualizations() {
        this.energyPlot = new EnergiesLineChart('plot-energies');
        this.velocityHistogramPlot = new VelocityHistogram('plot-vel-dist');
        this.moleculeVisualization = new MoleculesVisualization2D('plot-molecules', 300);
        this.potentialVisualization = new TotalPotentialVisualization2D('plot-total-potential', 300);
    }

    animate() {
        if(this.isPlaying) {
            this.stepNo += this.ticker.tick();
            if( this.stepNo >= this.numSteps ) {
                this.stepNo = 0;
            }
            if(this.uiCallback) this.uiCallback(this.stepNo);
            this.render();
        }
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.moleculeVisualization.render(this.simData, this.stepNo);
        this.velocityHistogramPlot.updateDistribution(this.simData, this.stepNo);
        this.energyPlot.updateStepNoIndicator(this.stepNo);
        this.potentialVisualization.render(this.simData, this.stepNo);
    }

    dataFileLoaded(simData) {
        this.simData = simData;
        this.stepNo = 0;
        this.numSteps = this.simData.length;
        var kin = this.simData.map(step => step['kin']);
        var pot = this.simData.map(step => step['pot']);
        var ene = this.simData.map(step => step['ene']);
        this.createVisualizations();
        this.energyPlot.updateEnergyData(kin, pot, ene);
        this.velocityHistogramPlot.updateLayout(this.simData);
        this.potentialVisualization.updateData(this.simData);
        this.render();
    }
}
