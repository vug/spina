var updateEnergyStepLine;
var updateEnergies;

function createEnergyPlot() {
    var kinetic = {  
        y: [], 
        mode: 'lines',
        name: 'Kinetic'
    };
    var potential = {
        y: [], 
        mode: 'lines',
        name: 'Potential'
    };
    var total = {
        y: [], 
        mode: 'lines',
        name: 'Total'
    };
    var step = {
        x: [1, 1],
        y: [-1, 1],
        mode: 'lines',
        name: 'current step'
    }

    var layout = {
        title:'Energies',
        xaxis: {
            title: 'Step No'
        },
        yaxis: {
            title: 'Energy'
        }       
    };
    var plotData = [kinetic, potential, total, step];
    Plotly.newPlot('plot-energies', plotData, layout, {showLink: false});

    updateEnergies = function() {
            kinetic.y = kin;
            potential.y = pot;
            total.y = ene;
            var maxKin = Math.max.apply(null, kin);
            var minPot = Math.min.apply(null, pot);
            step.y = [minPot, maxKin];
            Plotly.redraw('plot-energies');
    };

    updateEnergyStepLine = function(samples) {
        step.x = [stepNo, stepNo];
        Plotly.redraw('plot-energies');
    };  
}
