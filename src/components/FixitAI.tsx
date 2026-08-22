import React, { useState, useRef } from "react";
import { Camera, Upload, Sparkles, AlertCircle, RefreshCw, CheckCircle2, DollarSign, Hammer, AlertTriangle, Play, HelpCircle } from "lucide-react";
import { Language } from "../types";
import { PRESET_DIAGNOSTICS, TRANSLATIONS } from "../data";

interface FixitAIProps {
  language: Language;
  onBookFixer: (categoryId: string, aiDiagnosticDetails: any) => void;
}

export default function FixitAI({ language, onBookFixer }: FixitAIProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("leaky_tap");
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language];

  const currentPreset = PRESET_DIAGNOSTICS.find((p) => p.key === selectedPreset);

  const handlePresetSelect = (key: string) => {
    setSelectedPreset(key);
    setCustomImage(null);
    setDiagnosticResult(null);
    setError("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setSelectedPreset("");
        setDiagnosticResult(null);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setDiagnosticResult(null);
    setError("");

    // Simulate comforting progressive AI status steps
    const loadingSteps = language === "en" 
      ? ["Initializing computer vision...", "Detecting surface anomalies...", "Consulting Nepal local repair database...", "Mapping price projections..."]
      : ["कम्प्युटर भिजन सुरु गर्दै...", "सतहका त्रुटिहरू पहिचान गर्दै...", "स्थानीय मर्मत डाटाबेस परामर्श लिँदै...", "अनुमानित लागत गणना गर्दै..."];
    
    setLoadingStep(0);
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const imageToSend = customImage || currentPreset?.imageUrl || "";
      if (!imageToSend) {
        throw new Error(language === "en" ? "No photo selected" : "कुनै फोटो चयन गरिएको छैन");
      }

      const response = await fetch("/api/fixit-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageToSend,
          language: language,
          presetIssue: selectedPreset,
        }),
      });

      if (!response.ok) {
        throw new Error("Diagnostic request failed");
      }

      const result = await response.json();
      setDiagnosticResult(result);
    } catch (err: any) {
      console.error(err);
      setError(language === "en" ? "Failed to connect to AI Sathi. Please try again." : "एआई साथीसँग जडान असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।");
    } finally {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAIBooking = () => {
    if (!diagnosticResult) return;
    const catId = diagnosticResult.recommendedFixer.toLowerCase();
    onBookFixer(catId, diagnosticResult);
  };

  return (
    <div id="fixit-ai-screen" className="flex-1 flex flex-col bg-gray-50 h-full overflow-y-auto px-5 py-6">
      {/* AI Title branding bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8E1851] to-[#D7911D] flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#004021] tracking-tight">AI Sathi</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{language === "en" ? "Core Household Diagnostic Engine" : "तत्काल गृह मर्मत एआई साथी"}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm mb-5 space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          {t.fixitAiPrompt}
        </p>

        {/* Dynamic Display of selected/uploaded Image */}
        <div id="diagnostic-camera-box" className="relative w-full h-[220px] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
          {customImage ? (
            <img src={customImage} alt="User Upload" className="w-full h-full object-cover animate-fade-in" />
          ) : currentPreset ? (
            <img src={currentPreset.imageUrl} alt={currentPreset.nameEn} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4 space-y-2">
              <Camera className="w-10 h-10 text-slate-400 mx-auto" />
              <span className="text-xs text-slate-400 font-semibold">No Image Captured</span>
            </div>
          )}

          {/* Sparkles scanning line effect when analyzing */}
          {isAnalyzing && (
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-[#D7911D] to-transparent animate-scan-line shadow-lg"></div>
          )}
        </div>

        {/* Quick Simulated Photo Capture / Upload Actions */}
        <div className="flex gap-3">
          <button
            id="btn-upload-sim"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 px-3 border border-gray-100 hover:bg-gray-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#004021]" />
            <span>{language === "en" ? "Upload Photo" : "फोटो अपलोड"}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            id="btn-run-analysis"
            disabled={isAnalyzing}
            onClick={startAnalysis}
            className="flex-1 py-2.5 px-4 bg-[#8E1851] hover:bg-[#72113f] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D7911D]" />
            <span>{language === "en" ? "Analyze Issue" : "एआई जाँच"}</span>
          </button>
        </div>
      </div>

      {/* Preset sample options slider (Replicate vertical Grid details if desired, slider shown here is very ergonomic) */}
      {!isAnalyzing && !diagnosticResult && (
        <div id="ai-preset-catalog" className="space-y-3 mb-6">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{language === "en" ? "Or, choose a common preset issue:" : "वा, कुनै एक सामान्य समस्या रोज्नुहोस्:"}</h3>
          <div className="grid grid-cols-2 gap-3">
            {PRESET_DIAGNOSTICS.map((preset) => (
              <button
                id={`preset-${preset.key}`}
                key={preset.key}
                onClick={() => handlePresetSelect(preset.key)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 cursor-pointer hover:shadow-xs ${
                  selectedPreset === preset.key
                    ? "border-[#8E1851] bg-[#8E1851]/5"
                    : "border-gray-100 bg-white"
                }`}
              >
                <div className="w-full h-16 rounded-xl overflow-hidden bg-gray-50">
                  <img src={preset.imageUrl} alt={preset.nameEn} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 truncate">
                    {language === "en" ? preset.nameEn : preset.nameNe}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-semibold line-clamp-1">
                    {language === "en" ? preset.descEn : preset.descNe}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Loading Screen */}
      {isAnalyzing && (
        <div id="ai-analyzing-log" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 border-4 border-[#8E1851] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">{language === "en" ? "Fixit AI Diagnostic in Progress" : "फिक्सिट एआई जाँच हुँदैछ"}</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider animate-pulse">
              {language === "en" 
                ? ["Initializing computer vision...", "Detecting surface anomalies...", "Consulting Nepal local repair database...", "Mapping price projections..."][loadingStep]
                : ["कम्प्युटर भिजन सुरु गर्दै...", "सतहका त्रुटिहरू पहिचान गर्दै...", "स्थानीय मर्मत डाटाबेस परामर्श लिँदै...", "अनुमानित लागत गणना गर्दै..."][loadingStep]}
            </p>
          </div>
        </div>
      )}

      {/* ERROR STATUS */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-3xl p-4 text-xs font-semibold text-center flex items-center gap-2 justify-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Clean Diagnostic Summary Card Output */}
      {diagnosticResult && !isAnalyzing && (
        <div id="ai-diagnostic-card-result" className="bg-white rounded-3xl p-5 border-2 border-[#D7911D] shadow-lg space-y-4 animate-slide-up mb-6">
          <div className="flex justify-between items-start pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-[#D7911D]" />
              <h4 className="text-xs font-bold text-[#004021] uppercase tracking-wide">{language === "en" ? "Diagnostic Report" : "फिक्सिट जाँच रिपोर्ट"}</h4>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 bg-red-100 text-red-700 border border-red-200 font-bold rounded-md">
              {diagnosticResult.severity}
            </span>
          </div>

          {/* Problem description */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{t.problemIdentified}</span>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              {diagnosticResult.problemIdentified}
            </p>
          </div>

          {/* Pricing projections */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t.estimatedCost}</span>
              <span className="text-sm font-extrabold text-[#D7911D] mt-1">{diagnosticResult.estimatedCostRange}</span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">{t.recommendedFixer}</span>
              <span className="text-sm font-extrabold text-[#3038A4] mt-1">{diagnosticResult.recommendedFixer}</span>
            </div>
          </div>

          {/* AI Disclaimer & On-Site Price Agreement Warning Banner */}
          <div className="bg-amber-50/90 border-l-4 border-amber-500 p-3 rounded-r-2xl space-y-1 text-slate-700">
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{language === "en" ? "Important Notice:" : "महत्वपूर्ण जानकारी:"}</span>
            </div>
            <p className="text-[11px] font-semibold leading-relaxed text-slate-700">
              {language === "en" ? (
                <>
                  <strong className="text-amber-900">AI can make mistakes.</strong> This estimated cost is an approximation based on photo analysis.
                  After booking, once your technician arrives at your location, you and the technician can inspect the issue together and <strong className="text-amber-950 underline">fix/agree on the final price</strong> before starting the work.
                </>
              ) : (
                <>
                  <strong className="text-amber-900">एआईबाट त्रुटि हुन सक्छ।</strong> यो अनुमानित लागत फोटो पहिचानमा आधारित प्रारम्भिक अनुमान मात्र हो।
                  बुकिङ पछि, प्राविधिक तपाईंको ठाउँमा आइपुगेपछि दुवै जना मिलेर समस्या प्रत्यक्ष जाँच गरी <strong className="text-amber-950 underline">अन्तिम मूल्य तय गर्न सक्नुहुन्छ।</strong>
                </>
              )}
            </p>
          </div>

          {/* Actionable First Aid steps */}
          <div className="space-y-2.5 pt-2 border-t border-gray-100">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t.immediateSteps}</h5>
            <div className="space-y-2">
              {diagnosticResult.immediateSteps?.map((step: string, idx: number) => (
                <div key={idx} className="flex gap-2 items-start p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div className="w-4.5 h-4.5 bg-[#004021] text-white text-[9px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-normal">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking CTA button - matches and highlights recommended fixer */}
          <button
            id="btn-confirm-ai-booking"
            onClick={handleConfirmAIBooking}
            className="w-full py-3 bg-[#004021] hover:bg-[#003018] text-white font-extrabold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer text-center uppercase tracking-wider"
          >
            {t.unlockedFixer}
          </button>
        </div>
      )}
    </div>
  );
}
