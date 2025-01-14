import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  const container = document.getElementById('container');
  console.log('Container:', container);

  if (!container) {
    console.error('The #container element is missing!');
    return;
  }

  if (WebGL.isWebGL2Available()) {
    console.log('WebGL 2 is available');

    // Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 10);

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Load the raft model
const loader = new GLTFLoader();
let raft;

loader.load(
  '/assets/Raft.glb',
  (gltf) => {
    raft = gltf.scene;
    raft.position.set(0, 0, 0);
    raft.scale.set(1, 1, 1);
    scene.add(raft);
  },
  undefined,
  (error) => {
    console.error('Error loading the model:', error);
  }
);

// Handle keyboard inputs
const keys = { w: false, a: false, s: false, d: false };

document.addEventListener('keydown', (event) => {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = false;
  }
});

function updateRaftPosition() {
  if (raft) {
    if (keys.w) raft.position.z -= 0.1;
    if (keys.s) raft.position.z += 0.1;
    if (keys.a) raft.position.x -= 0.1;
    if (keys.d) raft.position.x += 0.1;
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  updateRaftPosition();
  renderer.render(scene, camera);
}
animate();
  } else {
    console.warn('WebGL 2 is not available');
    const warning = WebGL.getWebGL2ErrorMessage();
    container.appendChild(warning);
  }
});
