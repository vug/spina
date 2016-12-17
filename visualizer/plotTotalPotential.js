class TotalPotentialVisualization2D {
    constructor(elemId, size, vertexShader, fragmentShader) {
        this.size = size;
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.renderer = new THREE.WebGLRenderer();
        this.vertexShader = vertexShader;
        this.fragmentShader = fragmentShader;

        var elem = document.getElementById(elemId);
        elem.appendChild(this.renderer.domElement);

        this.camera.position.z = 1;

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.size, this.size);
        this.renderer.render(this.scene, this.camera);
    }

    updateData(simData) {
        var numParticles = simData[0]['pos'].length; // TODO: temporary solution. Value will directly come from simData
        var particlePositions = new Array(numParticles).fill(0).map((x, i) => new THREE.Vector2());
        // TODO: format fragmentShader and insert numParticles into it dynamically

        this.uniforms = {
            time: {value: 1.0},
            resolution: {value: new THREE.Vector2(this.size, this.size)},
            pos: {type: 'v2v', value: particlePositions},
            selectedParticleIdx: {value: Math.floor(numParticles / 2)},
            devicePixelRatio: {value: window.devicePixelRatio}
        };
        var geometry = new THREE.PlaneBufferGeometry(2, 2);
        var material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        this.renderer.render(this.scene, this.camera);
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
