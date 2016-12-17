class TotalPotentialVisualization2D {
    constructor(elemId, vertexShader, fragmentShader) {
        // TODO: split constructor: 1) Initialization: Create empty scene, render. 2) DataLoaded: create mesh add scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.renderer = new THREE.WebGLRenderer();
        this.uniforms = {
            time: {value: 1.0},
            resolution: {value: new THREE.Vector2()},
            pos: {type: 'v2v', value: Array(81).fill(0).map((x, i) => new THREE.Vector2())},
            selectedParticleIdx: {value: 40},
            devicePixelRatio: {value: window.devicePixelRatio}
        };

        var elem = document.getElementById(elemId);
        elem.appendChild(this.renderer.domElement);

        this.camera.position.z = 1;
        var geometry = new THREE.PlaneBufferGeometry(2, 2);
        var material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(400, 400);
        this.uniforms.resolution.value.x = 400;
        this.uniforms.resolution.value.y = 400;
    }

    render(simData, stepNo) {
        var pos = simData[stepNo]['pos'];
        for (var i = 0; i < 81; i++) {
            var p = this.uniforms.pos.value[i];
            p.x = pos[i][0];
            p.y = pos[i][1];
        }
        this.uniforms.time.value = stepNo;
        this.renderer.render(this.scene, this.camera);
    }
}
