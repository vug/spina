var updateVelocityHistogram;
var updateVelocityLayout;

function createVelocityHistogram() {
    var plotData = [
    {
        x: [],
        type: 'histogram',
        histnorm: 'probability',
        autobinx: false,
        xbins: {
            start: 0,
            end: 2,
            size: 0.1
        }
    }
    ];
    var layout = {
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
    Plotly.newPlot('plot-vel-dist', plotData, layout, {showLink: false});

    var calculateMaximumVelocity = function() {
        var vels = data.map(s => s.vel.map(v => Math.sqrt(v[0] * v[0] + v[1] * v[1])));
        var maxVels = vels.map(s => Math.max.apply(null, s));
        var maxVel = Math.max.apply(null, maxVels);
        return maxVel;
    };

    updateVelocityLayout = function() {
        var velMax = calculateMaximumVelocity();
        var update = {xaxis: {range: [0, velMax]}};
        Plotly.relayout('plot-vel-dist', update);
    };

    updateVelocityHistogram = function() {
        var vel = data[stepNo]['vel'];
        var velMag = vel.map(v => Math.sqrt(v[0] * v[0] + v[1] * v[1]));
        plotData[0].x = velMag;
        Plotly.redraw('plot-vel-dist');
    };
}
