/**
 * @file face.js
 * @author: Miguel Páramos (mparamos.com)
 * @description Initializes the MediaPipe Face Mesh model. Configures robust topological
 * mapping procedures bridging standard point arrays into ThreeJS BufferGeometry rendering matrices.
 * Implements real-time spatial deformation morphing based upon coordinate weight calculation.
 */

const faceoverFiles = ['skull.png', 'ill.png', 'japanese.png'];

// Instantiation placeholders for procedural geometry algorithms
let faceGeometry3D = null;
let faceMaterial3D = null;
let faceMesh3D = null;
const textureLoader = new THREE.TextureLoader();
let currentTexture = null;
let wasFaceDetected = false;
let uvsCalculated = false; // Flag preventing redundant computational mapping costs

let isCustomFaceoverActive = false;
let customFaceoverTexture = null;

let latestFaceLandmarks = null;

// Extrapolate references corresponding to interactive scaling algorithms
const faceoverSliders = document.getElementById('faceoverSliders');
const sldMeshScaleX = document.getElementById('meshScaleX');
const sldMeshScaleY = document.getElementById('meshScaleY');
const sldMeshOffsetX = document.getElementById('meshOffsetX');
const sldMeshOffsetY = document.getElementById('meshOffsetY');
const sldUvScaleX = document.getElementById('uvScaleX');
const sldUvScaleY = document.getElementById('uvScaleY');
const sldOffsetX = document.getElementById('uvOffsetX');
const sldOffsetY = document.getElementById('uvOffsetY');
const sldTilt = document.getElementById('meshTilt');

const sldMouthOffsetX = document.getElementById('mouthOffsetX');
const sldMouthOffsetY = document.getElementById('mouthOffsetY');
const sldMouthScale = document.getElementById('mouthScale');
const sldEyesOffsetX = document.getElementById('eyesOffsetX');
const sldEyesOffsetY = document.getElementById('eyesOffsetY');
const sldEyesScale = document.getElementById('eyesScale');

const chkFillMouth = document.getElementById('chkFillMouth');
const chkFillEyes = document.getElementById('chkFillEyes');

const btnResetSliders = document.getElementById('btnResetSliders');
const faceoverUploader = document.getElementById('faceoverUploader');
const btnCustomFaceover = document.getElementById('btnCustomFaceover');

// Initialize programmatic execution bypassing default interface rendering blocks
if (btnCustomFaceover && faceoverUploader) {
    btnCustomFaceover.addEventListener('click', () => {
        faceoverUploader.click();
    });
}

// Handle local asset routing converting filesystem object into compatible execution textures
if (faceoverUploader) {
    faceoverUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        textureLoader.load(url, (tex) => {
            customFaceoverTexture = tex;
            isCustomFaceoverActive = true;

            if (faceMaterial3D) {
                faceMaterial3D.map = customFaceoverTexture;
                faceMaterial3D.needsUpdate = true;
            }
            showToast(window.t('toast_loaded_face'), "success");

            // Evaluate existing computational flags determining recalculation prerequisites
            if (chkFaceover.checked && chkFaceDetect.checked && latestFaceLandmarks) {
                uvsCalculated = false;
            }
        });
    });
}

/**
 * Standard utility iterating input values bridging graphical rendering text outputs.
 * Enqueues real-time evaluation logic upon active geometry modifications.
 */
