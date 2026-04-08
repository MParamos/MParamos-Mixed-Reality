/**
 * @file hands.js
 * @author: Miguel Páramos (mparamos.com)
 * @description Initializes and configures the MediaPipe Hands model.
 * Orchestrates dual-hand heuristics, interface syncing, and 3D rendering of hand-tracked objects.
 */

// Cache DOM references for Hand parameter sliders
const handObjectSliders = document.getElementById('handObjectSliders');
const sldHandScale = document.getElementById('sldHandScale');
const valHandScale = document.getElementById('valHandScale');

const sldHandOffsetX = document.getElementById('sldHandOffsetX');
const sldHandOffsetY = document.getElementById('sldHandOffsetY');
const valHandOffsetX = document.getElementById('valHandOffsetX');
const valHandOffsetY = document.getElementById('valHandOffsetY');
const btnResetHandSliders = document.getElementById('btnResetHandSliders');

// Bind interface display logic to Hand Detection toggle state
chkHandDetect.addEventListener('change', (e) => {
    if (!e.target.checked && chkFingerCount.checked) {
        chkFingerCount.checked = false; // Disable dependent features
    }
    if (handObjectSliders) {
        handObjectSliders.style.display = e.target.checked ? 'flex' : 'none';
    }
});

// Initialization routine for slider panel visibility
if (handObjectSliders) {
    handObjectSliders.style.display = chkHandDetect.checked ? 'flex' : 'none';
}

// Attach mutation observers to sliders to update corresponding DOM text nodes
if (sldHandScale) {
    sldHandScale.addEventListener('input', (e) => {
        if (valHandScale) valHandScale.innerText = e.target.value;
    });
}
if (sldHandOffsetX) {
    sldHandOffsetX.addEventListener('input', (e) => {
        if (valHandOffsetX) valHandOffsetX.innerText = parseFloat(e.target.value).toFixed(2);
    });
}
if (sldHandOffsetY) {
    sldHandOffsetY.addEventListener('input', (e) => {
        if (valHandOffsetY) valHandOffsetY.innerText = parseFloat(e.target.value).toFixed(2);
    });
}

// Reset configuration pipeline for Hand parameters
if (btnResetHandSliders) {
    btnResetHandSliders.addEventListener('click', () => {
        if (sldHandScale) sldHandScale.value = 100;
        if (sldHandOffsetX) sldHandOffsetX.value = 0.00;
        if (sldHandOffsetY) sldHandOffsetY.value = 0.00;

        if (valHandScale) valHandScale.innerText = "100";
        if (valHandOffsetX) valHandOffsetX.innerText = "0.00";
        if (valHandOffsetY) valHandOffsetY.innerText = "0.00";
    });
}

// Prevent heuristic evaluation if baseline detection evaluates to false
chkFingerCount.addEventListener('change', (e) => {
    if (e.target.checked && !chkHandDetect.checked) {
        e.target.checked = false;
        showToast(window.t('toast_req_hand'), "error");
    }
});

/**
 * Executes advanced heuristic evaluation over detected palm topology to estimate extended digits.
 * Implements logic compensating for dorsal versus palmar perspectives relative to coordinate space.
 * @param {Array<Object>} landmarks - The array containing the 21 localized point coordinates for a single hand.
 * @param {string} handedness - String classifying detected topology as 'Left' or 'Right'.
 * @returns {number} Computed integer depicting extended digits.
 */
