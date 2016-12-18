class Visualizer {
    constructor(ticker) {
        this.ticker = ticker;
        this.uiCallback = null;

        this.dimensions = 2;
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
        if(this.dimensions === 3) {
            this.moleculeVisualization = new MoleculesVisualization3D('plot-molecules', 300);
        }
        else {
            this.moleculeVisualization = new MoleculesVisualization2D('plot-molecules', 300);
            this.potentialVisualization = new TotalPotentialVisualization2D('plot-total-potential', 300);
        }
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
        if(this.dimensions !== 3) this.potentialVisualization.render(this.simData, this.stepNo);
    }

    dataFileLoaded(simData) {
        this.simData = simData;
        this.stepNo = 0;
        this.numSteps = this.simData.length;
        this.dimensions = this.simData[0]['pos'][0].length;
        var kin = this.simData.map(step => step['kin']);
        var pot = this.simData.map(step => step['pot']);
        var ene = this.simData.map(step => step['ene']);
        this.createVisualizations();
        this.energyPlot.updateEnergyData(kin, pot, ene);
        this.velocityHistogramPlot.updateLayout(this.simData);
        if(this.dimensions === 3) {
            this.moleculeVisualization.updateData(this.simData);
        }
        else {
            this.potentialVisualization.updateData(this.simData);
        }
        this.render();
    }
}
