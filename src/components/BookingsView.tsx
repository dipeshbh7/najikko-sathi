import React, { useState, useRef } from "react";
import { Receipt, Calendar, Clock, MapPin, Sparkles, Plus, AlertCircle, CheckCircle2, ChevronRight, Bell, ShieldCheck, Star, Camera, X } from "lucide-react";
import { Booking, Language, JobStatus } from "../types";
import { TRANSLATIONS } from "../data";

interface BookingsViewProps {
  language: Language;
  bookings: Booking[];
  onScheduleService: (categoryId: string, applianceName: string) => void;
  onViewInvoice: (booking: Booking) => void;
  onSaveFeedback?: (bookingId: string, rating: number, feedbackText: string, feedbackPhotoUrl?: string) => void;
  onUpdateFinalCost?: (bookingId: string, finalCost: string) => void;
}

export default function BookingsView({
  language,
  bookings,
  onScheduleService,
  onViewInvoice,
  onSaveFeedback,
}: BookingsViewProps) {
  const [activeTab, setActiveTab] = useState<"ledger" | "reminders">("ledger");
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<Booking | null>(null);
  
  // Rating & Feedback Modal state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];
  const isNe = language === "ne";

  const handleSelectPresetPhoto = (presetData: string, presetName: string) => {
    setSelectedImage(presetData);
    setSelectedImageName(presetName);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setSelectedImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRatingSubmit = () => {
    if (!ratingBooking) return;
    if (onSaveFeedback) {
      onSaveFeedback(
        ratingBooking.id,
        selectedRating,
        feedbackText || (isNe ? "उत्कृष्ट सेवा।" : "Great service!"),
        selectedImage || undefined
      );
    }
    setRatingBooking(null);
    setSelectedImage(null);
    setSelectedImageName("");
    setFeedbackText("");
  };

  // Helper to translate problem scales
  const translateScale = (scale: string) => {
    if (scale === "Minor") return language === "en" ? "Minor" : "सामान्य";
    if (scale === "Moderate") return language === "en" ? "Moderate" : "मध्यम";
    return language === "en" ? "Major" : "गम्भीर";
  };

  const getStatusBadgeColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case JobStatus.IN_PROGRESS:
        return "bg-blue-50 text-[#3038A4] border-blue-200";
      default:
        return "bg-amber-50 text-[#D7911D] border-amber-200";
    }
  };

  const getStatusText = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED:
        return t.statusCompleted;
      case JobStatus.IN_PROGRESS:
        return t.statusInProgress;
      case JobStatus.ARRIVING:
        return t.statusArriving;
      default:
        return t.statusDispatched;
    }
  };

  return (
    <div id="bookings-container" className="flex-1 flex flex-col bg-gray-50 h-full">
      {/* Tab bar header */}
      <div id="bookings-tabs" className="flex border-b border-gray-100 bg-white shadow-sm select-none">
        <button
          id="tab-ledger"
          onClick={() => setActiveTab("ledger")}
          className={`flex-1 py-3 text-xs font-bold text-center tracking-wide uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "ledger"
              ? "border-[#004021] text-[#004021]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {t.bookingsLedger}
        </button>
        <button
          id="tab-reminders"
          onClick={() => setActiveTab("reminders")}
          className={`flex-1 py-3 text-xs font-bold text-center tracking-wide uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "reminders"
              ? "border-[#004021] text-[#004021]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          {t.smartReminders}
        </button>
      </div>

      {/* Main Area */}
      <div id="bookings-main-scroll" className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "ledger" ? (
          /* BOOKINGS LEDGER TAB */
          <div id="ledger-section" className="space-y-3.5">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-slate-400 font-medium">
                No bookings logged yet.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  id={`booking-card-${booking.id}`}
                  key={booking.id}
                  className="bg-white rounded-3xl p-4 border border-gray-100 hover:border-[#004021]/30 transition-all shadow-sm flex flex-col gap-3"
                >
                  {/* Category and Status Badge */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: "#004021" }}>
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {language === "en" ? booking.categoryName : (booking.categoryId === "plumber" ? "प्लम्बर" : booking.categoryId === "electrician" ? "बिजुली मिस्त्री" : booking.categoryId === "haracomert" ? "गृह हेरचाह र सफाइ" : "ह्यान्डीम्यान")}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{booking.date}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${getStatusBadgeColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  {/* Problem Description Details */}
                  <div className="bg-gray-50 rounded-xl p-3 text-xs border border-gray-100 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">{booking.problemDetails}</span>
                      <span className="text-[#8E1851] font-bold text-[10px] bg-pink-50 border border-pink-100 px-1.5 py-0.5 rounded">
                        {translateScale(booking.problemScale)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{booking.address}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-gray-200/60">
                      <span className="text-slate-500 font-semibold">{isNe ? "मूल्य निर्धारण:" : "Price Agreement:"}</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        {booking.finalAgreedCost ? (
                          <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            ✓ {isNe ? "तय भएको मूल्य:" : "Agreed:"} {booking.finalAgreedCost}
                          </span>
                        ) : (
                          <span className="text-slate-700 bg-gray-100 px-2 py-0.5 rounded-md">
                            {isNe ? "अनुमानित लागत:" : "Estimate:"} {booking.cost}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Technician Profile Row & Rating CTA */}
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-2">
                      <img src={booking.technicianAvatar} alt={booking.technicianName} className="w-8 h-8 rounded-full border border-gray-100 object-cover" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{language === "en" ? "Fixer Assigned" : "खटिएका प्राविधिक"}</span>
                        <span className="text-xs font-bold text-slate-800">{booking.technicianName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {booking.isAiDiagnostic && (
                        <button
                          id={`btn-diag-${booking.id}`}
                          onClick={() => setSelectedDiagnostic(booking)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#D7911D] bg-amber-50/40 text-[#D7911D] font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Sheet</span>
                        </button>
                      )}
                      
                      {booking.rating ? (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{booking.rating}/5</span>
                        </div>
                      ) : (
                        <button
                          id={`btn-rate-${booking.id}`}
                          onClick={() => setRatingBooking(booking)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#D7911D] hover:bg-[#b87814] text-slate-900 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <Star className="w-3 h-3 fill-slate-900" />
                          <span>{isNe ? "रेटिङ दिनुहोस्" : "Rate Fixer"}</span>
                        </button>
                      )}

                      <button
                        id={`btn-inv-${booking.id}`}
                        onClick={() => onViewInvoice(booking)}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-slate-600 font-bold text-[10px] flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>{language === "en" ? "Receipt" : "बिल"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Submitted Feedback Display on Booking Card */}
                  {booking.rating && (
                    <div className="mt-1 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-[11px] space-y-1">
                      <div className="flex justify-between items-center text-emerald-800 font-bold text-[10px]">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {isNe ? "तपाईंको प्रतिक्रिया:" : "Your Review:"}
                        </span>
                        <span className="text-slate-400 font-semibold">{booking.feedbackTimestamp || "Saved"}</span>
                      </div>
                      {booking.feedbackText && (
                        <p className="text-slate-700 italic font-medium text-[11px]">
                          "{booking.feedbackText}"
                        </p>
                      )}
                      {booking.feedbackPhotoUrl && (
                        <div className="mt-1 flex items-center gap-2">
                          <img
                            src={booking.feedbackPhotoUrl}
                            alt="Work preview"
                            className="w-10 h-10 rounded-lg object-cover border border-emerald-200"
                          />
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {isNe ? "संलग्न फोटो मर्मत कार्य" : "Attached work photo"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* PROACTIVE APPLIANCE SERVICING REMINDERS TAB */
          <div id="reminders-section" className="space-y-3.5">
            {/* Context Notice */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#D7911D] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {language === "en" 
                  ? "Based on past technician reports, Najikko Sathi calculates maintenance intervals. We automatically notify you before your water systems or electrical switchboards fail."
                  : "विगतका प्राविधिक रिपोर्टहरूको आधारमा, नजिकको साथीले मर्मतको समय तालिका गणना गर्दछ। तपाईंको पानी वा बिजुली आपूर्ति प्रणाली बिग्रिनु अघि नै हामी स्वतः सूचित गर्छौं।"}
              </p>
            </div>

            {/* Simulated Schedulers */}
            {bookings.filter(b => b.applianceName).map((b) => {
              // Calculate remaining days realistically. Let's make it look dynamic!
              const daysLeft = Math.max(3, b.nextServicingIntervalDays ? b.nextServicingIntervalDays - 60 : 30);
              const progressPercentage = Math.round(((b.nextServicingIntervalDays || 90) - daysLeft) / (b.nextServicingIntervalDays || 90) * 100);

              return (
                <div
                  id={`reminder-card-${b.id}`}
                  key={b.id}
                  className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{b.applianceName}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {language === "en" ? "Last checkup:" : "अन्तिम मर्मत:"} {b.date}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-bold">
                      {daysLeft <= 10 ? t.dueToday : `${t.dueIn} ${daysLeft} ${t.days}`}
                    </span>
                  </div>

                  {/* Servicing Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>{progressPercentage}% {language === "en" ? "Elapsed" : "समय बित्यो"}</span>
                      <span>{b.nextServicingIntervalDays} {language === "en" ? "days interval" : "दिनको अन्तराल"}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Booking Call to Action */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-indigo-500 animate-swing" />
                      <span>{language === "en" ? "Smart Reminders ON" : "स्मार्ट सूचना सक्रिय छ"}</span>
                    </div>
                    <button
                      id={`btn-remind-schedule-${b.id}`}
                      onClick={() => onScheduleService(b.categoryId, b.applianceName || "Appliance")}
                      className="px-3 py-1.5 bg-[#004021] hover:bg-[#003018] text-white font-bold text-[10px] rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      {t.scheduleService}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DIAGNOSTIC DETAILED OVERLAY SHEET */}
      {selectedDiagnostic && (
        <div id="diagnostic-overlay" className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl h-[80%] flex flex-col animate-slide-up shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D7911D]" />
                <h4 className="text-sm font-bold text-[#004021]">{language === "en" ? "AI Diagnostic Report" : "फिक्सिट एआई रिपोर्ट"}</h4>
              </div>
              <button
                id="diagnostic-close"
                onClick={() => setSelectedDiagnostic(null)}
                className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scroll Details */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#D7911D] font-bold uppercase tracking-wider">{t.problemIdentified}</span>
                  <span className="text-[10px] px-2.5 py-0.5 bg-red-100 text-red-700 border border-red-200 font-bold rounded-md">
                    {selectedDiagnostic.diagnosticDetails?.severity || "Major"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  {selectedDiagnostic.diagnosticDetails?.problemIdentified}
                </p>
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t.estimatedCost}</span>
                  <span className="text-sm font-bold text-slate-800 mt-1">{selectedDiagnostic.diagnosticDetails?.estimatedCostRange}</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{t.recommendedFixer}</span>
                  <span className="text-sm font-bold text-[#004021] mt-1">{selectedDiagnostic.diagnosticDetails?.recommendedFixer}</span>
                </div>
              </div>

              {/* AI Disclaimer & On-Site Price Negotiation Warning */}
              <div className="bg-amber-50/90 border-l-4 border-amber-500 p-3 rounded-r-2xl space-y-1 text-slate-700">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{language === "en" ? "Important Notice:" : "महत्वपूर्ण जानकारी:"}</span>
                </div>
                <p className="text-[11px] font-semibold leading-relaxed text-slate-700">
                  {language === "en" ? (
                    <>
                      <strong className="text-amber-900">AI can make mistakes.</strong> This estimated cost is an approximation based on photo analysis.
                      Once your technician arrives at your location, you and the technician can inspect the issue together and <strong className="text-amber-950 underline">fix/agree on the final price</strong> before starting the work.
                    </>
                  ) : (
                    <>
                      <strong className="text-amber-900">एआईबाट त्रुटि हुन सक्छ।</strong> यो अनुमानित लागत फोटो पहिचानमा आधारित प्रारम्भिक अनुमान मात्र हो।
                      बुकिङ पछि, प्राविधिक तपाईंको ठाउँमा आइपुगेपछि दुवै जना मिलेर समस्या प्रत्यक्ष जाँच गरी <strong className="text-amber-950 underline">अन्तिम मूल्य तय गर्न सक्नुहुन्छ।</strong>
                    </>
                  )}
                </p>
              </div>

              {/* Immediate Steps Stack */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{t.immediateSteps}</h5>
                <div className="space-y-2">
                  {selectedDiagnostic.diagnosticDetails?.immediateSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start p-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="w-5 h-5 bg-[#004021]/10 text-[#004021] text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* RATING & PHOTO FEEDBACK MODAL */}
      {ratingBooking && (
        <div id="rating-overlay" className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
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
                    {ratingBooking.technicianName} ({ratingBooking.categoryName})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setRatingBooking(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Star Rating Picker */}
            <div className="space-y-1.5 text-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <label className="text-xs font-extrabold text-slate-700 block">
                {isNe ? "मिस्त्रीको काम कस्तो लाग्यो? (१ देखि ५ तारा दिनुहोस्)" : "How was the service? (Tap 1 to 5 stars)"}
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

            {/* Feedback Review Text */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {isNe ? "प्रतिक्रिया वा टिप्पणी (ऐच्छिक):" : "Your Review / Feedback (Optional):"}
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={isNe ? "मर्मत काम र प्राविधिकबारे विचार लेख्नुहोस्..." : "Describe the repair outcome, cleanliness, and quality..."}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#004021] resize-none h-20"
              />
            </div>

            {/* Photo Attachment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {isNe ? "मर्मत भएको फोटो जोड्नुहोस् (फोटो प्रतिक्रिया):" : "Attach Photo of Completed Work:"}
              </label>

              {/* Sample Quick Photo Presets */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleSelectPresetPhoto("https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80", "Repaired Water Tap")}
                  className="flex flex-col items-center p-2 bg-gray-50 border border-gray-100 rounded-xl hover:border-amber-400 hover:bg-amber-50/50 transition-all text-center gap-1 cursor-pointer"
                >
                  <img src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80" alt="Preset" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-[9px] font-bold text-slate-700">{isNe ? "धारा मर्मत" : "Plumbing"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetPhoto("https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80", "Wiring Work")}
                  className="flex flex-col items-center p-2 bg-gray-50 border border-gray-100 rounded-xl hover:border-amber-400 hover:bg-amber-50/50 transition-all text-center gap-1 cursor-pointer"
                >
                  <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80" alt="Preset" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-[9px] font-bold text-slate-700">{isNe ? "स्विच बोर्ड" : "Electrical"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetPhoto("https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", "Serviced Appliance")}
                  className="flex flex-col items-center p-2 bg-gray-50 border border-gray-100 rounded-xl hover:border-amber-400 hover:bg-amber-50/50 transition-all text-center gap-1 cursor-pointer"
                >
                  <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" alt="Preset" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-[9px] font-bold text-slate-700">{isNe ? "सर्भिसिङ" : "Appliance"}</span>
                </button>
              </div>

              {/* Browse File Button */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-[#004021] p-3 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all bg-gray-50/50 hover:bg-emerald-50/30 gap-1"
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
                  {isNe ? "फोटो खिच्नुहोस् वा फोन ग्यालरीबाट छान्नुहोस्" : "Take Photo or Upload"}
                </span>
              </div>

              {/* Selected Image Indicator */}
              {selectedImage && (
                <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <img src={selectedImage} alt="selected" className="w-10 h-10 rounded-lg object-cover border border-emerald-300" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">{selectedImageName || "Photo Selected"}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">{isNe ? "फोटो संलग्न भयो ✓" : "Photo Attached ✓"}</span>
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

            {/* Submit Rating */}
            <button
              onClick={handleRatingSubmit}
              className="w-full py-3.5 bg-[#004021] hover:bg-[#003018] text-white rounded-2xl font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isNe ? "रेटिङ तथा प्रतिक्रिया बुझाउनुहोस्" : "Submit Rating & Photo Review"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Close Icon helper
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
