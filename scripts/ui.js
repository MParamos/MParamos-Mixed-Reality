/**
 * @file ui.js
 * @author: Miguel Páramos (mparamos.com)
 * @description Manages user interface interactions, DOM element references, toast notifications,
 * and responsive layout adjustments based on client device capabilities.
 */

// Dynamically assign the current calendar year to the footer licensing text
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Cache global DOM references essential for cross-script execution
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const threeCanvas = document.getElementById('three_canvas');

// Cache DOM references for principal feature checkboxes
const chkFaceDetect = document.getElementById('chkFaceDetect');
const chkFaceover = document.getElementById('chkFaceover');
const chkHandDetect = document.getElementById('chkHandDetect');
const chkFingerCount = document.getElementById('chkFingerCount');

// Cache DOM references for user-facing action triggers
const btnDownloadTemplate = document.getElementById('btnDownloadTemplate');
const btnDownloadCode = document.getElementById('btnDownloadCode');

// Gracefully handle missing assets by hiding the node upon fetching error
const creditsLogo = document.querySelector('.credits-logo');
if(creditsLogo) {
    creditsLogo.addEventListener('error', function() {
        this.style.display = 'none';
    });
}

// Instantiate programmatic download of a static asset via transient anchor element
btnDownloadTemplate.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = './FaceOvers/canonical_face_model_uv_visualization.png';
    link.download = 'plantilla_faceover.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Cleanup DOM post-execution
});

// Implementation stub for repository export
btnDownloadCode.addEventListener('click', () => {
    console.log("Source code export action triggered. Awaiting endpoint integration.");
});

/**
 * Displays a transient notification message anchored to the viewport.
 * @param {string} message - The string literal to be displayed.
 * @param {string} [type="error"] - Defines contextual CSS styling ('error', 'success', 'info').
 * @param {number} [duration=3000] - Visibility duration in milliseconds prior to automatic dismissal.
 */
function showToast(message, type = "error", duration = 3000) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    // Wipe previous state modifiers and concatenate target type class
    toast.className = "toast-" + type;
    void toast.offsetWidth; // Force synchronous browser layout recalculation (reflow) to restart CSS transitions
    toast.classList.add("show");

    // Enqueue dismissal callback
    setTimeout(() => { toast.classList.remove("show"); }, duration);
}

/**
 * Evaluates client hardware constraints to toggle specific landscape warnings
 * exclusively for coarse pointer devices (e.g., mobile phones, tablets).
 */
function checkOrientation() {
    const warning = document.getElementById('landscape-warning');
    const ui = document.querySelector('.ui-container');
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
        if (window.innerWidth > window.innerHeight) {
            // Mobile device evaluated to landscape geometry
            warning.style.display = 'flex';
            if(ui) ui.style.display = 'none';
        } else {
            // Mobile device evaluated to standard portrait geometry
            warning.style.display = 'none';
            if(ui) ui.style.display = 'flex';
        }
    } else {
        // Desktop or fine-pointer environment defaults to execution allowed
        warning.style.display = 'none';
        if(ui) ui.style.display = 'flex';
    }
}

// Bind orientation resolution handler to viewport mutations
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
checkOrientation(); // Initial invocation

// Enqueue informative toast evaluating touch capabilities upon primary load
if (window.matchMedia("(pointer: coarse)").matches) {
    setTimeout(() => {
        showToast(window.t('toast_mobile'), "info", 10000);
    }, 2000);
}
