var plotTotalPotential;
var camera, scene, renderer;
var uniforms;

function createPotentialPlot2D() {
    plotTotalPotential = document.getElementById('plot-total-potential');

    camera = new THREE.Camera();
    camera.position.z = 1;
    scene = new THREE.Scene();
    var geometry = new THREE.PlaneBufferGeometry(2, 2);
    uniforms = {
        time: {value: 1.0},
        resolution: {value: new THREE.Vector2()},
        pos: {type: 'v2v', value: Array(81).fill(0).map((x, i) => new THREE.Vector2())},
        selectedParticleIdx: {value: 40},
        devicePixelRatio: {value: window.devicePixelRatio}
    };

    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    plotTotalPotential.appendChild(renderer.domElement);

    renderer.setSize(400, 400);
    uniforms.resolution.value.x = 400;
    uniforms.resolution.value.y = 400;
}

function renderTotalPotential() {
    var pos = data[stepNo]['pos'];
    for (var i = 0; i < 81; i++) {
        p = uniforms.pos.value[i];
        p.x = pos[i][0];
        p.y = pos[i][1];
    }
    uniforms.time.value = stepNo;
    renderer.render(scene, camera);
}
