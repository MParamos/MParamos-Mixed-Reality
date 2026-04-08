/**
 * @file main.js
 * @author: Miguel Páramos (mparamos.com)
 * @description Entry point for the camera feed. Initializes the MediaPipe Camera utility
 * and orchestrates frame processing for hand and face detection. Implements robust fallbacks
 * evaluating programmatic hardware access permissions prior to generating context.
 */

const placeholder = document.getElementById('camera-placeholder');

/**
 * Initializes visual rendering rules updating viewport parameters upon explicit hardware availability failures.
 * Modifies baseline DOM i18n variables triggering explicit translations enforcing contextual state modifications.
 */
function showNoCameraError() {
    placeholder.setAttribute('data-i18n', 'toast_cam_error');
    placeholder.innerHTML = window.t ? window.t('toast_cam_error') : "❌ This website only works if you have an active webcam.";

    placeholder.style.backgroundColor = "#c62828";
    placeholder.style.color = "white";
    placeholder.style.padding = "20px 40px";
    placeholder.style.borderRadius = "8px";
    placeholder.style.textAlign = "center";
    placeholder.style.zIndex = "100";
    placeholder.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
    placeholder.style.maxWidth = "80%";
}

// Evaluate standardized hardware enumeration APIs prior to implementing camera loop configurations
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            // Gracefully terminate preliminary testing evaluation constraints freeing hardware resources
            stream.getTracks().forEach(track => track.stop());

            // Initialize primary execution layer routing canvas contexts synchronously
            const camera = new Camera(videoElement, {
                onFrame: async () => {
                    canvasElement.width = videoElement.videoWidth;
                    canvasElement.height = videoElement.videoHeight;

                    if (threeCanvas.width !== canvasElement.width || threeCanvas.height !== canvasElement.height) {
                        if(typeof renderer3d !== 'undefined') {
                            renderer3d.setSize(canvasElement.width, canvasElement.height, false);
                            camera3d.aspect = canvasElement.width / canvasElement.height;
                            camera3d.updateProjectionMatrix();
                        }
                    }

                    canvasCtx.save();
                    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

                    // Defer asynchronous pipeline requests routing active context processing execution states
                    if (chkHandDetect.checked || chkFingerCount.checked) {
                        if(typeof hands !== 'undefined') await hands.send({image: videoElement});
                    }

                    if (chkFaceDetect.checked) {
                        if(typeof faceMesh !== 'undefined') await faceMesh.send({image: videoElement});
                    }

                    canvasCtx.restore();
                },
                width: 1280,
                height: 720
            });

            // Discard loading interface upon successful primary rendering hook activation
            camera.start().then(() => {
                placeholder.style.display = 'none';
            });
        })
        .catch((err) => {
            showNoCameraError();
        });
} else {
    showNoCameraError();
}
