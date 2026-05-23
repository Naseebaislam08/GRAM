// GramCare AI (MediNova) - Complete Frontend Logic

// Global Application State
let currentLang = 'en';
let activeView = 'splash'; // Starts on PWA Splash
let currentRole = ''; // 'patient' or 'doctor'
let chatHistory = [];
let recognition = null;
let synth = window.speechSynthesis;
let currentSpeechUtterance = null;
let selectedHospitalId = 'phc';
let voiceRemindersActive = false;
let currentUser = null;

// Timelined pill state
let userReminders = [
  { id: 'metformin', name: 'Metformin 500mg', time: 'morning', desc: 'Take 1 tablet with breakfast food', taken: false, missed: true },
  { id: 'lisinopril', name: 'Lisinopril 10mg', time: 'afternoon', desc: 'Take 1 tablet once daily', taken: false, missed: false },
  { id: 'atorvastatin', name: 'Atorvastatin 20mg', time: 'night', desc: 'Take 1 tablet before bed', taken: false, missed: false }
];

// Multilingual Dictionary with regional Malvi (माळवी) support
const TRANSLATIONS = {
  en: {
    nav_home: "Home",
    nav_chat: "Emergency Assistant",
    nav_checker: "Pills safety",
    nav_doctors: "Telemed",
    landing_subtitle: "Your Rural Health Companion • AI First Aid • Clinic Routing",
    role_patient_title: "I am a Patient",
    role_patient_desc: "Access medicine reminders, symptom chat & hospital finder",
    role_doctor_title: "I am a Doctor",
    role_doctor_desc: "Access diagnosis dash, clinical record manager & queues",
    login_btn: "Get Secure OTP →",
    login_back: "← Back to Selection",
    dash_status: "Your health status is looking stable today. How can we help?",
    vital_bp: "Blood Pressure",
    vital_hr: "Heart Rate",
    vital_sugar: "Sugar Level",
    vital_normal: "Normal",
    vital_alert: "Alert",
    quick_ai_title: "Talk to AI Doctor",
    quick_ai_desc: "Instant medical protocols in English, हिन्दी, or मालवी",
    quick_hosp_title: "Nearby Hospitals",
    quick_hosp_desc: "Find Mangaliya PHC and open medical centers",
    quick_myths_title: "Myth Buster Guide",
    quick_myths_desc: "Busting traditional medical errors in rural areas",
    quick_checker_title: "Medicine Safety Checker",
    quick_checker_desc: "Verify medicine safety by expiration thresholds",
    insight_label: "Daily Insight",
    insight_med_title: "Time for Lisinopril Medication",
    insight_med_desc: "Take Lisinopril with a full glass of water. It helps keep your blood pressure steady.",
    insight_med_btn: "Log Medication Taken",
    upcoming_appt_title: "Upcoming Telemedicine Consultation",
    btn_join_call: "Join Call",
    btn_reschedule: "Reschedule",
    chat_status_active: "Severity:",
    chat_clear: "Clear",
    chat_welcome: "Hello, I am your GramCare Emergency Assistant. Please describe your symptoms or tell me what happened in English, Hindi, or Malvi (e.g. \"snake bite\", \"सीने में दर्द\", or \"घबराट हो रही है\").",
    chat_placeholder: "Describe symptoms here...",
    chat_goto_hospitals: "Find Nearest Hospital Now",
    severity_safe_title: "System Ready",
    severity_safe_desc: "Report symptoms to see priority detection and critical instructions.",
    first_aid_title: "First Aid Steps",
    first_aid_intro: "Follow these steps carefully while assistance is arriving:",
    first_aid_step_default: "Start by describing your symptoms in the chat.",
    hospitals_near_mangaliya: "Emergency Centers Near Mangaliya",
    hospitals_subheading: "Indore District, MP (Sorted by distance)",
    nearest_facility_badge: "★ NEAREST FACILITY",
    map_heading: "Indore Sector Route Map",
    reminders_today_title: "Daily Pill Reminders",
    reminder_missed_heading: "Missed Dose: Metformin",
    reminder_missed_desc: "Scheduled for 8:00 AM. Please take it now if safe.",
    morning_label: "MORNING (8:00 AM)",
    afternoon_label: "AFTERNOON (1:00 PM)",
    night_label: "NIGHT (9:00 PM)",
    metformin_instructions: "Take 1 tablet with breakfast food",
    lisinopril_instructions: "Take 1 tablet once daily",
    atorvastatin_instructions: "Take 1 tablet before bed",
    myths_title: "Health Myth Buster",
    myths_subtitle: "Scientific corrections for dangerous traditional practices in rural India.",
    myth_badge_fatal: "FATAL DANGER",
    myth_badge_harmful: "HARMFUL",
    myth1_title: "Snake Bite Treatment",
    myth1_myth: "Myth: Suck out the venom or tie a tight tourniquet.",
    myth1_exp: "Sucking venom introduces mouth bacteria to the wound, does not remove venom, and poisons the rescuer. Tourniquets block arterial blood flow and often lead to limb amputations.",
    myth1_correct: "Keep the victim completely still (movement spreads venom), keep the bitten limb below heart level, and go to the nearest PHC immediately for anti-venom.",
    myth2_title: "Burn Wounds",
    myth2_myth: "Myth: Apply ghee, mustard oil, butter, or toothpaste.",
    myth2_exp: "Greasy substances and fats trap high heat inside the skin tissues, causing the burn to sink deeper. Toothpaste contains irritating chemicals that lead to severe tissue infection.",
    myth2_correct: "Hold the burned area under clean, cool running water for 10-20 minutes. Cover loosely with a clean, dry, sterile cloth and visit a clinic.",
    myth3_title: "Fainting & Unconsciousness",
    myth3_myth: "Myth: Force-feed water, onion juice, or hot tea.",
    myth3_exp: "An unconscious person cannot swallow safely. Forcing fluids or food down their mouth causes the contents to enter their lungs, leading to choking and asphyxiation.",
    myth3_correct: "Place the person in the recovery position (on their side) to keep the airway open, loosen tight clothes, monitor breathing, and call emergency help.",
    myth4_title: "Open Wounds & Bleeding",
    myth4_myth: "Myth: Apply mud, ash, or cow dung on open cuts.",
    myth4_exp: "Mud and cow dung contain dangerous spores of Clostridium tetani and other deadly pathogens, which cause severe sepsis and tetanus infections.",
    myth4_correct: "Wash the wound with clean water and mild soap. Apply direct pressure with a clean cloth to stop bleeding and get a tetanus booster vaccine.",
    correct_action_label: "Correct Action",
    telemedicine_title: "Virtual Doctor Consultations",
    telemedicine_subtitle: "Backup connection to general practitioners and specialists for non-life-threatening advice.",
    spec_general: "General Physician",
    spec_emergency: "Emergency Specialist",
    spec_cardiology: "Cardiologist",
    spec_pediatrics: "Pediatrician",
    allergy_title: "Critical Allergy Alert",
    allergy_desc: "Strictly avoid penicillin medications. Tissues are highly sensitive.",
    history_title: "Clinical Parameters",
    param_vitals: "Current Symptoms",
    param_history: "Medical History",
    param_presc: "Active Prescriptions",
    emergency_contacts_title: "Emergency Contacts (Speed Dial)",
    uploaded_files_title: "Uploaded Medical Files",
    expiry_manual_title: "Verify Expiry Details",
    medicine_name_label: "Medicine Name",
    expiry_date_label: "Expiration Date",
    check_safety_btn: "Verify Medicine Safety",
    ocr_scan_title: "Camera OCR Scanner",
    ocr_scan_desc: "Scan strips directly with your camera to extract expiry dates automatically.",
    ocr_btn: "Open Scanner",
    offline_badge: "OFFLINE SAFE",
    offline_resources_title: "Local Pre-Cached Guidance",
    offline_resources_desc: "GramCare caches vital first-aid guides. These work instantly without any network connection in zero-reception areas.",
    proto_snake_desc: "Immobilization and anti-venom advice",
    proto_chest_desc: "Immediate steps for suspected heart attacks",
    proto_choke_desc: "Abdominal thrusts and posture correction",
    proto_burns_desc: "Heat trapping myths vs cool water action",
    consult_chat_label: "Consultation Notes",
    alert_cardiac_title: "Critical Emergency: Cardiac Arrhythmia",
    alert_cardiac_desc: "Patient: Sarah Jenkins • Room 402 • Rural Clinic Alpha"
  },
  hi: {
    nav_home: "होम",
    nav_chat: "एआई सहायक",
    nav_checker: "दवा सुरक्षा",
    nav_doctors: "डॉक्टर कॉल",
    landing_subtitle: "थारो ग्रामीण स्वास्थ्य साथी • एआई पैलो इलाज • अस्पताल मार्ग",
    role_patient_title: "मैं मरीज़ हूँ",
    role_patient_desc: "दवा की यादें, लक्षण चैट और पास के अस्पतालों को देखें",
    role_doctor_title: "मैं डॉक्टर हूँ",
    role_doctor_desc: "मरीज़ों की सूची, एआई रिपोर्ट और दवा लिखने का कंसोल खोलें",
    login_btn: "सुरक्षित OTP पाएँ →",
    login_back: "← वापस जाएँ",
    dash_status: "आपकी सेहत आज ठीक-ठाक लग रही है। हम आपकी क्या मदद कर सकते हैं?",
    vital_bp: "रक्तचाप (BP)",
    vital_hr: "दिल की धड़कन",
    vital_sugar: "शुगर लेवल",
    vital_normal: "सामान्य",
    vital_alert: "चेतावनी",
    quick_ai_title: "एआई डॉक्टर से बात करें",
    quick_ai_desc: "अंग्रेजी, हिन्दी या मालवी में तुरंत प्राथमिक उपचार निर्देश",
    quick_hosp_title: "पास के अस्पताल",
    quick_hosp_desc: "मांगल्या पीएचसी (PHC) और इंदौर के आपातकालीन केंद्र",
    quick_myths_title: "भ्रम निवारक पत्र",
    quick_myths_desc: "पारंपरिक चिकित्सा की गल्तियाँ और उनकी वैज्ञानिक हकीकत",
    quick_checker_title: "दवा सुरक्षा जांचक",
    quick_checker_desc: "दवा की एक्सपायरी तारीख देखकर सुरक्षा सत्यापित करें",
    insight_label: "दैनिक जानकारी",
    insight_med_title: "लिसिनोप्रिल (Lisinopril) दवा का समय",
    insight_med_desc: "लिसिनोप्रिल दवा को एक गिलास साफ पानी के साथ लें। यह रक्तचाप को स्थिर रखती है।",
    insight_med_btn: "दवा ली गई - दर्ज करें",
    upcoming_appt_title: "आने वाले डॉक्टर अपॉइंटमेंट",
    btn_join_call: "कॉल से जुड़ें",
    btn_reschedule: "समय बदलें",
    chat_status_active: "लक्षण गंभीरता:",
    chat_clear: "साफ करें",
    chat_welcome: "नमस्ते, मैं आपका ग्रामकेयर आपातकालीन सहायक हूँ। कृपया अपने लक्षण या समस्या हिन्दी, अंग्रेजी या मालवी में बताएं (जैसे: सांप ने काटा, सीने में दर्द या सांस फूलना)।",
    chat_placeholder: "यहाँ अपने लक्षण लिखें...",
    chat_goto_hospitals: "तुरंत नजदीकी अस्पताल खोजें",
    severity_safe_title: "सिस्टम तैयार है",
    severity_safe_desc: "प्राथमिकता निर्धारण और तत्काल निर्देशों के लिए लक्षण रिपोर्ट करें।",
    first_aid_title: "प्राथमिक चिकित्सा निर्देश",
    first_aid_intro: "सहायता पहुँचने तक इन जीवन रक्षक नियमों का पालन करें:",
    first_aid_step_default: "चैट में अपने लक्षणों का वर्णन करके शुरू करें।",
    hospitals_near_mangaliya: "मांगल्या के पास आपातकालीन केंद्र",
    hospitals_subheading: "इंदौर जिला, मध्य प्रदेश (दूरी के अनुसार क्रमबद्ध)",
    nearest_facility_badge: "★ निकटतम केंद्र",
    map_heading: "इंदौर सेक्टर रूट मैप",
    reminders_today_title: "दैनिक दवा सूची",
    reminder_missed_heading: "छूटी हुई दवा: मेटफॉर्मिन",
    reminder_missed_desc: "सुबह 8:00 बजे का समय था। यदि सुरक्षित हो, तो इसे अभी ले लें।",
    morning_label: "सुबह (8:00 AM)",
    afternoon_label: "दोपहर (1:00 PM)",
    night_label: "रात (9:00 PM)",
    metformin_instructions: "नाश्ते के साथ 1 गोली लें",
    lisinopril_instructions: "दिन में एक बार 1 गोली लें",
    atorvastatin_instructions: "सोने से पहले 1 गोली लें",
    myths_title: "स्वास्थ्य भ्रम निवारक",
    myths_subtitle: "भारतीय ग्रामीण क्षेत्रों में प्रचलित खतरनाक पारंपरिक प्रथाओं के वैज्ञानिक सुधार।",
    myth_badge_fatal: "घातक खतरा",
    myth_badge_harmful: "हानिकारक",
    myth1_title: "सांप के काटने का उपचार",
    myth1_myth: "भ्रम: जहर मुंह से चूसें या कसकर पट्टी (टूर्निकेट) बांधें।",
    myth1_exp: "जहर चूसने से घाव में मुंह के बैक्टीरिया फैलते हैं, जहर बाहर नहीं निकलता और बचाने वाले को भी खतरा होता है। कसकर बांधने से खून का दौरा रुकता है और अंग काटने की नौबत आ जाती है।",
    myth1_correct: "मरीज को पूरी तरह शांत और स्थिर रखें (हिलने-डुलने से जहर तेजी से फैलता है), काटे गए अंग को दिल के स्तर से नीचे रखें और एंटी-वेनम के लिए तुरंत नजदीकी मांगल्या PHC जाएं।",
    myth2_title: "जलने के घाव",
    myth2_myth: "भ्रम: घी, सरसों का तेल, मक्खन या टूथपेस्ट लगाएं।",
    myth2_exp: "चिकनी चीजें और वसा त्वचा के नीचे गर्मी को रोक लेते हैं, जिससे जलन गहराई तक फैलती है। टूथपेस्ट में जलन पैदा करने वाले रसायन होते हैं जो संक्रमण बढ़ाते हैं।",
    myth2_correct: "जले हुए हिस्से को 10-20 मिनट तक ठंडे बहते पानी के नीचे रखें। साफ, सूखे कपड़े से हल्के से ढकें और डॉक्टर के पास जाएं।",
    myth3_title: "बेहोशी और अचेतनता",
    myth3_myth: "भ्रम: मुंह में जबरन पानी, प्याज का रस या गर्म चाय डालें।",
    myth3_exp: "बेहोश व्यक्ति निगल नहीं सकता। जबरन तरल पदार्थ डालने से वे फेफड़ों में चले जाते हैं, जिससे दम घुटने (Asphyxiation) से मौत हो सकती है।",
    myth3_correct: "व्यक्ति को रिकवरी पोजीशन (करवट दिलाकर) में लेटाएं ताकि सांस की नली खुली रहे, तंग कपड़े ढीले करें और तुरंत अस्पताल ले जाएं।",
    myth4_title: "खुले घाव और रक्तस्राव",
    myth4_myth: "भ्रम: खुले कट पर मिट्टी, राख या गाय का गोबर लगाएं।",
    myth4_exp: "मिट्टी और गोबर में टिटनेस के खतरनाक बैक्टीरिया होते हैं, जिससे गंभीर सेप्सिस और टिटनेस संक्रमण होता है।",
    myth4_correct: "घाव को साफ पानी और हल्के साबुन से धोएं। बहते खून को रोकने के लिए साफ कपड़े से सीधे दबाएं और टिटनेस का टीका लगवाएं।",
    correct_action_label: "सही कार्रवाई",
    telemedicine_title: "वर्चुअल डॉक्टर परामर्श",
    telemedicine_subtitle: "सामान्य परामर्श और गैर-आपातकालीन सलाह के लिए डॉक्टरों से सीधा संपर्क।",
    spec_general: "सामान्य चिकित्सक",
    spec_emergency: "आपातकालीन विशेषज्ञ",
    spec_cardiology: "हृदय रोग विशेषज्ञ",
    spec_pediatrics: "बाल रोग विशेषज्ञ",
    allergy_title: "गंभीर एलर्जी चेतावनी",
    allergy_desc: "पेनिसिलिन दवाओं से पूरी तरह बचें। शरीर इसके प्रति अति संवेदनशील है।",
    history_title: "क्लीनिकल पैरामीटर",
    param_vitals: "वर्तमान लक्षण",
    param_history: "चिकित्सा इतिहास",
    param_presc: "सक्रिय नुस्खे",
    emergency_contacts_title: "आपातकालीन संपर्क (स्पीड डायल)",
    uploaded_files_title: "अपलोड की गई फ़ाइलें",
    expiry_manual_title: "दवा विवरण दर्ज करें",
    medicine_name_label: "दवा का नाम",
    expiry_date_label: "समाप्ति तिथि",
    check_safety_btn: "दवा सुरक्षा सत्यापित करें",
    ocr_scan_title: "कैमरा OCR स्कैनर",
    ocr_scan_desc: "दवा की पट्टी को कैमरे से स्कैन करके तारीखें स्वचालित रूप से निकालें।",
    ocr_btn: "स्कैनर खोलें",
    offline_badge: "ऑफलाइन सुरक्षित",
    offline_resources_title: "स्थानीय ऑफलाइन सहायता पुस्तकालय",
    offline_resources_desc: "ग्रामकेयर महत्वपूर्ण प्राथमिक उपचार गाइडों को सुरक्षित रखता है। यह बिना इंटरनेट के भी घने जंगलों या कम नेटवर्क वाले क्षेत्रों में काम करता है।",
    proto_snake_desc: "सांप काटने पर जहर को फैलने से रोकना और एंटी-वेनम सलाह",
    proto_chest_desc: "दिल के दौरे के संदेह होने पर किए जाने वाले तत्काल कदम",
    proto_choke_desc: "सांस नली में अवरोध होने पर पेट का संकुचन निर्देश",
    proto_burns_desc: "पारंपरिक तेल-घी के भ्रम बनाम ठंडे पानी की कार्रवाई",
    consult_chat_label: "परामर्श नोट्स",
    alert_cardiac_title: "आपातकालीन चेतावनी: कार्डियक अतालता",
    alert_cardiac_desc: "मरीज: सारा जेनकिंस • कमरा 402 • रूरल क्लिनिक अल्फा"
  },
  mv: { // Regional Malvi (माळवी) translations for Indore rural district
    nav_home: "घर",
    nav_chat: "एआई डॉक्टर",
    nav_checker: "गोली जांच",
    nav_doctors: "डॉक्टर साहब",
    landing_subtitle: "थारो ग्रामीण स्वास्थ्य साथी • एआई पैलो इलाज • अस्पताल मार्ग",
    role_patient_title: "मुँ मरीज़ हूँ",
    role_patient_desc: "दवा की यादें, लक्षण चैट और पास के अस्पतालों को देखें",
    role_doctor_title: "मुँ डॉक्टर हूँ",
    role_doctor_desc: "मरीज़ों की सूची, एआई रिपोर्ट और दवा लिखने का कंसोल खोलें",
    login_btn: "सुरक्षित OTP पाओ →",
    login_back: "← पाछो फिरो",
    dash_status: "थारी तबियत आज ठीक-ठाक दीख री है। म्हे कई मदद कर सका थारी?",
    vital_bp: "रक्तचाप (BP)",
    vital_hr: "धड़कन की रफ़्तार",
    vital_sugar: "शक्कर को नाप",
    vital_normal: "बराबर",
    vital_alert: "धोखो",
    quick_ai_title: "एआई डॉक्टर साहब से बात करो",
    quick_ai_desc: "कटी भी बीमारी या तकलीफ की सीधी सलाह लो माळवी में",
    quick_hosp_title: "पास का अस्पताल",
    quick_hosp_desc: "मांगल्या सरकारी अस्पताल और पास की दवाखाना",
    quick_myths_title: "भ्रम सुधार पत्र",
    quick_myths_desc: "बीमारी के बारे में फैली गल्त बातें और साची हकीकत",
    quick_checker_title: "दवा सुरक्षा जांच पत्र",
    quick_checker_desc: "दवा ख़राब तो नी होगी, ये तारीख से जांचो",
    insight_label: "दैनिक जानकारी",
    insight_med_title: "लिसिनोप्रिल (Lisinopril) दवा को वखत",
    insight_med_desc: "लिसिनोप्रिल दवा को एक गिलास साफ पानी के साथ लो। यो रक्तचाप को बराबर राखे है।",
    insight_med_btn: "गोली खाय ली - लिखो",
    upcoming_appt_title: "डॉक्टर साहब से बातचीत",
    btn_join_call: "कॉल से जुड़ो",
    btn_reschedule: "वखत बदलो",
    chat_status_active: "बीमारी की हालत:",
    chat_clear: "साफ करो",
    chat_welcome: "राम राम! मुँ थारो ग्रामकेयर एआई आपातकालीन सहायक हूँ। थारी तकलीफ या लक्षण माळवी, हिन्दी या अंग्रेजी में बताओ (जैसे: सांप काट खायो, सीने में दरद, सांस फूलनो या घबराट)।",
    chat_placeholder: "थारी तकलीफ यहाँ लिखो...",
    chat_goto_hospitals: "तुरंत पास को अस्पताल खोजो",
    severity_safe_title: "सिस्टम तैयार है",
    severity_safe_desc: "लक्षण बताओ ताकि गंभीर बीमारी और प्राथमिक उपचार को पतो लग सके।",
    first_aid_title: "त्वरित कार्रवाई सूची",
    first_aid_intro: "मदद आने तक इन बातों को ध्यान से पालन करो:",
    first_aid_step_default: "चैट में अपनी तकलीफ लिखी ने बताओ।",
    hospitals_near_mangaliya: "मांगल्या के पास का सरकारी अस्पताल",
    hospitals_subheading: "इंदौर जिला, मध्य प्रदेश (दूरी के हिसाब से)",
    nearest_facility_badge: "★ पास को दवाखानो",
    map_heading: "इंदौर क्षेत्र को नक़्शो",
    reminders_today_title: "दवा की लिस्ट",
    reminder_missed_heading: "गोली छूटी: मेटफॉर्मिन",
    reminder_missed_desc: "सुबह 8:00 बजे को वखत थो। अभी सुरक्षित होय तो गोली खाय लो।",
    morning_label: "सुबह (8:00 AM)",
    afternoon_label: "दोपहर (1:00 PM)",
    night_label: "रात (9:00 PM)",
    metformin_instructions: "नाश्ते के साथ 1 गोली लो",
    lisinopril_instructions: "दिन में एक बार 1 गोली लो",
    atorvastatin_instructions: "सोने से पहले 1 गोली लो",
    myths_title: "भ्रम सुधार पत्र",
    myths_subtitle: "गांव में फैली बीमारी की गल्तियों को वैज्ञानिक सुधार।",
    myth_badge_fatal: "भारी धोखो",
    myth_badge_harmful: "नुकसान देह",
    myth1_title: "सांप के काटने का इलाज",
    myth1_myth: "भ्रम: जहर मुंह से चूसो या कसके पट्टी (टूर्निकेट) बांधो।",
    myth1_exp: "जहर चूसने से मुंह की गंदगी घाव में फैले है। कसकर बांधने से खून का दौरा रुक जावे है और हाथ-पैर काटने की नौबत आ जावे है।",
    myth1_correct: "पीड़ित को एकदम शांत और स्थिर रखो। काटे हुए पैर-हाथ को दिल से नीचे रखो और तुरंत एंटी-वेनम के लिए मांगल्या PHC जाओ।",
    myth2_title: "जलने को घाव",
    myth2_myth: "भ्रम: घी, तेल, मक्खन या टूथपेस्ट लगाओ।",
    myth2_exp: "चिकनी चीजें गर्मी को त्वचा के नीचे रोक लेवे है, जिससे घाव और गेहरो होय जावे है। टूथपेस्ट से जलन और इन्फेक्शन बढे है।",
    myth2_correct: "जले हुए हिस्से को 10-20 मिनट तक बहते ठंडे पानी के नीचे रखो। साफ सूखे कपड़े से ढककर डॉक्टर के पास जाओ।",
    myth3_title: "बेहोशी को रोग",
    myth3_myth: "भ्रम: मुंह में पानी, प्याज को रस या गरम चाय डालो।",
    myth3_exp: "बेहोश आदमी निगल नी पावे है। मुंह में जबरन पानी डालने से वो फेफड़ों में चल जावे है जिससे दम घुटने से मौत हो सकती है।",
    myth3_correct: "बेहोश व्यक्ति को करवट दिलाकर रिकवरी पोजीशन में लेटाओ ताकि सांस नली खुली रहे। तुरंत डॉक्टर के पास ले जाओ।",
    myth4_title: "खुले घाव और खून बहना",
    myth4_myth: "भ्रम: कटे हुए घाव पर मिट्टी, राख या गोबर लगाओ।",
    myth4_exp: "गोबर और मिट्टी में टिटनेस के खतरनाक कीटाणु होवे है, जिससे सेप्सिस और टिटनेस की घातक बीमारी हो जावे है।",
    myth4_correct: "घाव को साफ पानी और साबुन से धोओ। साफ कपड़े से दबाकर खून रोको और टिटनेस का इंजेक्शन लगवाओ।",
    correct_action_label: "साची हकीकत",
    telemedicine_title: "डॉक्टर साहब से बातचीत",
    telemedicine_subtitle: "सामान्य बीमारी की सलाह के लिए सीधे डॉक्टर साहब से कॉल करो।",
    spec_general: "सामान्य चिकित्सक",
    spec_emergency: "आपातकालीन विशेषज्ञ",
    spec_cardiology: "हृदय रोग विशेषज्ञ",
    spec_pediatrics: "बाल रोग विशेषज्ञ",
    allergy_title: "भारी धोखो: एलर्जी",
    allergy_desc: "पेनिसिलिन गोली से पूरी तरह बचो। यो थारे शरीर के लिए जहर के बराबर है।",
    history_title: "क्लीनिकल रिपोर्ट",
    param_vitals: "आज की तकलीफ",
    param_history: "पुरानी बीमारी",
    param_presc: "चालू दवाइयां",
    emergency_contacts_title: "आपातकालीन नंबर (स्पीड डायल)",
    uploaded_files_title: "फ़ाइल रिपोर्ट",
    expiry_manual_title: "दवा की तारीख जांचो",
    medicine_name_label: "दवा को नाम",
    expiry_date_label: "ख़तम होवे की तारीख",
    check_safety_btn: "दवा की सुरक्षा जांचो",
    ocr_scan_title: "कैमरा स्कैनर",
    ocr_scan_desc: "दवा की पट्टी कैमरे से स्कैन करीने तारीख निकालो",
    ocr_btn: "स्कैनर खोलो",
    offline_badge: "ऑफलाइन सुरक्षित",
    offline_resources_title: "स्थानीय ऑफलाइन सहायता पुस्तकालय",
    offline_resources_desc: "ग्रामकेयर महत्वपूर्ण प्राथमिक उपचार गाइडों को सुरक्षित रखता है। यह बिना इंटरनेट के भी घने जंगलों या कम नेटवर्क वाले क्षेत्रों में काम करता है।",
    proto_snake_desc: "सांप काटने पर जहर को फैलने से रोकना और एंटी-वेनम सलाह",
    proto_chest_desc: "दिल के दौरे के संदेह होने पर किए जाने वाले तत्काल कदम",
    proto_choke_desc: "सांस नली में अवरोध होने पर पेट का संकुचन निर्देश",
    proto_burns_desc: "पारंपरिक तेल-घी के भ्रम बनाम ठंडे पानी की कार्रवाई",
    consult_chat_label: "परामर्श नोट्स",
    alert_cardiac_title: "आपातकालीन चेतावनी: कार्डियक अतालता",
    alert_cardiac_desc: "मरीज: सारा जेनकिंस • कमरा 402 • रूरल क्लिनिक अल्फा"
  }
};

