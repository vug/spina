class VelocityHistogram {
    constructor(elemId) {
        this.elemId = elemId;
        this.plotData = [
            {
                x: [],
                type: 'histogram',
                histnorm: 'probability',
                autobinx: false,
                xbins: {
                    start: 0,
                    end: 3,
                    size: 0.1
                }
            }
        ];
        this.layout = {
            title: 'Velocity distribution',
            xaxis: {
                range: [0, 1],
                title: 'speed'
            },
            yaxis: {
                range: [0, 1],
                title: 'probability'
            }
        };
        Plotly.newPlot(this.elemId, this.plotData, this.layout, {showLink: false});
    }

    updateLayout(simData) {
        var velMax = this.calculateMaximumVelocity(simData);
        var update = {xaxis: {range: [0, velMax]}};
        Plotly.relayout('plot-vel-dist', update);
    }

    updateDistribution(simData, stepNo) {
        var vel = simData[stepNo]['vel'];
        var velMag = vel.map(v => Math.sqrt(v[0] * v[0] + v[1] * v[1]));
        this.plotData[0].x = velMag;
        Plotly.redraw('plot-vel-dist');
    }

    calculateMaximumVelocity(simData) {
        var vels = simData.map(s => s.vel.map(v => Math.sqrt(v[0] * v[0] + v[1] * v[1])));
        var maxVels = vels.map(s => Math.max.apply(null, s));
        var maxVel = Math.max.apply(null, maxVels);
        return maxVel;
    }

    newPlot() {
        Plotly.newPlot(this.elemId, this.plotData, this.layout, {showLink: false});
    }
}
