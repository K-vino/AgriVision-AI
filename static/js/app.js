document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    // Sections
    const inputSection = document.getElementById('inputSection');
    const loadingSection = document.getElementById('loadingSection');
    const resultsSection = document.getElementById('resultsSection');
    const errorSection = document.getElementById('errorSection');
    
    // Inputs
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const districtInput = document.getElementById('districtInput');
    
    // Buttons
    const uploadBtn = document.getElementById('uploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const removeImgBtn = document.getElementById('removeImgBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const retryBtn = document.getElementById('retryBtn');
    
    // Camera
    const cameraContainer = document.getElementById('cameraContainer');
    const videoElement = document.getElementById('videoElement');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const canvasElement = document.getElementById('canvasElement');
    
    // Previews & Prompts
    const imagePreview = document.getElementById('imagePreview');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const uploadActions = document.querySelector('.upload-actions');
    
    // Loading Text
    const loadingText = document.getElementById('loadingText');

    let currentFile = null;
    let cameraStream = null;

    // --- State Management ---
    function checkFormValidity() {
        if (currentFile && districtInput.value.trim().length > 0) {
            analyzeBtn.disabled = false;
        } else {
            analyzeBtn.disabled = true;
        }
    }

    function resetForm() {
        currentFile = null;
        fileInput.value = '';
        districtInput.value = '';
        
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        removeImgBtn.classList.add('hidden');
        
        uploadPrompt.classList.remove('hidden');
        uploadActions.classList.remove('hidden');
        
        analyzeBtn.disabled = true;
        
        // Sections
        resultsSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        loadingSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
    }

    // --- File Upload Logic ---
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    removeImgBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentFile = null;
        fileInput.value = '';
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        removeImgBtn.classList.add('hidden');
        uploadPrompt.classList.remove('hidden');
        uploadActions.classList.remove('hidden');
        checkFormValidity();
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }
        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            removeImgBtn.classList.remove('hidden');
            
            uploadPrompt.classList.add('hidden');
            uploadActions.classList.add('hidden');
            checkFormValidity();
        };
        reader.readAsDataURL(file);
    }

    districtInput.addEventListener('input', checkFormValidity);

    // --- Camera Logic ---
    cameraBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            videoElement.srcObject = cameraStream;
            cameraContainer.classList.remove('hidden');
            dropZone.classList.add('hidden');
        } catch (err) {
            alert('Camera access denied or unavailable.');
        }
    });

    closeCameraBtn.addEventListener('click', (e) => {
        e.preventDefault();
        stopCamera();
    });

    captureBtn.addEventListener('click', (e) => {
        e.preventDefault();
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        const ctx = canvasElement.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        
        canvasElement.toBlob((blob) => {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            handleFile(file);
            stopCamera();
        }, 'image/jpeg');
    });

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        cameraContainer.classList.add('hidden');
        dropZone.classList.remove('hidden');
    }

    // --- Loading Sequence ---
    const loadingSteps = [
        "🌿 Detecting plant disease...",
        "🤖 Analyzing with AI...",
        "🌦️ Checking climate risk...",
        "✨ Finalizing report..."
    ];

    let loadingInterval;
    function startLoadingSequence() {
        inputSection.classList.add('hidden');
        errorSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
        let step = 0;
        loadingText.textContent = loadingSteps[0];
        
        loadingInterval = setInterval(() => {
            step++;
            if (step < loadingSteps.length) {
                loadingText.textContent = loadingSteps[step];
            } else {
                clearInterval(loadingInterval);
            }
        }, 1500); // Change text every 1.5s
    }

    function stopLoadingSequence() {
        clearInterval(loadingInterval);
        loadingSection.classList.add('hidden');
    }

    // --- Analysis Execution ---
    analyzeBtn.addEventListener('click', async () => {
        if (!currentFile || !districtInput.value.trim()) return;

        startLoadingSequence();

        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('district', districtInput.value.trim());

        try {
            const response = await fetch('/full-analysis', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('API returned an error');

            const data = await response.json();
            stopLoadingSequence();
            displayResults(data);
        } catch (error) {
            console.error(error);
            stopLoadingSequence();
            errorSection.classList.remove('hidden');
        }
    });

    resetBtn.addEventListener('click', resetForm);
    retryBtn.addEventListener('click', resetForm);

    // --- Display Results ---
    function displayResults(data) {
        // Safe extractions
        const diseaseName = data.disease?.disease_name || 'Unknown';
        const severityRaw = (data.disease?.severity || 'LOW').toUpperCase();
        const treatmentRaw = data.disease?.treatment || 'No specific treatment provided.';
        const confidence = data.disease?.confidence ? (data.disease.confidence * 100).toFixed(1) : '--';
        
        const plantName = data.plant?.common_name || 'Unknown Plant';
        
        const crsScore = data.climate_risk?.crs_score || 0;
        const crsLevelRaw = (data.climate_risk?.risk_level || 'LOW').toUpperCase();
        
        const temp = data.climate_risk?.details?.temp_score || 0;
        const hum = data.climate_risk?.details?.humidity_score || 0;
        const wind = data.climate_risk?.details?.wind_score || 0;

        // Disease Card
        document.getElementById('resDisease').textContent = diseaseName;
        document.getElementById('resPlant').textContent = `Plant: ${plantName}`;
        document.getElementById('resConfidence').textContent = `Confidence: ${confidence}%`;

        // Severity Card
        let sevClass = 'badge-low';
        let sevText = 'LOW';
        if (severityRaw.includes('MODERATE')) { sevClass = 'badge-moderate'; sevText = 'MODERATE'; }
        else if (severityRaw.includes('HIGH')) { sevClass = 'badge-high'; sevText = 'HIGH'; }
        else if (severityRaw.includes('CRITICAL')) { sevClass = 'badge-critical'; sevText = 'CRITICAL'; }

        const sevBadge = document.getElementById('resSeverityBadge');
        sevBadge.textContent = sevText;
        sevBadge.className = `badge ${sevClass}`;

        // Treatment Card (format as bullet points)
        const treatmentList = document.getElementById('resTreatment');
        treatmentList.innerHTML = '';
        
        const treatments = treatmentRaw.split(/(?:\. |\n|-)/).filter(t => t.trim().length > 5);
        if (treatments.length === 0) {
            const li = document.createElement('li');
            li.textContent = treatmentRaw;
            treatmentList.appendChild(li);
        } else {
            treatments.forEach(t => {
                const li = document.createElement('li');
                let text = t.trim();
                if (!text.endsWith('.')) text += '.';
                li.textContent = text;
                treatmentList.appendChild(li);
            });
        }

        // Climate Card
        document.getElementById('resCrsScore').textContent = crsScore;
        
        let crsClass = 'badge-low';
        if (crsLevelRaw === 'MODERATE') crsClass = 'badge-moderate';
        else if (crsLevelRaw === 'HIGH') crsClass = 'badge-high';
        else if (crsLevelRaw === 'CRITICAL') crsClass = 'badge-critical';

        const crsBadge = document.getElementById('resRiskBadge');
        crsBadge.textContent = `${crsLevelRaw} RISK`;
        crsBadge.className = `badge ${crsClass}`;

        document.getElementById('resTemp').textContent = `${Math.round(temp)}°`;
        document.getElementById('resHum').textContent = `${Math.round(hum)}%`;
        document.getElementById('resWind').textContent = `${Math.round(wind)}m/s`;

        // Set score color based on risk
        const scoreEl = document.getElementById('resCrsScore');
        if (crsLevelRaw === 'LOW') scoreEl.style.color = 'var(--success)';
        else if (crsLevelRaw === 'MODERATE') scoreEl.style.color = 'var(--warning)';
        else if (crsLevelRaw === 'HIGH') scoreEl.style.color = 'var(--orange)';
        else scoreEl.style.color = 'var(--danger)';

        resultsSection.classList.remove('hidden');
    }
});
