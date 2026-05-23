// Crop Health Dashboard Analytics Controller (dashboard.js)

document.addEventListener("DOMContentLoaded", () => {
  // SVG Map Hotspots hover tooltips
  const hotspotGroups = document.querySelectorAll(".hotspot-group");
  const mapTooltipBox = document.getElementById("map-tooltip-box");
  const hotspotSvg = document.getElementById("hotspot-svg");

  hotspotGroups.forEach(group => {
    group.addEventListener("mousemove", (e) => {
      const title = group.getAttribute("data-title");
      const details = group.getAttribute("data-details");
      
      mapTooltipBox.innerHTML = `
        <div style="font-weight:700; color:var(--accent-mint); margin-bottom:4px;">${title}</div>
        <div style="color:var(--text-main); font-size:11px;">${details}</div>
      `;
      mapTooltipBox.style.display = "block";
      
      // Calculate cursor position relative to map container
      const rect = hotspotSvg.getBoundingClientRect();
      const x = e.clientX - rect.left + 15;
      const y = e.clientY - rect.top + 15;
      
      mapTooltipBox.style.left = `${x}px`;
      mapTooltipBox.style.top = `${y}px`;
    });

    group.addEventListener("mouseleave", () => {
      mapTooltipBox.style.display = "none";
    });
  });

  // Chart instances
  let diseaseChart = null;
  let healthChart = null;

  function initCharts() {
    const isDark = !document.body.hasAttribute("data-theme") || document.body.getAttribute("data-theme") === "dark";
    const textThemeColor = isDark ? "#8b9e95" : "#627b6e";
    const gridLineColor = isDark ? "rgba(46, 204, 113, 0.08)" : "rgba(39, 174, 96, 0.12)";

    // Chart 1: Disease Distribution Donut
    const ctxDisease = document.getElementById("disease-dist-chart").getContext("2d");
    if (diseaseChart) diseaseChart.destroy();
    diseaseChart = new Chart(ctxDisease, {
      type: "doughnut",
      data: {
        labels: ["Tomato Blight", "Wheat Rust", "Potato Late Blight", "Rice Blast", "Healthy / Safe"],
        datasets: [{
          data: [25, 35, 15, 10, 15],
          backgroundColor: [
            "#f39c12", // Gold / Orange
            "#e74c3c", // Red
            "#3498db", // Blue
            "#9b59b6", // Purple
            "#2ecc71"  // Mint Green
          ],
          borderWidth: isDark ? 2 : 1,
          borderColor: isDark ? "#121e17" : "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: textThemeColor,
              font: {
                family: "Inter",
                size: 11
              },
              boxWidth: 12
            }
          }
        },
        cutout: "70%"
      }
    });

    // Chart 2: Crop Health Score Line Chart
    const ctxHealth = document.getElementById("health-trend-chart").getContext("2d");
    if (healthChart) healthChart.destroy();
    healthChart = new Chart(ctxHealth, {
      type: "line",
      data: {
        labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
        datasets: [{
          label: "Regional Health Index (%)",
          data: [72, 75, 71, 80, 88, 91],
          borderColor: "#00ff87",
          backgroundColor: "rgba(0, 255, 135, 0.05)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#00ff87",
          pointBorderColor: isDark ? "#0a110d" : "#ffffff",
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: gridLineColor
            },
            ticks: {
              color: textThemeColor,
              font: {
                family: "Inter",
                size: 10
              }
            }
          },
          y: {
            grid: {
              color: gridLineColor
            },
            ticks: {
              color: textThemeColor,
              font: {
                family: "Inter",
                size: 10
              }
            },
            min: 50,
            max: 100
          }
        }
      }
    });
  }

  // Update stats counters dynamically
  function updateDashboardStats() {
    const diagnosesCount = window.GramCareDB.getHistory().length;
    const bookingsCount = window.GramCareDB.getBookings().length;

    // Use default values if history is empty (make it look populated initially)
    const baseDiagnoses = 12;
    document.getElementById("stat-diagnoses").innerText = baseDiagnoses + diagnosesCount;
    
    const baseBookings = 1;
    document.getElementById("stat-bookings").innerText = baseBookings + bookingsCount;
  }

  // Expose to window for external updates
  window.initCharts = initCharts;
  window.updateDashboardStats = updateDashboardStats;

  // Initialize
  initCharts();
  updateDashboardStats();
});
