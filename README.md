# Mixed Reality Web Simulator 🎭🗡️

A client-side, browser-based Mixed Reality application built with Vanilla JavaScript, Three.js, and Google MediaPipe. This simulator allows real-time rendering of 3D objects mapped to hand gestures and custom 2D/3D facial overlays (Faceovers) with local morphing capabilities.

Developed by **[Miguel Páramos](https://mparamos.com)**.

## ✨ Features

* **Real-Time Hand Tracking:** Accurately detects hand landmarks and computes extended digits using advanced heuristics.
* **Dual-Hand 3D Interaction:** Renders a 3D object (GLB/GLTF) scaled and positioned dynamically between the user's hands.
* **Facial Mesh & Custom Faceovers:** Maps a high-density 478-point facial mesh. Users can upload custom `.png` textures to act as digital masks.
* **Local Morphing Engine:** Includes a custom topological deformation algorithm to independently adjust the position and scale of the eyes and mouth cutouts without breaking the 3D mesh.
* **Dynamic Topology Patching:** Toggleable options to dynamically triangulate and fill the physical mouth and eye holes in the MediaPipe mesh.
* **i18n Support:** Fully internationalized UI (English, Spanish, French) powered by a lightweight, pure Vanilla JS localization engine.
* **Zero Backend Requirements:** 100% client-side execution. No user data, images, or video feeds are ever sent to a server.

## 🛠️ Technology Stack

* **HTML5 / CSS3** (Flexbox, Pure CSS Vector Graphics)
* **Vanilla JavaScript** (ES6+, Strict MVC Architecture)
* **[Three.js](https://threejs.org/)** (v0.141.0) - For WebGL 3D rendering and GLTF loading.
* **[Google MediaPipe](https://developers.google.com/mediapipe)** - Face Mesh and Hands machine learning models.

## 🚀 How to Run Locally

Due to modern browser security policies regarding webcam access (`getUserMedia`), this application **cannot** be run directly from the file system (`file:///path/to/index.html`). It must be served over `localhost` or `HTTPS`.

### Using VS Code (Easiest way)
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
2. Open the project folder in VS Code.
3. Right-click `index.html` and select **"Open with Live Server"**.

### Using Python
If you have Python installed, you can spin up a quick local server from your terminal:
```bash
# Navigate to the project directory
cd path/to/mixed-reality-simulator

# For Python 3.x
python -m http.server 8000
