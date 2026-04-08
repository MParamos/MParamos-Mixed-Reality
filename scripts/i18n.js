/**
 * @file i18n.js
 * @author: Miguel Páramos (mparamos.com)
 * @description Handles internationalization (i18n) for the application.
 * Contains static translation dictionaries and manages dynamic DOM updates upon language switching.
 */

// Static dictionary mapping language keys to their respective translation strings.
const translations = {
    es: {
        "warn_title": "📱 ¡Gira el móvil!",
        "warn_desc1": "Esta experiencia de Realidad Mixta está diseñada para usarse en vertical (Portrait) y con el dispositivo perpendicular al suelo.",
        "warn_desc2": "(Aunque te digo un secreto: en modo escritorio va aún mejor 😉)",
        "loading_models": "[ Cargando Modelos IA... ]",
        "title_faceover": "🎭 Opciones de Faceover",
        "size_x": "Tamaño X",
        "size_y": "Tamaño Y",
        "offset_x": "Desplazar X",
        "offset_y": "Desplazar Y",
        "tex_x": "Textura X",
        "tex_y": "Textura Y",
        "offset_tx": "Offset TX",
        "offset_ty": "Offset TY",
        "rotation": "Rotación",
        "mouth_x": "Boca X",
        "mouth_y": "Boca Y",
        "scale_mouth": "Escala Boca",
        "eyes_x": "Ojos X",
        "eyes_y": "Ojos Y",
        "scale_eyes": "Escala Ojos",
        "close_mouth": "Cerrar Boca",
        "close_eyes": "Cerrar Ojos",
        "btn_reset": "🔄 Reset",
        "title_hand": "🗡️ Opciones de objeto en mano",
        "size": "Tamaño",
        "det_face": "Detección Cara",
        "faceover": "Faceover 🎭",
        "det_hands": "Detección Manos",
        "count_fingers": "Contador Dedos",
        "btn_template": "📥 Descargar plantilla faceover",
        "btn_custom_face": "🖼️ Propio faceover",
        "btn_custom_hand": "🗡️ Propio objeto mano",
        "btn_code": "📥 Descargar código fuente",
        "credits_title": "Miguel Páramos - Realidad Mixta",
        "credits_license1": "Distribuido bajo licencia",
        "credits_license2": "Se agradece atribución con enlace a",
        "credits_license3": "Powered by",
        "toast_cam_error": "❌ Esta página web solo funciona si tienes una webcam disponible en tu equipo.",
        "toast_mobile": "📱 Mantén el móvil recto (perpendicular al suelo) para mejor seguimiento. En modo escritorio va aún mejor.",
        "toast_req_face": "⚠️ ¡Debes activar la Detección de Cara primero!",
        "toast_req_hand": "⚠️ ¡Debes activar la Detección de Manos primero!",
        "toast_loaded_face": "🖼️ Faceover personalizado cargado",
        "toast_loaded_obj": "🚀 {file} cargado"
    },
    en: {
        "warn_title": "📱 Rotate your phone!",
        "warn_desc1": "This Mixed Reality experience is designed to be used in Portrait mode with the device perpendicular to the ground.",
        "warn_desc2": "(Secret tip: it works even better on desktop 😉)",
        "loading_models": "[ Loading AI Models... ]",
        "title_faceover": "🎭 Faceover Options",
        "size_x": "Size X",
        "size_y": "Size Y",
        "offset_x": "Offset X",
        "offset_y": "Offset Y",
        "tex_x": "Texture X",
        "tex_y": "Texture Y",
        "offset_tx": "Offset TX",
        "offset_ty": "Offset TY",
        "rotation": "Rotation",
        "mouth_x": "Mouth X",
        "mouth_y": "Mouth Y",
        "scale_mouth": "Mouth Scale",
        "eyes_x": "Eyes X",
        "eyes_y": "Eyes Y",
        "scale_eyes": "Eyes Scale",
        "close_mouth": "Fill Mouth",
        "close_eyes": "Fill Eyes",
        "btn_reset": "🔄 Reset",
        "title_hand": "🗡️ Hand Object Options",
        "size": "Scale",
        "det_face": "Face Detection",
        "faceover": "Faceover 🎭",
        "det_hands": "Hand Detection",
        "count_fingers": "Finger Counter",
        "btn_template": "📥 Download faceover template",
        "btn_custom_face": "🖼️ Custom faceover",
        "btn_custom_hand": "🗡️ Custom hand object",
        "btn_code": "📥 Download source code",
        "credits_title": "Miguel Páramos - Mixed Reality",
        "credits_license1": "Distributed under the",
        "credits_license2": "Attribution linking to",
        "credits_license3": "Powered by",
        "toast_cam_error": "❌ This website only works if you have an active webcam.",
        "toast_mobile": "📱 Keep your phone straight (perpendicular to the ground) for better tracking. Desktop works even better.",
        "toast_req_face": "⚠️ You must enable Face Detection first!",
        "toast_req_hand": "⚠️ You must enable Hand Detection first!",
        "toast_loaded_face": "🖼️ Custom faceover loaded",
        "toast_loaded_obj": "🚀 {file} loaded successfully"
    },
    fr: {
        "warn_title": "📱 Tournez votre téléphone!",
        "warn_desc1": "Cette expérience de Réalité Mixte est conçue pour être utilisée en mode Portrait.",
        "warn_desc2": "(Secret : ça marche encore mieux sur un ordinateur de bureau 😉)",
        "loading_models": "[ Chargement des modèles IA... ]",
        "title_faceover": "🎭 Options Faceover",
        "size_x": "Taille X",
        "size_y": "Taille Y",
        "offset_x": "Décalage X",
        "offset_y": "Décalage Y",
        "tex_x": "Texture X",
        "tex_y": "Texture Y",
        "offset_tx": "Décalage TX",
        "offset_ty": "Décalage TY",
        "rotation": "Rotation",
        "mouth_x": "Bouche X",
        "mouth_y": "Bouche Y",
        "scale_mouth": "Échelle Bouche",
        "eyes_x": "Yeux X",
        "eyes_y": "Yeux Y",
        "scale_eyes": "Échelle Yeux",
        "close_mouth": "Fermer Bouche",
        "close_eyes": "Fermer Yeux",
        "btn_reset": "🔄 Réinitialiser",
        "title_hand": "🗡️ Options objet main",
        "size": "Taille",
        "det_face": "Détection Visage",
        "faceover": "Faceover 🎭",
        "det_hands": "Détection Mains",
        "count_fingers": "Compteur Doigts",
        "btn_template": "📥 Télécharger modèle faceover",
        "btn_custom_face": "🖼️ Faceover personnalisé",
        "btn_custom_hand": "🗡️ Objet main personnalisé",
        "btn_code": "📥 Télécharger code source",
        "credits_title": "Miguel Páramos - Réalité Mixte",
        "credits_license1": "Distribué sous la licence",
        "credits_license2": "Attribution avec un lien vers",
        "credits_license3": "Propulsé par",
        "toast_cam_error": "❌ Ce site web ne fonctionne que si vous avez une webcam active.",
        "toast_mobile": "📱 Gardez votre téléphone droit pour un meilleur suivi. Le bureau fonctionne encore mieux.",
        "toast_req_face": "⚠️ Vous devez d'abord activer la Détection du Visage!",
        "toast_req_hand": "⚠️ Vous devez d'abord activer la Détection des Mains!",
        "toast_loaded_face": "🖼️ Faceover personnalisé chargé",
        "toast_loaded_obj": "🚀 {file} chargé avec succès"
    }
};