function updateSliders() {
    document.getElementById('valMeshScaleX').innerText = parseFloat(sldMeshScaleX.value).toFixed(2);
    document.getElementById('valMeshScaleY').innerText = parseFloat(sldMeshScaleY.value).toFixed(2);
    document.getElementById('valMeshOffsetX').innerText = parseFloat(sldMeshOffsetX.value).toFixed(2);
    document.getElementById('valMeshOffsetY').innerText = parseFloat(sldMeshOffsetY.value).toFixed(2);
    document.getElementById('valUvScaleX').innerText = parseFloat(sldUvScaleX.value).toFixed(2);
    document.getElementById('valUvScaleY').innerText = parseFloat(sldUvScaleY.value).toFixed(2);
    document.getElementById('valOffsetX').innerText = parseFloat(sldOffsetX.value).toFixed(2);
    document.getElementById('valOffsetY').innerText = parseFloat(sldOffsetY.value).toFixed(2);
    document.getElementById('valTilt').innerText = sldTilt.value + '°';

    if (sldMouthOffsetX) document.getElementById('valMouthOffsetX').innerText = sldMouthOffsetX.value;
    if (sldMouthOffsetY) document.getElementById('valMouthOffsetY').innerText = sldMouthOffsetY.value;
    if (sldMouthScale) document.getElementById('valMouthScale').innerText = sldMouthScale.value;
    if (sldEyesOffsetX) document.getElementById('valEyesOffsetX').innerText = sldEyesOffsetX.value;
    if (sldEyesOffsetY) document.getElementById('valEyesOffsetY').innerText = sldEyesOffsetY.value;
    if (sldEyesScale) document.getElementById('valEyesScale').innerText = sldEyesScale.value;

    if (latestFaceLandmarks && faceGeometry3D) {
        calibrateUVs(latestFaceLandmarks);
    }
}

// Compile index assigning recursive observers
const allFaceSliders = [
    sldMeshScaleX, sldMeshScaleY, sldMeshOffsetX, sldMeshOffsetY,
    sldUvScaleX, sldUvScaleY, sldOffsetX, sldOffsetY, sldTilt,
    sldMouthOffsetX, sldMouthOffsetY, sldMouthScale,
    sldEyesOffsetX, sldEyesOffsetY, sldEyesScale
];

allFaceSliders.forEach(slider => {
    if(slider) slider.addEventListener('input', updateSliders);
});

// Configure standardized fallback values overwriting all dynamic interface components
btnResetSliders.addEventListener('click', () => {
    sldMeshScaleX.value = 1.0;
    sldMeshScaleY.value = 1.0;
    sldMeshOffsetX.value = 0.0;
    sldMeshOffsetY.value = 0.0;
    sldUvScaleX.value = 1.35;
    sldUvScaleY.value = 1.35;
    sldOffsetX.value = 0.0;
    sldOffsetY.value = -0.01;
    sldTilt.value = 0;

    if (sldMouthOffsetX) sldMouthOffsetX.value = 0;
    if (sldMouthOffsetY) sldMouthOffsetY.value = 0;
    if (sldMouthScale) sldMouthScale.value = 100;
    if (sldEyesOffsetX) sldEyesOffsetX.value = 0;
    if (sldEyesOffsetY) sldEyesOffsetY.value = 0;
    if (sldEyesScale) sldEyesScale.value = 100;

    if (chkFillMouth) chkFillMouth.checked = false;
    if (chkFillEyes) chkFillEyes.checked = false;
    updateFaceIndices(); // Reinitialize matrix arrays defaulting to non-patched topology

    updateSliders();
});

let faceIndices = [];

/**
 * Translates MediaPipe indexed point connections into contiguous triangular arrays.
 * Compiles output array strictly defining spatial relationship bridging coordinates into renderable flat structures.
 */
function buildIndicesFromTessellation() {
    if (faceIndices.length > 0) return;
    const adj = new Map();
    for (const edge of FACEMESH_TESSELATION) {
        if (!adj.has(edge[0])) adj.set(edge[0], new Set());
        if (!adj.has(edge[1])) adj.set(edge[1], new Set());
        adj.get(edge[0]).add(edge[1]);
        adj.get(edge[1]).add(edge[0]);
    }
    for (let u = 0; u < 478; u++) {
        if (!adj.has(u)) continue;
        for (const v of adj.get(u)) {
            if (v > u) {
                for (const w of adj.get(v)) {
                    if (w > v && adj.get(u).has(w)) {
                        faceIndices.push(u, v, w);
                    }
                }
            }
        }
    }
}

/**
 * Conditionally mutates baseline indexed geometry arrays injecting secondary triangular closures.
 * Modifies core references preventing standard hollow rendering loops depending on specified parameter constraints.
 */
