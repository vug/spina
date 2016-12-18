class TotalPotentialVisualization2D {
    constructor(elemId, size) {
        this.size = size;
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        this.renderer = new THREE.WebGLRenderer();
        this.numParticles = null;

        var elem = document.getElementById(elemId);
        elem.appendChild(this.renderer.domElement);

        this.camera.position.z = 1;

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.size, this.size);
        this.renderer.render(this.scene, this.camera);
    }

    setSize(size) {
        this.renderer.setSize(size, size);
        this.uniforms.resolution.value.x = size;
        this.uniforms.resolution.value.y = size;
    }

    updateData(simData) {
        this.numParticles = simData[0]['pos'].length; // TODO: temporary solution. Value will directly come from simData
        var particlePositions = new Array(this.numParticles).fill(0).map((x, i) => new THREE.Vector2());

        this.uniforms = {
            time: {value: 1.0},
            resolution: {value: new THREE.Vector2(this.size, this.size)},
            pos: {type: 'v2v', value: particlePositions},
            selectedParticleIdx: {value: Math.floor(this.numParticles / 2)},
            devicePixelRatio: {value: window.devicePixelRatio}
        };
        var geometry = new THREE.PlaneBufferGeometry(2, 2);
        var material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(this.numParticles)
        });
        var mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        this.renderer.render(this.scene, this.camera);
    }

    render(simData, stepNo) {
        var pos = simData[stepNo]['pos'];
        for (var i = 0; i < this.numParticles; i++) {
            var p = this.uniforms.pos.value[i];
            p.x = pos[i][0];
            p.y = pos[i][1];
        }
        this.uniforms.time.value = stepNo;
        this.renderer.render(this.scene, this.camera);
    }

    getVertexShader() {
        var vertexShader = `
            void main()	{
                gl_Position = vec4( position, 1.0 );
            }
        `;
        return vertexShader;
    }

    getFragmentShader(numParticles) {
        var fragmentShader = `
            #define numParticles ${numParticles}
            uniform vec2 resolution;
            uniform float time;
            uniform vec2 pos[numParticles];
            uniform int selectedParticleIdx;
            uniform float devicePixelRatio;
        
            float inverse_sqr(float r) {
                return 1.0 / r;
            }
        
            float lj(float r) {
                float epsilon = 1.0;
                float sigma = 1.0;
                float sigma12 = pow(sigma, 12.0);
                float sigma6 = pow(sigma, 6.0);
                return 4.0 * epsilon * (sigma12 * pow(r, -12.0) - sigma6 * pow(r, -6.0));
            }
        
            void main()	{
                vec2 p = 10. * gl_FragCoord.xy / resolution.xy / devicePixelRatio;
                float t = time * 5.0;
                float val = 0.0;
                vec3 color = vec3(0.0);
                for (int i=0; i<numParticles; i++) {
                    vec2 d = p - pos[i];
                    float r = sqrt(d.x * d.x + d.y * d.y);
                    if (i == selectedParticleIdx) continue;
                    val += lj(r);
                }
                val = clamp(val, -1.0, 1.0);
        
                if (val < 0.0) {
                    color = vec3(1.0+val, 1.0+val, 1.0);
                }
                else {
                    color = vec3(1.0, 1.0-val, 1.0-val);
                }
        
                for (int i=0; i<numParticles; i++) {
                    vec2 d = p - pos[i];
                    float r = sqrt(d.x * d.x + d.y * d.y);
                    float radius = 0.1;  // hard-sphere
                    color = mix(color, vec3(1.0, 1.0, 0.0), 1.0 - smoothstep(radius-0.005, radius+0.005, r));
                }
                gl_FragColor=vec4(color, 1.0);
            }
        `;
        return fragmentShader;
    }
}
