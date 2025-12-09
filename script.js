// --------------------------------------------------
// Scene, Camera, Renderer
// --------------------------------------------------
const container = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// --------------------------------------------------
// Lighting
// --------------------------------------------------
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// --------------------------------------------------
// Ground
// --------------------------------------------------
const groundGeom = new THREE.PlaneGeometry(500, 500);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
const ground = new THREE.Mesh(groundGeom, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// --------------------------------------------------
// Car
// --------------------------------------------------
const carGeom = new THREE.BoxGeometry(2, 1, 4);
const carMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const car = new THREE.Mesh(carGeom, carMat);
car.position.y = 0.5;
scene.add(car);

// --------------------------------------------------
// Car Physics
// --------------------------------------------------
let speed = 0;
const maxSpeed = 0.5;
const acceleration = 0.01;
const friction = 0.005;
const turnSpeed = 0.03;

const keys = {};

window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

// --------------------------------------------------
// Animation Loop
// --------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  // Accelerate / Brake
  if (keys["ArrowUp"] || keys["KeyW"]) speed += acceleration;
  if (keys["ArrowDown"] || keys["KeyS"]) speed -= acceleration;

  // Limit speed
  speed = Math.min(Math.max(speed, -maxSpeed), maxSpeed);

  // Steering
  if (speed !== 0) {
    if (keys["ArrowLeft"] || keys["KeyA"]) car.rotation.y += turnSpeed;
    if (keys["ArrowRight"] || keys["KeyD"]) car.rotation.y -= turnSpeed;
  }

  // Friction
  if (!keys["ArrowUp"] && !keys["KeyW"] && !keys["ArrowDown"] && !keys["KeyS"]) {
    if (speed > 0) speed -= friction;
    if (speed < 0) speed += friction;
    if (Math.abs(speed) < friction) speed = 0;
  }

  // Move car forward
  car.position.x += Math.sin(car.rotation.y) * speed;
  car.position.z += Math.cos(car.rotation.y) * speed;

  // Camera follow
  const followOffset = new THREE.Vector3(
    -Math.sin(car.rotation.y) * 10,
    5,
    -Math.cos(car.rotation.y) * 10
  );
  const desiredCamPos = car.position.clone().add(followOffset);
  camera.position.lerp(desiredCamPos, 0.05);
  camera.lookAt(car.position);

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