// Local cache for offline symptom parser fallback
const OFFLINE_PROTOCOLS = {
  snake_bite: {
    severity: "CRITICAL",
    symptom: "Snake Bite (WHO Guideline Standard)",
    guidance_en: "- Keep the victim completely still; any motion speeds the venom circulation.\n- Position the bitten limb below heart level if possible and remove tight items.\n- Gently clean the wound with clean water.\n- DO NOT cut, apply ice, suck venom, or tie a tight tourniquet.\n- Seek anti-venom treatment at the nearest PHC immediately.",
    guidance_hi: "- पीड़ित को बिल्कुल शांत और स्थिर रखें; हलचल से जहर तेजी से फैलता है।\n- काटे गए अंग को दिल के स्तर से नीचे रखें और अंगूठी/तंग कपड़े हटा दें।\n- घाव को साफ पानी से धीरे से धोएं।\n- चीरा न लगाएं, बर्फ न लगाएं, जहर न चूसें, और तंग पट्टी न बांधें।\n- एंटी-वेनम इंजेक्शन के लिए मरीज को तुरंत मांगल्या PHC ले जाएं।",
    escalation_message_en: "Critical Emergency! Take victim to Mangaliya PHC (1.4 km) immediately for Anti-Venom Injection.",
    escalation_message_hi: "गंभीर आपातकाल! एंटी-वेनम के लिए मरीज को तुरंत नजदीकी मांगल्या PHC (1.4 किलोमीटर) ले जाएं।",
    myth_id: "myth-snake-bite"
  },
  chest_pain: {
    severity: "CRITICAL",
    symptom: "Suspected Cardiac Arrest / Heart Attack",
    guidance_en: "- Help the person sit down comfortably and remain calm.\n- Loosen any tight clothing (collar, shirts).\n- If responsive and can swallow, give them one adult aspirin (325mg) to chew.\n- Monitor breathing closely; be ready to perform CPR compressions if they collapse.",
    guidance_hi: "- व्यक्ति को आराम से बिठाएं और शांत रखें।\n- शर्ट का कॉलर या तंग कपड़े ढीले करें।\n- यदि वे होश में हैं, तो एक एस्पिरिन (325mg) चबाने के लिए दें।\n- सांसों पर नजर रखें; यदि सांस रुकती है, तो तुरंत सीपीआर (CPR) शुरू करें।",
    escalation_message_en: "Immediate Danger! Proceed to Bombay Hospital or CHL Hospital. Do not drive yourself.",
    escalation_message_hi: "गंभीर खतरा! तुरंत बॉम्बे हॉस्पिटल या सीएचएल हॉस्पिटल इंदौर ले जाएं। मरीज को अकेला न छोड़ें।",
    myth_id: "myth-unconscious"
  },
  choking: {
    severity: "CRITICAL",
    symptom: "Choking (Red Cross standard)",
    guidance_en: "- Adult/Child: Stand behind, give 5 sharp back blows between shoulder blades. If blocked, give 5 abdominal Heimlich thrusts.\n- Infant: Position face-down along forearm, support head lower than body. Give 5 back blows, then turn face-up, give 5 chest thrusts (1.5 inches deep).\n- Unresponsive: Place flat, perform CPR compressions. Open mouth and check for object; NEVER do blind finger sweeps.",
    guidance_hi: "- वयस्क/बच्चा: पीछे खड़े हों, पीठ पर 5 बार थपथपाएं। अवरोध होने पर पेट को 5 बार दबाएं (Heimlich Maneuver)।\n- शिशु: अग्रबाहु पर चेहरा नीचे कर सिर नीचे की तरफ रखें, पीठ पर 5 बार थपथपाएं। फिर सीधा कर 5 बार छाती दबाएं (1.5 इंच)।\n- बेहोश: सीधे सुलाएं, सीपीआर (CPR) दें। मुंह खोलकर अवरोध देखें, मुंह में अंधाधुंध हाथ न डालें (Never blind sweep)।",
    escalation_message_en: "Call emergency responders immediately. If the person faints, lay flat and clear airway.",
    escalation_message_hi: "तुरंत आपातकालीन सहायता बुलाएं। यदि व्यक्ति बेहोश हो जाता है, तो सीधे सुलाएं और सांस नली की जांच करें।",
    myth_id: "myth-unconscious"
  },
  burns: {
    severity: "MEDIUM",
    symptom: "Thermal Burn / Scalding (WHO Standard)",
    guidance_en: "- Pour cool running water over the burn for 10 to 20 minutes to cool skin layers.\n- Do not apply ice water as it causes tissue damage.\n- Do not apply butter, oil, toothpaste, or home remedies which trap heat.\n- Cover loosely with clean cellophane plastic wrap or a sterile non-stick bandage.",
    guidance_hi: "- जले हुए हिस्से पर 10 से 20 मिनट तक ठंडा साफ बहता पानी डालें।\n- बर्फ या अत्यधिक ठंडे पानी का उपयोग न करें, यह त्वचा की परतों को नुकसान पहुँचाता है।\n- मक्खन, घी, तेल, टूथपेस्ट या घरेलू नुस्खे न लगाएं जो गर्मी को अंदर रोकते हैं।\n- साफ सेलफ़ोन प्लास्टिक या पट्टी से ढीला ढकें।",
    escalation_message_en: "Consult a clinic if burn is large, blisters form, or skin appears charred.",
    escalation_message_hi: "यदि जला हुआ हिस्सा बड़ा है, फफोले पड़ गए हैं या त्वचा जल गई है, तो अस्पताल से परामर्श लें।",
    myth_id: "myth-burn"
  }
};

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
  // Initialize PWA Local Storage Database users
  UserDB.initializeDefaultUsers();

  // Offline detection setup
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  updateConnectionStatus();

  // Load default view
  showView('splash');
  
  // Set default date to current month in safety checker
  const dateInput = document.getElementById("medicine-date-input");
  if (dateInput) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    dateInput.value = `${year}-${month}`;
  }

  // Set default missed reminder notifications
  updateRemindersUI();
});

