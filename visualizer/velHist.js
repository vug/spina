var updateVelocityHistogram;

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
            range: [0, 2],
            title: 'speed'
        },
        yaxis: {
            range: [0, 1],
            title: 'probability'
        }
    }
    Plotly.newPlot('plot-vel-dist', plotData, layout, {showLink: false});

    updateVelocityHistogram = function() {
        var vel = data[stepNo]['vel'];
        var velMag = vel.map(v => Math.sqrt(v[0] * v[0] + v[1] * v[1]));
        plotData[0].x = velMag;
        Plotly.redraw('plot-vel-dist');
    };
}