function updateFaceIndices() {
    if (!faceGeometry3D) return;
    let currentIndices = [...faceIndices];

    if (chkFillMouth && chkFillMouth.checked) {
        // Enqueue static array connecting inner labial bounds correlating to unified point mapping
        const mouthPatch = [
            78, 95, 191,  191, 95, 88,  191, 88, 80,  80, 88, 178,
            80, 178, 81,  81, 178, 87,  81, 87, 82,   82, 87, 14,
            82, 14, 13,   13, 14, 317,  13, 317, 312, 312, 317, 402,
            312, 402, 311, 311, 402, 318, 311, 318, 310, 310, 318, 324,
            310, 324, 415, 415, 324, 308
        ];
        currentIndices = currentIndices.concat(mouthPatch);
    }

    if (chkFillEyes && chkFillEyes.checked) {
        // Implement radial triangle generation connecting primary pupil bounds to peripheral eye boundaries
        const leftEyeLoop = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
        for(let i=0; i<leftEyeLoop.length; i++) {
            currentIndices.push(468, leftEyeLoop[i], leftEyeLoop[(i+1)%leftEyeLoop.length]);
        }

        const rightEyeLoop = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382];
        for(let i=0; i<rightEyeLoop.length; i++) {
            currentIndices.push(473, rightEyeLoop[i], rightEyeLoop[(i+1)%rightEyeLoop.length]);
        }
    }

    faceGeometry3D.setIndex(currentIndices);
}

// Bind live execution routing preventing geometry desync
if (chkFillMouth) chkFillMouth.addEventListener('change', updateFaceIndices);
if (chkFillEyes) chkFillEyes.addEventListener('change', updateFaceIndices);

/**
 * Initializes underlying geometric buffering required by Three.js standard rendering cycles.
 * @returns {boolean} State boolean verifying object assignment integrity.
 */
function initFace3D() {
    buildIndicesFromTessellation();

    faceGeometry3D = new THREE.BufferGeometry();
    updateFaceIndices();

    const placeholderUvs = new Float32Array(478 * 2);
    faceGeometry3D.setAttribute('uv', new THREE.BufferAttribute(placeholderUvs, 2));

    faceMaterial3D = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        side: THREE.DoubleSide
    });

    if (currentTexture) {
        faceMaterial3D.map = currentTexture;
        faceMaterial3D.needsUpdate = true;
    }

    faceMesh3D = new THREE.Mesh(faceGeometry3D, faceMaterial3D);
    faceMesh3D.visible = false;
    scene3d.add(faceMesh3D);
    return true;
}

/**
 * Projects physical points mapped within standardized facial boundaries converting rendering spaces
 * applying translation offsets resolving UV map scaling boundaries.
 * @param {Array<Object>} landmarks - Correlative index mapping point vectors relative to physical rendering constraints.
 */
function calibrateUVs(landmarks) {
    const scaleX = parseFloat(sldUvScaleX.value);
    const scaleY = parseFloat(sldUvScaleY.value);
    const offsetX = parseFloat(sldOffsetX.value);
    const offsetY = parseFloat(sldOffsetY.value);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const lm of landmarks) {
        if (lm.x < minX) minX = lm.x;
        if (lm.x > maxX) maxX = lm.x;
        if (lm.y < minY) minY = lm.y;
        if (lm.y > maxY) maxY = lm.y;
    }
    const width = maxX - minX;
    const height = maxY - minY;

    const uvs = new Float32Array(landmarks.length * 2);
    for (let i = 0; i < landmarks.length; i++) {
        const nx = (landmarks[i].x - (minX + width/2)) / width;
        const ny = (landmarks[i].y - (minY + height/2)) / height;

        uvs[i * 2] = (nx / scaleX) + 0.5 + offsetX;
        uvs[i * 2 + 1] = 1.0 - ((ny / scaleY) + 0.5 + offsetY);
    }

    faceGeometry3D.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    faceGeometry3D.attributes.uv.needsUpdate = true;
    uvsCalculated = true;
}

/**
 * Bypasses hardcoded array execution assigning custom user textures preemptively prior to executing standard randomized iteration pools.
 */