// App View Routing Handler
function showView(viewId) {
  // Hide all panels
  const views = document.querySelectorAll(".view-panel");
  views.forEach(view => view.classList.remove("active"));
  
  // Show target view panel
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add("active");
  }

  activeView = viewId;

  // Sync Bottom Navigation items styling
  const navLinks = document.querySelectorAll(".bottom-nav-link");
  navLinks.forEach(link => link.classList.remove("active"));

  let activeNavBtn = null;
  if (viewId === 'dashboard') activeNavBtn = document.getElementById('btn-nav-home');
  else if (viewId === 'chatbot') activeNavBtn = document.getElementById('btn-nav-chat');
  else if (viewId === 'reminders') activeNavBtn = document.getElementById('btn-nav-reminders');
  else if (viewId === 'doctors') activeNavBtn = document.getElementById('btn-nav-doctors');
  else if (viewId === 'profile') activeNavBtn = document.getElementById('btn-nav-profile');

  if (activeNavBtn) {
    activeNavBtn.classList.add("active");
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Local Storage User DB manager
const UserDB = {
  getUsers: function() {
    try {
      const data = localStorage.getItem("gramcare_users");
      return data ? JSON.parse(data) : [];
    } catch(e) {
      console.error("Error reading users:", e);
      return [];
    }
  },
  saveUsers: function(users) {
    try {
      localStorage.setItem("gramcare_users", JSON.stringify(users));
    } catch(e) {
      console.error("Error saving users:", e);
    }
  },
  normalizePhone: function(phone) {
    return phone.replace(/[^\d]/g, "").slice(-10); // match last 10 digits
  },
  findUser: function(phone) {
    const norm = this.normalizePhone(phone);
    const users = this.getUsers();
    return users.find(u => this.normalizePhone(u.phone) === norm);
  },
  registerUser: function(name, phone, age, blood, lang) {
    const users = this.getUsers();
    const newUser = { 
      id: 'usr-' + Date.now(), 
      name, 
      phone, 
      age, 
      blood, 
      lang,
      contacts: [
        { id: 'c1', name: 'Sarah James', relation: 'Daughter', phone: '+91 9988776655', type: 'family', icon: '👧', desc: 'Primary Contact • Lives in Indore' },
        { id: 'c2', name: 'Dr. Amit Verma', relation: 'Family Doctor', phone: '+91 731 4774444', type: 'doctor', icon: '👨‍⚕️', desc: 'Family General Doctor' }
      ]
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },
  initializeDefaultUsers: function() {
    const users = this.getUsers();
    if (users.length === 0) {
      const defaultUsers = [
        { 
          id: 'usr-default', 
          name: 'Mr. James', 
          phone: '+91 9876543210', 
          age: 68, 
          blood: 'O+', 
          lang: 'en',
          contacts: [
            { id: 'c1', name: 'Sarah James', relation: 'Daughter', phone: '+91 9988776655', type: 'family', icon: '👧', desc: 'Primary Contact • Lives in Indore' },
            { id: 'c2', name: 'Dr. Amit Verma', relation: 'Family Doctor', phone: '+91 731 4774444', type: 'doctor', icon: '👨‍⚕️', desc: 'Family General Doctor' }
          ]
        }
      ];
      this.saveUsers(defaultUsers);
    }
  }
};

// Splash login role selections
function selectLoginRole(role) {
  currentRole = role;
  const selectBox = document.getElementById("splash-role-select");
  const loginForm = document.getElementById("splash-login-form");
  const regForm = document.getElementById("splash-register-form");
  const label = document.getElementById("login-phone-label");
  const phoneInput = document.getElementById("login-phone");

  if (selectBox && loginForm && label && regForm) {
    selectBox.style.display = "none";
    loginForm.style.display = "block";
    regForm.style.display = "none";
    
    if (role === 'patient') {
      label.textContent = currentLang === 'hi' ? "मोबाइल नंबर या मरीज़ आईडी दर्ज करें" : 
                          currentLang === 'mv' ? "मोबाइल नंबर या मरीज़ आईडी दर्ज करें" : 
                          "Enter Mobile Number or Patient ID";
      phoneInput.placeholder = "e.g. 98765 43210";
      phoneInput.value = "+91 9876543210"; // Pre-load mockup
      
      // Show register link trigger for patients
      const trigger = document.getElementById("register-trigger-container");
      if (trigger) trigger.style.display = "block";
    } else {
      label.textContent = currentLang === 'hi' ? "डॉक्टर लाइसेंस नंबर दर्ज करें" :
                          currentLang === 'mv' ? "डॉक्टर लाइसेंस नंबर दर्ज करें" :
                          "Enter Medical License ID";
      phoneInput.placeholder = "e.g. MCI-12345";
      phoneInput.value = "MCI-44589"; // Pre-load doctor license mockup
      
      // Hide register link trigger for doctors
      const trigger = document.getElementById("register-trigger-container");
      if (trigger) trigger.style.display = "none";
    }
  }
}

function backToRoles() {
  const selectBox = document.getElementById("splash-role-select");
  const loginForm = document.getElementById("splash-login-form");
  const regForm = document.getElementById("splash-register-form");
  if (selectBox && loginForm && regForm) {
    selectBox.style.display = "block";
    loginForm.style.display = "none";
    regForm.style.display = "none";
  }
}

// Registration toggle triggers
function showRegisterForm() {
  const loginForm = document.getElementById("splash-login-form");
  const regForm = document.getElementById("splash-register-form");
  if (loginForm && regForm) {
    loginForm.style.display = "none";
    regForm.style.display = "block";
    
    // Set default lang in reg form dropdown matching current app language
    const regLang = document.getElementById("reg-lang");
    if (regLang) regLang.value = currentLang;
  }
}

function cancelRegistration() {
  const loginForm = document.getElementById("splash-login-form");
  const regForm = document.getElementById("splash-register-form");
  if (loginForm && regForm) {
    loginForm.style.display = "block";
    regForm.style.display = "none";
  }
}

// Register form submission
function submitRegistration() {
  const nameInput = document.getElementById("reg-name");
  const phoneInput = document.getElementById("reg-phone");
  const ageInput = document.getElementById("reg-age");
  const bloodSelect = document.getElementById("reg-blood");
  const langSelect = document.getElementById("reg-lang");

  if (!nameInput || !phoneInput || !ageInput || !bloodSelect || !langSelect) return;

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const age = parseInt(ageInput.value, 10);
  const blood = bloodSelect.value;
  const lang = langSelect.value;

  if (!name) {
    showToast("Please enter your Full Name", "warning");
    return;
  }
  if (!phone || phone.length < 10) {
    showToast("Please enter a valid mobile number", "warning");
    return;
  }
  if (isNaN(age) || age < 1 || age > 120) {
    showToast("Please enter a valid age", "warning");
    return;
  }

  // Check if phone number already exists
  if (UserDB.findUser(phone)) {
    showToast("Mobile number already registered. Please log in.", "warning");
    cancelRegistration();
    const loginPhone = document.getElementById("login-phone");
    if (loginPhone) loginPhone.value = phone;
    return;
  }

  // Register user in database
  const newUser = UserDB.registerUser(name, phone, age, blood, lang);
  
  // Reset fields
  nameInput.value = "";
  phoneInput.value = "";
  ageInput.value = "";

  // Set role
  currentRole = 'patient';

  // Login
  loginUserSession(newUser);
  showToast("Account created successfully!", "success");
}

// Dynamic Login Session mapping
function loginUserSession(user) {
  const header = document.getElementById("main-header");
  const bottomNav = document.getElementById("app-nav-bar");
  const sosFloat = document.getElementById("floating-sos");
  
  showView('dashboard');
  if (header) header.style.display = "flex";
  if (bottomNav) bottomNav.style.display = "flex";
  if (sosFloat) sosFloat.style.display = "flex";

  // Dynamic greetings spans
  const welcomeName = document.getElementById("patient-welcome-name");
  if (welcomeName) {
    welcomeName.textContent = user.name;
  }

  // Profile cards
  const profileName = document.getElementById("profile-user-name");
  const profileAge = document.getElementById("profile-age-badge");
  const profileBlood = document.getElementById("profile-blood-badge");

  if (profileName) profileName.textContent = user.name;
  if (profileAge) profileAge.textContent = `${user.age} Years Old`;
  if (profileBlood) profileBlood.textContent = `Blood: ${user.blood}`;

  // Set current user session context
  currentUser = user;

  // Safeguard: immediately initialize contacts if not present and persist to localStorage
  if (!currentUser.contacts) {
    currentUser.contacts = [
      { id: 'c1', name: 'Sarah James', relation: 'Daughter', phone: '+91 9988776655', type: 'family', icon: '👧', desc: 'Primary Contact • Lives in Indore' },
      { id: 'c2', name: 'Dr. Amit Verma', relation: 'Family Doctor', phone: '+91 731 4774444', type: 'doctor', icon: '👨‍⚕️', desc: 'Family General Doctor' }
    ];
    saveCurrentUserProfile();
  }

  // Safeguard: immediately initialize reports if not present and persist to localStorage
  if (!currentUser.reports) {
    currentUser.reports = [
      { id: 'r1', name: 'Annual Blood Panel_2025.pdf', date: 'Oct 12, 2025', size: '2.4 MB', dataUrl: null },
      { id: 'r2', name: 'ECG_Report_Jan2026.pdf', date: 'Jan 05, 2026', size: '1.1 MB', dataUrl: null }
    ];
    saveCurrentUserProfile();
  }

  renderContactsUI();
  renderReportsUI();

  // Swap translations to their preferred language!
  switchLanguage(user.lang);
}

// Logins submit validation
function submitLogin() {
  const phoneInput = document.getElementById("login-phone");
  if (!phoneInput) return;

  const phoneVal = phoneInput.value.trim();

  if (currentRole === 'patient') {
    if (!phoneVal) {
      showToast("Please enter your mobile number", "warning");
      return;
    }

    // Look up in UserDB
    const matchedUser = UserDB.findUser(phoneVal);
    if (!matchedUser) {
      showToast("Mobile number not registered. Please Create an Account.", "warning");
      return;
    }

    loginUserSession(matchedUser);
    showToast(currentLang === 'hi' ? "मरीज़ पोर्टल में लॉगिन हुआ" : "Logged in successfully to Patient Portal", "success");
  } 
  else {
    // Doctors login
    const header = document.getElementById("main-header");
    const bottomNav = document.getElementById("app-nav-bar");
    const sosFloat = document.getElementById("floating-sos");
    
    showView('docdashboard');
    if (header) header.style.display = "flex";
    if (bottomNav) bottomNav.style.display = "none";
    if (sosFloat) sosFloat.style.display = "flex";
    
    showToast("Access Granted. MediNova Doctor Console active.", "success");
  }
}

function logoutRole() {
  const header = document.getElementById("main-header");
  const bottomNav = document.getElementById("app-nav-bar");
  const sosFloat = document.getElementById("floating-sos");

  currentRole = '';
  currentUser = null;
  showView('splash');
  backToRoles();

  if (header) header.style.display = "none";
  if (bottomNav) bottomNav.style.display = "none";
  if (sosFloat) sosFloat.style.display = "none";

  // Clear inputs
  const phoneInput = document.getElementById("login-phone");
  if (phoneInput) phoneInput.value = "";

  showToast("Logged out successfully", "info");
}

function goToHome() {
  if (currentRole === 'doctor') {
    showView('docdashboard');
  } else {
    showView('dashboard');
  }
}

// Multilingual Switching adaptors
function switchLanguage(lang) {
  currentLang = lang;
  
  // Toggles highlights
  const enBtns = [document.getElementById("btn-lang-en"), document.getElementById("splash-lang-en")];
  const hiBtns = [document.getElementById("btn-lang-hi"), document.getElementById("splash-lang-hi")];
  const mvBtns = [document.getElementById("btn-lang-mv"), document.getElementById("splash-lang-mv")];

  enBtns.forEach(btn => btn && btn.classList.toggle("active", lang === 'en'));
  hiBtns.forEach(btn => btn && btn.classList.toggle("active", lang === 'hi'));
  mvBtns.forEach(btn => btn && btn.classList.toggle("active", lang === 'mv'));

  // Translate all marked DOM tags
  const translatableElements = document.querySelectorAll("[data-key]");
  translatableElements.forEach(elem => {
    const key = elem.getAttribute("data-key");
    if (TRANSLATIONS[lang][key]) {
      elem.textContent = TRANSLATIONS[lang][key];
    }
  });

  // Re-translate inputs placeholders
  const chatInput = document.getElementById("chat-user-input");
  if (chatInput) {
    chatInput.placeholder = TRANSLATIONS[lang]["chat_placeholder"];
  }

  // Update greeting bubble
  const greetingEl = document.getElementById("chat-greeting");
  if (greetingEl && chatHistory.length === 0) {
    greetingEl.textContent = TRANSLATIONS[lang]["chat_welcome"];
  }

  // Update welcome messages dynamically
  const welcomePrefix = document.getElementById("patient-welcome-prefix");
  if (welcomePrefix && currentRole === 'patient') {
    welcomePrefix.textContent = lang === 'hi' ? "नमस्ते, " : 
                               lang === 'mv' ? "राम राम, " : 
                               "Good morning, ";
  }

  // Safety checker outputs
  const resultDisplay = document.getElementById("expiry-result-box");
  if (resultDisplay && resultDisplay.style.display === "block") {
    checkMedicineExpiry(); // Re-trigger safety check logic in new language
  }

  if (synth.speaking) {
    synth.cancel();
  }

  const langNames = { en: "English", hi: "हिन्दी", mv: "मालवी (माळवी)" };
  showToast(`Language switched to ${langNames[lang]}`, "success");
}

// Connection Status offline checkers
function updateConnectionStatus() {
  const banner = document.getElementById("offline-banner");
  if (!banner) return;

  if (navigator.onLine) {
    banner.style.display = "none";
  } else {
    banner.style.display = "flex";
    showToast("Internet connection lost. Offline cached data active.", "warning");
  }
}

// Floating SOS dial logic
function triggerSosEmergency() {
  showToast("🚨 SOS CRITICAL PROTOCOL STARTED!", "error");
  showView('chatbot');
  
  // Directly trigger cardiac arrest offline flow mockup
  const proto = OFFLINE_PROTOCOLS.chest_pain;
  appendMessage("SOS EMERGENCY TRIGGERED - Suspected Cardiac distress", 'user');
  
  setTimeout(() => {
    const guidance = currentLang === 'hi' ? proto.guidance_hi : 
                     currentLang === 'mv' ? TRANSLATIONS['mv']['proto_chest_desc'] + "\n" + proto.guidance_hi : 
                     proto.guidance_en;
    const escalation = currentLang === 'hi' || currentLang === 'mv' ? proto.escalation_message_hi : proto.escalation_message_en;
    
    let combinedMessage = `<strong>${proto.symptom} (SOS Critical Priority)</strong><br><br>${guidance.replace(/\n/g, '<br>')}`;
    if (escalation) {
      combinedMessage += `<br><br><span style="color:var(--severity-critical); font-weight:bold;">🚨 ${escalation}</span>`;
    }

    appendMessage(combinedMessage, 'assistant');
    updateSeverityUI(proto);
    speakAloud(escalation + ". " + guidance);
  }, 500);
}

// Patient reminders timelines updates
function updateRemindersUI() {
  const missedBadge = document.getElementById("metformin-missed-badge");
  const missedAlert = document.getElementById("missed-dose-alert");
  const navBadge = document.getElementById("nav-badge-reminders");

  let missedCount = 0;

  userReminders.forEach(med => {
    const card = document.getElementById(`med-reminder-${med.id}`);
    const btn = document.getElementById(`btn-taken-${med.id}`);
    
    if (card && btn) {
      if (med.taken) {
        btn.textContent = "✓ Taken";
        btn.className = "btn-taken checked";
        btn.disabled = true;
        
        // Hide missed labels if taken
        if (med.id === 'metformin') {
          if (missedBadge) missedBadge.style.display = "none";
        }
      } else {
        btn.textContent = "Mark as Taken";
        btn.className = "btn-taken";
        btn.disabled = false;

        if (med.missed) {
          missedCount++;
          if (med.id === 'metformin' && missedBadge) missedBadge.style.display = "inline-block";
        }
      }
    }
  });

  // Toggle missed dose warnings
  if (missedCount > 0 && !userReminders[0].taken) {
    if (missedAlert) missedAlert.style.display = "flex";
    if (navBadge) navBadge.style.display = "block";
  } else {
    if (missedAlert) missedAlert.style.display = "none";
    if (navBadge) navBadge.style.display = "none";
  }
}

function markReminderTaken(medId) {
  const med = userReminders.find(m => m.id === medId);
  if (med) {
    med.taken = true;
    updateRemindersUI();
    showToast(`${med.name} logged as taken successfully`, "success");
    
    if (voiceRemindersActive) {
      const msg = currentLang === 'hi' ? `${med.name} दवा ले ली गई है। धन्यवाद।` : 
                  currentLang === 'mv' ? `${med.name} गोली खाय ली है। धन्यवाद।` : 
                  `${med.name} has been marked as taken. Thank you.`;
      speakAloud(msg);
    }
  }
}

function resolveMissedDose() {
  markReminderTaken('metformin');
}

function toggleVoiceReminders() {
  const toggle = document.getElementById("voice-reminder-toggle");
  voiceRemindersActive = toggle.checked;
  showToast(`Voice assistance reminders ${voiceRemindersActive ? 'activated' : 'deactivated'}`, "info");
}

function logInsightMedication() {
  markReminderTaken('lisinopril');
  const btn = document.getElementById("btn-log-insight-med");
  if (btn) {
    btn.disabled = true;
    btn.textContent = currentLang === 'hi' ? "दवा ले ली गई है" : 
                      currentLang === 'mv' ? "गोली खाय ली है" : 
                      "Medication Logged";
  }
}

function rescheduleAppointment() {
  showToast("Booking operator contacted to reschedule. We will send an SMS confirmation.", "info");
}

// Add Custom reminders modal drawers
function openAddReminderModal() {
  const drawer = document.getElementById("add-reminder-drawer");
  if (drawer) drawer.style.display = "block";
}

function closeAddReminderModal() {
  const drawer = document.getElementById("add-reminder-drawer");
  if (drawer) drawer.style.display = "none";
}

function submitCustomReminder() {
  const nameInput = document.getElementById("new-reminder-name");
  const timeSelect = document.getElementById("new-reminder-time");
  const descInput = document.getElementById("new-reminder-desc");

  if (!nameInput || !timeSelect || !descInput) return;

  const name = nameInput.value.trim();
  const time = timeSelect.value;
  const desc = descInput.value.trim();

  if (!name) {
    showToast("Please enter a medicine name", "warning");
    return;
  }

  const id = `med-${Date.now()}`;
  const newMed = { id, name, time, desc, taken: false, missed: false };
  userReminders.push(newMed);

  // Dynamically append visual node to timelines listing
  appendReminderToTimeline(newMed);
  
  // Reset
  nameInput.value = "";
  descInput.value = "";
  closeAddReminderModal();
  updateRemindersUI();
  
  showToast(`${name} added to daily pill timeline`, "success");
}

function appendReminderToTimeline(med) {
  // Find correct timeline category
  const slots = { morning: "morning_label", afternoon: "afternoon_label", night: "night_label" };
  constSlotHeading = Array.from(document.querySelectorAll(".time-slot-heading")).find(h => {
    return h.querySelector("[data-key]") && h.querySelector("[data-key]").getAttribute("data-key") === slots[med.time];
  });

  if (constSlotHeading) {
    const card = document.createElement("div");
    card.className = "reminder-item-card";
    card.id = `med-reminder-${med.id}`;
    
    card.innerHTML = `
      <div class="reminder-item-left">
        <span class="reminder-item-icon">💊</span>
        <div class="reminder-item-info">
          <h4>${med.name}</h4>
          <p>${med.desc}</p>
        </div>
      </div>
      <button class="btn-taken" id="btn-taken-${med.id}" onclick="markReminderTaken('${med.id}')">Mark as Taken</button>
    `;

    // Insert card immediately after slot heading
    constSlotHeading.parentNode.insertBefore(card, constSlotHeading.nextSibling);
  }
}

// Chatbot functionality adaptations
function applySuggestion(text) {
  const input = document.getElementById("chat-user-input");
  if (input) {
    input.value = text;
    input.focus();
  }
}

function handleChatKey(e) {
  if (e.key === 'Enter') {
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const input = document.getElementById("chat-user-input");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  // Render User Message bubble
  appendMessage(text, 'user');
  input.value = "";
  chatHistory.push({ role: 'user', text: text });

  // Render loading state for Assistant
  const loadingId = appendMessage("Thinking... विश्लेषण कर रहा है...", 'assistant loading');
  
  // Disable inputs during processing
  const sendBtn = document.getElementById("btn-send-chat");
  const micBtn = document.getElementById("btn-mic-chat");
  if (sendBtn) sendBtn.disabled = true;
  if (micBtn) micBtn.disabled = true;

  try {
    let resultData;
    
    // Check if offline
    if (!navigator.onLine) {
      resultData = parseOfflineSymptoms(text);
      await new Promise(resolve => setTimeout(resolve, 800)); // Mock latency
    } else {
      // Fetch from API proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang: currentLang })
      });
      
      if (response.ok) {
        resultData = await response.json();
      } else {
        throw new Error("Server responded with error status");
      }
    }

    // Remove loading bubble
    const loadingBubble = document.getElementById(loadingId);
    if (loadingBubble) loadingBubble.remove();

    // Render Response Bubble
    const guidance = currentLang === 'hi' ? resultData.guidance_hi : 
                     currentLang === 'mv' ? resultData.guidance_hi : // Fallback to Hindi prompt for Malvi dialect
                     resultData.guidance_en;
    const escalation = currentLang === 'hi' || currentLang === 'mv' ? resultData.escalation_message_hi : resultData.escalation_message_en;
    
    let combinedMessage = `<strong>${resultData.symptom || 'First Aid Steps'}</strong><br><br>${guidance.replace(/\n/g, '<br>')}`;
    if (escalation) {
      combinedMessage += `<br><br><span style="color:var(--severity-critical); font-weight:bold;">🚨 ${escalation}</span>`;
    }
    
    appendMessage(combinedMessage, 'assistant');
    chatHistory.push({ role: 'model', text: combinedMessage });

    // Update UI elements based on API response
    updateSeverityUI(resultData);

    // Speak aloud if critical
    if (resultData.severity === 'CRITICAL') {
      const speechText = escalation ? `${escalation}. ${guidance}` : guidance;
      speakAloud(speechText);
    }

  } catch (error) {
    console.error("Chat error:", error);
    const loadingBubble = document.getElementById(loadingId);
    if (loadingBubble) loadingBubble.remove();
    
    // Graceful error state
    const fallbackData = parseOfflineSymptoms(text);
    const guidance = currentLang === 'hi' || currentLang === 'mv' ? fallbackData.guidance_hi : fallbackData.guidance_en;
    const escalation = currentLang === 'hi' || currentLang === 'mv' ? fallbackData.escalation_message_hi : fallbackData.escalation_message_en;
    
    let combinedMessage = `<strong>${fallbackData.symptom} (Offline Fallback Guidance)</strong><br><br>${guidance.replace(/\n/g, '<br>')}`;
    if (escalation) {
      combinedMessage += `<br><br><span style="color:var(--severity-critical); font-weight:bold;">⚠️ ${escalation}</span>`;
    }
    
    appendMessage(combinedMessage, 'assistant');
    updateSeverityUI(fallbackData);
    
    showToast("AI network connection slow. Loading cached guidelines.", "warning");
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    if (micBtn) micBtn.disabled = false;
  }
}

function appendMessage(text, senderClass) {
  const box = document.getElementById("chat-messages-box");
  if (!box) return null;

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${senderClass}`;
  const id = `msg-${Date.now()}`;
  bubble.id = id;
  bubble.innerHTML = text;
  box.appendChild(bubble);

  // Scroll to bottom
  box.scrollTop = box.scrollHeight;
  return id;
}

// Clear Chat
function clearChat() {
  const box = document.getElementById("chat-messages-box");
  if (box) {
    box.innerHTML = `
      <div class="message-bubble assistant">
        <p id="chat-greeting">${TRANSLATIONS[currentLang]["chat_welcome"]}</p>
      </div>
    `;
  }
  chatHistory = [];
  
  // Reset Severity UI
  const defaultState = { severity: 'LOW', symptom: 'System Ready', myth_id: null };
  updateSeverityUI(defaultState);
  
  if (synth.speaking) {
    synth.cancel();
  }
  
  showToast("Chat cleared", "info");
}

// Offline parser symptoms
function parseOfflineSymptoms(text) {
  const lower = text.toLowerCase();
  if (lower.includes("chest") || lower.includes("heart") || lower.includes("sweat") || lower.includes("breath") || lower.includes("सीने में") || lower.includes("घबराट")) {
    return OFFLINE_PROTOCOLS.chest_pain;
  } else if (lower.includes("snake") || lower.includes("bite") || lower.includes("सांप") || lower.includes("काट")) {
    return OFFLINE_PROTOCOLS.snake_bite;
  } else if (lower.includes("burn") || lower.includes("fire") || lower.includes("जलना") || lower.includes("आग")) {
    return OFFLINE_PROTOCOLS.burns;
  } else if (lower.includes("choke") || lower.includes("choking") || lower.includes("गला") || lower.includes("अटक")) {
    return OFFLINE_PROTOCOLS.choking;
  } else {
    // Default low response
    return {
      severity: "LOW",
      symptom: "General Care guidance",
      guidance_en: "- Sit down and rest in a shaded cool place.\n- Drink clean water or ORS rehydration solution.\n- Monitor body temperature closely.\n- Consult a local doctor if symptoms worsen.",
      guidance_hi: "- छायादार ठंडी जगह पर बैठें और आराम करें।\n- साफ पानी या ओआरएस (ORS) घोल पिएं।\n- शरीर के तापमान पर नजर रखें।\n- यदि लक्षण बिगड़ते हैं, तो डॉक्टर से संपर्क करें।",
      escalation_message_en: "",
      escalation_message_hi: "",
      myth_id: null
    };
  }
}

// Update Chat/Severity UI styling
function updateSeverityUI(data) {
  const banner = document.getElementById("severity-alert-banner");
  const icon = document.getElementById("severity-icon");
  const title = document.getElementById("severity-title");
  const desc = document.getElementById("severity-desc");
  const pill = document.getElementById("active-severity-pill");
  const checklist = document.getElementById("first-aid-steps-list");
  const intro = document.getElementById("first-aid-intro");
  const hospitalBtn = document.getElementById("btn-chat-hospital-shortcut");
  const body = document.body;

  if (!banner || !pill || !checklist) return;

  // Clear previous body states
  body.classList.remove("state-critical", "state-medium");

  // Reset checklist
  checklist.innerHTML = "";
  
  // Set Severity class & Pill
  pill.textContent = data.severity;
  pill.className = `severity-pill ${data.severity.toLowerCase()}`;

  const guidance = currentLang === 'hi' || currentLang === 'mv' ? data.guidance_hi : data.guidance_en;
  const steps = guidance.split("\n");

  if (data.severity === 'CRITICAL') {
    body.classList.add("state-critical");
    banner.className = "alert-banner";
    icon.textContent = "🚨";
    title.textContent = currentLang === 'hi' ? "गंभीर स्थिति — तत्काल ध्यान दें!" : 
                         currentLang === 'mv' ? "भारी धोखो — तुरंत अस्पताल जाओ!" :
                         "CRITICAL SEVERITY — ACTION REQUIRED";
    desc.textContent = currentLang === 'hi' ? "मरीज को तुरंत नजदीकी अस्पताल ले जाएं। नीचे दिए गए प्राथमिक उपचार निर्देशों का पालन करें।" : 
                       currentLang === 'mv' ? "मरीज़ को तुरंत मांगल्या PHC या इंदौर ले जाओ। नीचे लिखे नियमों का पालन करो।" :
                       "Take patient to nearest hospital immediately. Follow the critical checklist below.";
    intro.textContent = currentLang === 'hi' || currentLang === 'mv' ? "एंबुलेंस आने तक इन जीवन रक्षक कदमों का पालन करें:" : "Follow these life-saving steps until medical help arrives:";
    
    // Add steps to list
    steps.forEach(step => {
      if (step.trim()) {
        const li = document.createElement("li");
        li.textContent = step.replace(/^-\s*/, "");
        checklist.appendChild(li);
      }
    });

    if (hospitalBtn) hospitalBtn.style.display = "block";
  } 
  else if (data.severity === 'MEDIUM') {
    body.classList.add("state-medium");
    banner.className = "alert-banner-yellow";
    icon.textContent = "⚠️";
    title.textContent = currentLang === 'hi' ? "मध्यम गंभीरता — निगरानी रखें" : 
                         currentLang === 'mv' ? "मध्यम गंभीरता — ध्यान रखो" :
                         "MEDIUM SEVERITY — MONITOR CLOSELY";
    desc.textContent = currentLang === 'hi' ? "आराम से बैठें और निर्देशों का पालन करें। गंभीर लक्षण दिखने पर डॉक्टर से मिलें।" : 
                       currentLang === 'mv' ? "आराम से बैठो और गोली लो। ज़्यादा तकलीफ होए तो डॉक्टर साहब से मिलो।" :
                       "Settle the patient. Follow first aid guidelines and visit clinic if needed.";
    intro.textContent = currentLang === 'hi' || currentLang === 'mv' ? "प्राथमिक उपचार सूची:" : "Standard care checklist:";
    
    steps.forEach(step => {
      if (step.trim()) {
        const li = document.createElement("li");
        li.textContent = step.replace(/^-\s*/, "");
        checklist.appendChild(li);
      }
    });

    if (hospitalBtn) hospitalBtn.style.display = "block";
  } 
  else {
    banner.className = "alert-banner-green";
    icon.textContent = "✓";
    title.textContent = currentLang === 'hi' ? "सामान्य लक्षण — सुरक्षित" : 
                         currentLang === 'mv' ? "सामान्य लक्षण — सुरक्षित" :
                         "LOW SEVERITY — SAFE STATE";
    desc.textContent = currentLang === 'hi' ? "लक्षण सामान्य हैं। हाइड्रेटेड रहें और आराम करें।" : 
                       currentLang === 'mv' ? "तबियत बराबर है। पाणी पीओ और आराम करो।" :
                       "Symptoms appear normal. Maintain hydration, rest, and observe.";
    intro.textContent = currentLang === 'hi' || currentLang === 'mv' ? "देखभाल निर्देश:" : "Observational guidelines:";
    
    steps.forEach(step => {
      if (step.trim()) {
        const li = document.createElement("li");
        li.textContent = step.replace(/^-\s*/, "");
        checklist.appendChild(li);
      }
    });

    if (hospitalBtn) hospitalBtn.style.display = "none";
  }

  // Surfaced dangerous Traditional myth box link
  const mythBox = document.getElementById("chat-myth-surfaced");
  if (mythBox) {
    if (data.myth_id) {
      mythBox.style.display = "flex";
      mythBox.setAttribute("data-target-myth", data.myth_id);
      
      const mythTitle = document.getElementById("chat-myth-title");
      const mythText = document.getElementById("chat-myth-text");
      if (mythTitle && mythText) {
        if (data.myth_id === 'myth-snake-bite') {
          mythTitle.textContent = currentLang === 'hi' || currentLang === 'mv' ? "खतरनाक भ्रम: जहर चूसना!" : "Dangerous Myth spotted: Sucking Venom!";
          mythText.textContent = currentLang === 'hi' || currentLang === 'mv' ? "सांप काटने पर जहर चूसना जानलेवा है। वैज्ञानिक तथ्यों के लिए यहाँ क्लिक करें।" : "Sucking venom does not work and causes infections. Click here for details.";
        } else if (data.myth_id === 'myth-burn') {
          mythTitle.textContent = currentLang === 'hi' || currentLang === 'mv' ? "खतरनाक भ्रम: तेल या घी लगाना!" : "Dangerous Myth spotted: Applying Oils/Ghee!";
          mythText.textContent = currentLang === 'hi' || currentLang === 'mv' ? "जले पर घी या तेल लगाने से घाव गहरा होता है। सही उपचार देखें।" : "Applying fats traps heat in skin. Click here to read correct cooling actions.";
        } else if (data.myth_id === 'myth-unconscious') {
          mythTitle.textContent = currentLang === 'hi' || currentLang === 'mv' ? "खतरनाक भ्रम: जबरन पानी पिलाना!" : "Dangerous Myth spotted: Feeding Fluids!";
          mythText.textContent = currentLang === 'hi' || currentLang === 'mv' ? "बेहोश व्यक्ति को पानी पिलाने से दम घुट सकता है। यहाँ क्लिक करें।" : "Forcing fluids causes choking in unconscious individuals. Click here.";
        } else if (data.myth_id === 'myth-dung') {
          mythTitle.textContent = currentLang === 'hi' || currentLang === 'mv' ? "खतरनाक भ्रम: गोबर या मिट्टी लगाना!" : "Dangerous Myth spotted: Applying Mud/Dung!";
          mythText.textContent = currentLang === 'hi' || currentLang === 'mv' ? "गोबर लगाने से टिटनेस का घातक संक्रमण हो सकता है। सही गाइड देखें।" : "Cow dung contains tetanus spores. Click here to see wound hygiene rules.";
        }
      }
    } else {
      mythBox.style.display = "none";
    }
  }
}

// Speak aloud via synthesis
function speakAloud(text) {
  if (!synth) return;

  if (synth.speaking) {
    synth.cancel();
  }

  const cleanText = text.replace(/[-*#`_]/g, "").replace(/\n/g, ". ");
  currentSpeechUtterance = new SpeechSynthesisUtterance(cleanText);
  
  currentSpeechUtterance.lang = currentLang === 'en' ? 'en-IN' : 'hi-IN';
  currentSpeechUtterance.rate = 0.95;

  synth.speak(currentSpeechUtterance);
}

