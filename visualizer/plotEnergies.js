class EnergiesLineChart {
    constructor(elemId) {
        this.elemId = elemId;
        this.kinetic = {
            y: [],
            mode: 'lines',
            name: 'Kinetic'
        };
        this.potential = {
            y: [],
            mode: 'lines',
            name: 'Potential'
        };
        this.total = {
            y: [],
            mode: 'lines',
            name: 'Total'
        };
        this.step = {
            x: [1, 1],
            y: [-1, 1],
            mode: 'lines',
            name: 'current step'
        };
        this.layout = {
            title:'Energies',
            xaxis: {
                title: 'Step No'
            },
            yaxis: {
                title: 'Energy'
            }
        };
        this.plotData = [this.kinetic, this.potential, this.total, this.step];
        Plotly.newPlot(elemId, this.plotData, this.layout, {showLink: false});
    }

    updateEnergies(kin, pot, ene) {
            this.kinetic.y = kin;
            this.potential.y = pot;
            this.total.y = ene;
            var maxKin = Math.max.apply(null, kin);
            var minPot = Math.min.apply(null, pot);
            this.step.y = [minPot, maxKin];
            Plotly.redraw(this.elemId);
    }

    updateEnergyStepLine(stepNo) {
        this.step.x = [stepNo, stepNo];
        Plotly.redraw(this.elemId);
    };
}
