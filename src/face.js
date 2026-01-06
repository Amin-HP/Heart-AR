import { MindARThree } from 'mind-ar/dist/mindar-face-three.prod.js';
import * as THREE from 'three';
import Butterfly from './Butterfly.js';

document.querySelector('#app').innerHTML = `
  <div id="container"></div>
`;

const mindarThree = new MindARThree({
    container: document.querySelector('#container'),
});
const { renderer, scene, camera } = mindarThree;

const clock = new THREE.Clock();

// Anchor 1: Nose tip (Index 1) - used for position tracking only
const anchorNose = mindarThree.addAnchor(1);

// Container for butterflies attached to SCENE, not face
const butterflyContainer = new THREE.Group();
scene.add(butterflyContainer);

// Initialize Butterflies
const textureLoader = new THREE.TextureLoader();
const butterflies = [];

for (let i = 0; i < 5; i++) {
    const butterfly = new Butterfly(butterflyContainer, textureLoader, {
        createBase: false,
        takeoffDelay: Math.random() * 5,
        fadeInDuration: 0.1,
        flightHeight: 3 + Math.random() * 5,
        movementRadius: 5.0 + Math.random() * 5.0,
        movementRandomness: 0.2,
        scale: 3.0 + Math.random() * 0.5,
        orbitMode: true,
    });
    butterflies.push(butterfly);
}

// Start immediately
butterflies.forEach(b => b.start(0));

// Dummy vector
const nosePos = new THREE.Vector3(0, 0, 0);

const start = async () => {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
        const elapsedTime = clock.getElapsedTime();

        // Logic: butterflyContainer follows nose position, but ignores rotation
        if (anchorNose.group.visible) {
            // Get absolute world position of the nose anchor
            anchorNose.group.getWorldPosition(nosePos);

            // Apply position to container
            butterflyContainer.position.lerp(nosePos, 0.15);
            // Force rotation to be zero (always upright)
            butterflyContainer.rotation.set(0, 0, 0);
        }

        butterflies.forEach(b => b.update(elapsedTime));
        renderer.render(scene, camera);
    });
}
start();
