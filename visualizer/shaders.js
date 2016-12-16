var vertexShader = `
    void main()	{
        gl_Position = vec4( position, 1.0 );
    }
`;

var fragmentShader = `
    #define numParticles 81
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

            // val += pow(0.0000001 * lj(r), 0.25);
            val += lj(r);
            // val += lj(r);

            // val += 0.01 * inverse_sqr(r); // gravity

            // float radius = 0.1;  // hard-sphere
            // val += smoothstep(radius-0.01, radius+0.01, r);
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
