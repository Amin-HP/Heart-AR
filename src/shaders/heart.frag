uniform sampler2D uTexture;
uniform float uOpacity;
varying vec2 vUv;

void main() {
    vec4 color = texture2D(uTexture, vUv);
    if (color.a < 0.1) discard; 
    gl_FragColor = vec4(color.rgb, color.a * uOpacity);
}