function loadRandomFaceover() {
    if (isCustomFaceoverActive && customFaceoverTexture) {
        currentTexture = customFaceoverTexture;
        if (faceMaterial3D) {
            faceMaterial3D.map = currentTexture;
            faceMaterial3D.needsUpdate = true;
        }
        return;
    }

    const randomImg = faceoverFiles[Math.floor(Math.random() * faceoverFiles.length)];
    textureLoader.load(`./FaceOvers/${randomImg}`, (tex) => {
        currentTexture = tex;
        if (faceMaterial3D) {
            faceMaterial3D.map = currentTexture;
            faceMaterial3D.needsUpdate = true;
        }
    });
}

// Bind feature toggling evaluating conditional dependencies preventing isolated rendering crashes
chkFaceover.addEventListener('change', (e) => {
    if (e.target.checked) {
        if (!chkFaceDetect.checked) {
            e.target.checked = false;
            showToast(window.t('toast_req_face'));
        } else {
            if(faceoverSliders) faceoverSliders.style.display = 'flex';
            loadRandomFaceover();
        }
    } else {
        if(faceoverSliders) faceoverSliders.style.display = 'none';
        if (faceMesh3D) faceMesh3D.visible = false;
    }
});

chkFaceDetect.addEventListener('change', (e) => {
    if (!e.target.checked && chkFaceover.checked) {
        chkFaceover.checked = false;
        if(faceoverSliders) faceoverSliders.style.display = 'none';
        if (faceMesh3D) faceMesh3D.visible = false;
    }
});

