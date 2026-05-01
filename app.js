// Initialize Lucide icons
lucide.createIcons();

// --- Translations ---
const translations = {
    en: {
        app_title: "AgriVision AI",
        app_subtitle: "Smart Farming Assistant",
        step_1_title: "Upload Image",
        upload_instruction: "Tap to upload or take photo",
        step_2_title: "Enter District",
        district_placeholder: "Enter your district",
        step_3_title: "Get Results",
        analyze_button: "Analyze",
        loading_1: "Detecting disease...",
        loading_2: "AI analyzing...",
        loading_3: "Checking weather...",
        results_title: "Analysis Complete",
        try_another: "Try Another",
        disease_label: "Plant Disease",
        confidence_label: "Confidence",
        severity_label: "Severity",
        treatment_label: "Treatment Plan",
        climate_risk_label: "Climate Risk"
    },
    ta: {
        app_title: "அக்ரிவிஷன் AI",
        app_subtitle: "ஸ்மார்ட் விவசாய உதவி",
        step_1_title: "படத்தை பதிவேற்றவும்",
        upload_instruction: "பதிவேற்ற தட்டவும்",
        step_2_title: "மாவட்டத்தை உள்ளிடவும்",
        district_placeholder: "உங்கள் மாவட்டத்தை உள்ளிடவும்",
        step_3_title: "முடிவுகளைப் பெறுக",
        analyze_button: "ஆய்வு செய்யவும்",
        loading_1: "நோயை கண்டறிகிறது...",
        loading_2: "AI ஆராய்கிறது...",
        loading_3: "வானிலை சரிபார்க்கிறது...",
        results_title: "ஆய்வு முடிந்தது",
        try_another: "மீண்டும் முயற்சிக்க",
        disease_label: "தாவர நோய்",
        confidence_label: "நம்பிக்கை",
        severity_label: "தீவிரத்தன்மை",
        treatment_label: "சிகிச்சை முறை",
        climate_risk_label: "காலநிலை அபாயம்"
    }
};

// --- State ---
let currentLang = localStorage.getItem('agrivision_lang') || 'en';
let selectedFile = null;

// --- DOM Elements ---
const langToggleBtn = document.getElementById('lang-toggle');
const langText = document.getElementById('lang-text');

const uploadArea = document.getElementById('upload-area');
const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const imagePreview = document.getElementById('image-preview');

const districtInput = document.getElementById('district-input');
const analyzeBtn = document.getElementById('analyze-btn');

const inputSection = document.getElementById('input-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');

const errorToast = document.getElementById('error-toast');
const errorMessage = document.getElementById('error-message');

const resetBtn = document.getElementById('reset-btn');

// --- Initialization ---
function init() {
    applyLanguage(currentLang);
    setupEventListeners();
}

// --- Language Management ---
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ta' : 'en';
    localStorage.setItem('agrivision_lang', currentLang);
    applyLanguage(currentLang);
}

function applyLanguage(lang) {
    langText.textContent = lang.toUpperCase();
    
    // Update inner text
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.setAttribute('placeholder', translations[lang][key]);
        }
    });
}

// --- Event Listeners ---
function setupEventListeners() {
    langToggleBtn.addEventListener('click', toggleLanguage);

    // Upload interactions
    uploadArea.addEventListener('click', () => imageInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Input validation
    districtInput.addEventListener('input', checkFormValidity);

    // Analyze action
    analyzeBtn.addEventListener('click', performAnalysis);

    // Reset action
    resetBtn.addEventListener('click', resetApp);
}

function handleFileSelection(file) {
    if (!file.type.startsWith('image/')) {
        showError(currentLang === 'en' ? 'Please upload a valid image file.' : 'சரியான படக் கோப்பைப் பதிவேற்றவும்.');
        return;
    }
    
    selectedFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
        uploadPlaceholder.classList.add('hidden');
        uploadArea.style.padding = '0';
        uploadArea.style.border = 'none';
    };
    reader.readAsDataURL(file);
    
    checkFormValidity();
}

function checkFormValidity() {
    const districtValue = districtInput.value.trim();
    if (selectedFile && districtValue.length > 0) {
        analyzeBtn.disabled = false;
    } else {
        analyzeBtn.disabled = true;
    }
}