// Web Speech mic recognition captures
function toggleVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    showToast("Speech Recognition not supported in this browser. Use Chrome.", "error");
    return;
  }

  const micBtn = document.getElementById("btn-mic-chat");
  const feedback = document.getElementById("voice-recording-feedback");
  const feedbackText = document.getElementById("voice-recording-text");
  
  if (recognition) {
    recognition.stop();
    recognition = null;
    micBtn.classList.remove("listening");
    if (feedback) feedback.style.display = "none";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = currentLang === 'en' ? 'en-IN' : 'hi-IN';

  recognition.onstart = () => {
    micBtn.classList.add("listening");
    if (feedback) {
      feedback.style.display = "flex";
      feedbackText.textContent = currentLang === 'en' ? "Listening... Speak now." : "आवाज रिकॉर्ड हो रही है... बोलें।";
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    showToast(`Voice capture error: ${event.error}`, "error");
    micBtn.classList.remove("listening");
    if (feedback) feedback.style.display = "none";
    recognition = null;
  };

  recognition.onend = () => {
    micBtn.classList.remove("listening");
    if (feedback) feedback.style.display = "none";
    recognition = null;
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById("chat-user-input");
    if (input) {
      input.value = transcript;
      showToast(currentLang === 'en' ? "Transcribed successfully" : "सफलतापूर्वक टाइप किया गया", "success");
      setTimeout(() => {
        sendChatMessage();
      }, 500);
    }
  };

  recognition.start();
}

// Voice Recognition microphone button inside virtual doctor room
let consultRecognition = null;

function toggleConsultVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    showToast("Speech Recognition not supported in this browser. Use Chrome.", "error");
    return;
  }

  const micBtn = document.getElementById("btn-mic-consult");
  
  if (consultRecognition) {
    consultRecognition.stop();
    consultRecognition = null;
    return;
  }

  consultRecognition = new SpeechRecognition();
  consultRecognition.continuous = false;
  consultRecognition.interimResults = false;
  consultRecognition.lang = currentLang === 'en' ? 'en-IN' : 'hi-IN';

  consultRecognition.onstart = () => {
    micBtn.classList.add("listening");
    showToast(currentLang === 'en' ? "Voice capture active... Speak now." : "परामर्श आवाज रिकॉर्ड हो रही है...", "info");
  };

  consultRecognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    showToast(`Voice capture error: ${event.error}`, "error");
    micBtn.classList.remove("listening");
    consultRecognition = null;
  };

  consultRecognition.onend = () => {
    micBtn.classList.remove("listening");
    consultRecognition = null;
  };

  consultRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById("consult-chat-input-field");
    if (input) {
      input.value = transcript;
      showToast(currentLang === 'en' ? "Transcribed successfully" : "सफलतापूर्वक टाइप किया गया", "success");
      setTimeout(() => {
        sendConsultChatMessage();
      }, 500);
    }
  };

  consultRecognition.start();
}

