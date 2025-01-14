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
  
    // Smoothly update the camera position to follow the raft
    const desiredPosition = new THREE.Vector3();
    const currentPosition = new THREE.Vector3();
  
    function updateCameraPositionSmoothly(camera, target, offset) {
      if (target) {
        desiredPosition.set(
          target.position.x + offset.x,
          target.position.y + offset.y,
          target.position.z + offset.z
        );
        currentPosition.lerp(desiredPosition, 0.1); // Adjust 0.1 for smoothness
        camera.position.copy(currentPosition);
        camera.lookAt(target.position); // Ensure the camera always looks at the raft
      }
    }
  
    // Update raft position and orientation based on user input
    function updateRaftPosition() {
      if (raft) {
        let direction = new THREE.Vector3();
  
        // Calculate direction based on keys
        if (keys.w) direction.z -= 1;
        if (keys.s) direction.z += 1;
        if (keys.a) direction.x -= 1;
        if (keys.d) direction.x += 1;
  
        // Normalize direction to avoid diagonal speed boost
        if (direction.length() > 0) {
          direction.normalize();
  
          // Update raft position
          raft.position.addScaledVector(direction, 0.1);
  
          // Update raft rotation to face the movement direction
          const angle = Math.atan2(direction.x, direction.z);
          raft.rotation.y = angle;
        }
      }
    }
  
    const cameraOffset = { x: 0, y: 5, z: 10 }; // Adjust this offset for third-person view
  
    function animate() {
      requestAnimationFrame(animate);
  
      // Update raft position and orientation
      updateRaftPosition();
  
      // Smoothly update camera position
      updateCameraPositionSmoothly(camera, raft, cameraOffset);
  
      // Render the scene
      renderer.render(scene, camera);
    }
  
    // Start the animation loop
    animate();
  
  } else {
    console.warn('WebGL 2 is not available');
    const warning = WebGL.getWebGL2ErrorMessage();
    container.appendChild(warning);
  }  
});