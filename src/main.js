import './style.css';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';

document.querySelector('#app').innerHTML = `
  <div id="container"></div>
`;

const mindarThree = new MindARThree({
  container: document.querySelector('#container'),
  imageTargetSrc: './targets.mind',
});
const { renderer, scene, camera } = mindarThree;

const anchor = mindarThree.addAnchor(0);
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
anchor.group.add(cube);

const start = async () => {
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}
start();