function countFingers(landmarks, handedness) {
    let count = 0;

    // Evaluate standard phalanges (Index, Middle, Ring, Pinky) via local Y-axis comparative thresholding
    if (landmarks[8].y < landmarks[6].y) count++;
    if (landmarks[12].y < landmarks[10].y) count++;
    if (landmarks[16].y < landmarks[14].y) count++;
    if (landmarks[20].y < landmarks[18].y) count++;

    // Evaluate perspective utilizing horizontal coordinate variance between index base and pinky base
    const isBackOfHand = (handedness === 'Left')
        ? (landmarks[17].x > landmarks[5].x)
        : (landmarks[17].x < landmarks[5].x);

    // Apply strict comparative branching for thumb classification based upon dorsal evaluation
    if (handedness === 'Left') {
        if (!isBackOfHand && landmarks[4].x > landmarks[3].x) count++;
        else if (isBackOfHand && landmarks[4].x < landmarks[3].x) count++;
    } else {
        if (!isBackOfHand && landmarks[4].x < landmarks[3].x) count++;
        else if (isBackOfHand && landmarks[4].x > landmarks[3].x) count++;
    }
    return count;
}

// Persistency definitions for dual-hand object rendering
let poseBufferFrames = 0;
const MAX_BUFFER_FRAMES = 15; // Sustains object visibility bridging transient detection gaps
let lastDrawData = { x: 0, y: 0, scale: 0 };

let earthMesh = null;
let customMesh = null;
const glbLoader = new THREE.GLTFLoader();

// Initialize core Three.js scene architecture
const scene3d = new THREE.Scene();
const camera3d = new THREE.PerspectiveCamera(75, 1280 / 720, 0.1, 1000);
const renderer3d = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
renderer3d.setClearColor(0x000000, 0); // Enforce composite transparency enabling underlying camera visualization
renderer3d.setSize(1280, 720, false);
camera3d.position.z = 5;

// Inject standard illumination
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.6);
scene3d.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
directionalLight.position.set(2, 2, 5).normalize();
scene3d.add(directionalLight);

// Execute asynchronous fetching of baseline GLB asset
glbLoader.load('3DObjects/earth.glb', (gltf) => {
    earthMesh = gltf.scene;
    earthMesh.visible = false;
    earthMesh.rotation.x = 35 * (Math.PI / 180);
    scene3d.add(earthMesh);
}, undefined, (err) => console.error("Error evaluating baseline GLB dependency:", err));

// DOM references managing local model upload routines
const glbUploader = document.getElementById('glbUploader');
const btnUploadGLB = document.getElementById('btnCustomObject');

// Bridging interaction to invisible standard DOM input type
if (btnUploadGLB && glbUploader) {
    btnUploadGLB.addEventListener('click', () => {
        glbUploader.click();
    });
}

// Intercept file blob processing and initialize substitution routine
if(glbUploader) {
    glbUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file); // Construct transient local pointer

        glbLoader.load(url, (gltf) => {
            if (customMesh) scene3d.remove(customMesh); // Execute garbage processing for previous local model
            customMesh = gltf.scene;

            // Execute auto-scaling normalizing generic model to specific target boundaries
            const box = new THREE.Box3().setFromObject(customMesh);
            const size = box.getSize(new THREE.Vector3()).length();
            const scaleFactor = 3.0 / size;
            customMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

            customMesh.visible = false;
            scene3d.add(customMesh);
            if (earthMesh) earthMesh.visible = false;

            showToast(window.t('toast_loaded_obj', { file: file.name }), "success");
        });
    });
}

/**
 * Core loop executing render updates bound to monitor refresh intervals.
 */
function animate3d() {
    requestAnimationFrame(animate3d);
    const activeObj = customMesh || earthMesh;
    if (activeObj) {
        activeObj.rotation.y += 0.05; // Standard Y-axis rotation constant
    }
    renderer3d.render(scene3d, camera3d);
}
animate3d();

// Initialize MediaPipe Hands topology solver mapping localized CDN assets
const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

