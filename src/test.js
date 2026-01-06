import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Butterfly from './Butterfly.js';

const app = document.querySelector('#app');
app.innerHTML = '<div id="container"></div>';
const container = document.querySelector('#container');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020); // Dark grey background

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 1.5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Butterflies
const textureLoader = new THREE.TextureLoader();
const butterflies = [];

// 1. Base Butterfly
butterflies.push(new Butterfly(scene, textureLoader, {
    createBase: true,
    takeoffDelay: 0,
    movementRadius: 1.1
}));

// 2. Second Butterfly
butterflies.push(new Butterfly(scene, textureLoader, {
    createBase: false,
    takeoffDelay: 2.0,
    movementRadius: 1.3
}));

// 3. Third Butterfly
butterflies.push(new Butterfly(scene, textureLoader, {
    createBase: false,
    takeoffDelay: 4.0,
    movementRadius: 1.5
}));

// Start them all immediately
butterflies.forEach(b => b.start(0));

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    butterflies.forEach(b => b.update(elapsedTime));

    controls.update();
    renderer.render(scene, camera);
}
animate();
