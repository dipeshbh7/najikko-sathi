import React, { useState } from "react";
import { ShieldCheck, Calendar, MapPin, ArrowRight, Globe, CheckCircle2, Clock, Star, Phone, ChevronRight, Sparkles } from "lucide-react";
import { Language } from "../types";
import splashLogo from "../assets/images/regenerated_image_1785073739278.png";

interface OnboardingViewProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onFinishOnboarding: () => void;
}

export const ONBOARDING_SLIDES = [
  {
    id: 1,
    titleEn: "Trusted People, Every Time",
    titleNe: "विश्वसिलो सेवा, हरेक पटक",
    descEn: "All our professionals are verified and background-checked for your peace of mind.",
    descNe: "तपाईंको ढुक्क सेवाको लागि हाम्रा सबै प्राविधिकहरू प्रमाणित र पृष्ठभूमि जाँच गरिएका छन्।",
    badgeTitleEn: "Verified Pro",
    badgeTitleNe: "वेरिफाइड सेवा प्रदायक",
    badgeDetailEn: "Background Checked",
    badgeDetailNe: "पृष्ठभूमि जाँच गरिएको",
    visualType: "verified_pro",
  },
  {
    id: 2,
    titleEn: "Book in Minutes, Not Hours",
    titleNe: "केही मिनेटमै बुकिङ, ढुक्क सेवा",
    descEn: "Choose your service, pick a time, and we'll handle the rest.",
    descNe: "आफ्नो सेवा रोज्नुहोस्, समय छान्नुहोस्, र बाँकी हामी सम्हाल्नेछौं।",
    badgeTitleEn: "Easy Booking",
    badgeTitleNe: "सजिलो बुकिङ",
    badgeDetailEn: "2-min booking",
    badgeDetailNe: "२ मिनेटमा बुकिङ",
    visualType: "easy_booking",
  },
  {
    id: 3,
    titleEn: "Real-time Updates, Zero Worry",
    titleNe: "लाइभ अपडेट, ढुक्क मन",
    descEn: "Track your pro in real-time and get updates at every step.",
    descNe: "वास्तविक समयमा आफ्नो मिस्त्रीलाई ट्र्याक गर्नुहोस् र हरेक चरणमा अपडेट पाउनुहोस्।",
    badgeTitleEn: "Live Tracking",
    badgeTitleNe: "लाइभ ट्र्याकिङ",
    badgeDetailEn: "Real-time updates",
    badgeDetailNe: "वास्तविक समय अपडेट",
    visualType: "live_tracking",
  },
];