// Configure standardized MediaPipe Face Mesh initialization variables
const faceMesh = new FaceMesh({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

// Delegate frame rendering mapping vectors sequentially mapping complex interactions
faceMesh.onResults((results) => {
    if (!chkFaceDetect.checked) return;

    if (!faceMesh3D) initFace3D();

    const isFaceCurrentlyDetected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;

    if (isFaceCurrentlyDetected && !wasFaceDetected && chkFaceover.checked) {
        loadRandomFaceover();
        uvsCalculated = false;
    }

    wasFaceDetected = isFaceCurrentlyDetected;

    if (isFaceCurrentlyDetected) {
        latestFaceLandmarks = results.multiFaceLandmarks[0];

        if (chkFaceover.checked && faceMesh3D && currentTexture) {
            faceMesh3D.visible = true;

            if (!uvsCalculated) calibrateUVs(latestFaceLandmarks);

            const vFov = camera3d.fov * Math.PI / 180;
            const heightAtZ0 = 2 * Math.tan(vFov / 2) * camera3d.position.z;
            const widthAtZ0 = heightAtZ0 * camera3d.aspect;

            // Enqueue primary execution logic defining total mesh spatial properties
            const scaleX = parseFloat(sldMeshScaleX.value);
            const scaleY = parseFloat(sldMeshScaleY.value);
            const moveX = parseFloat(sldMeshOffsetX.value) * (widthAtZ0 / 2);
            const moveY = parseFloat(sldMeshOffsetY.value) * (heightAtZ0 / 2);
            const tiltRad = parseFloat(sldTilt.value) * Math.PI / 180;
            const cosT = Math.cos(tiltRad);
            const sinT = Math.sin(tiltRad);

            // Execute morphing logic defining arbitrary scalar execution values based on normalized DOM variables
            const mOffX = sldMouthOffsetX ? (parseFloat(sldMouthOffsetX.value) / 100) * widthAtZ0 : 0;
            const mOffY = sldMouthOffsetY ? -(parseFloat(sldMouthOffsetY.value) / 100) * heightAtZ0 : 0;
            const mScale = sldMouthScale ? parseFloat(sldMouthScale.value) / 100 : 1;

            const eOffX = sldEyesOffsetX ? (parseFloat(sldEyesOffsetX.value) / 100) * widthAtZ0 : 0;
            const eOffY = sldEyesOffsetY ? -(parseFloat(sldEyesOffsetY.value) / 100) * heightAtZ0 : 0;
            const eScale = sldEyesScale ? parseFloat(sldEyesScale.value) / 100 : 1;

            const nose = latestFaceLandmarks[1];
            const cX = (nose.x - 0.5) * widthAtZ0;
            const cY = -(nose.y - 0.5) * heightAtZ0;

            const mouthCenter = latestFaceLandmarks[13];
            const leftEyeCenter = latestFaceLandmarks[468] || latestFaceLandmarks[159];
            const rightEyeCenter = latestFaceLandmarks[473] || latestFaceLandmarks[386];

            const mcX = (mouthCenter.x - 0.5) * widthAtZ0;
            const mcY = -(mouthCenter.y - 0.5) * heightAtZ0;
            const lecX = (leftEyeCenter.x - 0.5) * widthAtZ0;
            const lecY = -(leftEyeCenter.y - 0.5) * heightAtZ0;
            const recX = (rightEyeCenter.x - 0.5) * widthAtZ0;
            const recY = -(rightEyeCenter.y - 0.5) * heightAtZ0;

            const mouthRadius = widthAtZ0 * 0.15;
            const eyeRadius = widthAtZ0 * 0.10;

            const positions = new Float32Array(latestFaceLandmarks.length * 3);

            for (let i = 0; i < latestFaceLandmarks.length; i++) {
                let rawX = (latestFaceLandmarks[i].x - 0.5) * widthAtZ0;
                let rawY = -(latestFaceLandmarks[i].y - 0.5) * heightAtZ0;
                let rawZ = -latestFaceLandmarks[i].z * widthAtZ0;

                // Evaluate current vertex distance mapping intersection rules identifying proximity weights
                const distMouth = Math.sqrt(Math.pow(rawX - mcX, 2) + Math.pow(rawY - mcY, 2));
                if (distMouth < mouthRadius) {
                    const weight = 1.0 - (distMouth / mouthRadius);
                    rawX += mOffX * weight;
                    rawY += mOffY * weight;
                    rawX = mcX + ((rawX - mcX) * (1.0 + (mScale - 1.0) * weight));
                    rawY = mcY + ((rawY - mcY) * (1.0 + (mScale - 1.0) * weight));
                }

                const distLeftEye = Math.sqrt(Math.pow(rawX - lecX, 2) + Math.pow(rawY - lecY, 2));
                const distRightEye = Math.sqrt(Math.pow(rawX - recX, 2) + Math.pow(rawY - recY, 2));

                let eyeWeight = 0;
                let activeEyeCenterX = 0;
                let activeEyeCenterY = 0;

                if (distLeftEye < eyeRadius) {
                    eyeWeight = 1.0 - (distLeftEye / eyeRadius);
                    activeEyeCenterX = lecX;
                    activeEyeCenterY = lecY;
                } else if (distRightEye < eyeRadius) {
                    eyeWeight = 1.0 - (distRightEye / eyeRadius);
                    activeEyeCenterX = recX;
                    activeEyeCenterY = recY;
                }

                if (eyeWeight > 0) {
                    rawX += eOffX * eyeWeight;
                    rawY += eOffY * eyeWeight;
                    rawX = activeEyeCenterX + ((rawX - activeEyeCenterX) * (1.0 + (eScale - 1.0) * eyeWeight));
                    rawY = activeEyeCenterY + ((rawY - activeEyeCenterY) * (1.0 + (eScale - 1.0) * eyeWeight));
                }

                // Apply uniform matrix modification normalizing specific geometric coordinates into rendering translation bounds
                let dx = rawX - cX;
                let dy = rawY - cY;
                let sx = dx * scaleX;
                let sy = dy * scaleY;
                let rx = sx * cosT - sy * sinT;
                let ry = sx * sinT + sy * cosT;

                positions[i * 3] = rx + cX + moveX;
                positions[i * 3 + 1] = ry + cY + moveY;
                positions[i * 3 + 2] = rawZ;
            }

            faceGeometry3D.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            faceGeometry3D.attributes.position.needsUpdate = true;

        } else {
            // Render baseline visualization executing standard 2D vector arrays
            if (faceMesh3D) faceMesh3D.visible = false;
            drawConnectors(canvasCtx, latestFaceLandmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
            drawConnectors(canvasCtx, latestFaceLandmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
            drawConnectors(canvasCtx, latestFaceLandmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
            drawConnectors(canvasCtx, latestFaceLandmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
        }
    } else {
        latestFaceLandmarks = null;
        if (faceMesh3D) faceMesh3D.visible = false;
    }
});
