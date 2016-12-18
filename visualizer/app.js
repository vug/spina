var loader = new SimulationResultLoader();
var ticker = new Ticker();
var visualizer = new Visualizer(ticker);

visualizer.uiCallback = function (stepNo) {
    // If an explicit change based on stepNo has to be made, put it here.
};

var visualizationInformations = {
    'main': `<p>Spina MD Simulation Visualizer</p>
<p>First, load a simulation results file. For a quick example, click on "2D Example" or "3D Example" button to pull
data file from my <a href="https://aws.amazon.com/s3/">AWS S3 bucket</a>. (Files are ~20MB).</p>
<p>After the file is loaded into memory click on Play/Pause button to animate the simulation, move slider to go to a
certain step number. Set "Steps Per Second" to play the simulation in different speeds. "Select Particle" is explained
in the information of potential visualization.</p>
<p>To read explanations of each visualization click on info buttons in "Info and Zoom" section. And to make a visualization
bigger click on the respective zoom button.</p>
<p>You can also run an MD simulation with the <a href="https://github.com/vug/spina/tree/master/simulator">simulator</a>
part of Spina and load the resulting file on your local machine using "Local File" button.</p>`,
    'mol': `<p>Visualizes molecules.</p>
<p>2D simulations are drawn on canvas element via 
<a href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API"> Canvas API</a>. Particles are colored circles.
They are purple when slow and become yellower as they move faster. Their acceleration is shown with green lines.</p>
<p>3D simulations are rendered using
<a href="https://threejs.org/">Three.js</a>  
<a href="https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API">WebGL</a> library. Particles are spheres.
The 3D scene is rendered on the GPU. You can use your mouse to zoom in and out and rotate around the center of the 
space.</p>`,
    'pot': `<p>Visualizes the total LJ potential on the selected particle.</p>
<p>It calculates sum of LJ-potentials of all particles (except the selected particle) on every point of space. Blue 
means a negative value (attractive region), white is zero, and red means positive (repulsive region).</p>
<p>Use "Select Particle" to choose a particle. In "2D Example", after the system reaches equilibrium, you can see how 
that particle is trapped inside a potential well due to the interaction with the rest of the particles.</p>
<p>Visualization and its calculation is done via
<a href="https://en.wikipedia.org/wiki/OpenGL_Shading_Language">GLSL</a> 
<a href="https://www.opengl.org/wiki/Fragment_Shader">fragment shader</a>. Fragment shaders run on GPU
hence do the calculation for each pixel in parallel which allows fast refresh rates in intensive calculations.</p>
<p>Only shown in 2D simulations.</p>`,
    'ene': `<p>Line chart of kinetic, potential and total energies of the system.</p>
<p>x-axis is time. Simulation step no is indicated with a vertical red line. (All units are dimensionless)</p>
<p>Thanks to the Verlet integration, it can be seen that the total energy of the system (the green line) is conserved 
throughout the simulation.</p>
<p>Chart is drawn using <a href="https://plot.ly/javascript/">Plotly</a> library.</p>`,
    'vel': `<p>The probability distribution of instantaneous velocity.</p>
<p>x-axis is the velocity values, y-axis is the occurrence frequency of that value in current simulation step.
(All units are dimensionless)</p>
<p>Chart is drawn using <a href="https://plot.ly/javascript/">Plotly</a> library.</p>`
};

var mainLayout = {
    mol: {show: true, zoomed: false, showInfo: false, label: 'Molecule', name: 'mol',
        style: {width: '300px', height: '300px', position: 'absolute', 'top': '25px', 'left': '25px'}},
    pot: {show: true, zoomed: false, showInfo: false, label: 'Potential', name: 'pot',
        style: {width: '300px', height: '300px', position: 'absolute', 'top': '350px', 'left': '25px'}},
    ene: {show: true, zoomed: false, showInfo: false, label: 'Energy', name: 'ene',
        style: {width: '400px', height: '300px', position: 'absolute', 'top': '25px', 'left': '350px'}},
    vel: {show: true, zoomed: false, showInfo: false, label: 'Velocity', name: 'vel',
        style: {width: '400px', height: '300px', position: 'absolute', 'top': '350px', 'left': '350px'}}
};

