import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';
import Butterfly from './Butterfly.js';

document.querySelector('#app').innerHTML = `
  <div id="container"></div>
`;

const mindarThree = new MindARThree({
  container: document.querySelector('#container'),
  imageTargetSrc: './targets.mind',
});
const { renderer, scene, camera } = mindarThree;

const anchor = mindarThree.addAnchor(0);

// Initialize Butterflies
const textureLoader = new THREE.TextureLoader();
const butterflies = [];

for (let i = 0; i < 3; i++) {
  const butterfly = new Butterfly(anchor.group, textureLoader, {
    createBase: false,
    takeoffDelay: i * 1.5,
    fadeInDuration: 0.1,
    flightHeight: 0.5 + Math.random() * 0.2,
    movementRadius: 1.0 + Math.random() * 0.2,
    movementRandomness: 0.2,
    scale: 1,
  });
  butterflies.push(butterfly);
}

const clock = new THREE.Clock();

anchor.onTargetFound = () => {
  const t = clock.getElapsedTime();
  butterflies.forEach(b => b.start(t));
}

const start = async () => {
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    const elapsedTime = clock.getElapsedTime();
    butterflies.forEach(b => b.update(elapsedTime));
    renderer.render(scene, camera);
  });
}
start();
