import http.server
import socketserver
import json
import os
import sys
import urllib.request
import urllib.error

# Port configuration
DEFAULT_PORT = 8000

# Fallback/mock database for offline or missing API key
MOCK_RESPONSES = {
    "chest pain": {
        "severity": "CRITICAL",
        "symptom": "Suspected Cardiac Arrest / Heart Attack",
        "guidance_en": "- Help the person sit down and remain calm.\n- Loosen any tight clothing.\n- If responsive and can swallow, give one adult aspirin (325mg) to chew.\n- Do not leave them alone. Be ready to perform CPR compressions if they collapse.",
        "guidance_hi": "- व्यक्ति को आराम से बिठाएं और शांत रखें।\n- तंग कपड़ों (कॉलर, शर्ट) को ढीला करें।\n- यदि वे होश में हैं, तो एक एस्पिरिन (325mg) चबाने के लिए दें।\n- उन्हें अकेला न छोड़ें और सांसों पर नजर रखें; बेहोश होने पर सीपीआर शुरू करें।",
        "escalation_message_en": "Critical Emergency! Proceed to CHL Hospital or Bombay Hospital Indore immediately.",
        "escalation_message_hi": "आपातकालीन स्थिति! तुरंत बॉम्बे हॉस्पिटल या सीएचएल हॉस्पिटल इंदौर ले जाएं।",
        "myth_id": "myth-unconscious"
    },
    "snake bite": {
        "severity": "CRITICAL",
        "symptom": "Snake Bite",
        "guidance_en": "- Keep the victim completely still; movement spreads the venom.\n- Immobilize the bitten limb (splint or bandage) and keep below heart level.\n- Gently clean the wound with clean water.\n- DO NOT cut, suck, apply ice, or use tight tourniquets.",
        "guidance_hi": "- पीड़ित को शांत और बिल्कुल स्थिर रखें; हलचल से जहर तेजी से फैलता है।\n- काटे गए अंग को स्थिर रखें (खपच्ची या पट्टी से) और दिल के स्तर से नीचे रखें।\n- घाव को साफ पानी से धीरे से धोएं।\n- चीरा न लगाएं, जहर न चूसें, बर्फ न लगाएं, और कसकर पट्टी न बांधें।",
        "escalation_message_en": "Critical Emergency! Take the victim to Mangaliya PHC immediately for Anti-Venom treatment.",
        "escalation_message_hi": "आपातकालीन स्थिति! एंटी-वेनम के लिए मरीज को तुरंत मांगल्या PHC (निकटतम केंद्र) ले जाएं।",
        "myth_id": "myth-snake-bite"
    },
    "burn": {
        "severity": "MEDIUM",
        "symptom": "Thermal Skin Burn",
        "guidance_en": "- Pour cool running water over the burn for 10 to 20 minutes to cool skin layers.\n- Remove jewelry or tight items from the burned area before it swells.\n- Cover loosely with clean plastic wrap or a sterile non-stick bandage.\n- DO NOT apply ice, butter, ghee, mustard oil, or toothpaste to the burn.",
        "guidance_hi": "- जले हुए हिस्से पर 10 से 20 मिनट तक ठंडा साफ बहता पानी डालें।\n- सूजन आने से पहले गहने या तंग सामान हटा दें।\n- साफ प्लास्टिक रैप या गैर-चिपकने वाली पट्टी से ढीला ढकें।\n- जले पर बर्फ, मक्खन, घी, सरसों का तेल या टूथपेस्ट न लगाएं।",
        "escalation_message_en": "Consult a clinic if the burn is larger than 3 inches, is on face/hands, or blisters form.",
        "escalation_message_hi": "यदि जला हुआ हिस्सा 3 इंच से बड़ा है, चेहरे या हाथों पर है, या छाले पड़ गए हैं, तो तुरंत डॉक्टर से परामर्श करें।",
        "myth_id": "myth-burn"
    },
    "choking": {
        "severity": "CRITICAL",
        "symptom": "Choking Winding Block",
        "guidance_en": "- Adult/Child: 5 sharp back blows between shoulder blades. If blocked, 5 abdominal Heimlich thrusts.\n- Infant: Position face-down along forearm (head lower). Give 5 back blows, then turn face-up, give 5 chest thrusts (1.5 inches deep).\n- Unresponsive: Place flat, start CPR (compressions first). Open mouth, check for object; NEVER do blind sweeps.",
        "guidance_hi": "- वयस्क/बच्चा: पीठ पर 5 बार थपथपाएं। अवरोध होने पर पेट को 5 बार दबाएं (Heimlich Maneuver)।\n- शिशु: अग्रबाहु पर चेहरा नीचे कर सिर नीचे की तरफ रखें, पीठ पर 5 बार थपथपाएं। फिर सीधा कर 5 बार छाती दबाएं (1.5 इंच)।\n- बेहोश: सीधे सुलाएं, सीपीआर (CPR) दें। मुंह खोलकर अवरोध देखें, मुंह में अंधाधुंध हाथ न डालें।",
        "escalation_message_en": "Immediate Danger! Call emergency responders immediately. If the person faints, perform CPR.",
        "escalation_message_hi": "गंभीर खतरा! तुरंत आपातकालीन सहायता बुलाएं। यदि वे बेहोश हो जाते हैं, तो सीपीआर (CPR) शुरू करें।",
        "myth_id": "myth-unconscious"
    },
    "unconsciousness": {
        "severity": "CRITICAL",
        "symptom": "Unconsciousness / Fainting",
        "guidance_en": "- Check responsiveness and breathing. If not breathing, start CPR immediately.\n- If breathing, gently roll them onto their side into the recovery position to keep airway open.\n- Keep them comfortable (not too cold or overheated) and monitor breathing.\n- DO NOT force-feed any water, onion juice, or hot tea.",
        "guidance_hi": "- सांसों और होश की जांच करें। यदि सांस न चल रही हो, तो तुरंत सीपीआर (CPR) शुरू करें।\n- यदि सांस चल रही हो, तो सांस की नली खुली रखने के लिए उन्हें धीरे से करवट दिलाकर रिकवरी पोजीशन में लाएं।\n- उन्हें आरामदायक स्थिति में रखें और सांसों पर नजर रखें। मुंह में जबरन पानी या चाय न डालें।",
        "escalation_message_en": "Seek emergency medical help immediately. Do not leave the person unattended.",
        "escalation_message_hi": "आपातकालीन स्थिति! तुरंत आपातकालीन सहायता बुलाएं और मरीज के पास बने रहें।",
        "myth_id": "myth-unconscious"
    },
    "fever": {
        "severity": "LOW",
        "symptom": "Fever",
        "guidance_en": "- Keep the room comfortable and dress in light, breathable clothing.\n- Stay hydrated by drinking plenty of water, ORS, or clean fluids.\n- Take paracetamol for body aches and high temperature, if safe.\n- Use a damp cloth on the forehead for sponge cooling.",
        "guidance_hi": "- कमरे को आरामदायक रखें और हल्के कपड़े पहनें।\n- पानी, ओआरएस या साफ तरल पदार्थ पीकर हाइड्रेटेड रहें।\n- शरीर दर्द और तेज बुखार के लिए सुरक्षित होने पर पैरासिटामोल लें।\n- स्पंजिंग के लिए माथे पर ठंडे पानी की पट्टी का उपयोग करें।",
        "escalation_message_en": "Consult a doctor if fever exceeds 103 F (39.4 C) or lasts more than 3 days.",
        "escalation_message_hi": "यदि बुखार 103 F (39.4 C) से अधिक हो जाए या 3 दिनों से अधिक रहे, तो डॉक्टर से परामर्श करें।",
        "myth_id": None
    }
}

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


