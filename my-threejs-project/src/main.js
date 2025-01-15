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

    // Create the ocean surface
    const oceanGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50); // Large plane with segments for waves
    const oceanMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e90ff, // Deep sky blue
      shininess: 50, // Adds a slight shine
      flatShading: true, // Low-poly look
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2; // Rotate to lie flat
    scene.add(ocean);

    // Add wave animation
    function animateWaves() {
      const time = performance.now() * 0.001; // Get time in seconds
      const vertices = ocean.geometry.attributes.position.array;

      for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        const z = vertices[i + 2];

        // Simple sine wave formula for height
        vertices[i + 2] = Math.sin(x * 0.1 + time) * 0.5 + Math.sin(y * 0.1 + time) * 0.5;
      }

      // Update the geometry to reflect vertex changes
      ocean.geometry.attributes.position.needsUpdate = true;
    }
  
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
        if (keys.w) direction.z += 1;
        if (keys.s) direction.z -= 1;
        if (keys.a) direction.x += 1;
        if (keys.d) direction.x -= 1;
  
        // Normalize direction to avoid diagonal speed boost
        if (direction.length() > 0) {
          direction.normalize();
        
          // Update raft position
          raft.position.addScaledVector(direction, 0.1);
        
          // Calculate the target rotation
          const targetAngle = Math.atan2(direction.x, direction.z);
          const currentAngle = raft.rotation.y;
        
          // Smoothly interpolate to the target angle
          raft.rotation.y = THREE.MathUtils.lerp(currentAngle, targetAngle, 0.1); // Adjust 0.1 for smoothness
        }
        
      }
    }
  
    const cameraOffset = { x: 0, y: 8, z: 15 }; // Adjust this offset for third-person view
  
    function animate() {
      requestAnimationFrame(animate);
  
      // Update raft position and orientation
      updateRaftPosition();
  
      // Smoothly update camera position
      updateCameraPositionSmoothly(camera, raft, cameraOffset);

        // Animate waves
      animateWaves();
  
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