// Hospital Finder sync selectors
function selectHospital(id) {
  selectedHospitalId = id;
  const body = document.body;
  
  const cards = document.querySelectorAll(".hospital-card");
  cards.forEach(card => card.classList.remove("active"));
  
  const activeCard = document.getElementById(`hospital-${id === 'phc' ? 'phc' : 'card' + (id === 'chl' ? '2' : id === 'bombay' ? '3' : id === 'district' ? '4' : '5')}`);
  if (activeCard) {
    activeCard.classList.add("active");
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const routeLines = document.querySelectorAll(".map-route-line");
  routeLines.forEach(line => line.classList.remove("active", "critical"));

  const markers = document.querySelectorAll(".map-marker");
  markers.forEach(marker => marker.classList.remove("active"));

  const marker = document.getElementById(`pin-${id}`);
  if (marker) {
    marker.classList.add("active");
  }

  const route = document.getElementById(`route-${id}`);
  const etaBadge = document.getElementById("route-eta-badge");
  
  if (route) {
    route.classList.add("active");
    if (body.classList.contains("state-critical")) {
      route.classList.add("critical");
    }
  }

  if (etaBadge) {
    const etas = {
      phc: "PHC: 4 mins (1.4 km)",
      chl: "CHL: 18 mins (9.8 km)",
      bombay: "Bombay: 15 mins (8.2 km)",
      district: "District: 25 mins (12.5 km)",
      kokilaben: "Kokilaben: 20 mins (11.2 km)"
    };
    etaBadge.textContent = etas[id];
    etaBadge.className = body.classList.contains("state-critical") ? "severity-pill critical" : "severity-pill low";
  }
}

function makeCall(number) {
  showToast(`Initiating emergency speed-dial call to ${number}...`, "success");
  setTimeout(() => {
    window.location.href = `tel:${number}`;
  }, 1000);
}

// Load Offline static protocol
function loadOfflineProtocol(protoKey) {
  showView('chatbot');
  clearChat();
  
  const proto = OFFLINE_PROTOCOLS[protoKey];
  if (proto) {
    const titles = {
      snake_bite: "Snake bite protocol",
      chest_pain: "Cardiac pain guide",
      choking: "Choking procedure",
      burns: "Thermal burn first aid"
    };
    appendMessage(titles[protoKey], 'user');
    
    const guidance = currentLang === 'hi' || currentLang === 'mv' ? proto.guidance_hi : proto.guidance_en;
    const escalation = currentLang === 'hi' || currentLang === 'mv' ? proto.escalation_message_hi : proto.escalation_message_en;
    
    let combinedMessage = `<strong>${proto.symptom} (Local Cached Protocol)</strong><br><br>${guidance.replace(/\n/g, '<br>')}`;
    if (escalation) {
      combinedMessage += `<br><br><span style="color:var(--severity-critical); font-weight:bold;">🚨 ${escalation}</span>`;
    }
    
    setTimeout(() => {
      appendMessage(combinedMessage, 'assistant');
      updateSeverityUI(proto);
      showToast("Loaded offline pre-cached first-aid protocol.", "success");
    }, 400);
  }
}

// Scroll anchor trigger from Chat to Myths
document.addEventListener("click", (e) => {
  const mythTrigger = e.target.closest("#chat-myth-surfaced");
  if (mythTrigger) {
    const mythId = mythTrigger.getAttribute("data-target-myth");
    if (mythId) {
      showView('myths');
      const card = document.getElementById(mythId);
      if (card) {
        card.style.transform = "scale(1.05)";
        card.style.borderColor = "var(--accent-blue)";
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
          card.style.transform = "";
          card.style.borderColor = "";
        }, 2000);
      }
    }
  }
});

