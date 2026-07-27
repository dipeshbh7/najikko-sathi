import React, { useEffect, useState, useRef } from "react";
import { 
  Phone, 
  Navigation, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  Star, 
  Sparkles, 
  Bell, 
  Upload, 
  Loader2, 
  AlertTriangle, 
  Check, 
  Camera, 
  X,
  Info,
  ChevronRight,
  Globe,
  Map as MapIcon,
  Lock
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Booking, TrackingState, Language, JobStatus } from "../types";
import { TRANSLATIONS } from "../data";

// Google Maps API Key handling
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "AIzaSyAE8NmxMfRiTfNsnFByvUgLmklFwGfACO8";

const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY";

// Helper component to render polylines on the map
function MapPolyline({ origin, destination }: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google) return;

    const polyline = new window.google.maps.Polyline({
      path: [origin, destination],
      geodesic: true,
      strokeColor: "#D7911D",
      strokeOpacity: 0.8,
      strokeWeight: 3,
    });

    polyline.setMap(map);

    return () => {
      polyline.setMap(null);
    };
  }, [map, origin, destination]);

  return null;
}

// Custom type for verification reports
interface VerificationReport {
  timestamp: string;
  photoUrl: string;
  qualityScore: number;
  assessment: string;
  isCorrect: boolean;
  hazardsFound: string[];
  recommenedAdjustments: string[];
  tips: string;
}

interface TrackingViewProps {
  language: Language;
  activeBooking: Booking | null;
  trackingState: TrackingState | null;
  onUpdateBookingStatus: (bookingId: string, status: JobStatus) => void;
  onJobComplete: (bookingId: string) => void;
  onSaveFeedback?: (bookingId: string, rating: number, feedbackText: string, feedbackPhotoUrl?: string) => void;
  onUpdateFinalCost?: (bookingId: string, finalCost: string) => void;
}

