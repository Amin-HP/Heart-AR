uniform float uTime;
uniform float uFlapStrength;
varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Butterfly flapping logic
    // Butterfly flapping logic
    // Restrict to 0.0 (flat) -> positive (wings up)
    // Increase max angle to ~1.5 (near 90 degrees) for full closure effect
    float maxAngle = 1.5 * uFlapStrength; 
    float rawSine = sin(uTime * 20.0);
    // Map -1..1 to 0..1
    float flapProgress = rawSine * 0.5 + 0.5;
    
    // Optional: make the downstroke slightly faster or sharper? 
    // For now, smooth sine mapped to 0..1 is fine.
    float angle = flapProgress * maxAngle;
    
    float absX = abs(pos.x);
    float signX = sign(pos.x);
    
    // Rigid rotation logic to prevent stretching
    if (absX > 0.001) {
        float theta = angle;
        pos.x = signX * (absX * cos(theta));
        pos.z = absX * sin(theta);
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