// Telemedicine Consultation Room simulation
let currentDocName = "";
function startConsultation(docName, specialty) {
  currentDocName = docName;
  const overlay = document.getElementById("consultation-room-overlay");
  const docTitle = document.getElementById("consult-doctor-title");
  const docSubtitle = document.getElementById("consult-doctor-subtitle");
  
  if (overlay) {
    overlay.style.display = "flex";
    setTimeout(() => {
      if (docTitle) docTitle.textContent = docName;
      if (docSubtitle) docSubtitle.textContent = `Connected • ${specialty}`;
      showToast(`Telemedicine channel connected with ${docName}`, "success");
    }, 1500);
  }
}

function endConsultation() {
  const overlay = document.getElementById("consultation-room-overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
  const chatMessages = document.getElementById("consult-chat-messages-box");
  if (chatMessages) {
    chatMessages.innerHTML = `
      <div class="message-bubble assistant" style="padding: 0.5rem 0.75rem; font-size: 0.8rem;">
        <p>System: Consultation ended.</p>
      </div>
    `;
  }
  showToast("Consultation session terminated", "info");
}

function handleConsultChatKey(e) {
  if (e.key === 'Enter') {
    sendConsultChatMessage();
  }
}

function sendConsultChatMessage() {
  const input = document.getElementById("consult-chat-input-field");
  const chatBox = document.getElementById("consult-chat-messages-box");
  
  if (!input || !chatBox) return;
  const text = input.value.trim();
  if (!text) return;

  const userBubble = document.createElement("div");
  userBubble.className = "message-bubble user";
  userBubble.style.padding = "0.5rem 0.75rem";
  userBubble.style.fontSize = "0.8rem";
  userBubble.innerHTML = text;
  chatBox.appendChild(userBubble);
  
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Automated doctor simulated responses
  setTimeout(() => {
    const docBubble = document.createElement("div");
    docBubble.className = "message-bubble assistant";
    docBubble.style.padding = "0.5rem 0.75rem";
    docBubble.style.fontSize = "0.8rem";
    
    const doctorReplies = [
      `I understand. Have you clean washed the area? Try to sit in a quiet place.`,
      `Don't worry. Keep breathing slow and deep. I am assessing your symptoms.`,
      `Are you close to the Mangaliya Primary Health Center? If symptoms get severe, please go there immediately.`,
      `I am preparing a digital guidance sheet for you. Keep resting.`
    ];
    const randomReply = doctorReplies[Math.floor(Math.random() * doctorReplies.length)];
    
    docBubble.innerHTML = `<strong>${currentDocName}:</strong> ${randomReply}`;
    chatBox.appendChild(docBubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    showToast(`New message from ${currentDocName}`, "info");
  }, 1500);
}

// Medicine Expiry Checker Safety
function checkMedicineExpiry() {
  const nameInput = document.getElementById("medicine-name-input");
  const dateInput = document.getElementById("medicine-date-input");
  const resultBox = document.getElementById("expiry-result-box");
  const resultDisplay = document.getElementById("expiry-result-display");
  const resultIcon = document.getElementById("expiry-result-icon");
  const resultTitle = document.getElementById("expiry-result-title");
  const resultDesc = document.getElementById("expiry-result-desc");

  if (!dateInput || !resultBox) return;

  const dateValue = dateInput.value;
  if (!dateValue) {
    showToast("Please enter a valid expiration date", "warning");
    return;
  }

  const medName = nameInput.value.trim() || "Medicine";

  const parts = dateValue.split("-");
  const expiryYear = parseInt(parts[0], 10);
  const expiryMonth = parseInt(parts[1], 10);
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const monthsRemaining = (expiryYear - currentYear) * 12 + (expiryMonth - currentMonth);

  resultBox.style.display = "block";

  if (monthsRemaining < 0) {
    resultDisplay.className = "result-display expired";
    resultIcon.textContent = "✕";
    resultTitle.textContent = currentLang === 'hi' ? `${medName}: सेवन असुरक्षित (Expired)` : 
                               currentLang === 'mv' ? `${medName}: सेवन असुरक्षित (Expired)` : 
                               `${medName}: EXPIRED - UNSAFE`;
    resultDesc.textContent = currentLang === 'hi' || currentLang === 'mv'
      ? `यह दवा समाप्त हो चुकी है। कृपया इसका सेवन न करें और इसे सुरक्षित रूप से फेंक दें!` 
      : `Do NOT consume. This medicine has expired and may be toxic or ineffective.`;
    showToast("Safety alert: Medicine has expired!", "error");
  } 
  else if (monthsRemaining === 0 || monthsRemaining === 1) {
    resultDisplay.className = "result-display expiring-soon";
    resultIcon.textContent = "⚠️";
    resultTitle.textContent = currentLang === 'hi' ? `${medName}: जल्द समाप्त होने वाली है` : 
                               currentLang === 'mv' ? `${medName}: जल्द समाप्त होने वाली है` :
                               `${medName}: EXPIRING SOON`;
    resultDesc.textContent = currentLang === 'hi' || currentLang === 'mv'
      ? `यह दवा जल्द समाप्त हो जाएगी। जरूरत पड़ने पर ही उपयोग करें और बदलाव की तैयारी रखें।`
      : `Medicine will expire within 30-45 days. Consume with caution and check efficacy.`;
    showToast("Warning: Expiration date is approaching.", "warning");
  } 
  else {
    resultDisplay.className = "result-display safe";
    resultIcon.textContent = "✓";
    resultTitle.textContent = currentLang === 'hi' ? `${medName}: सेवन के लिए सुरक्षित` : 
                               currentLang === 'mv' ? `${medName}: सेवन के लिए सुरक्षित` :
                               `${medName}: SAFE TO CONSUME`;
    resultDesc.textContent = currentLang === 'hi' || currentLang === 'mv'
      ? `दवा सुरक्षित है। इसकी समाप्ति में ${monthsRemaining} महीने शेष हैं। ठंडी जगह पर रखें।`
      : `Medicine is safe. ${monthsRemaining} months remaining before expiration date.`;
    showToast("Medicine verified: Safe for use.", "success");
  }
}

// Live Camera OCR Scanner Functions
let ocrStream = null;

async function openOcrScanner() {
  const video = document.getElementById("scanner-video");
  const container = document.getElementById("scanner-container");
  const openBtn = document.getElementById("btn-open-scanner");
  const captureBtn = document.getElementById("btn-capture-scanner");
  const closeBtn = document.getElementById("btn-close-scanner");
  
  const cardIcon = document.getElementById("ocr-card-icon");
  const cardTitle = document.getElementById("ocr-card-title");
  const cardDesc = document.getElementById("ocr-card-desc");

  if (!video || !container || !openBtn || !captureBtn || !closeBtn) return;

  try {
    // Request device camera access
    ocrStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    
    video.srcObject = ocrStream;
    
    // UI adjustments
    container.style.display = "block";
    captureBtn.style.display = "block";
    closeBtn.style.display = "block";
    openBtn.style.display = "none";
    
    if (cardIcon) cardIcon.style.display = "none";
    if (cardTitle) cardTitle.style.display = "none";
    if (cardDesc) cardDesc.style.display = "none";
    
    showToast("Camera stream started successfully", "success");
  } catch (err) {
    console.error("Camera access error:", err);
    showToast("Camera blocked or not supported. Falling back to emulator...", "warning");
    triggerOcrMock();
  }
}

function closeOcrScanner() {
  const video = document.getElementById("scanner-video");
  const container = document.getElementById("scanner-container");
  const openBtn = document.getElementById("btn-open-scanner");
  const captureBtn = document.getElementById("btn-capture-scanner");
  const closeBtn = document.getElementById("btn-close-scanner");
  const loadingStatus = document.getElementById("ocr-loading-status");
  
  const cardIcon = document.getElementById("ocr-card-icon");
  const cardTitle = document.getElementById("ocr-card-title");
  const cardDesc = document.getElementById("ocr-card-desc");

  // Stop camera tracks
  if (ocrStream) {
    ocrStream.getTracks().forEach(track => track.stop());
    ocrStream = null;
  }
  
  if (video) video.srcObject = null;

  // UI adjustments
  if (container) container.style.display = "none";
  if (captureBtn) captureBtn.style.display = "none";
  if (closeBtn) closeBtn.style.display = "none";
  if (loadingStatus) loadingStatus.style.display = "none";
  if (openBtn) openBtn.style.display = "block";
  
  if (cardIcon) cardIcon.style.display = "block";
  if (cardTitle) cardTitle.style.display = "block";
  if (cardDesc) cardDesc.style.display = "block";
}

async function captureOcrImage() {
  const video = document.getElementById("scanner-video");
  const canvas = document.getElementById("scanner-canvas");
  const loadingStatus = document.getElementById("ocr-loading-status");
  const loadingText = document.getElementById("ocr-loading-text");
  
  const nameInput = document.getElementById("medicine-name-input");
  const dateInput = document.getElementById("medicine-date-input");

  if (!video || !canvas || !loadingStatus || !loadingText || !nameInput || !dateInput) return;

  // Draw current video frame to canvas
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Show loading indicator
  loadingStatus.style.display = "block";
  loadingText.textContent = currentLang === 'hi' ? "दवा की पट्टी का पाठ पढ़ रहा है..." :
                             currentLang === 'mv' ? "दवा की पट्टी का पाठ पढ़ रहा है..." :
                             "Reading medicine strip text...";

  try {
    // Invoke Tesseract OCR
    const result = await Tesseract.recognize(canvas, 'eng', {
      logger: m => console.log(m)
    });
    
    const text = result.data.text;
    console.log("OCR Extracted Text:", text);

    // Smart regex date parsing
    const parsedDate = parseExpiryDate(text);
    
    if (parsedDate) {
      // Clean extracted medicine name
      const parsedName = parseMedicineName(text);
      
      nameInput.value = parsedName;
      
      // format YYYY-MM
      const formattedMonth = String(parsedDate.month).padStart(2, '0');
      dateInput.value = `${parsedDate.year}-${formattedMonth}`;

      showToast(`OCR Success: Extracted expiry date: ${formattedMonth}/${parsedDate.year}!`, "success");
      
      // Stop scanner stream
      closeOcrScanner();
      
      // Call safety verification check
      checkMedicineExpiry();
    } else {
      loadingStatus.style.display = "none";
      showToast("No expiry date found. Align the EXP date in the dashed box and retry.", "warning");
    }
  } catch (err) {
    console.error("OCR recognition error:", err);
    loadingStatus.style.display = "none";
    showToast("Error processing OCR. Please try again or input manually.", "error");
  }
}

// Smart regex date extraction parser
function parseExpiryDate(text) {
  // Try pattern: EXP: MM/YYYY or EXP MM/YY
  const regex1 = /exp(?:iry)?(?:\.|\s+date)?\s*[:\-\/\.]?\s*(\d{2})[\-\/\.\s]+(\d{2,4})/i;
  const match1 = text.match(regex1);
  if (match1) {
    let month = parseInt(match1[1], 10);
    let yearStr = match1[2];
    let year = parseInt(yearStr, 10);
    if (yearStr.length === 2) {
      year += 2000;
    }
    if (month >= 1 && month <= 12 && year >= 2000 && year <= 2100) {
      return { month, year };
    }
  }

  // Try pattern with month names: EXP JAN 2026 or EXP 05-FEB-25
  const monthsMap = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
  };
  const regex2 = /exp(?:iry)?(?:\.|\s+date)?\s*[:\-\/\.]?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\-\/\.\s]+(\d{2,4})/i;
  const match2 = text.match(regex2);
  if (match2) {
    let monthName = match2[1].toLowerCase();
    let month = monthsMap[monthName];
    let yearStr = match2[2];
    let year = parseInt(yearStr, 10);
    if (yearStr.length === 2) {
      year += 2000;
    }
    if (month && year >= 2000 && year <= 2100) {
      return { month, year };
    }
  }

  // Try matching MM/YYYY without EXP prefix
  const regex3 = /\b(\d{2})[\-\/\.](\d{4})\b/;
  const match3 = text.match(regex3);
  if (match3) {
    let month = parseInt(match3[1], 10);
    let year = parseInt(match3[2], 10);
    if (month >= 1 && month <= 12) {
      return { month, year };
    }
  }

  // Try matching MM/YY general
  const regex4 = /\b(\d{2})[\-\/\.](\d{2})\b/;
  const match4 = text.match(regex4);
  if (match4) {
    let month = parseInt(match4[1], 10);
    let year = parseInt(match4[2], 10) + 2000;
    if (month >= 1 && month <= 12) {
      return { month, year };
    }
  }

  return null;
}

