class MoleculesVisualization3D {
    constructor(elemId, size) {
        this.size = size;
        var center = new THREE.Vector3(5., 5., 5.);
        var camPos = new THREE.Vector3(0, 0, 15);
        this.camera = new THREE.PerspectiveCamera( 70, 1.0, 1, 1000 );
        this.camera.lookAt(center);
        this.camera.position.addVectors(center, camPos);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();

        var elem = document.getElementById(elemId);
        elem.appendChild(this.renderer.domElement);

        var pointLight1 = new THREE.PointLight(0x999999);
        var pointLight2 = new THREE.PointLight(0xFFFFFF);
        var pointLight3 = new THREE.PointLight(0xFFFFFF);
        pointLight1.position.set(5., 5., 5.);
        pointLight2.position.set(25., 25., 25.);
        pointLight3.position.set(-15., -15., -15.);
        this.scene.add(pointLight1);
        var ambientLight = new THREE.AmbientLight(0xAAAAAA);
        this.scene.add( ambientLight );

        const RADIUS = 0.2;
        const SEGMENTS = 16;
        const RINGS = 16;
        this.sphereGeometry = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);
        this.material = new THREE.MeshLambertMaterial({color: 0x5588DD});

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(5., 5., 5.);
        this.controls.addEventListener('change', () => this.renderer.render(this.scene, this.camera));
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.size, this.size);
        this.renderer.render(this.scene, this.camera);
    }

    updateData(simData) {
        this.numParticles = simData[0]['pos'].length;
        this.meshes = [];
        for (var i=0; i<this.numParticles; i++) {
            var p = simData[0]['pos'][i];
            var mesh = new THREE.Mesh(this.sphereGeometry, this.material);
            mesh.position.x = p[0];
            mesh.position.y = p[1];
            mesh.position.z = [2];
            this.meshes.push(mesh);
            this.scene.add(mesh);
        }
    }

    render(simData, stepNo) {
        this.controls.update();
        for (var i=0; i<this.numParticles; i++) {
            var p = simData[stepNo]['pos'][i];
            var mesh = this.meshes[i];
            mesh.position.set(p[0], p[1], p[2]);
        }
        this.renderer.render(this.scene, this.camera);
    }
}