export default function TrackingView({
  language,
  activeBooking,
  trackingState,
  onUpdateBookingStatus,
  onJobComplete,
  onSaveFeedback,
  onUpdateFinalCost,
}: TrackingViewProps) {
  const [eta, setEta] = useState(15);
  const [techPos, setTechPos] = useState({ x: 10, y: 15 }); // simulated grid positions (0 to 100)
  const [currentStatus, setCurrentStatus] = useState<JobStatus>(JobStatus.DISPATCHED);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Custom states for Live Google Maps, Fix Price Modal & Rating System
  const [mapMode, setMapMode] = useState<"classic" | "google">("google");
  const [isFixPriceOpen, setIsFixPriceOpen] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState<string>("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];
  const isNe = language === "ne";

  // Preset repair work photos to easily test uploading feedback picture
  const PRESET_FEEDBACK_PHOTOS = [
    {
      id: "pipe_fixed",
      name: isNe ? "सम्पन्न धारा मर्मत" : "Fixed Water Tap",
      desc: isNe ? "नयाँ सिल सहित जोडिएको धारा" : "Repaired water tap with leak-proof seal",
      data: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "wiring_fixed",
      name: isNe ? "सुरक्षित स्विचबोर्ड" : "Neat Switchboard",
      desc: isNe ? "तारहरू मिलाएर तयार गरिएको नयाँ बोर्ड" : "Neatly mounted electrical board",
      data: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "clean_work",
      name: isNe ? "सफाई तथा सर्भिसिङ" : "Serviced Appliance",
      desc: isNe ? "पूर्ण सफाई तथा सफल मर्मत" : "Cleaned and tested home appliance",
      data: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Map landmarks to display in our simulated vector SVG map
  const landmarks = [
    { name: "Pulchowk Gate", x: 20, y: 70 },
    { name: "Durbar Marg", x: 80, y: 30 },
    { name: "Dharahara Tower", x: 50, y: 45 },
    { name: "New Baneshwor", x: 75, y: 65 },
  ];

  // Helper to map our 0-100 x,y grid points to real Kathmandu geographical coordinates
  const getRealLatLng = (x: number, y: number) => {
    // Baluwatar (User home at 55%, 55%) is lat: 27.7215, lng: 85.3310
    // Let x=0 -> lng=85.3000, x=100 -> lng=85.3620
    // Let y=0 -> lat=27.7500, y=100 -> lat=27.6930
    const lng = 85.3000 + (x / 100) * (85.3620 - 85.3000);
    const lat = 27.7500 - (y / 100) * (27.7500 - 27.6930);
    return { lat, lng };
  };

  const userLatLng = getRealLatLng(55, 55);
  const techLatLng = getRealLatLng(techPos.x, techPos.y);

  useEffect(() => {
    if (activeBooking) {
      setEta(activeBooking.status === JobStatus.ARRIVING ? 5 : 15);
      setCurrentStatus(activeBooking.status);
    }
  }, [activeBooking?.id]);

  useEffect(() => {
    if (!activeBooking || currentStatus === JobStatus.COMPLETED) return;

    const interval = setInterval(() => {
      setEta((prev) => (prev > 0 ? prev - 1 : 0));

      // Move tech icon closer to user home (user home is at 55, 55 on grid)
      setTechPos((prev) => {
        const destX = 55;
        const destY = 55;
        const stepX = (destX - prev.x) * 0.15;
        const stepY = (destY - prev.y) * 0.15;
        return {
          x: Math.round(prev.x + stepX),
          y: Math.round(prev.y + stepY),
        };
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [activeBooking?.id, currentStatus]);

  useEffect(() => {
    if (!activeBooking || currentStatus === JobStatus.COMPLETED) return;

    if (eta <= 0) {
      if (currentStatus === JobStatus.DISPATCHED) {
        setCurrentStatus(JobStatus.ARRIVING);
        onUpdateBookingStatus(activeBooking.id, JobStatus.ARRIVING);
        triggerNotification(
          language === "en"
            ? "Technician is nearby! Arriving in 5 Mins."
            : "प्राविधिक नजिकै हुनुहुन्छ! ५ मिनेटमा आइपुग्दै।"
        );
        setEta(5);
      } else if (currentStatus === JobStatus.ARRIVING) {
        setCurrentStatus(JobStatus.ARRIVED);
        onUpdateBookingStatus(activeBooking.id, JobStatus.ARRIVED);
        setTechPos({ x: 55, y: 55 });
        triggerNotification(
          language === "en"
            ? "Your fixer has arrived at your door! Please inspect & agree on final price."
            : "तपाईंको मिस्त्री स्थानमा आइपुग्नुभयो! समस्या हेरेर अन्तिम मूल्य तय गर्नुहोस्।"
        );
        setEta(0);
      } else if (currentStatus === JobStatus.IN_PROGRESS) {
        setCurrentStatus(JobStatus.COMPLETED);
        onJobComplete(activeBooking.id);
        triggerNotification(
          language === "en"
            ? "Job completed successfully! Payment details logged."
            : "काम सफलतापूर्वक सम्पन्न भयो! भुक्तानी विवरण दर्ता भयो।"
        );
      }
    }
  }, [eta, activeBooking?.id, currentStatus, language, onUpdateBookingStatus, onJobComplete]);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    if (navigator.vibrate) navigator.vibrate(100);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSetStatus = (status: JobStatus) => {
    if (!activeBooking) return;
    setCurrentStatus(status);
    onUpdateBookingStatus(activeBooking.id, status);
    if (status === JobStatus.ARRIVED) {
      setTechPos({ x: 55, y: 55 });
      setEta(0);
      triggerNotification(
        language === "en"
          ? "Worker has arrived at your location!"
          : "प्राविधिक स्थानमा आइपुग्नुभयो!"
      );
    } else if (status === JobStatus.IN_PROGRESS) {
      setEta(10);
      triggerNotification(
        language === "en"
          ? "Repair work started!"
          : "मर्मत कार्य सुरु भयो!"
      );
    } else if (status === JobStatus.COMPLETED) {
      onJobComplete(activeBooking.id);
      triggerNotification(
        language === "en"
          ? "Job marked as completed!"
          : "काम सम्पन्न भयो!"
      );
    } else if (status === JobStatus.ARRIVING) {
      setEta(5);
    } else if (status === JobStatus.DISPATCHED) {
      setEta(15);
      setTechPos({ x: 10, y: 15 });
    }
  };

  const getStatusText = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return t.statusCompleted;
      case JobStatus.IN_PROGRESS:
        return t.statusInProgress;
      case JobStatus.ARRIVED:
        return t.statusArrived || (isNe ? "स्थानमा आइपुग्नुभयो" : "Worker Arrived");
      case JobStatus.ARRIVING:
        return t.statusArriving;
      default:
        return t.statusDispatched;
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setSelectedImageName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetPhoto = (preset: typeof PRESET_FEEDBACK_PHOTOS[0]) => {
    setSelectedImage(preset.data);
    setSelectedImageName(preset.name);
  };

  const handleSubmitFeedback = () => {
    if (!activeBooking) return;

    if (onSaveFeedback) {
      onSaveFeedback(
        activeBooking.id,
        selectedRating,
        feedbackText || (isNe ? "उत्कृष्ट काम भएको छ।" : "Excellent work! Very satisfied."),
        selectedImage || undefined
      );
    }

    setFeedbackSubmitted(true);
    setIsFeedbackOpen(false);
    triggerNotification(
      isNe
        ? "धन्यवाद! तपाईंको रेटिङ र फोटो प्रतिक्रिया दर्ता भयो।"
        : "Thank you! Your rating & photo feedback has been saved."
    );
  };

  const handleSaveFinalCost = (customVal?: string) => {
    if (!activeBooking) return;
    const finalVal = customVal || customPriceInput || "NPR 1,200";
    const formattedVal = finalVal.toLowerCase().includes("npr") || finalVal.toLowerCase().includes("rs") 
      ? finalVal 
      : `NPR ${finalVal}`;

    if (onUpdateFinalCost) {
      onUpdateFinalCost(activeBooking.id, formattedVal);
    }
    setIsFixPriceOpen(false);
    setCustomPriceInput("");
    triggerNotification(
      isNe
        ? `अन्तिम मूल्य तय गरियो: ${formattedVal} (प्राविधिक र ग्राहक बीच सहमति)`
        : `Final price agreed: ${formattedVal} (Customer & Technician Agreed)`
    );
  };

  if (!activeBooking) {
    return (
      <div id="tracking-empty" className="flex-1 flex flex-col justify-center items-center p-6 bg-gray-50 text-center h-full">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 border border-gray-100">
          <Navigation className="w-10 h-10 text-[#004021] animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">{t.noActiveTracking}</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed font-semibold">
          {t.trackingDescription}
        </p>
      </div>
    );
  }

  return (
    <div id="tracking-view-screen" className="flex-1 flex flex-col bg-gray-100 relative h-full overflow-hidden select-none">
      {/* Dynamic Push Notification Banner */}
      {notification && (
        <div id="push-notification-banner" className="absolute top-4 left-4 right-4 bg-[#004021] text-white rounded-2xl p-3.5 shadow-xl border border-[#D7911D] z-50 flex items-start gap-3 animate-slide-down">
          <Bell className="w-5 h-5 text-[#D7911D] shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <h5 className="text-[11px] font-bold text-[#D7911D] uppercase tracking-wider">Najikko Sathi Alert</h5>
            <p className="text-xs font-semibold mt-0.5">{notification}</p>
          </div>
        </div>
      )}

      {/* Quick Status Stage Simulation Bar */}
      <div className="absolute top-4 left-4 z-40 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full shadow-lg border border-gray-200/80 flex gap-1 items-center max-w-[60%] overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSetStatus(JobStatus.DISPATCHED)}
          className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            currentStatus === JobStatus.DISPATCHED ? "bg-[#004021] text-white" : "text-slate-600 hover:bg-gray-100"
          }`}
        >
          🚀 {isNe ? "हिँडेको" : "En Route"}
        </button>
        <button
          onClick={() => handleSetStatus(JobStatus.ARRIVING)}
          className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            currentStatus === JobStatus.ARRIVING ? "bg-[#004021] text-white" : "text-slate-600 hover:bg-gray-100"
          }`}
        >
          🛵 {isNe ? "५ मि" : "Arriving"}
        </button>
        <button
          onClick={() => handleSetStatus(JobStatus.ARRIVED)}
          className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            currentStatus === JobStatus.ARRIVED ? "bg-[#8E1851] text-white shadow-xs" : "text-slate-600 hover:bg-gray-100"
          }`}
        >
          📍 {isNe ? "आइपुगेको" : "Worker Arrived"}
        </button>
        <button
          onClick={() => handleSetStatus(JobStatus.IN_PROGRESS)}
          className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
            currentStatus === JobStatus.IN_PROGRESS ? "bg-[#004021] text-white" : "text-slate-600 hover:bg-gray-100"
          }`}
        >
          🛠 {isNe ? "काम हुँदैछ" : "Working"}
        </button>
      </div>

      {/* Map Switch Header Tab */}
      <div className="absolute top-4 right-4 z-40 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-200/50 flex gap-1">
        <button
          onClick={() => setMapMode("classic")}
          className={`flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full transition-all cursor-pointer ${
            mapMode === "classic" 
              ? "bg-[#004021] text-[#D7911D]" 
              : "text-slate-600 hover:bg-gray-100"
          }`}
        >
          <MapIcon className="w-3 h-3" />
          {isNe ? "नक्शा" : "Classic Map"}
        </button>
        <button
          onClick={() => setMapMode("google")}
          className={`flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full transition-all cursor-pointer ${
            mapMode === "google" 
              ? "bg-[#004021] text-[#D7911D]" 
              : "text-slate-600 hover:bg-gray-100"
          }`}
        >
          <Globe className="w-3 h-3" />
          {isNe ? "गुगल म्याप" : "Live Map"}
        </button>
      </div>

      {/* Map Container Area */}
      <div id="simulated-map" className="flex-1 bg-gray-100 relative overflow-hidden border-b border-gray-100 min-h-[250px]">
        {mapMode === "classic" ? (
          /* Classic Vector Simulated Kathmandu Map Grid */
          <>
            <svg className="absolute inset-0 w-full h-full text-slate-200 opacity-60" stroke="currentColor" strokeWidth="1.5">
              <line x1="0" y1="200" x2="100%" y2="200" />
              <line x1="0" y1="400" x2="100%" y2="400" />
              <line x1="150" y1="0" x2="150" y2="100%" />
              <line x1="300" y1="0" x2="300" y2="100%" />
              <line x1="0" y1="0" x2="100%" y2="100%" strokeDasharray="5,5" />
              <line x1="0" y1="100%" x2="100%" y2="0" strokeDasharray="5,5" />
            </svg>

            {landmarks.map((l, index) => (
              <div
                key={index}
                className="absolute flex flex-col items-center select-none opacity-40"
                style={{ left: `${l.x}%`, top: `${l.y}%` }}
              >
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                <span className="text-[9px] font-bold text-slate-500 mt-0.5">{l.name}</span>
              </div>
            ))}

            {/* Path line from Technician to Home */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" stroke="#D7911D" strokeWidth="2" strokeDasharray="4,4">
              <line x1={`${techPos.x}%`} y1={`${techPos.y}%`} x2="55%" y2="55%" />
            </svg>

            {/* User's Home Destination Marker */}
            <div
              id="user-home-marker"
              className="absolute flex flex-col items-center z-10 animate-pulse"
              style={{ left: "55%", top: "55%" }}
            >
              <div className="w-8 h-8 rounded-full bg-[#004021] border-2 border-white flex items-center justify-center shadow-md">
                <MapPin className="w-4 h-4 text-[#D7911D]" />
              </div>
              <span className="bg-white px-2 py-0.5 text-[8px] font-bold rounded-md shadow-sm border border-gray-100 text-slate-600 mt-1">
                {isNe ? "मेरो घर" : "My Home"}
              </span>
            </div>

            {/* Technician Moving Marker */}
            <div
              id="technician-bike-marker"
              className="absolute flex flex-col items-center transition-all duration-1000 z-20"
              style={{ left: `${techPos.x}%`, top: `${techPos.y}%` }}
            >
              <div className="w-9 h-9 rounded-xl bg-[#8E1851] border-2 border-white flex items-center justify-center shadow-lg relative animate-bounce">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-9 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm13.1-4.1l-1.4-2.8c-.3-.6-.9-1.1-1.6-1.1H13v2h4l1.4 2.8c.1.2.1.4 0 .6l-2.6 5.2H9.2L6.6 9.3c-.1-.2-.1-.4 0-.6L8 5.9h4V4H7.4c-.7 0-1.3.4-1.6 1.1L4.4 7.9c-.3.6-.1 1.4.5 1.7L9.2 12c.5.2 1.1-.1 1.3-.6l1.5-3h2.1l1.5 3c.2.5.8.8 1.3.6l4.3-2.4c.6-.3.8-1.1.5-1.7z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white animate-ping"></span>
              </div>
              <span className="bg-white px-2 py-0.5 text-[8px] font-bold rounded-md shadow-sm border border-gray-100 text-slate-700 mt-1">
                {activeBooking.technicianName} (Fixer)
              </span>
            </div>
          </>
        ) : (
          /* Live Interactive Google Map with fallback setup */
          <div className="w-full h-full relative">
            {!hasValidKey ? (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-10 text-white select-text">
                <div className="w-16 h-16 bg-[#004021] border-2 border-[#D7911D] rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-[#D7911D]" />
                </div>
                <h3 className="text-md font-bold tracking-tight text-[#D7911D]">
                  {isNe ? "गुगल म्याप एपिआई की आवश्यक छ" : "Google Maps API Key Required"}
                </h3>
                <p className="text-[11px] text-slate-300 max-w-sm mt-1 leading-relaxed font-medium">
                  {isNe 
                    ? "काठमाडौँको वास्तविक गुगल म्याप अनलक गर्न सेक्रेट्स प्यानलमा म्याप एपिआई की थप्नुहोस्।"
                    : "To view the active fixer location live on real-world Kathmandu streets, please set up your key."}
                </p>
              </div>
            ) : (
              <APIProvider apiKey={API_KEY} version="weekly">
                <Map
                  defaultCenter={userLatLng}
                  defaultZoom={14}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: "100%", height: "100%" }}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true
                  }}
                >
                  {/* User Destination Marker */}
                  <AdvancedMarker position={userLatLng}>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#004021] border-2 border-white flex items-center justify-center shadow-md">
                        <MapPin className="w-4 h-4 text-[#D7911D]" />
                      </div>
                      <span className="bg-white px-2 py-0.5 text-[8px] font-bold rounded-md shadow-sm border border-gray-100 text-slate-600 mt-1">
                        {isNe ? "मेरो घर" : "My Home"}
                      </span>
                    </div>
                  </AdvancedMarker>

                  {/* Technician Moving Marker */}
                  <AdvancedMarker position={techLatLng}>
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl bg-[#8E1851] border-2 border-white flex items-center justify-center shadow-lg relative animate-bounce">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.5 12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-9 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm13.1-4.1l-1.4-2.8c-.3-.6-.9-1.1-1.6-1.1H13v2h4l1.4 2.8c.1.2.1.4 0 .6l-2.6 5.2H9.2L6.6 9.3c-.1-.2-.1-.4 0-.6L8 5.9h4V4H7.4c-.7 0-1.3.4-1.6 1.1L4.4 7.9c-.3.6-.1 1.4.5 1.7L9.2 12c.5.2 1.1-.1 1.3-.6l1.5-3h2.1l1.5 3c.2.5.8.8 1.3.6l4.3-2.4c.6-.3.8-1.1.5-1.7z" />
                        </svg>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white animate-ping"></span>
                      </div>
                      <span className="bg-white px-2 py-0.5 text-[8px] font-bold rounded-md shadow-sm border border-gray-100 text-slate-700 mt-1">
                        {activeBooking.technicianName}
                      </span>
                    </div>
                  </AdvancedMarker>

                  <MapPolyline origin={techLatLng} destination={userLatLng} />
                </Map>
              </APIProvider>
            )}
          </div>
        )}
      </div>

      {/* Arrival Card Overlay */}
      <div id="arrival-status-card" className="bg-white p-5 rounded-t-3xl border-t border-gray-100 shadow-xl space-y-4 select-none z-10 shrink-0">
        
        {/* DEDICATED WORKER ARRIVED HERO SCREEN BANNER */}
        {currentStatus === JobStatus.ARRIVED && (
          <div className="bg-gradient-to-r from-[#004021] to-[#003018] text-white p-4 rounded-2xl shadow-md border border-emerald-400/30 space-y-3 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeBooking.technicianAvatar}
                    alt={activeBooking.technicianName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-[#D7911D] shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#004021] flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-[#004021]" />
                  </span>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 bg-[#D7911D] text-slate-900 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider mb-0.5">
                    <MapPin className="w-2.5 h-2.5 fill-slate-900" />
                    <span>{isNe ? "ढोकामा आइपुग्नुभयो" : "Arrived at Doorstep"}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white">
                    {activeBooking.technicianName} {isNe ? "आइपुग्नुभयो!" : "has arrived!"}
                  </h3>
                  <p className="text-[10px] text-emerald-200 font-medium">
                    {isNe ? "कृपया मर्मत स्थान देखाएर अन्तिम मूल्य तय गर्नुहोस्।" : "Please show the issue & fix the agreed price before work starts."}
                  </p>
                </div>
              </div>

              {/* Handshake Security PIN */}
              <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/20 text-center shrink-0">
                <span className="text-[8px] uppercase tracking-wider text-emerald-200 font-bold block">{isNe ? "सुरक्षा पिन" : "Verification PIN"}</span>
                <span className="text-xs font-extrabold text-[#D7911D] tracking-widest">4892</span>
              </div>
            </div>

            {/* Quick Action Handshake Row */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <button
                onClick={() => setIsFixPriceOpen(true)}
                className="py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border border-white/20 active:scale-95 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#D7911D]" />
                <span>{activeBooking.finalAgreedCost ? (isNe ? "मूल्य: " + activeBooking.finalAgreedCost : activeBooking.finalAgreedCost) : (isNe ? "अन्तिम मूल्य तय गर्नुहोस्" : "Fix Final Price")}</span>
              </button>

              <button
                onClick={() => handleSetStatus(JobStatus.IN_PROGRESS)}
                className="py-2.5 px-3 bg-[#D7911D] hover:bg-[#b87814] text-slate-900 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 fill-slate-900" />
                <span>{isNe ? "काम सुरु गर्नुहोस्" : "Start Repair Work"}</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] text-[#D7911D] font-bold uppercase tracking-wider">{t.etaCountdown}</span>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-extrabold text-[#004021] tracking-tight">
                {currentStatus === JobStatus.IN_PROGRESS ? "--" : currentStatus === JobStatus.ARRIVED ? "0" : eta}
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {currentStatus === JobStatus.IN_PROGRESS ? t.statusInProgress : currentStatus === JobStatus.ARRIVED ? (isNe ? "आइपुगेको" : "Arrived") : t.mins}
              </span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">{isNe ? "अवस्था" : "Status"}</span>
            <div className="flex items-center gap-1.5 justify-end">
              <span className={`w-2 h-2 rounded-full animate-pulse ${currentStatus === JobStatus.ARRIVED ? "bg-emerald-500" : "bg-[#8E1851]"}`}></span>
              <h4 className="text-xs font-extrabold text-slate-800">{getStatusText(currentStatus)}</h4>
            </div>
          </div>
        </div>

        {/* Technician Details */}
        <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-2xl gap-2">
          <div className="flex items-center gap-3">
            <img src={activeBooking.technicianAvatar} alt={activeBooking.technicianName} className="w-11 h-11 rounded-xl object-cover border border-gray-100" />
            <div className="flex flex-col">
              <h4 className="text-xs font-extrabold text-slate-800">{activeBooking.technicianName}</h4>
              <span className="text-[10px] text-slate-400 font-semibold">{activeBooking.categoryName} Specialist</span>
              <div className="flex items-center gap-0.5 text-amber-500 mt-0.5">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold text-slate-600">4.8</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Rate & Feedback Button */}
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-2.5 bg-[#D7911D] hover:bg-[#b87814] text-slate-900 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
              <span>{isNe ? "रेटिङ र प्रतिक्रिया" : "Rate & Feedback"}</span>
            </button>

            <a
              id="tracking-btn-call-tech"
              href={`tel:${activeBooking.technicianPhone}`}
              className="p-3 bg-[#004021] hover:bg-[#003018] text-white rounded-xl shadow-md active:scale-95 transition-all shrink-0"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* On-Site Price Agreement Box (Customer + Fixer Price Lock) */}
        <div className="bg-[#004021]/5 border border-[#004021]/20 p-3 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-[#004021] font-extrabold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isNe ? "स्थानगत अन्तिम मूल्य (On-Site Price):" : "On-Site Agreed Final Price:"}</span>
            </div>
            <span className="text-[10px] bg-[#004021]/10 text-[#004021] px-2 py-0.5 rounded-full font-bold">
              {activeBooking.finalAgreedCost ? (isNe ? "तय भएको ✓" : "Agreed & Locked ✓") : (isNe ? "अनुमानित" : "Estimate")}
            </span>
          </div>

          <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                {activeBooking.finalAgreedCost ? (isNe ? "सहमति भएको अन्तिम रकम" : "Agreed Final Price") : (isNe ? "प्रारम्भिक अनुमानित लागत" : "Estimated Cost Range")}
              </span>
              <span className="text-sm font-extrabold text-[#004021]">
                {activeBooking.finalAgreedCost || activeBooking.cost}
              </span>
            </div>

            <button
              onClick={() => setIsFixPriceOpen(true)}
              className="px-3 py-1.5 bg-[#004021] hover:bg-[#003018] text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-[#D7911D]" />
              <span>{activeBooking.finalAgreedCost ? (isNe ? "मूल्य फेर्नुहोस्" : "Edit Final Price") : (isNe ? "अन्तिम मूल्य तय गर्नुहोस्" : "Fix Final Price")}</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-500 font-semibold leading-tight">
            {isNe 
              ? "💡 मिस्त्री आएपछि दुवै जना मिलेर काम जाँच गरी अन्तिम मूल्य तय (Fix Price) गर्न सक्नुहुन्छ।"
              : "💡 Once technician arrives, inspect the repair together and fix the exact final price before work begins."}
          </p>
        </div>

        {/* Real-time Push Status Steps Tracker */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1.5 pt-1">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-semibold ${currentStatus === JobStatus.DISPATCHED || currentStatus === JobStatus.ARRIVING || currentStatus === JobStatus.ARRIVED || currentStatus === JobStatus.IN_PROGRESS ? "bg-[#004021] text-white border-transparent" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              1
            </div>
            <span className={currentStatus === JobStatus.DISPATCHED ? "text-slate-700 font-bold" : ""}>En Route</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-1 -mt-4"></div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-semibold ${currentStatus === JobStatus.ARRIVING || currentStatus === JobStatus.ARRIVED || currentStatus === JobStatus.IN_PROGRESS ? "bg-[#004021] text-white border-transparent" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              2
            </div>
            <span className={currentStatus === JobStatus.ARRIVING ? "text-slate-700 font-bold" : ""}>Nearby</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-1 -mt-4"></div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-semibold ${currentStatus === JobStatus.ARRIVED || currentStatus === JobStatus.IN_PROGRESS ? "bg-[#8E1851] text-white border-transparent shadow-xs" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              3
            </div>
            <span className={currentStatus === JobStatus.ARRIVED ? "text-[#8E1851] font-extrabold" : ""}>Arrived</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-200 mx-1 -mt-4"></div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center font-semibold ${currentStatus === JobStatus.IN_PROGRESS ? "bg-[#004021] text-white border-transparent" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              4
            </div>
            <span className={currentStatus === JobStatus.IN_PROGRESS ? "text-slate-700 font-bold" : ""}>Working</span>
          </div>
        </div>

        {/* Display Submitted Feedback Card if customer rated */}
        {activeBooking.rating && (
          <div className="pt-2 border-t border-gray-100 mt-2 select-text bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1 text-[#004021] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isNe ? "तपाईंको प्रतिक्रिया दर्ता भयो" : "Your Rating & Feedback"}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= (activeBooking.rating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {activeBooking.feedbackText && (
              <p className="text-xs text-slate-700 font-medium italic mt-1">
                "{activeBooking.feedbackText}"
              </p>
            )}

            {activeBooking.feedbackPhotoUrl && (
              <div className="mt-2 flex items-center gap-2 bg-white p-1.5 rounded-xl border border-emerald-200/80 w-fit">
                <img
                  src={activeBooking.feedbackPhotoUrl}
                  alt="Work feedback"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                />
                <div className="text-[10px] text-slate-500 font-semibold pr-2">
                  <span className="block font-bold text-slate-700">{isNe ? "संलग्न फोटो" : "Attached Repair Photo"}</span>
                  <span>{activeBooking.feedbackTimestamp || "Just now"}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RATING & FEEDBACK DRAWER MODAL */}
      {isFeedbackOpen && (
        <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end select-text animate-fade-in">
          <div className="bg-white rounded-t-3xl p-6 space-y-4 max-h-[90%] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    {isNe ? "रेटिङ तथा फोटो प्रतिक्रिया" : "Rate Service & Photo Feedback"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {activeBooking.technicianName} ({activeBooking.categoryName})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-1.5 text-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="text-xs font-extrabold text-slate-700 block">
                {isNe ? "मिस्त्रीको काम कस्तो लाग्यो? (१ देखि ५ तारा दिनुहोस्)" : "How was the service? (Tap to rate 1 to 5 stars)"}
              </label>
              <div className="flex justify-center items-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="p-1 transition-transform active:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= selectedRating
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-slate-300 hover:text-amber-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-bold text-amber-700">
                {selectedRating === 5 ? (isNe ? "उत्कृष्ट (5/5)" : "Excellent (5/5)") :
                 selectedRating === 4 ? (isNe ? "धेरै राम्रो (4/5)" : "Very Good (4/5)") :
                 selectedRating === 3 ? (isNe ? "ठिकै (3/5)" : "Good (3/5)") :
                 selectedRating === 2 ? (isNe ? "सुधार आवश्यक (2/5)" : "Needs Improvement (2/5)") :
                 (isNe ? "असंतोषजनक (1/5)" : "Unsatisfactory (1/5)")}
              </span>
            </div>

            {/* Feedback Review Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {isNe ? "प्रतिक्रिया वा टिप्पणी (ऐच्छिक):" : "Your Feedback / Experience (Optional):"}
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={isNe ? "मर्मत काम र मिस्त्रीको बानीब्यहोरा बारे लेख्नुहोस्..." : "Describe the repair outcome, punctuality, and quality..."}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#004021] resize-none h-20"
              />
            </div>

            {/* Photo Upload with Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {isNe ? "सम्पन्न कामको फोटो जोड्नुहोस् (फोटो प्रतिक्रिया):" : "Attach Photo of Completed Work (Photo Feedback):"}
              </label>

              {/* Sample Photo Presets for 1-Click test */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {PRESET_FEEDBACK_PHOTOS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPresetPhoto(preset)}
                    className="flex flex-col items-center p-2 bg-gray-50 border border-gray-100 rounded-xl hover:border-amber-400 hover:bg-amber-50/50 transition-all text-center gap-1 cursor-pointer"
                  >
                    <img src={preset.data} alt={preset.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="text-[9px] font-bold text-slate-700 line-clamp-1">{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#004021] p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all bg-gray-50/50 hover:bg-emerald-50/30 gap-1"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Camera className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">
                  {isNe ? "फोटो खिच्नुहोस् वा अपलोड गर्नुहोस्" : "Take Photo or Upload"}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {isNe ? "फोन क्यामेरा प्रयोग गर्न सकिन्छ" : "Supports camera or file gallery"}
                </span>
              </div>

              {/* Selected Photo Indicator */}
              {selectedImage && (
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <img src={selectedImage} alt="selected" className="w-10 h-10 rounded-lg object-cover border border-emerald-300" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">{selectedImageName || "Photo Attached"}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">{isNe ? "फोटो जोडियो ✓" : "Photo Attached ✓"}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedImageName("");
                    }}
                    className="text-slate-400 hover:text-red-500 text-xs font-bold"
                  >
                    {isNe ? "हटाउनुहोस्" : "Remove"}
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitFeedback}
              className="w-full py-3.5 bg-[#004021] hover:bg-[#003018] text-white rounded-2xl font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <Check className="w-4 h-4" />
              <span>{isNe ? "रेटिङ र प्रतिक्रिया बुझाउनुहोस्" : "Submit Rating & Photo Feedback"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ON-SITE FIX FINAL PRICE MODAL DRAWER */}
      {isFixPriceOpen && (
        <div id="fix-price-drawer" className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end select-text animate-fade-in">
          <div className="bg-white rounded-t-3xl p-6 space-y-4 max-h-[90%] overflow-y-auto shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#004021]/10 flex items-center justify-center text-[#004021]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">
                    {isNe ? "प्राविधिकसँग अन्तिम मूल्य तय गर्नुहोस्" : "Agree On-Site Price with Fixer"}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {activeBooking.technicianName} ({activeBooking.categoryName})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsFixPriceOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50/80 border-l-4 border-amber-500 p-3 rounded-r-2xl space-y-1 text-slate-700 text-xs">
              <div className="font-extrabold text-amber-900 flex items-center gap-1">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{isNe ? "प्रत्यक्ष निरीक्षण पछि मूल्य निर्धारण:" : "Post-Inspection Price Lock:"}</span>
              </div>
              <p className="text-[11px] font-semibold leading-relaxed text-slate-700">
                {isNe 
                  ? "मिस्त्री तपाईंको ठाउँमा पुगिसकेपछि समस्या प्रत्यक्ष जाँच गरेर आपसी सहमतिमा अन्तिम रकम (Final Price) यहाँ तय गर्न सक्नुहुन्छ।"
                  : "After technician arrives, inspect the exact issue together and fix the final agreed price before starting the work."}
              </p>
            </div>

            {/* Preset Price Chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 block">
                {isNe ? "द्रुत सहमति रकम छान्नुहोस्:" : "Select Agreed Amount (Quick Presets):"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["NPR 800", "NPR 1,000", "NPR 1,200", "NPR 1,500", "NPR 1,800", "NPR 2,200"].map((presetCost) => (
                  <button
                    key={presetCost}
                    type="button"
                    onClick={() => handleSaveFinalCost(presetCost)}
                    className="py-2.5 px-2 bg-gray-50 border border-gray-200 rounded-xl hover:border-[#004021] hover:bg-[#004021]/5 text-[#004021] font-extrabold text-xs transition-all active:scale-95 cursor-pointer text-center"
                  >
                    {presetCost}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-slate-700 block">
                {isNe ? "वा अन्य कुनै तय भएको रकम टाइप गर्नुहोस् (NPR):" : "Or Enter Custom Agreed Price (NPR):"}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(e.target.value)}
                    placeholder="e.g. 1350"
                    className="w-full pl-12 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#004021]"
                  />
                  <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">NPR</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveFinalCost()}
                  className="px-5 py-3 bg-[#004021] hover:bg-[#003018] text-white rounded-xl font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  {isNe ? "सहमति पक्का गर्नुहोस्" : "Confirm Price"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
