// Expert Consultation & Chatbot Controller (chat.js)

document.addEventListener("DOMContentLoaded", () => {
  // Chat DOM elements
  const chatbotMsgContainer = document.getElementById("chatbot-msg-container");
  const chatbotTextInput = document.getElementById("chatbot-text-input");
  const chatbotSendBtn = document.getElementById("chatbot-send-btn");

  // Booking Scheduler DOM elements
  const bookingForm = document.getElementById("booking-form");
  const bookingName = document.getElementById("booking-name");
  const bookingPhone = document.getElementById("booking-phone");
  const bookingCrop = document.getElementById("booking-crop");
  const bookingAddress = document.getElementById("booking-address");
  const addressFieldGroup = document.getElementById("address-field-group");
  
  const formatOptions = document.querySelectorAll(".format-option");
  const timeSlots = document.querySelectorAll(".time-slot");
  const appointmentsListContainer = document.getElementById("appointments-list-container");
  
  // Custom Calendar elements
  const calPrevBtn = document.getElementById("cal-prev-btn");
  const calNextBtn = document.getElementById("cal-next-btn");
  const calMonthYear = document.getElementById("cal-month-year");
  const calendarDays = document.getElementById("calendar-days");

  let selectedFormat = "Video Call";
  let selectedDateString = null;
  let selectedTimeSlot = null;

  // Mock Calendar variables (Locking calendar to May/June 2026 for high-fidelity demonstration)
  let currentMonthIndex = 4; // May (0-indexed)
  let currentYear = 2026;
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Today's date mock: May 22, 2026
  const TODAY_DAY = 22;
  const TODAY_MONTH = 4;
  const TODAY_YEAR = 2026;

  // 1. AI Chatbot Logic
  function appendChatBubble(sender, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerText = text;
    chatbotMsgContainer.appendChild(bubble);
    chatbotMsgContainer.scrollTop = chatbotMsgContainer.scrollHeight;
  }

  function simulateBotTypingAndReply(userMsg) {
    // Show temporary typing state
    const typingBubble = document.createElement("div");
    typingBubble.className = "chat-bubble bot typing-indicator";
    typingBubble.innerHTML = `<span style="opacity: 0.6;">Typing agronomist advice...</span>`;
    chatbotMsgContainer.appendChild(typingBubble);
    chatbotMsgContainer.scrollTop = chatbotMsgContainer.scrollHeight;

    // Process keywords
    const msg = userMsg.toLowerCase();
    let reply = "I understand you have questions about crop management. To give you the best advice, could you clarify what crop type you are growing and if you observed any leaf spot discoloration?";

    if (msg.includes("blight") || msg.includes("tomato") || msg.includes("early blight")) {
      reply = "Tomato Early Blight is caused by the fungus Alternaria solani. It thrives in warm, humid conditions. I highly recommend spraying BioShield Copper Fungicide. Additionally, prune the lowest branches (up to 12 inches from soil) to prevent soil-dwelling spores from splashing onto leaves.";
    } else if (msg.includes("rust") || msg.includes("wheat")) {
      reply = "Wheat Leaf Rust spores spread rapidly via wind. You should apply a systemic triazole fungicide like RustGuard immediately. Keep nitrogen fertilizer levels balanced, as high nitrogen results in excessive humid foliage which accelerates spore germination.";
    } else if (msg.includes("blast") || msg.includes("rice")) {
      reply = "Rice Blast is a severe disease. If diagnosed, use Tricyclazole (BlastOff) during the tillering and panicle booting stages. To prevent it, ensure proper field drainage and avoid over-dense planting grids.";
    } else if (msg.includes("neem") || msg.includes("organic")) {
      reply = "Organic Neem Concentrate (like BlightStop) acts as an excellent preventative treatment. It disrupts the feeding and reproductive cycles of insects, and hinders fungal spore adhesion. Dilute 30ml per gallon of water and spray during cool evening hours to prevent leaf scorch.";
    } else if (msg.includes("fertilizer") || msg.includes("npk")) {
      reply = "NPK 19-19-19 fertilizer is a balanced booster. Apply it through foliar spray (5g per liter of water) or drip irrigation during active growth stages. Avoid applying high nitrogen fertilizers if a fungal infection is already present in your field, as soft new growth is highly susceptible.";
    } else if (msg.includes("pruning") || msg.includes("cut")) {
      reply = "Pruning is essential! Always use sharp, sterilized shears. Disinfect your pruning tools with rubbing alcohol between cuts on infected stems, otherwise you will carry the fungus/bacteria to healthy plants.";
    } else if (msg.includes("hi") || msg.includes("hello")) {
      reply = "Hello! Welcome to GramCare Support. I can answer questions about crop blights, rusts, organic spray recipes, water schedules, and soil nutrient balancing. What crops are you working with?";
    }

    setTimeout(() => {
      // Remove typing bubble
      typingBubble.remove();
      appendChatBubble("bot", reply);
    }, 1200 + Math.random() * 800);
  }

  // Handle send message
  function handleSendMessage() {
    const text = chatbotTextInput.value.trim();
    if (text === "") return;
    
    appendChatBubble("user", text);
    chatbotTextInput.value = "";
    
    simulateBotTypingAndReply(text);
  }

  chatbotSendBtn.addEventListener("click", handleSendMessage);
  chatbotTextInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });

  // Global escalation handler
  window.escalateToChatbot = (crop, disease) => {
    const greeting = `Hi, I just completed a diagnostics scan on my ${crop}. The AI report detected "${disease}" with high probability. What immediate measures should I take to save my crop?`;
    appendChatBubble("user", greeting);
    simulateBotTypingAndReply(greeting);
  };

  // 2. Scheduler & Meeting Format Controller
  formatOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      formatOptions.forEach(o => o.classList.remove("selected"));
      opt.classList.add("selected");
      selectedFormat = opt.dataset.format;
      
      if (selectedFormat === "Field Visit") {
        addressFieldGroup.style.display = "flex";
        document.getElementById("booking-address").required = true;
      } else {
        addressFieldGroup.style.display = "none";
        document.getElementById("booking-address").required = false;
      }
    });
  });

  timeSlots.forEach(slot => {
    slot.addEventListener("click", () => {
      if (slot.classList.contains("disabled")) return;
      timeSlots.forEach(s => s.classList.remove("selected"));
      slot.classList.add("selected");
      selectedTimeSlot = slot.dataset.time;
    });
  });

  // 3. Custom Calendar Rendering Engine
  function renderCalendar(month, year) {
    calMonthYear.innerText = `${MONTHS[month]} ${year}`;
    calendarDays.innerHTML = "";
    
    // Add day labels
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    daysOfWeek.forEach(d => {
      const el = document.createElement("div");
      el.className = "calendar-weekday";
      el.innerText = d;
      calendarDays.appendChild(el);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Append blank cells for alignment
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement("div");
      blank.className = "calendar-day disabled";
      calendarDays.appendChild(blank);
    }

    // Append days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div");
      dayCell.className = "calendar-day";
      dayCell.innerText = day;

      // Disable past dates
      let isPast = false;
      if (year < TODAY_YEAR) isPast = true;
      else if (year === TODAY_YEAR && month < TODAY_MONTH) isPast = true;
      else if (year === TODAY_YEAR && month === TODAY_MONTH && day < TODAY_DAY) isPast = true;

      // Mock fully booked slots (e.g. Sundays, or arbitrary days)
      const dayOfWeek = new Date(year, month, day).getDay();
      const isBooked = dayOfWeek === 0; // Sundays disabled

      if (isPast || isBooked) {
        dayCell.classList.add("disabled");
      } else {
        // Date click handler
        dayCell.addEventListener("click", () => {
          document.querySelectorAll(".calendar-day").forEach(c => c.classList.remove("selected"));
          dayCell.classList.add("selected");
          selectedDateString = `${MONTHS[month]} ${day}, ${year}`;
          
          // Randomly disable some time slots for this day to look realistic
          timeSlots.forEach(s => {
            s.classList.remove("selected", "disabled");
            if (Math.random() < 0.3) {
              s.classList.add("disabled");
            }
          });
          selectedTimeSlot = null;
        });
      }

      calendarDays.appendChild(dayCell);
    }
  }

  // Calendar navigation
  calPrevBtn.addEventListener("click", () => {
    currentMonthIndex--;
    if (currentMonthIndex < 0) {
      currentMonthIndex = 11;
      currentYear--;
    }
    renderCalendar(currentMonthIndex, currentYear);
    selectedDateString = null;
  });

  calNextBtn.addEventListener("click", () => {
    currentMonthIndex++;
    if (currentMonthIndex > 11) {
      currentMonthIndex = 0;
      currentYear++;
    }
    renderCalendar(currentMonthIndex, currentYear);
    selectedDateString = null;
  });

  // Initial Calendar Render
  renderCalendar(currentMonthIndex, currentYear);

  // 4. Booking Submission Controller
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!selectedDateString) {
      showToast("Please choose a date from the calendar widget.", "danger");
      return;
    }

    if (!selectedTimeSlot) {
      showToast("Please choose an available time slot.", "danger");
      return;
    }

    const name = bookingName.value.trim();
    const phone = bookingPhone.value.trim();
    const crop = bookingCrop.value;
    const address = selectedFormat === "Field Visit" ? bookingAddress.value.trim() : "";

    const agronomists = ["Dr. Anita Sharma", "Dr. Sunil Rao", "Prof. Devendra Pal"];
    const randomAgronomist = agronomists[Math.floor(Math.random() * agronomists.length)];

    const booking = {
      name,
      phone,
      cropCategory: crop,
      format: selectedFormat,
      date: selectedDateString,
      time: selectedTimeSlot,
      address,
      expertName: randomAgronomist
    };

    // Save to Database
    window.GramCareDB.addBooking(booking);

    // Refresh display lists
    populateBookingsList();
    if (window.updateDashboardStats) window.updateDashboardStats();

    // Reset Form
    bookingForm.reset();
    selectedDateString = null;
    selectedTimeSlot = null;
    document.querySelectorAll(".calendar-day").forEach(c => c.classList.remove("selected"));
    timeSlots.forEach(s => s.classList.remove("selected", "disabled"));
    addressFieldGroup.style.display = "none";
    
    // Toggle back to default format selector view
    formatOptions.forEach(o => o.classList.remove("selected"));
    document.querySelector(`[data-format="Video Call"]`).classList.add("selected");
    selectedFormat = "Video Call";

    showToast("Consultation booked successfully!", "success");
  });

  // Populate booked consultations
  function populateBookingsList() {
    appointmentsListContainer.innerHTML = "";
    const bookings = window.GramCareDB.getBookings();
    
    if (bookings.length === 0) {
      appointmentsListContainer.innerHTML = `
        <div style="text-align:center; color:var(--text-muted); padding: 20px; font-size:13px;">
          No bookings scheduled yet. Fill out the scheduler above to book.
        </div>
      `;
      return;
    }

    bookings.forEach(b => {
      const card = document.createElement("div");
      card.className = "appointment-card";
      card.innerHTML = `
        <div class="app-meta">
          <span class="app-crop">${b.cropCategory} Crop Assessment</span>
          <span class="app-details">Date: ${b.date} | Time: ${b.time} | Format: ${b.format}</span>
          ${b.address ? `<span class="app-details">Location: ${b.address}</span>` : ""}
          <span class="app-details" style="font-style: italic; color: var(--accent-mint);">Agronomist: ${b.expertName}</span>
        </div>
        <span class="status-badge confirmed">Confirmed</span>
      `;
      appointmentsListContainer.appendChild(card);
    });
  }

  // Expose to window for app coordinator trigger
  window.populateBookingsList = populateBookingsList;

  // Initial load
  populateBookingsList();
});