// Delegate frame processing result loop
hands.onResults((results) => {
    if (!chkHandDetect.checked && !chkFingerCount.checked) return;

    let currentPoseValid = false;
    let currentLeftLandmarks = null;
    let currentRightLandmarks = null;
    let currentLeftFingers = 0;
    let currentRightFingers = 0;

    // Isolate frame structures matching detection thresholds
    if (results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            const handedness = results.multiHandedness[i].label;
            const isLeft = handedness === 'Left';
            const handColor = isLeft ? '#00FFFF' : '#FF00FF';
            const fingers = countFingers(landmarks, handedness);

            if (isLeft) {
                currentLeftLandmarks = landmarks;
                currentLeftFingers = fingers;
            } else {
                currentRightLandmarks = landmarks;
                currentRightFingers = fingers;
            }

            // Draw wireframe overlay directly correlating to the 2D Canvas context
            if (chkHandDetect.checked) {
                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: handColor, lineWidth: 2});
                drawLandmarks(canvasCtx, landmarks, {color: '#FFFFFF', lineWidth: 1, radius: 2});
            }

            // Render numeric value representing specific finger heuristic computation
            if (chkFingerCount.checked) {
                const x = landmarks[0].x * canvasElement.width;
                const y = (landmarks[0].y * canvasElement.height) - 30;
                canvasCtx.save();
                canvasCtx.scale(-1, 1);
                canvasCtx.font = "bold 56px sans-serif";
                canvasCtx.fillStyle = handColor;
                canvasCtx.strokeStyle = "black";
                canvasCtx.lineWidth = 4;
                canvasCtx.textAlign = "center";
                canvasCtx.strokeText(fingers, -x, y);
                canvasCtx.fillText(fingers, -x, y);
                canvasCtx.restore();
            }
        }
    }

    const activeObj = customMesh || earthMesh;

    // Dual-hand gesture bridging logic for 3D model injection
    if (activeObj && currentLeftLandmarks && currentRightLandmarks) {
        // Enforce heuristic rule constraint: Right hand > 4 fingers; Left hand > 3 fingers
        if (currentLeftFingers >= 3 && currentLeftFingers <= 5 &&
            currentRightFingers >= 4 && currentRightFingers <= 5) {

            currentPoseValid = true;
            poseBufferFrames = MAX_BUFFER_FRAMES; // Refill sustain buffer

            const wrist0 = currentLeftLandmarks[0];
            const wrist1 = currentRightLandmarks[0];

            lastDrawData.x = (wrist0.x + wrist1.x) / 2 * canvasElement.width;
            lastDrawData.y = ((wrist0.y + wrist1.y) / 2 * canvasElement.height) - 100;

            const distance = Math.sqrt(Math.pow(wrist0.x - wrist1.x, 2) + Math.pow(wrist0.y - wrist1.y, 2));

            // Extract arbitrary scale variance dictated by DOM user parameters
            const scaleMultiplier = sldHandScale ? (parseFloat(sldHandScale.value) / 100) : 1.0;
            lastDrawData.scale = Math.max(0.015, distance * 0.175) * scaleMultiplier;
        }
    }

    // Execute translation mapping normalizing Canvas 2D vectors into ThreeJS coordinate constraints
    if (activeObj && (currentPoseValid || poseBufferFrames > 0)) {
        if (customMesh && earthMesh) earthMesh.visible = false;
        activeObj.visible = true;

        const ndcX = ( ( lastDrawData.x / canvasElement.width ) * 2 ) - 1;
        const ndcY = - ( ( lastDrawData.y / canvasElement.height ) * 2 ) + 1;

        const baseX = ndcX * camera3d.position.z * camera3d.aspect;
        const baseY = ndcY * camera3d.position.z;

        // Apply offset parameters directly modifying execution translation variables
        const offsetX = sldHandOffsetX ? parseFloat(sldHandOffsetX.value) : 0;
        const offsetY = sldHandOffsetY ? parseFloat(sldHandOffsetY.value) : 0;

        activeObj.position.set(baseX + offsetX, baseY + offsetY, 0);
        activeObj.scale.set(lastDrawData.scale, lastDrawData.scale, lastDrawData.scale);

        if (!currentPoseValid) poseBufferFrames--;
    } else if (activeObj) {
        activeObj.visible = false;
    }
});
