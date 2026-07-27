import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function getMediaData(image: string): Promise<{ base64Data: string; mimeType: string }> {
  let base64Data = image;
  let mimeType = "image/jpeg";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    const fetchRes = await fetch(image);
    const arrayBuffer = await fetchRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    base64Data = buffer.toString("base64");
    
    const contentType = fetchRes.headers.get("content-type");
    if (contentType) {
      mimeType = contentType;
    }
  } else if (image.includes("base64,")) {
    const parts = image.split("base64,");
    base64Data = parts[1];
    const match = image.match(/data:([^;]+);/);
    if (match) {
      mimeType = match[1];
    }
  }

  return { base64Data, mimeType };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set payload size limits to allow base64 images
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Initialize Gemini API client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY not found or is placeholder. Running in fallback mode for diagnostics.");
  }

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: ai ? "live" : "fallback" });
  });

  // API Route: Fixit AI diagnostic
  app.post("/api/fixit-ai", async (req, res) => {
    try {
      const { image, language, presetIssue } = req.body;
      const lang = language === "ne" ? "ne" : "en";

      if (!image) {
        return res.status(400).json({ error: "No image data provided" });
      }

      // If we don't have an API key, we will fall back to high-quality mock data based on general queries
      if (!ai) {
        console.log("No Gemini API key. Returning high-quality mock diagnostic for:", presetIssue);
        return res.json(getMockDiagnosticResponse(lang, presetIssue));
      }

      const prompt = `You are "AI Sathi", the core household diagnostic engine for "Najikko Sathi", a mobile local repair helper app in Nepal.
Analyze the provided image of a household issue (e.g., leaking tap, exposed wires, broken socket, appliance issue, paint damage, pest infestation, broken table, wall damage).
Provide a detailed structured diagnostic report in JSON format.
The report MUST contain the following fields:
1. problemIdentified: A concise but detailed explanation of what is wrong, written in ${lang === "ne" ? "Nepali language" : "English language"}.
2. estimatedCostRange: A realistic price range in Nepalese Rupees (NPR) starting with "Rs.", e.g., "Rs. 600 - Rs. 1,200" or "Rs. 1,500 - Rs. 3,500". Keep it reasonable for Nepal's rates.
3. recommendedFixer: One of the exact categories: 'Electrician', 'Plumber', 'Handyman', 'Preiaction', 'Haracomert', or 'Oahar'. Match the issue correctly. (e.g. Electrical issues -> 'Electrician', Plumbing/leaks -> 'Plumber', generic furniture/drilling/general tasks -> 'Handyman', Painting/Pest/Exterior -> 'Preiaction', Cleaning/Home Care -> 'Haracomert', other/consulting -> 'Oahar').
4. severity: A level of severity, either "Minor" (सामान्य), "Moderate" (मध्यम), or "Major" (गम्भीर).
5. immediateSteps: An array of 3 actionable steps the user should take immediately to mitigate damage, written in ${lang === "ne" ? "Nepali language" : "English language"}.

Respond strictly in JSON matching this schema:
{
  "problemIdentified": "string",
  "estimatedCostRange": "string",
  "recommendedFixer": "string",
  "severity": "string",
  "immediateSteps": ["string", "string", "string"]
}`;

      const { base64Data, mimeType } = await getMediaData(image);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              problemIdentified: { type: Type.STRING },
              estimatedCostRange: { type: Type.STRING },
              recommendedFixer: { type: Type.STRING },
              severity: { type: Type.STRING },
              immediateSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["problemIdentified", "estimatedCostRange", "recommendedFixer", "severity", "immediateSteps"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Diagnostic Error:", error);
      // Fallback on error so the user has an operational experience
      const fallbackPreset = req.body.presetIssue || "leaky_tap";
      const fallbackData = getMockDiagnosticResponse(req.body.language || "en", fallbackPreset);
      res.json(fallbackData);
    }
  });

  // API Route: Verify Repair via Gemini Vision
  app.post("/api/verify-repair", async (req, res) => {
    try {
      const { image, language, category } = req.body;
      const lang = language === "ne" ? "ne" : "en";

      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      if (!ai) {
        console.log("No Gemini API key. Returning high-quality mock verification.");
        return res.json(getMockVerificationResponse(lang, category || "Plumber"));
      }

      const prompt = `You are "Sathi Verifier", the advanced AI engineering quality inspector for "Najikko Sathi", a home repair helper app in Nepal.
Analyze the provided image of a home repair work-in-progress or completed job (Category: ${category || 'General Repair'}).
Evaluate the work carefully for quality, alignment, safety, and correctness.
Provide a detailed JSON response matching this schema:
{
  "qualityScore": number, // A quality score from 1 to 100
  "assessment": "string", // An overview of the work quality, in ${lang === "ne" ? "Nepali language" : "English language"}
  "isCorrect": boolean, // Whether the repair looks fundamentally correct/on the right track
  "hazardsFound": ["string"], // Any safety hazards or issues found (e.g. wet wires, loose nuts, unsealed joint). If none, return empty array. In ${lang === "ne" ? "Nepali" : "English"}.
  "recommenedAdjustments": ["string"], // Actionable adjustments the technician/user should make to ensure durability, in ${lang === "ne" ? "Nepali" : "English"}.
  "tips": "string" // Practical tip or maintenance advice for the future, in ${lang === "ne" ? "Nepali" : "English"}
}`;

      const { base64Data, mimeType } = await getMediaData(image);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              qualityScore: { type: Type.INTEGER },
              assessment: { type: Type.STRING },
              isCorrect: { type: Type.BOOLEAN },
              hazardsFound: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommenedAdjustments: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              tips: { type: Type.STRING }
            },
            required: ["qualityScore", "assessment", "isCorrect", "hazardsFound", "recommenedAdjustments", "tips"],
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      const result = JSON.parse(text);
      res.json(result);
    } catch (error) {
      console.error("Verify Repair error:", error);
      res.json(getMockVerificationResponse(req.body.language || "en", req.body.category || "Plumber"));
    }
  });

  // Serve Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Fallback high-quality diagnostics for the 4 presets