// --- API and Logic ---
async function performAnalysis() {
    const district = districtInput.value.trim();
    if (!selectedFile || !district) return;

    // UI transitions
    inputSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    
    // Simulate loading steps visually
    const step1 = document.getElementById('loading-step-1');
    const step2 = document.getElementById('loading-step-2');
    const step3 = document.getElementById('loading-step-3');

    setTimeout(() => {
        if (!loadingSection.classList.contains('hidden')) {
            step1.classList.remove('active');
            step2.classList.add('active');
        }
    }, 1500);

    setTimeout(() => {
        if (!loadingSection.classList.contains('hidden')) {
            step2.classList.remove('active');
            step3.classList.add('active');
        }
    }, 3000);

    // Prepare FormData
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('district', district);

    // Define API URL. Change this to your Render backend URL when deploying.
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '' 
        : 'https://agrivision-backend.onrender.com'; // Replace with actual backend URL

    try {
        const response = await fetch(`${API_BASE_URL}/full-analysis`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure at least enough time passed to show loading animation slightly
        setTimeout(() => {
            displayResults(data);
        }, 800); 

    } catch (error) {
        console.error('Analysis error:', error);
        showError(currentLang === 'en' ? 'Analysis failed. Please try again.' : 'பகுப்பாய்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.');
        
        // Go back to input
        loadingSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        
        // Reset loading steps
        step3.classList.remove('active');
        step2.classList.remove('active');
        step1.classList.add('active');
    }
}

function getSeverityClass(level) {
    if (!level) return 'status-mod';
    const l = level.toLowerCase();
    if (l.includes('low') || l.includes('none')) return 'status-low';
    if (l.includes('moderate') || l.includes('medium')) return 'status-mod';
    if (l.includes('high')) return 'status-high';
    if (l.includes('critical') || l.includes('severe')) return 'status-crit';
    return 'status-mod'; // default
}

function displayResults(data) {
    loadingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Safely extract data handling potential backend response variations
    const diseaseObj = data.disease || {};
    const diseaseName = diseaseObj.disease_name || diseaseObj.name || (typeof data.disease === 'string' ? data.disease : (currentLang === 'en' ? 'Unknown Disease' : 'தெரியாத நோய்'));
    const confidence = typeof diseaseObj.confidence === 'number' ? Math.round(diseaseObj.confidence * 100) : 0;
    const severity = diseaseObj.severity || 'Unknown';
    const treatments = diseaseObj.treatment || [];
    
    const climateObj = data.climate_risk || {};
    const climateScore = climateObj.score || climateObj.risk_score || 0;
    const climateLevel = climateObj.level || climateObj.risk_level || 'Unknown';

    // Populate Disease Card
    document.getElementById('res-disease-name').textContent = diseaseName;
    document.getElementById('res-confidence').textContent = confidence;
    setTimeout(() => {
        document.getElementById('res-confidence-fill').style.width = `${confidence}%`;
    }, 100);

    // Populate Severity Card
    const sevCard = document.getElementById('res-severity-card');
    document.getElementById('res-severity').textContent = severity;
    sevCard.className = `result-card severity-card ${getSeverityClass(severity)}`;

    // Populate Treatment Card
    const treatmentList = document.getElementById('res-treatment-list');
    treatmentList.innerHTML = '';
    
    let treatmentArray = [];
    if (Array.isArray(treatments)) {
        treatmentArray = treatments;
    } else if (typeof treatments === 'string') {
        treatmentArray = treatments.split('\n').filter(t => t.trim().length > 0);
    }

    if (treatmentArray.length > 0) {
        treatmentArray.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t.replace(/^[-*•]\s*/, ''); // Clean up bullet points if string split
            treatmentList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = currentLang === 'en' ? 'No specific treatment data available.' : 'குறிப்பிட்ட சிகிச்சை தரவு இல்லை.';
        treatmentList.appendChild(li);
    }

    // Populate Climate Risk Card
    const climCard = document.getElementById('res-climate-card');
    document.getElementById('res-climate-score').textContent = Math.round(climateScore);
    document.getElementById('res-climate-level').textContent = climateLevel;
    climCard.className = `result-card climate-card ${getSeverityClass(climateLevel)}`;
    
    lucide.createIcons();
}

function resetApp() {
    selectedFile = null;
    imageInput.value = '';
    districtInput.value = '';
    
    imagePreview.classList.add('hidden');
    imagePreview.src = '';
    uploadPlaceholder.classList.remove('hidden');
    uploadArea.style.padding = '32px 20px';
    uploadArea.style.border = '';
    
    document.getElementById('res-confidence-fill').style.width = '0%';
    
    analyzeBtn.disabled = true;
    
    resultsSection.classList.add('hidden');
    inputSection.classList.remove('hidden');
    
    // Reset loading steps
    document.querySelectorAll('.loading-step').forEach(el => el.classList.remove('active'));
    document.getElementById('loading-step-1').classList.add('active');
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorToast.classList.remove('hidden');
    setTimeout(() => {
        errorToast.classList.add('hidden');
    }, 4000);
}

// Boot up
init();