export default function OnboardingView({ language, setLanguage, onFinishOnboarding }: OnboardingViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const slide = ONBOARDING_SLIDES[currentSlide];

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onFinishOnboarding();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 40 && currentSlide < ONBOARDING_SLIDES.length - 1) {
      // Swipe left -> Next
      setCurrentSlide((prev) => prev + 1);
    } else if (diff < -40 && currentSlide > 0) {
      // Swipe right -> Prev
      setCurrentSlide((prev) => prev - 1);
    }
    setTouchStartX(null);
  };

  return (
    <div
      id="onboarding-container"
      className="h-screen w-full max-w-md mx-auto bg-white flex flex-col justify-between overflow-hidden relative font-sans shadow-sm"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Status Bar */}
      <div id="onboarding-status-bar" className="bg-transparent px-6 py-3 flex justify-between items-center text-xs font-semibold text-slate-700 select-none z-20 shrink-0">
        <span>10:14</span>
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-500">5G</span>
          <div className="w-5 h-2.5 border border-slate-600 rounded-sm p-0.5 flex items-center">
            <div className="bg-slate-700 h-full w-3/4 rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Top Header Navigation: Logo + Language Toggle + Skip */}
      <div id="onboarding-header" className="px-5 pt-1 pb-2 flex justify-between items-center z-20 shrink-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <img src={splashLogo} alt="Logo" className="w-8 h-8 rounded-xl object-cover border border-[#004021]/15 shadow-xs" />
          <div>
            <h1 className="text-sm font-black text-[#004021] leading-tight">Najik Ko Sathi</h1>
            <p className="text-[10px] text-emerald-800 font-semibold leading-none">नजिकको साथी</p>
          </div>
        </div>

        {/* Right Controls: Language & Skip */}
        <div className="flex items-center gap-2">
          <button
            id="onboarding-lang-btn"
            onClick={() => setLanguage(language === "en" ? "ne" : "en")}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[#004021] hover:bg-emerald-100 transition-colors"
          >
            <Globe className="w-3 h-3" />
            {language === "en" ? "नेपाली" : "English"}
          </button>
          <button
            id="onboarding-skip-btn"
            onClick={onFinishOnboarding}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 transition-colors"
          >
            {language === "en" ? "Skip" : "छोड्नुहोस्"}
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div id="onboarding-main-content" className="flex-1 flex flex-col justify-between px-5 pt-2 pb-4 overflow-y-auto scrollbar-none">
        
        {/* Hero Illustration / Visual Mockup Container */}
        <div className="relative w-full h-[320px] rounded-3xl overflow-hidden shadow-lg bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center my-auto">
          
          {/* Slide 1 Visual: Verified Professional */}
          {slide.visualType === "verified_pro" && (
            <div className="w-full h-full relative bg-cover bg-center overflow-hidden flex flex-col justify-between p-4" style={{ backgroundImage: "linear-gradient(to bottom, rgba(0,64,33,0.1), rgba(0,64,33,0.85)), url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80')" }}>
              <div className="flex justify-between items-start">
                <span className="bg-[#004021]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Najik Ko Sathi Official
                </span>
              </div>

              {/* Verified Pro Card Overlay */}
              <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=150&q=80"
                      alt="Verified Pro"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Bikash Gurung</h4>
                    <p className="text-[10px] font-medium text-emerald-700">Master Electrician & Technician</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>4.9 (540+ jobs done)</span>
                    </div>
                  </div>
                </div>
                <div className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-center">
                  <span className="block text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider">Citizenship</span>
                  <span className="text-[10px] font-bold text-emerald-600">Verified ✓</span>
                </div>
              </div>

              {/* Floating Badge (as shown in image) */}
              <div className="absolute bottom-16 left-4 bg-white rounded-2xl p-2.5 shadow-2xl border border-slate-100 flex items-center gap-2.5 max-w-[220px] animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 leading-tight">{slide.badgeTitleEn}</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">{slide.badgeTitleNe}</p>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{slide.badgeDetailEn}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 2 Visual: Easy Booking Mockup */}
          {slide.visualType === "easy_booking" && (
            <div className="w-full h-full relative bg-slate-900 overflow-hidden flex items-center justify-center p-3">
              {/* Background ambient lighting */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#004021] via-slate-900 to-amber-950 opacity-90"></div>

              {/* Mockup Phone Frame */}
              <div className="relative z-10 w-[210px] bg-slate-950 rounded-[28px] border-4 border-slate-700 shadow-2xl p-2.5 text-white overflow-hidden">
                <div className="flex justify-between items-center text-[8px] text-slate-400 mb-2 border-b border-slate-800/80 pb-1">
                  <span className="font-bold text-emerald-400">Najik Ko Sathi App</span>
                  <span>10:14</span>
                </div>

                <p className="text-[9px] text-slate-300 font-semibold mb-1.5">Hello, Sita 👋<br /><span className="text-[8px] text-slate-400">What service do you need?</span></p>

                {/* Category Grid */}
                <div className="grid grid-[#004021] grid-cols-3 gap-1 mb-2">
                  {[
                    { name: "Plumber", icon: "🪠", color: "bg-blue-900/50" },
                    { name: "Electrician", icon: "⚡", color: "bg-amber-900/50" },
                    { name: "Cleaner", icon: "🧹", color: "bg-teal-900/50" },
                    { name: "Appliance", icon: "🧺", color: "bg-purple-900/50" },
                    { name: "Carpenter", icon: "🪚", color: "bg-emerald-900/50" },
                    { name: "Technician", icon: "🛠️", color: "bg-rose-900/50" },
                  ].map((cat, idx) => (
                    <div key={idx} className={`${cat.color} p-1 rounded-lg text-center border border-white/10 flex flex-col items-center justify-center`}>
                      <span className="text-xs">{cat.icon}</span>
                      <span className="text-[7px] font-medium text-slate-200 mt-0.5">{cat.name}</span>
                    </div>
                  ))}
                </div>

                {/* AI Feature Banner */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-1.5 rounded-xl border border-emerald-400/40 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <div>
                      <p className="text-[8px] font-bold text-white leading-tight">AI Sathi Photo Diagnosis</p>
                      <p className="text-[7px] text-emerald-100">समस्या फोटो खिच्नुहोस्</p>
                    </div>
                  </div>
                  <div className="bg-white/20 p-1 rounded-full text-white">
                    <ChevronRight className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>

              {/* Floating Badge (as shown in image) */}
              <div className="absolute bottom-4 left-4 z-20 bg-white rounded-2xl p-2.5 shadow-2xl border border-slate-100 flex items-center gap-2.5 max-w-[210px] animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 leading-tight">{slide.badgeTitleEn}</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">{slide.badgeTitleNe}</p>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{slide.badgeDetailEn}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Slide 3 Visual: Live Tracking Map */}
          {slide.visualType === "live_tracking" && (
            <div className="w-full h-full relative bg-slate-100 overflow-hidden flex items-center justify-center p-3">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 bg-[#e5e9ec] flex flex-col justify-between overflow-hidden">
                {/* SVG map roads simulation */}
                <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 300 300">
                  <path d="M 10 50 Q 80 120 150 100 T 290 180" fill="none" stroke="#94a3b8" strokeWidth="12" />
                  <path d="M 50 280 Q 120 180 150 100 T 250 20" fill="none" stroke="#cbd5e1" strokeWidth="8" />
                  <path d="M 10 50 Q 80 120 150 100 T 290 180" fill="none" stroke="#004021" strokeWidth="4" strokeDasharray="6,6" />
                </svg>

                {/* Map Pin for Customer */}
                <div className="absolute top-12 right-12 bg-rose-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-pulse">
                  <MapPin className="w-4 h-4" />
                </div>

                {/* Map Pin for Pro moving */}
                <div className="absolute bottom-24 left-20 bg-emerald-600 text-white p-1.5 rounded-full shadow-xl border-2 border-white flex items-center gap-1">
                  <span className="text-[10px]">🏍️</span>
                  <span className="text-[9px] font-extrabold pr-1">Pro</span>
                </div>
              </div>

              {/* Phone overlay card showing live status */}
              <div className="relative z-10 w-[220px] bg-white rounded-2xl p-3 shadow-2xl border border-slate-200 text-slate-800">
                <div className="flex justify-between items-center text-[9px] text-emerald-800 font-bold mb-1 border-b border-slate-100 pb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Tracking
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8px]">ETA 12m</span>
                </div>
                <h6 className="text-[11px] font-bold text-slate-800">Your Pro is on the way</h6>
                <p className="text-[9px] text-slate-500 mb-2">तपाईंको प्रो आउँदै हुनुहुन्छ</p>

                <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                      alt="Pro"
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                    />
                    <div>
                      <p className="text-[10px] font-bold text-slate-800">Ramesh B.</p>
                      <p className="text-[8px] text-amber-500 font-bold">★ 4.9 Plumber</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Phone className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Floating Badge (as shown in image) */}
              <div className="absolute bottom-4 left-4 z-20 bg-white rounded-2xl p-2.5 shadow-2xl border border-slate-100 flex items-center gap-2.5 max-w-[210px] animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 leading-tight">{slide.badgeTitleEn}</h5>
                  <p className="text-[10px] text-slate-500 leading-tight">{slide.badgeTitleNe}</p>
                  <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{slide.badgeDetailEn}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text Section below visual mockup */}
        <div className="mt-4 mb-2">
          {/* Main Title (English & Nepali) */}
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {slide.titleEn.split(",")[0]}
            {slide.titleEn.includes(",") && (
              <span className="block text-[#004021]">,{slide.titleEn.split(",")[1]}</span>
            )}
          </h2>
          <h3 className="text-base font-bold text-[#004021] mt-0.5">
            {slide.titleNe}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 max-w-xs">
            {language === "en" ? slide.descEn : slide.descNe}
          </p>
        </div>

        {/* Bottom Controls: Pagination Dots + Circular Action Button */}
        <div id="onboarding-bottom-nav" className="flex items-center justify-between pt-3 pb-1">
          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {ONBOARDING_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? "w-7 h-2.5 bg-[#004021]"
                    : "w-2.5 h-2.5 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next / Get Started Button */}
          <button
            id="onboarding-next-btn"
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-[#004021] hover:bg-[#003018] active:scale-95 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div id="onboarding-home-indicator" className="h-5 bg-white w-full flex justify-center items-center pb-1 select-none shrink-0">
        <div className="w-32 h-1 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  );
}