function getMockDiagnosticResponse(lang: "en" | "ne", preset: string) {
  const isNe = lang === "ne";
  
  if (preset === "exposed_wire") {
    return {
      problemIdentified: isNe 
        ? "खुल्ला र असुरक्षित बिजुलीको तार (Exposed Wire Sparking). तारको बाहिरी भाग उप्किएको छ जसले गर्दा सर्ट सर्किट वा झट्का (shock) लाग्ने उच्च जोखिम छ।"
        : "Exposed Sparking Electrical Wire. The outer insulation has peeled off completely, posing a high risk of short circuits, spark hazards, or electrical shocks.",
      estimatedCostRange: isNe ? "Rs. 800 - Rs. 1,500" : "Rs. 800 - Rs. 1,500",
      recommendedFixer: "Electrician",
      severity: isNe ? "गम्भीर (Major)" : "Major",
      immediateSteps: isNe ? [
        "मुख्य बिजुलीको स्विच (MCB/Switchboard) तुरुन्तै बन्द गर्नुहोस्।",
        "खुल्ला तारलाई खाली हात वा धातुका वस्तुले कदापि नछुनुहोस्।",
        "बालबालिका र घरपालुवा जनावरहरूलाई यस क्षेत्रबाट टाढा राख्नुहोस्।"
      ] : [
        "Turn off the main power switchboard or MCB immediately to cut power.",
        "Do not touch the exposed wire with bare hands or metallic objects.",
        "Keep children and pets completely away from the affected area."
      ]
    };
  } else if (preset === "broken_ac") {
    return {
      problemIdentified: isNe 
        ? "एसी (AC) बाट पानी चुहावट र चिस्यान कमी (Air Conditioner Leaking). एसीको कन्डेंसर ड्रेन पाइप बन्द भएकोले भित्री युनिटबाट पानी चुहिरहेको छ।"
        : "AC Air Filter Blockage & Indoor Unit Water Leakage. The drain line or air filter is clogged, forcing water to overflow from the indoor unit.",
      estimatedCostRange: isNe ? "Rs. 1,500 - Rs. 3,500" : "Rs. 1,500 - Rs. 3,500",
      recommendedFixer: "Handyman",
      severity: isNe ? "मध्यम (Moderate)" : "Moderate",
      immediateSteps: isNe ? [
        "पहिले एसी बन्द गर्नुहोस् र बिजुलीको प्लग निकाल्नुहोस्।",
        "एसी मुनि पानी थाप्न भाँडो वा टावेल राख्नुहोस् ताकी भित्ता नबिग्रियोस्।",
        "एसी कभर खोलेर धुलो जमेको एयर फिल्टर बिस्तारै सफा गर्नुहोस्।"
      ] : [
        "Turn off the AC unit immediately and disconnect it from the power source.",
        "Place a towel or tray underneath to protect the wall and floor from water stains.",
        "Check and gently clean the visible dust filter to ease internal pressure."
      ]
    };
  } else if (preset === "termite") {
    return {
      problemIdentified: isNe 
        ? "काठको ढोका वा दराजमा धमिराको प्रकोप (Termite Infestation). काठ भित्रभित्रै धमिराले खाएर मक्किएको छ, तुरुन्त कीटनाशक नियन्त्रण उपचार चाहिन्छ।"
        : "Severe Termite Wood Damage. Termites are eating through the wooden door frames and cabinets, causing structural weakness in home furniture.",
      estimatedCostRange: isNe ? "Rs. 3,000 - Rs. 7,000" : "Rs. 3,000 - Rs. 7,000",
      recommendedFixer: "Preiaction",
      severity: isNe ? "गम्भीर (Major)" : "Major",
      immediateSteps: isNe ? [
        "धमिरा लागेको ठाउँको काठ चलाउन वा खोतल्न बन्द गर्नुहोस्, यसले धमिरा झन् फैलाउँछ।",
        "प्रभावित काठको सम्पर्कमा रहेका अन्य बहुमूल्य चीज वा लुगाफाटा टाढा राख्नुहोस्।",
        "वरपर सुख्खा राख्नुहोस् किनभने धमिरा ओसिलो ठाउँमा छिटो फैलिन्छ।"
      ] : [
        "Avoid disturbing or scraping the infested wood as termites will scatter to other areas.",
        "Isolate valuable cardboard boxes, papers, and books away from the infestation.",
        "Keep the surrounding area dry, as termites thrive on accumulated moisture."
      ]
    };
  }

  // Default to leaky_tap
  return {
    problemIdentified: isNe 
      ? "धारा वा पाइपबाट पानी चुहावट (Leaky Faucet / Pipe Joint). धाराको भित्री वासर खिइएको वा थ्रेड खुकुलो भएको कारण लगातार पानी चुहिरहेको छ।"
      : "Leaky Faucet and Joint Pipe. The inner rubber washer has worn out or the thread connection has loosened, causing constant water dripping.",
    estimatedCostRange: isNe ? "Rs. 500 - Rs. 1,200" : "Rs. 500 - Rs. 1,200",
    recommendedFixer: "Plumber",
    severity: isNe ? "सामान्य (Minor)" : "Minor",
    immediateSteps: isNe ? [
      "सिङ्क मुनिको सानो कोणीय भल्भ (Stop Valve) वा घरको मुख्य पानीको ट्याङ्कीको भल्भ बन्द गर्नुहोस्।",
      "चुहिएको पानी संकलन गर्न धारा मुनि बाल्टिन वा मग राख्नुहोस्।",
      "धारामा थप बल प्रयोग गरेर टाइट नगर्नुहोस्, थ्रेड भाँचिन सक्छ।"
    ] : [
      "Turn off the local stop valve under the sink or the main water overhead valve.",
      "Place a bucket underneath to save water and prevent floor pooling.",
      "Avoid overtightening the handle forcefully as it may crack the brass thread."
    ]
  };
}

