var plotMolecules3D;
var renderMolecules3D;
var camera3, scene3, controls3, renderer3;
var uniforms;

var meshes = [];
var center = new THREE.Vector3(5., 5., 5.);
var camPos = new THREE.Vector3(0, 0, 15);

function createMoleculePlot3D() {
    plotMolecules3D = document.getElementById('plot-mols-3D');

    // uniforms = {
    //     time: {value: 1.0},
    //     resolution: {value: new THREE.Vector2()},
    //     pos: {type: 'v3v', value: Array(81).fill(0).map((x, i) => new THREE.Vector3())},
    //     selectedParticleIdx: {value: 40},
    //     devicePixelRatio: {value: window.devicePixelRatio}
    // };

    camera3 = new THREE.PerspectiveCamera( 70, 1.0, 1, 1000 );
    camera3.lookAt(center);
    camera3.position.addVectors(center, camPos);

    scene3 = new THREE.Scene();
    const RADIUS = 0.2;
    const SEGMENTS = 16;
    const RINGS = 16;

    var sphereGeometry = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);
    var material = new THREE.MeshLambertMaterial({color: 0x5588DD});

    for (var i=0; i<729; i++) {
        // var p = data[stepNo]['pos'][i];
        var mesh3 = new THREE.Mesh(sphereGeometry, material);
        mesh3.position.x = 0;
        mesh3.position.y = 0;
        mesh3.position.z = 0;
        meshes.push(mesh3);
        scene3.add(mesh3);
    }

    var pointLight1 = new THREE.PointLight(0x999999);
    var pointLight2 = new THREE.PointLight(0xFFFFFF);
    var pointLight3 = new THREE.PointLight(0xFFFFFF);
    pointLight1.position.set(5., 5., 5.);
    pointLight2.position.set(25., 25., 25.);
    pointLight3.position.set(-15., -15., -15.);
    scene3.add(pointLight1);

    var ambientLight = new THREE.AmbientLight(0xAAAAAA);
    scene3.add( ambientLight );

    renderer3 = new THREE.WebGLRenderer();
    renderer3.setPixelRatio(window.devicePixelRatio);
    renderer3.setSize(400, 400);
    // uniforms.resolution.value.x = 400;
    // uniforms.resolution.value.y = 400;

    plotMolecules3D.appendChild(renderer3.domElement);

    renderer3.render(scene3, camera3);

    controls3 = new THREE.OrbitControls(camera3, renderer3.domElement);
    controls3.target.set(5., 5., 5.);
    controls3.addEventListener('change', renderMolecules3D);
    controls3.enableDamping = true;
    controls3.dampingFactor = 0.25;
    // controls3.enableZoom = false;

}

function renderMolecules3D() {
    // controls3.update();
    // var timer = 0.0001 * Date.now();
    // camPos.x = Math.cos( timer ) * 10.;
    // camPos.z = Math.sin( timer ) * 10.;
    // camera3.position.addVectors(center, camPos);
    // camera3.lookAt(center);

    for (var i=0; i<729; i++) {
        var p = data[stepNo]['pos'][i];
        var mesh = meshes[i];
        mesh.position.set(p[0], p[1], p[2]);
    }
    renderer3.render(scene3, camera3);
}