def query_gemini_api(user_message, lang="en"):
    if not GEMINI_API_KEY:
        print("[INFO] GEMINI_API_KEY not set. Using local mock responses.")
        return get_mock_response(user_message)

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY
    )

    # Detailed system prompt supporting regional Devanagari script for Indore/Malvi
    system_instruction = (
        "You are GramCare AI, a sympathetic, highly direct emergency health assistant "
        "for low-resource, rural areas in Indore, India. "
        "You accept symptom reports in English, Hindi, or local Devanagari Malvi dialect. "
        "Analyze user-reported symptoms and return ONLY a valid JSON object. "
        "Schema: {\"severity\": \"CRITICAL|MEDIUM|LOW\", \"symptom\": \"string\", "
        "\"guidance_en\": \"clinical bullet steps in English\", \"guidance_hi\": \"clinical bullet steps in Hindi/Malvi Devanagari\", "
        "\"escalation_message_en\": \"string or empty\", \"escalation_message_hi\": \"string or empty\", "
        "\"myth_id\": \"myth-snake-bite|myth-burn|myth-unconscious|myth-dung or null\"}. "
        "Ensure all guidance precisely aligns with the WHO and Red Cross guidelines: "
        "- For snake bites: keep victim still, immobilize limb below heart level, do not cut/suck, go to nearest PHC for anti-venom.\n"
        "- For heart attack: sit comfortably, loosen clothes, give paracetamol/aspirin if safe, start CPR if collapse.\n"
        "- For child choking: Heimlich abdominal thrusts and sharp back blows. For infants: support head lower face-down on forearm, 5 back blows, then turn face-up and 5 chest thrusts.\n"
        "- For burns: cool water 10-20 mins, do not use toothpaste/oil/butter, cover loosely.\n"
        "- For fainting: place in recovery position on their side, check breathing, do not pour liquids in mouth.\n"
        "Do NOT wrap in markdown code blocks. Return raw JSON text only."
    )

    payload = json.dumps({
        "contents": [{"parts": [{"text": "User Symptom: " + user_message}]}],
        "systemInstruction": {"parts": [{"text": system_instruction}]},
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.2}
    }).encode("utf-8")

    try:
        req = urllib.request.Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            res_json = json.loads(resp.read().decode("utf-8"))
            text_response = res_json["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text_response.strip())
    except Exception as e:
        print(f"[API ERROR] Gemini request failed: {e}")
        return get_mock_response(user_message)


def get_mock_response(user_message):
    msg = user_message.lower()
    if any(k in msg for k in ["chest", "heart", "sweat", "breath", "cardiac", "dard", "darr", "सीने में", "घबराट"]):
        return MOCK_RESPONSES["chest pain"]
    elif any(k in msg for k in ["snake", "bite", "saanp", "kaata", "सांप", "काट"]):
        return MOCK_RESPONSES["snake bite"]
    elif any(k in msg for k in ["burn", "fire", "hot", "jal", "aag", "जलना"]):
        return MOCK_RESPONSES["burn"]
    elif any(k in msg for k in ["choke", "choking", "gala", "atak", "गला"]):
        return MOCK_RESPONSES["choking"]
    elif any(k in msg for k in ["unconscious", "faint", "pass out", "behos", "बेहोश", "गश"]):
        return MOCK_RESPONSES["unconsciousness"]
    elif any(k in msg for k in ["fever", "temperature", "bukhar", "बुखार"]):
        return MOCK_RESPONSES["fever"]
    else:
        return {
            "severity": "LOW",
            "symptom": "General Query",
            "guidance_en": (
                "- Rest and stay in a comfortable environment.\n"
                "- Keep hydrated by drinking plenty of clean water, ORS, or light fluids.\n"
                "- Track symptoms and check temperature closely if possible.\n"
                "- Visit the nearest primary health center if symptoms do not improve."
            ),
            "guidance_hi": (
                "- आराम करें और आरामदायक ठंडे वातावरण में विश्राम करें।\n"
                "- पानी, ओआरएस (ORS) या साफ तरल पदार्थ पीकर हाइड्रेटेड रहें।\n"
                "- लक्षणों पर नजर रखें और शरीर का तापमान मापते रहें।\n"
                "- यदि लक्षणों में सुधार नहीं होता है, तो निकटतम सरकारी स्वास्थ्य केंद्र पर जाएं।"
            ),
            "escalation_message_en": "",
            "escalation_message_hi": "",
            "myth_id": None
        }


class GramCareRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path == "/api/chat":
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode("utf-8"))
                user_message = data.get("message", "")
                lang = data.get("lang", "en")

                result = query_gemini_api(user_message, lang)

                response_bytes = json.dumps(result).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(response_bytes)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(response_bytes)
            except Exception as e:
                print(f"[HANDLER ERROR] {e}")
                err = json.dumps({"error": str(e)}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(err)
        else:
            self.send_response(404)
            self.end_headers()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress verbose access logs
        pass


def run_server(port=DEFAULT_PORT):
    socketserver.TCPServer.allow_reuse_address = True
    handler = GramCareRequestHandler

    for attempt_port in range(port, port + 10):
        try:
            with socketserver.TCPServer(("", attempt_port), handler) as httpd:
                print("==================================================")
                print(" GramCare AI (MediNova) Server started!")
                print(f" Open this URL in your browser:")
                print(f"   http://localhost:{attempt_port}")
                print(" Press Ctrl+C to stop.")
                print("==================================================")
                httpd.serve_forever()
                break
        except OSError as e:
            if e.errno in (98, 10048):
                print(f"[PORT BUSY] Port {attempt_port} in use. Trying {attempt_port + 1}...")
            else:
                raise
        except KeyboardInterrupt:
            print("\nGramCare AI Server stopped.")
            sys.exit(0)


if __name__ == "__main__":
    run_server()
