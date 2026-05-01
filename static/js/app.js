document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.getElementById('imagePreview');
    const uploadPrompt = document.getElementById('uploadPrompt');
    const removeBtn = document.getElementById('removeBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const districtInput = document.getElementById('districtInput');
    const loadingState = document.getElementById('loadingState');
    const resultsSection = document.getElementById('resultsSection');

    // Camera elements
    const cameraBtn = document.getElementById('cameraBtn');
    const cameraModal = document.getElementById('cameraModal');
    const videoElement = document.getElementById('videoElement');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const canvasElement = document.getElementById('canvasElement');

    let currentFile = null;
    let stream = null;

    // --- File Upload Logic ---
    uploadArea.addEventListener('click', (e) => {
        if(e.target === cameraBtn || e.target.closest('#cameraBtn') || e.target === removeBtn || e.target.closest('#removeBtn')) return;
        fileInput.click();
    });

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
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFile(fileInput.files[0]);
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearFile();
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            removeBtn.classList.remove('hidden');
            uploadPrompt.classList.add('hidden');
            checkReady();
        };
        reader.readAsDataURL(file);
    }

    function clearFile() {
        currentFile = null;
        fileInput.value = '';
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        removeBtn.classList.add('hidden');
        uploadPrompt.classList.remove('hidden');
        checkReady();
    }

    districtInput.addEventListener('input', checkReady);

    function checkReady() {
        if (currentFile && districtInput.value.trim() !== '') {
            analyzeBtn.disabled = false;
        } else {
            analyzeBtn.disabled = true;
        }
    }

    // --- Camera Logic ---
    cameraBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            videoElement.srcObject = stream;
            cameraModal.classList.remove('hidden');
        } catch (err) {
            alert('Camera access denied or not available.');
        }
    });

    closeCameraBtn.addEventListener('click', closeCamera);

    captureBtn.addEventListener('click', () => {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        canvasElement.getContext('2d').drawImage(videoElement, 0, 0);
        
        canvasElement.toBlob((blob) => {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            handleFile(file);
            closeCamera();
        }, 'image/jpeg');
    });

    function closeCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        cameraModal.classList.add('hidden');
    }

    // --- Analysis Logic ---
    analyzeBtn.addEventListener('click', async () => {
        if (!currentFile || !districtInput.value.trim()) return;

        // UI updates
        analyzeBtn.disabled = true;
        uploadArea.style.pointerEvents = 'none';
        districtInput.disabled = true;
        resultsSection.classList.add('hidden');
        loadingState.classList.remove('hidden');

        // Scroll to loader
        loadingState.scrollIntoView({ behavior: 'smooth' });

        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('district', districtInput.value.trim());

        try {
            const response = await fetch('/full-analysis', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error(error);
            alert('An error occurred during analysis. Please check console for details.');
        } finally {
            analyzeBtn.disabled = false;
            uploadArea.style.pointerEvents = 'auto';
            districtInput.disabled = false;
            loadingState.classList.add('hidden');
        }
    });

    function displayResults(data) {
        // Populate Disease
        document.getElementById('resDiseaseName').textContent = data.disease.disease_name || 'Unknown';
        
        const severityEl = document.getElementById('resSeverity');
        let severity = (data.disease.severity || 'UNKNOWN').toUpperCase();
        if(severity.includes("LOW")) severity = "LOW";
        else if(severity.includes("MODERATE")) severity = "MODERATE";
        else if(severity.includes("HIGH")) severity = "HIGH";
        else severity = "UNKNOWN";

        severityEl.textContent = severity;
        severityEl.setAttribute('data-level', severity);
        
        document.getElementById('resTreatment').textContent = data.disease.treatment || 'No specific treatment recommended.';

        // Populate Plant
        document.getElementById('resCommonName').textContent = data.plant.common_name || '--';
        document.getElementById('resScientificName').textContent = data.plant.scientific_name || '--';
        document.getElementById('resWatering').textContent = data.plant.watering || '--';
        document.getElementById('resSunlight').textContent = data.plant.sunlight || '--';

        // Populate Climate
        const crs = data.climate_risk.crs_score;
        document.getElementById('resCrsScore').textContent = crs;
        
        const riskLevelEl = document.getElementById('resRiskLevel');
        riskLevelEl.textContent = data.climate_risk.risk_level + " RISK";
        riskLevelEl.setAttribute('data-level', data.climate_risk.risk_level);

        document.getElementById('resTemp').textContent = `${data.climate_risk.details.temp_score.toFixed(0)}°`;
        document.getElementById('resHum').textContent = `${data.climate_risk.details.humidity_score.toFixed(0)}%`;
        document.getElementById('resWind').textContent = `${data.climate_risk.details.wind_score.toFixed(0)} m/s`;

        // Update Gauge
        updateGauge(crs);

        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function updateGauge(score) {
        const path = document.getElementById('crsPath');
        const totalLen = 125;
        const offset = totalLen - (score / 100) * totalLen;
        
        let color = '#10b981'; 
        if (score > 25) color = '#fbbf24'; 
        if (score > 50) color = '#ef4444'; 
        if (score > 75) color = '#991b1b'; 
        
        path.style.stroke = color;
        setTimeout(() => {
            path.style.strokeDashoffset = Math.max(0, offset);
        }, 100);
    }
});