// Force application initialization strictly in Spanish to prevent caching artifacts
let currentLang = 'es';

/**
 * Retrieves the translation string corresponding to a specified key.
 * Dynamically replaces bracketed parameters if provided.
 * @param {string} key - The dictionary key for the requested translation.
 * @param {Object} [params={}] - Key-value pairs for dynamic string interpolation.
 * @returns {string} The localized string.
 */
window.t = function(key, params = {}) {
    let text = translations[currentLang][key] || key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, v);
    }
    return text;
};

/**
 * Iterates over all DOM elements bearing the 'data-i18n' attribute and mutates their innerHTML.
 */
function updateDOMTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerHTML = translations[currentLang][key];
        }
    });
}

/**
 * Updates the global language state and initiates a DOM mutation cycle.
 * @param {string} lang - The ISO locale code targeting the translation dictionary.
 */
function setLanguage(lang) {
    currentLang = lang;
    updateDOMTranslations();
}

document.addEventListener('DOMContentLoaded', () => {
    // Acquire references to custom CSS-based flag buttons
    const flagBtns = document.querySelectorAll('.flag-btn');

    /**
     * Toggles CSS classes to highlight the presently active locale flag.
     * @param {string} lang - The ISO locale code to evaluate against.
     */
    function setActiveFlag(lang) {
        flagBtns.forEach(btn => {
            if(btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Perform primary initialization routines enforcing Spanish locale
    setActiveFlag(currentLang);
    updateDOMTranslations();

    // Attach event listeners routing to the language state manager
    flagBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.currentTarget.getAttribute('data-lang');
            setLanguage(lang);
            setActiveFlag(lang);
        });
    });
});