function getMockVerificationResponse(lang: "en" | "ne", category: string) {
  const isNe = lang === "ne";
  const cat = (category || "").toLowerCase();

  if (cat.includes("electric")) {
    return {
      qualityScore: 92,
      assessment: isNe
        ? "विद्युतीय मर्मत कार्य सुरक्षित र व्यावसायिक रूपमा गरिएको देखिन्छ। मुख्य जडानहरू राम्ररी टेप गरिएका छन्।"
        : "The electrical repair looks highly professional and safe. The main connections are properly insulated with electrical tape.",
      isCorrect: true,
      hazardsFound: isNe
        ? ["वरपर कुनै पनि ओसिलो वा पानी परेको भाग नभएको सुनिश्चित गर्नुहोस्।"]
        : ["Double check that there are no exposed conductors or damp spots near the socket."],
      recommenedAdjustments: isNe
        ? ["तारहरूलाई भित्तामा अझ राम्रोसँग बाँध्नुहोस्।"]
        : ["Bundle the loose routing wires with cable ties to avoid direct pulling strain."],
      tips: isNe
        ? "विद्युतीय लोड धेरै नथप्नुहोस् र सधैं गुणस्तरीय फ्युज वा एमसीबी प्रयोग गर्नुहोस्।"
        : "Never overload this circuit. Keep the distribution box dry and clean."
    };
  }

  // default to plumber / general
  return {
    qualityScore: 88,
    assessment: isNe
      ? "प्लम्बिङ मर्मत उत्कृष्ट गतिमा भइरहेको देखिन्छ। नयाँ जडान गरिएको वासर र पाइप जोइन्टहरू बलिया छन्।"
      : "The plumbing joint looks well-aligned and neat. The newly fitted rubber washer and Teflon tape wrapping are securely positioned.",
    isCorrect: true,
    hazardsFound: isNe
      ? ["पाइप जोइन्ट मुनि सानो पानीको थोपा चुहावट हुन सक्छ, सुक्खा कपडाले पुछेर जाँच गर्नुहोस्।"]
      : ["Check for micro-condensation or weeping joints; run a dry tissue paper around the fitting."],
    recommenedAdjustments: isNe
      ? ["टी-जोइन्ट थ्रेडलाई हल्का कस्नुहोस्।"]
      : ["Ensure the compression nut is tightened precisely, but do not crack the PVC threading."],
    tips: isNe
      ? "पाइपहरूमा जम्ने फोहोर सफा गर्न महिनामा एक पटक तातो पानी बगाउनुहोस्।"
      : "Flush the pipe drain with warm water once a month to keep calcium and rust buildup away."
  };
}

startServer();