var vm = new Vue({
    el: '#vui',
    data: {
        stepsPerSecond: 30,
        selectedMoleculeId: 0,
        playing: false,
        visualizer: visualizer,
        loading: false,
        layout: JSON.parse(JSON.stringify(mainLayout)),  // hackish way of deep-copying an object
        info: visualizationInformations['main'],
        infos: visualizationInformations
    },
    methods: {
        setSPS: function (event) {
            ticker.setStepsPerSecond(this.stepsPerSecond);
        },
        setSelectedMolecule: function(event) {
            var molId = parseInt(event.target.value);
            visualizer.potentialVisualization.uniforms.selectedParticleIdx.value = molId;
            visualizer.potentialVisualization.render(visualizer.simData, visualizer.stepNo);
        },
        loadFile: function (event) {
            var file = event.target.files[0];
            this.loading = true;
            loader.loadFile(file, this.simulationResultLoaded);
        },
        playPause: function (event) {
            if(visualizer.simData) this.playing = !this.playing;
        },
        simulationResultLoaded: function (simData) {
            this.playing = false;
            this.emptyDivs();
            document.getElementById('time-slider').max = simData.length - 1;
            document.getElementById('time-slider').value = 0;
            visualizer.dataFileLoaded(simData);
            this.loading = false;
            this.selectedMoleculeId = visualizer.potentialVisualization.uniforms.selectedParticleIdx.value;
            document.getElementById('number-mol-id').max = simData[0]['pos'].length - 1;
        },
        emptyDivs: function () {
            var divIds = ['plot-molecules', 'plot-energies', 'plot-total-potential', 'plot-vel-dist'];
            for (var divId of divIds) {
                document.getElementById(divId).innerHTML = '';
            }
        },
        loadExample: function (url) {
            this.loading = true;
            loader.requestSimulationData(url, this.simulationResultLoaded);
        },
        zoomIn: function(name) {
            // First zoomOut any visualization that was zoomed in
            for (var visName in this.layout) {
                if(this.layout[visName].zoomed) {
                    this.zoomOut(visName);
                }
            }

            var zoomStyle = {width: '600px', height: '600px', position: 'absolute', 'top': '25px', 'left': '25px'};
            this.layout.mol.show = false;
            this.layout.pot.show = false;
            this.layout.ene.show = false;
            this.layout.vel.show = false;

            this.layout[name].style = zoomStyle;
            console.log('layout style set to zoomStyle');
            this.layout[name].show = true;
            this.layout[name].zoomed = true;
            this.resizeVisualization(name);
        },
        zoomOut: function(name) {
            this.layout = JSON.parse(JSON.stringify(mainLayout));
            this.layout[name].zoomed = false;
            this.resizeVisualization(name);
        },
        zoom: function(name) {
            this.layout[name].zoomed ? this.zoomOut(name) : this.zoomIn(name);
        },
        resizeVisualization: function(name) {
            var size = parseInt(vm.layout[name].style.width.split('px')[0]);

            // Sleeping 50 ms before calling newPlot is a hack. Should find a more robust solution.
            switch(name) {
                case 'mol':
                    if (this.visualizer.dimensions === 3) {
                        this.visualizer.moleculeVisualization.setSize(size);
                    }
                    else {
                        this.visualizer.moleculeVisualization = new MoleculesVisualization2D('plot-molecules', size);
                        this.visualizer.moleculeVisualization.render(this.visualizer.simData, this.visualizer.stepNo);
                    }
                    break;
                case 'pot':
                    this.visualizer.potentialVisualization.setSize(size);
                    break;
                case 'ene':
                    setTimeout(() => {this.visualizer.energyPlot.newPlot(); console.log('energy newPlot');}, 100);
                    break;
                case 'vel':
                    setTimeout(() => {this.visualizer.velocityHistogramPlot.newPlot(); console.log('velocity new Plot');}, 100);
                    break;
            }
        }
    },
    watch: {
        playing: function (newPlaying) {
            visualizer.isPlaying = newPlaying;
            ticker.prevFrameTime = undefined;
            ticker.tickerTime = 0.0;
        },
    }
});