// Cleans up OCR strings to get a smart medicine name
function parseMedicineName(text) {
  const lines = text.split("\n");
  for (let line of lines) {
    let clean = line.trim();
    if (clean.length > 3 && 
        !/exp|mfg|batch|b\.?\s*no|m\.?r\.?p|rs|tax|lic|mg|ml|\d/i.test(clean)) {
      let name = clean.replace(/[^a-zA-Z\s]/g, "").trim();
      if (name.length > 3) {
        return name;
      }
    }
  }
  return "Scanned Medicine";
}

function triggerOcrMock() {
  const nameInput = document.getElementById("medicine-name-input");
  const dateInput = document.getElementById("medicine-date-input");
  
  if (nameInput) nameInput.value = "Amoxicillin 250mg Strip";
  if (dateInput) dateInput.value = "2025-11";
  
  showToast("Mock OCR Scan: Extracted Exp: 11/2025!", "success");
  checkMedicineExpiry();
}

// Doctor Dashboard Console logic
function acceptPatientRequest(patientId, name) {
  const item = document.getElementById(`queue-item-${patientId}`);
  const counter = document.getElementById("doc-pending-requests-count");

  if (item) {
    item.style.transform = "scale(0.9)";
    item.style.opacity = "0";
    setTimeout(() => {
      item.remove();
      
      if (counter) {
        let count = parseInt(counter.textContent, 10);
        if (count > 0) {
          count--;
          counter.textContent = String(count).padStart(2, '0');
        }
      }
      showToast(`Accepted consultation request from ${name}`, "success");
    }, 400);
  }
}

function submitDoctorPrescription() {
  const medInput = document.getElementById("doc-presc-med-name");
  const freqSelect = document.getElementById("doc-presc-frequency");
  const listContainer = document.getElementById("doc-patient-record-folder");

  if (!medInput || !freqSelect || !listContainer) return;

  const medName = medInput.value.trim();
  const freq = freqSelect.options[freqSelect.selectedIndex].text;

  if (!medName) {
    showToast("Please enter a medicine name to prescribe", "warning");
    return;
  }

  // Create visual prescription log line
  const prescLine = document.createElement("div");
  prescLine.className = "profile-list-item";
  prescLine.style.borderBottom = "1px solid rgba(255,255,255,0.04)";
  prescLine.style.padding = "0.4rem 0";
  prescLine.style.fontSize = "0.75rem";
  prescLine.innerHTML = `
    <div class="profile-list-item-left">
      <span class="icon">💊</span>
      <p style="color:white; font-weight:bold;">${medName}</p>
    </div>
    <div class="profile-list-item-right" style="color:var(--severity-low); font-weight:bold;">${freq}</div>
  `;

  listContainer.appendChild(prescLine);
  
  // Reset
  medInput.value = "";
  showToast(`Prescribed ${medName} to Mr. James Carter successfully`, "success");
}

