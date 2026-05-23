// Global Application Coordinator (app.js)

// 1. Toast Notification API
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg class="toast-icon" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 3.2 seconds
  setTimeout(() => {
    toast.remove();
  }, 3200);
}

// Expose globally
window.showToast = showToast;

document.addEventListener("DOMContentLoaded", () => {
  // Navigation elements
  const navItems = document.querySelectorAll(".nav-item");
  const viewContainers = document.querySelectorAll(".view-container");
  const headerTitle = document.getElementById("header-title");

  // Theme elements
  const themeCheckbox = document.getElementById("theme-checkbox");

  // History elements
  const historyTimelineContainer = document.getElementById("history-timeline-container");
  const clearHistoryBtn = document.getElementById("clear-history-btn");

  // Mock Pre-populations for First-Time Users
  function initializeMockData() {
    const history = window.GramCareDB.getHistory();
    if (history.length === 0) {
      const mockHistory = [
        {
          cropType: "tomato",
          diseaseName: "Tomato Early Blight",
          confidence: 94,
          symptoms: "Dark, concentric target-like spots appearing first on older lower leaves. Leaves yellow around the spots.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          cropType: "wheat",
          diseaseName: "Wheat Leaf Rust",
          confidence: 88,
          symptoms: "Small, oval, orange-brown pustules scattered randomly across the leaf surface.",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
        },
        {
          cropType: "potato",
          diseaseName: "Healthy Potato Plant",
          confidence: 97,
          symptoms: "Lush green compound leaves. Upright growth with no wilting or dark lesions.",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        }
      ];
      localStorage.setItem("gramcare_history", JSON.stringify(mockHistory));
    }
  }

  // 2. Navigation / Tab Controller
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      
      const targetView = item.dataset.view;
      if (!targetView) return;

      // Update Nav active class
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      // Update View active class
      viewContainers.forEach(view => view.classList.remove("active"));
      const activeView = document.getElementById(`view-${targetView}`);
      if (activeView) activeView.classList.add("active");

      // Update header text title
      const titles = {
        dashboard: "Crop Health Dashboard",
        diagnosis: "AI Disease Diagnosis Scanner",
        consultation: "Expert Agricultural Consultation",
        marketplace: "Treatment Mini-Marketplace",
        history: "Crop Health Diagnosis Log"
      };
      headerTitle.innerText = titles[targetView] || "GramCare AI";

      // If switching to dashboard, redraw charts to solve responsive sizing bugs
      if (targetView === "dashboard" && window.initCharts) {
        window.initCharts();
        window.updateDashboardStats();
      }

      // Populate history lists if history view selected
      if (targetView === "history") {
        populateHistoryTimeline();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // 3. Theme Toggle Controller
  themeCheckbox.addEventListener("change", () => {
    const isChecked = themeCheckbox.checked;
    if (isChecked) {
      document.body.removeAttribute("data-theme");
      localStorage.setItem("gramcare_theme", "dark");
    } else {
      document.body.setAttribute("data-theme", "light");
      localStorage.setItem("gramcare_theme", "light");
    }

    // Refresh charts colors
    if (window.initCharts) window.initCharts();
    showToast(`${isChecked ? "Dark" : "Light"} theme activated!`, "success");
  });

  // Load Saved Theme preference
  const savedTheme = localStorage.getItem("gramcare_theme");
  if (savedTheme === "light") {
    themeCheckbox.checked = false;
    document.body.setAttribute("data-theme", "light");
  } else {
    themeCheckbox.checked = true;
    document.body.removeAttribute("data-theme");
  }

  // 4. History Log Timeline Renderer
  function populateHistoryTimeline() {
    if (!historyTimelineContainer) return;
    historyTimelineContainer.innerHTML = "";
    const history = window.GramCareDB.getHistory();

    if (history.length === 0) {
      historyTimelineContainer.innerHTML = `
        <div style="text-align:center; color:var(--text-muted); padding:40px 0;">
          No historical diagnoses recorded. Upload an image in the "AI Diagnosis" tab to get started.
        </div>
      `;
      return;
    }

    history.forEach(item => {
      const card = document.createElement("div");
      card.className = "history-card";
      
      const date = new Date(item.timestamp);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      card.innerHTML = `
        <div class="glass-panel history-body">
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <h3 style="color:var(--accent-mint); font-size:16px;">${item.diseaseName}</h3>
              <span style="font-size:11px; background-color:var(--bg-tertiary); padding:2px 8px; border-radius:10px; text-transform:uppercase;">${item.cropType}</span>
            </div>
            <p style="font-size:13px; color:var(--text-muted); line-height:1.5; margin-top:2px;">
              <strong>Observed Symptoms:</strong> ${item.symptoms}
            </p>
          </div>
          <div style="text-align:right;" class="history-time-meta">
            <div style="font-size:16px; font-weight:800; color:var(--accent-green);">${item.confidence}%</div>
            <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">${formattedDate}</div>
          </div>
        </div>
      `;
      historyTimelineContainer.appendChild(card);
    });
  }

  // Clear history handler
  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all historical diagnosis logs? This cannot be undone.")) {
      window.GramCareDB.clearHistory();
      populateHistoryTimeline();
      if (window.updateDashboardStats) window.updateDashboardStats();
      showToast("Diagnosis history logs cleared.", "success");
    }
  });

  // 5. Service Worker Registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then((reg) => {
          console.log("GramCare PWA Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.error("GramCare PWA Service Worker registration failed:", err);
        });
    });
  }

  // Expose updates for global access
  window.populateHistoryTimeline = populateHistoryTimeline;

  // Initialize App
  initializeMockData();
  populateHistoryTimeline();
});
