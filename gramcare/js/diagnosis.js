// Crop Disease Diagnosis Controller (diagnosis.js)

document.addEventListener("DOMContentLoaded", () => {
  const cropSelector = document.getElementById("crop-selector");
  const uploadDropzone = document.getElementById("upload-dropzone");
  const uploadPromptView = document.getElementById("upload-prompt-view");
  const imagePreviewView = document.getElementById("image-preview-view");
  const cropPreviewImg = document.getElementById("crop-preview-img");
  const clearImageBtn = document.getElementById("clear-image-btn");
  const cameraTriggerBtn = document.getElementById("camera-trigger-btn");
  const fileInput = document.getElementById("file-input");
  
  const startDiagnosisBtn = document.getElementById("start-diagnosis-btn");
  const scanningOverlayView = document.getElementById("scanning-overlay-view");
  const scanningStatusText = document.getElementById("scanning-status-text");
  const scanProgressBar = document.getElementById("scan-progress-bar");
  
  const resultsPlaceholderView = document.getElementById("results-placeholder-view");
  const reportOutput = document.getElementById("report-output");
  
  const reportDiseaseName = document.getElementById("report-disease-name");
  const reportPathogen = document.getElementById("report-pathogen");
  const reportConfidence = document.getElementById("report-confidence");
  const reportSymptoms = document.getElementById("report-symptoms");
  const reportOrganicTreatment = document.getElementById("report-organic-treatment");
  const reportChemicalTreatment = document.getElementById("report-chemical-treatment");
  const reportPreventiveMeasures = document.getElementById("report-preventive-measures");
  const diagnosisRecsGrid = document.getElementById("diagnosis-recs-grid");
  
  const chatEscalateBtn = document.getElementById("diagnose-escalate-chat");
  const expertEscalateBtn = document.getElementById("diagnose-escalate-expert");
  
  let selectedFile = null;
  let activeDiagnosisReport = null;

  // File browse trigger
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  // Camera trigger simulation
  cameraTriggerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Simulate camera capture by triggering a file dialog or using a mock photo
    // To make it look premium, we'll tell the user we are activating the camera, and auto-load a mock leaf photo
    showToast("Activating live device camera...", "success");
    
    setTimeout(() => {
      // Simulate taking a photo after 1.5 seconds
      const crop = cropSelector.value;
      const mockImage = `https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=300`;
      cropPreviewImg.src = mockImage;
      
      // Create a mock File object
      selectedFile = {
        name: `camera_capture_${crop}_infected.png`,
        size: 245300,
        type: "image/png"
      };
      
      uploadPromptView.style.display = "none";
      imagePreviewView.style.display = "block";
      startDiagnosisBtn.style.display = "block";
      showToast("Camera capture captured successfully!", "success");
    }, 1500);
  });

  // Drag & Drop event listeners
  ["dragenter", "dragover"].forEach(eventName => {
    uploadDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadDropzone.classList.add("dragover");
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    uploadDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadDropzone.classList.remove("dragover");
    }, false);
  });

  uploadDropzone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  // Clear image preview
  clearImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetUploadZone();
  });

  function handleFileSelected(file) {
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file.", "danger");
      return;
    }
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      cropPreviewImg.src = e.target.result;
      uploadPromptView.style.display = "none";
      imagePreviewView.style.display = "block";
      startDiagnosisBtn.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  function resetUploadZone() {
    selectedFile = null;
    fileInput.value = "";
    cropPreviewImg.src = "";
    uploadPromptView.style.display = "flex";
    imagePreviewView.style.display = "none";
    startDiagnosisBtn.style.display = "none";
  }

  // Diagnosis execution
  startDiagnosisBtn.addEventListener("click", () => {
    if (!selectedFile) return;

    scanningOverlayView.style.display = "flex";
    scanProgressBar.style.width = "0%";
    startDiagnosisBtn.disabled = true;
    
    const statuses = [
      { pct: 15, text: "Detecting crop leaf boundaries..." },
      { pct: 40, text: "Analyzing chlorosis and spot contours..." },
      { pct: 70, text: "Comparing patterns with pathogen database..." },
      { pct: 90, text: "Calculating disease confidence index..." },
      { pct: 100, text: "Finalizing diagnostics report..." }
    ];

    let currentStatusIndex = 0;
    
    const interval = setInterval(() => {
      const currentStatus = statuses[currentStatusIndex];
      if (currentStatus) {
        scanningStatusText.innerText = currentStatus.text;
        scanProgressBar.style.width = `${currentStatus.pct}%`;
        currentStatusIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          scanningOverlayView.style.display = "none";
          startDiagnosisBtn.disabled = false;
          showDiagnosisResults();
        }, 3000);
      }
    }, 500);
  });

  function showDiagnosisResults() {
    const crop = cropSelector.value;
    // Determine whether to simulate healthy or infected based on filename
    // If filename has 'healthy' in it, load healthy, otherwise default infected.
    const isHealthy = selectedFile.name.toLowerCase().includes("healthy");
    
    const rule = window.GramCareDB.getDiagnosisRule(crop, isHealthy ? "healthy" : "infected");
    if (!rule) {
      showToast("Error retrieving crop templates.", "danger");
      return;
    }

    // Generate random confidence score within the rule's range
    const [minConf, maxConf] = rule.confidenceRange;
    const confidenceScore = Math.floor(Math.random() * (maxConf - minConf + 1)) + minConf;

    activeDiagnosisReport = {
      cropType: crop,
      diseaseName: rule.diseaseName,
      pathogen: rule.pathogen,
      confidence: confidenceScore,
      symptoms: rule.symptoms,
      organicTreatment: rule.organicTreatment,
      chemicalTreatment: rule.chemicalTreatment,
      preventiveMeasures: rule.preventiveMeasures,
      recommendedProducts: rule.recommendedProducts
    };

    // Render text fields
    reportDiseaseName.innerText = activeDiagnosisReport.diseaseName;
    reportPathogen.innerText = activeDiagnosisReport.pathogen;
    reportConfidence.innerText = `${activeDiagnosisReport.confidence}%`;
    reportSymptoms.innerText = activeDiagnosisReport.symptoms;
    reportOrganicTreatment.innerText = activeDiagnosisReport.organicTreatment;
    reportChemicalTreatment.innerText = activeDiagnosisReport.chemicalTreatment;
    reportPreventiveMeasures.innerText = activeDiagnosisReport.preventiveMeasures;

    // Render Recommended Treatments Marketplace Cards
    diagnosisRecsGrid.innerHTML = "";
    activeDiagnosisReport.recommendedProducts.forEach(prodId => {
      const prod = window.GramCareDB.getProductById(prodId);
      if (prod) {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <div class="product-img-container" style="height:100px;">
            <img src="${prod.image}" class="product-img" alt="${prod.name}">
            <span class="product-tag">${prod.category}</span>
          </div>
          <div class="product-body" style="padding: 10px; gap: 4px;">
            <h4 class="product-title" style="font-size: 13px;">${prod.name}</h4>
            <div class="product-footer" style="padding-top: 6px; border-top:none;">
              <span class="product-price" style="font-size:14px;">$${prod.price.toFixed(2)}</span>
              <button class="btn btn-primary add-to-cart-quick" data-id="${prod.id}" style="padding: 4px 8px; border-radius: 6px; font-size:11px;">Buy</button>
            </div>
          </div>
        `;
        
        // Add to cart listener inside details
        card.querySelector(".add-to-cart-quick").addEventListener("click", (e) => {
          e.stopPropagation();
          window.GramCareDB.addToCart(prod.id);
          window.updateCartBadge();
          showToast(`Added ${prod.name} to cart!`, "success");
        });
        
        diagnosisRecsGrid.appendChild(card);
      }
    });

    // Save report to History DB
    window.GramCareDB.addHistory({
      cropType: activeDiagnosisReport.cropType,
      diseaseName: activeDiagnosisReport.diseaseName,
      confidence: activeDiagnosisReport.confidence,
      symptoms: activeDiagnosisReport.symptoms
    });
    
    // Update dashboard counters & history logs dynamically
    if (window.updateDashboardStats) window.updateDashboardStats();
    if (window.populateHistoryTimeline) window.populateHistoryTimeline();

    // Toggle view components
    resultsPlaceholderView.style.display = "none";
    reportOutput.style.display = "flex";
    
    showToast("AI Crop Health analysis completed!", "success");
  }

  // Escalation: Chatbot Integration
  chatEscalateBtn.addEventListener("click", () => {
    if (!activeDiagnosisReport) return;
    
    // Trigger chat panel switch
    const chatNavItem = document.querySelector(`.nav-item[data-view="consultation"]`);
    if (chatNavItem) chatNavItem.click();
    
    // Send automated prompt to chat
    if (window.escalateToChatbot) {
      window.escalateToChatbot(activeDiagnosisReport.cropType, activeDiagnosisReport.diseaseName);
    }
  });

  // Escalation: Expert Scheduler Booking
  expertEscalateBtn.addEventListener("click", () => {
    if (!activeDiagnosisReport) return;

    // Trigger consultation panel switch
    const consultNavItem = document.querySelector(`.nav-item[data-view="consultation"]`);
    if (consultNavItem) consultNavItem.click();

    // Preselect Crop Category in form
    const bookingCropSelect = document.getElementById("booking-crop");
    if (bookingCropSelect) {
      // capitalize first letter
      const cropCap = activeDiagnosisReport.cropType.charAt(0).toUpperCase() + activeDiagnosisReport.cropType.slice(1);
      bookingCropSelect.value = cropCap;
    }
    
    showToast("Pre-selected crop details in scheduler.", "success");
  });
});