// Toast Alert Notification System
function showToast(message, type = "info") {
  const container = document.getElementById("toast-notification-box");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "warning") icon = "⚠️";
  if (type === "error") icon = "🚨";

  toast.innerHTML = `
    <span>${icon}</span>
    <span style="font-size:0.75rem; font-weight:500; color:white;">${message}</span>
    <button class="toast-close-btn" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.5s ease";
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// Emergency Contact Speed Dial Manager
function renderContactsUI() {
  const container = document.getElementById("profile-contacts-list");
  if (!container || !currentUser) return;

  // Safeguard: initialize default contacts if not present
  if (!currentUser.contacts) {
    currentUser.contacts = [
      { id: 'c1', name: 'Sarah James', relation: 'Daughter', phone: '+91 9988776655', type: 'family', icon: '👧', desc: 'Primary Contact • Lives in Indore' },
      { id: 'c2', name: 'Dr. Amit Verma', relation: 'Family Doctor', phone: '+91 731 4774444', type: 'doctor', icon: '👨‍⚕️', desc: 'Family General Doctor' }
    ];
  }

  container.innerHTML = "";

  currentUser.contacts.forEach(c => {
    const item = document.createElement("div");
    item.className = "profile-list-item";
    
    // Choose icon based on type/relation if not set
    let icon = c.icon || (c.type === 'doctor' ? '👨‍⚕️' : '👧');
    if (c.type === 'family') {
      const rel = c.relation.toLowerCase();
      if (rel.includes('wife')) icon = '👩';
      else if (rel.includes('daughter') || rel.includes('girl')) icon = '👧';
      else if (rel.includes('son') || rel.includes('boy')) icon = '👦';
      else if (rel.includes('husband') || rel.includes('man')) icon = '👨';
      else if (rel.includes('mother') || rel.includes('mom')) icon = '👵';
      else if (rel.includes('father') || rel.includes('dad')) icon = '👴';
    }
    
    item.innerHTML = `
      <div class="profile-list-item-left">
        <span class="icon">${icon}</span>
        <div>
          <p style="font-size:0.8rem; font-weight:bold; color:white;">${c.name} (${c.relation})</p>
          <p style="font-size:0.65rem; color:var(--text-secondary);">${c.phone} • ${c.desc || ''}</p>
        </div>
      </div>
      <div style="display:flex; gap:0.4rem; align-items:center;">
        <button class="btn-circle-call" style="background:rgba(255,255,255,0.08); color:white;" onclick="editContactEntry('${c.id}')" title="Edit Contact">✏️</button>
        <button class="btn-circle-call" onclick="makeCall('${c.phone}')" title="Call">📞</button>
      </div>
    `;
    container.appendChild(item);
  });
}

function openManageContacts(isNew = true) {
  const drawer = document.getElementById("manage-contacts-drawer");
  const title = document.getElementById("contact-drawer-title");
  const deleteBtn = document.getElementById("btn-delete-contact");
  
  if (!drawer) return;

  drawer.style.display = "block";
  drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (isNew) {
    if (title) title.textContent = currentLang === 'hi' ? "नया संपर्क जोड़ें" : "Add Speed Dial Contact";
    if (deleteBtn) deleteBtn.style.display = "none";
    
    // Clear form inputs
    document.getElementById("edit-contact-id").value = "";
    document.getElementById("edit-contact-type").value = "family";
    document.getElementById("edit-contact-name").value = "";
    document.getElementById("edit-contact-relation").value = "";
    document.getElementById("edit-contact-phone").value = "";
    document.getElementById("edit-contact-desc").value = "";
    
    onContactTypeChange();
  } else {
    if (title) title.textContent = currentLang === 'hi' ? "संपर्क संपादित करें" : "Edit Speed Dial Contact";
    if (deleteBtn) deleteBtn.style.display = "block";
  }
}

function closeManageContacts() {
  const drawer = document.getElementById("manage-contacts-drawer");
  if (drawer) drawer.style.display = "none";
}

function editContactEntry(id) {
  if (!currentUser || !currentUser.contacts) return;
  const c = currentUser.contacts.find(item => item.id === id);
  if (!c) return;

  document.getElementById("edit-contact-id").value = c.id;
  document.getElementById("edit-contact-type").value = c.type;
  document.getElementById("edit-contact-name").value = c.name;
  document.getElementById("edit-contact-relation").value = c.relation;
  document.getElementById("edit-contact-phone").value = c.phone;
  document.getElementById("edit-contact-desc").value = c.desc || "";

  onContactTypeChange();
  openManageContacts(false);
}

function saveContact() {
  if (!currentUser) return;
  
  const idInput = document.getElementById("edit-contact-id");
  const typeInput = document.getElementById("edit-contact-type");
  const nameInput = document.getElementById("edit-contact-name");
  const relationInput = document.getElementById("edit-contact-relation");
  const phoneInput = document.getElementById("edit-contact-phone");
  const descInput = document.getElementById("edit-contact-desc");

  if (!nameInput || !relationInput || !phoneInput || !descInput) return;

  const id = idInput.value;
  const type = typeInput.value;
  const name = nameInput.value.trim();
  const relation = relationInput.value.trim();
  const phone = phoneInput.value.trim();
  const desc = descInput.value.trim();

  if (!name) {
    showToast("Please enter a name", "warning");
    return;
  }
  if (!relation) {
    showToast("Please specify a relation or role", "warning");
    return;
  }
  if (!phone) {
    showToast("Please enter a phone number", "warning");
    return;
  }

  // Find dynamic icon based on gendered keywords
  let icon = type === 'doctor' ? '👨‍⚕️' : '👧';
  const relLower = relation.toLowerCase();
  if (type === 'family') {
    if (relLower.includes('wife')) icon = '👩';
    else if (relLower.includes('daughter') || relLower.includes('girl')) icon = '👧';
    else if (relLower.includes('son') || relLower.includes('boy')) icon = '👦';
    else if (relLower.includes('husband') || relLower.includes('man')) icon = '👨';
    else if (relLower.includes('mother') || relLower.includes('mom')) icon = '👵';
    else if (relLower.includes('father') || relLower.includes('dad')) icon = '👴';
  }

  if (!currentUser.contacts) currentUser.contacts = [];

  if (id) {
    // Edit existing contact
    const index = currentUser.contacts.findIndex(c => c.id === id);
    if (index !== -1) {
      currentUser.contacts[index] = { id, name, relation, phone, type, icon, desc };
      showToast("Contact updated successfully", "success");
    }
  } else {
    // Add new contact
    const newId = 'c-' + Date.now();
    currentUser.contacts.push({ id: newId, name, relation, phone, type, icon, desc });
    showToast("New speed-dial contact added", "success");
  }

  saveCurrentUserProfile();
  renderContactsUI();
  closeManageContacts();
}

function deleteContact() {
  if (!currentUser || !currentUser.contacts) return;
  
  const id = document.getElementById("edit-contact-id").value;
  if (!id) return;

  currentUser.contacts = currentUser.contacts.filter(c => c.id !== id);
  
  saveCurrentUserProfile();
  renderContactsUI();
  closeManageContacts();
  showToast("Contact deleted from speed-dial list", "success");
}

function saveCurrentUserProfile() {
  if (!currentUser) return;
  const users = UserDB.getUsers();
  const index = users.findIndex(u => u.id === currentUser.id);
  if (index !== -1) {
    users[index] = currentUser;
    UserDB.saveUsers(users);
  }
}

function onContactTypeChange() {
  const type = document.getElementById("edit-contact-type").value;
  const relLabel = document.getElementById("lbl-contact-relation");
  const relInput = document.getElementById("edit-contact-relation");
  
  if (!relLabel || !relInput) return;

  if (type === 'doctor') {
    relLabel.textContent = "Specialty / Specialty Role";
    relInput.placeholder = "e.g. Family Doctor, Cardiologist, Pediatrician";
  } else {
    relLabel.textContent = "Relation (Family)";
    relInput.placeholder = "e.g. Wife, Daughter, Son, Husband";
  }
}

// Medical Report Uploading & Explorer List UI
function renderReportsUI() {
  const container = document.getElementById("profile-reports-list");
  if (!container || !currentUser) return;

  // Safeguard: initialize default reports if not present
  if (!currentUser.reports) {
    currentUser.reports = [
      { id: 'r1', name: 'Annual Blood Panel_2025.pdf', date: 'Oct 12, 2025', size: '2.4 MB', dataUrl: null },
      { id: 'r2', name: 'ECG_Report_Jan2026.pdf', date: 'Jan 05, 2026', size: '1.1 MB', dataUrl: null }
    ];
  }

  container.innerHTML = "";

  if (currentUser.reports.length === 0) {
    container.innerHTML = `
      <p style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:1rem;">
        No medical reports uploaded yet.
      </p>
    `;
    return;
  }

  currentUser.reports.forEach(r => {
    const item = document.createElement("div");
    item.className = "profile-list-item";
    item.style.cursor = "pointer";
    item.onclick = () => openReportFile(r.id);
    
    item.innerHTML = `
      <div class="profile-list-item-left">
        <span class="icon">📄</span>
        <div>
          <p style="font-size:0.75rem; font-weight:600; color:white;">${r.name}</p>
          <p style="font-size:0.65rem; color:var(--text-secondary);">${r.date} • ${r.size}</p>
        </div>
      </div>
      <div style="display:flex; gap:0.4rem; align-items:center;">
        <button class="btn-circle-call" style="background:rgba(255,255,255,0.08); color:white;" onclick="event.stopPropagation(); deleteReportEntry('${r.id}')" title="Delete Report">✕</button>
        <span style="font-size:0.85rem; cursor:pointer; color:var(--accent-blue);" title="View File">📥</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function handleReportUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const name = file.name;
  const sizeBytes = file.size;
  const size = (sizeBytes / (1024 * 1024)).toFixed(2) + " MB";
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  // Safeguard against localStorage size limitations (5MB limit)
  // If file > 1MB, store it as a simulated report to prevent QuotaExceededError
  if (sizeBytes > 1024 * 1024) {
    const newReport = {
      id: 'rep-' + Date.now(),
      name: name,
      date: date,
      size: size,
      dataUrl: null // simulated placeholder
    };
    
    if (!currentUser.reports) currentUser.reports = [];
    currentUser.reports.push(newReport);
    saveCurrentUserProfile();
    renderReportsUI();
    showToast(`Large file ${name} uploaded (Simulated offline caching)`, "success");
    return;
  }

  showToast("Reading medical document...", "info");

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const newReport = {
      id: 'rep-' + Date.now(),
      name: name,
      date: date,
      size: size,
      dataUrl: dataUrl
    };
    
    if (!currentUser.reports) currentUser.reports = [];
    currentUser.reports.push(newReport);
    saveCurrentUserProfile();
    renderReportsUI();
    showToast(`${name} uploaded and encrypted successfully!`, "success");
  };
  
  reader.onerror = function(err) {
    console.error("File upload error:", err);
    showToast("Error reading file. Please try again.", "error");
  };

  reader.readAsDataURL(file);
}

function openReportFile(id) {
  if (!currentUser || !currentUser.reports) return;
  const r = currentUser.reports.find(item => item.id === id);
  if (!r) return;

  if (r.dataUrl) {
    // Open in a new tab for seamless browser-native document rendering
    try {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.title = r.name;
        // Draw frame to show base64 document or image
        if (r.dataUrl.startsWith("data:image/")) {
          newWindow.document.write(`
            <div style="background:#0F172A; min-height:100vh; display:flex; align-items:center; justify-content:center; margin:0;">
              <img src="${r.dataUrl}" style="max-width:100%; max-height:95vh; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            </div>
          `);
        } else {
          newWindow.document.write(`
            <iframe src="${r.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>
          `);
        }
        newWindow.document.close();
        showToast(`Opening report document: ${r.name}`, "success");
      } else {
        showToast("Popup blocked! Allow popups to view files.", "warning");
      }
    } catch(e) {
      console.error(e);
      showToast("Browser block prevented view. Triggering mock download...", "info");
    }
  } else {
    // Mock default file downloads
    showToast(`Downloading preloaded medical file: ${r.name}`, "success");
  }
}

function deleteReportEntry(id) {
  if (!currentUser || !currentUser.reports) return;
  
  currentUser.reports = currentUser.reports.filter(r => r.id !== id);
  saveCurrentUserProfile();
  renderReportsUI();
  showToast("Medical file deleted successfully", "success");
}

// Emergency Ambulance Speed Dial Call Trigger (108)
function callAmbulance() {
  showToast("🚨 Initiating critical speed-dial to Ambulance (108)...", "error");
  speakAloud("Initiating emergency speed dial call to ambulance. Please stay completely calm.");
  setTimeout(() => {
    window.location.href = "tel:108";
  }, 1200);
}
