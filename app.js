// --- 1. Three.js Background Particle Setup ---
const canvas = document.getElementById('hero-canvas');
let scene, camera, renderer, particleSystem;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThree() {
    // Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Particles Geometry
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Generate coordinates forming a loose cyber-sphere
    for (let i = 0; i < particleCount; i++) {
        // Spherical coordinates
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 180 + Math.random() * 40; // thickness/radial randomness

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Color interpolation between luxury champagne gold (#c5a880) and platinum silver (#d4d4d4)
        const mixRatio = Math.random();
        colors[i * 3] = mixRatio * (197 / 255) + (1 - mixRatio) * (212 / 255); // R
        colors[i * 3 + 1] = mixRatio * (168 / 255) + (1 - mixRatio) * (212 / 255); // G
        colors[i * 3 + 2] = mixRatio * (128 / 255) + (1 - mixRatio) * (212 / 255); // B
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Texture/Material
    // Create a circular particle texture dynamically
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
        size: 3.5,
        vertexColors: true,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    // Particle System
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Event Listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);

    animate();
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Slowly rotate the point-cloud sphere
    particleSystem.rotation.y += 0.0015;
    particleSystem.rotation.x += 0.0008;

    // React slightly to mouse movement
    const targetX = mouseX * 0.15;
    const targetY = mouseY * 0.15;
    particleSystem.position.x += (targetX - particleSystem.position.x) * 0.05;
    particleSystem.position.y += (-targetY - particleSystem.position.y) * 0.05;

    renderer.render(scene, camera);
}

// Initialise Background
initThree();


// --- 2. Model Viewer Interactions & Controls ---
const modelViewer = document.getElementById('showroom-viewer');
const toggleRotateBtn = document.getElementById('toggle-rotate');
const resetCameraBtn = document.getElementById('reset-camera');
const toggleShadowsBtn = document.getElementById('toggle-shadows');

// Toggle auto-rotation
toggleRotateBtn.addEventListener('click', () => {
    const isRotating = modelViewer.hasAttribute('auto-rotate');
    if (isRotating) {
        modelViewer.removeAttribute('auto-rotate');
        toggleRotateBtn.classList.remove('active');
    } else {
        modelViewer.setAttribute('auto-rotate', '');
        toggleRotateBtn.classList.add('active');
    }
});

// Reset camera view
resetCameraBtn.addEventListener('click', () => {
    modelViewer.cameraOrbit = '0deg 75deg auto';
    modelViewer.fieldOfView = 'auto';
});

// Toggle shadows
toggleShadowsBtn.addEventListener('click', () => {
    const intensity = modelViewer.getAttribute('shadow-intensity');
    if (parseFloat(intensity) > 0) {
        modelViewer.setAttribute('shadow-intensity', '0');
        toggleShadowsBtn.classList.remove('active');
    } else {
        modelViewer.setAttribute('shadow-intensity', '1.5');
        toggleShadowsBtn.classList.add('active');
    }
});

// Handle loading error (e.g. offline/network restrictions for CDN assets)
modelViewer.addEventListener('error', (error) => {
    console.warn("Model viewer load error, displaying drag & drop helper:", error);
    const infoText = document.createElement('div');
    infoText.className = 'viewer-error-banner';
    infoText.innerHTML = '⚠️ Default model offline. Drag & drop your own <b>.glb</b> file to explore!';
    infoText.style.cssText = 'position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(220, 38, 38, 0.25); border: 1px solid rgba(220, 38, 38, 0.5); padding: 10px 20px; border-radius: 30px; font-size: 0.85rem; color: #fca5a5; z-index: 10; pointer-events: none; backdrop-filter: blur(8px); font-family: var(--font-body); white-space: nowrap;';
    
    if (!document.querySelector('.viewer-error-banner')) {
        modelViewer.parentElement.appendChild(infoText);
    }
});

// Remove error banner when a file is successfully loaded
modelViewer.addEventListener('load', () => {
    const banner = document.querySelector('.viewer-error-banner');
    if (banner) {
        banner.remove();
    }
});



// --- 3. Drag & Drop Local GLB Uploader ---
const showroomContainer = document.querySelector('.showroom-container');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const browseLink = document.querySelector('.browse-link');

// Open file dialog when clicking link
browseLink.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    showroomContainer.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Drag highlights
showroomContainer.addEventListener('dragenter', () => {
    dropZone.classList.add('active');
}, false);

showroomContainer.addEventListener('dragover', () => {
    dropZone.classList.add('active');
}, false);

// Hide overlay if dragged outside dropzone
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
}, false);

// Handle dropped files
showroomContainer.addEventListener('drop', (e) => {
    dropZone.classList.remove('active');
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}, false);

// Handle file input changes (clicks)
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    
    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.glb')) {
        alert('Please select a valid 3D .glb file.');
        return;
    }

    // Create Local Object URL and inject to model-viewer
    const objectURL = URL.createObjectURL(file);
    modelViewer.src = objectURL;
    
    // Automatically turn on rotation on new model upload to show it off
    modelViewer.setAttribute('auto-rotate', '');
    toggleRotateBtn.classList.add('active');
}


// --- 4. Contact Form Interaction ---
const contactForm = document.getElementById('contact-form');
const successMessage = document.getElementById('form-success');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Perform subtle button animation state
    const submitBtn = contactForm.querySelector('.form-submit');
    submitBtn.innerText = 'Transmitting... ⚡';
    submitBtn.disabled = true;

    // Simulate server side connection
    setTimeout(() => {
        submitBtn.innerText = 'Send Message 🚀';
        submitBtn.disabled = false;
        contactForm.reset();
        
        // Show success state
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }, 1500);
});
