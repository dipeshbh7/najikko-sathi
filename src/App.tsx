import React, { useState, useEffect } from "react";
import { Home, Calendar, MapPin, User, Sparkles, X, Globe, Bell, FileText, CheckCircle, Smartphone } from "lucide-react";
import { Language, Booking, NotificationItem, JobStatus } from "./types";
import { SERVICE_CATEGORIES, INITIAL_BOOKINGS, TRANSLATIONS, SERVICE_PROVIDERS } from "./data";
import splashLogo from "./assets/images/regenerated_image_1785073739278.png";
import userAvatar from "./assets/images/regenerated_image_1785073319397.png";
import AuthView from "./components/AuthView";
import NavigationSidebar from "./components/NavigationSidebar";
import CustomerSupport from "./components/CustomerSupport";
import BookingsView from "./components/BookingsView";
import TrackingView from "./components/TrackingView";
import FixitAI from "./components/FixitAI";
import HomeView from "./components/HomeView";

export default function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [splashProgress, setSplashProgress] = useState(0);
  const [language, setLanguage] = useState<Language>("en");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [activeView, setActiveView] = useState<"home" | "bookings" | "tracking" | "profile" | "support" | "settings">("home");

  // Splash screen 3 second timer
  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000; // 3 seconds requirement

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setSplashProgress(pct);
      if (elapsed >= duration) {
        clearInterval(interval);
        setShowSplash(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-01",
      titleEn: "Welcome to Najikko Sathi!",
      titleNe: "नजिकको साथीमा स्वागत छ!",
      bodyEn: "Tap AI Sathi camera to diagnose any household issue instantly.",
      bodyNe: "कुनै पनि समस्या तत्काल जाँच गर्न एआई साथी क्यामेरा ट्याप गर्नुहोस्।",
      timestamp: "10:14 AM",
      read: false,
    },
  ]);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedCategoryToBook, setSelectedCategoryToBook] = useState<any | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  // Manual Booking form inputs
  const [problemScale, setProblemScale] = useState("Moderate");
  const [problemDetails, setProblemDetails] = useState("");
  const [address, setAddress] = useState("");

  const t = TRANSLATIONS[language];

  // Auto-trigger appliance reminders
  useEffect(() => {
    if (!user) return;
    const interval = setTimeout(() => {
      // Find past geyser booking and trigger notification
      const geyserReminder: NotificationItem = {
        id: `remind-${Date.now()}`,
        titleEn: "Routine Geyser Servicing Due!",
        titleNe: "नियमित गिजर मर्मत सम्झाउनी!",
        bodyEn: "Your Geyser is due for its 90-day checkup to prevent calcium buildup.",
        bodyNe: "तपाईंको गिजरलाई क्याल्सियम जम्न नदिन ९० दिने नियमित जाँचको आवश्यकता छ।",
        timestamp: "Just now",
        read: false,
      };
      setNotifications((prev) => [geyserReminder, ...prev]);
    }, 15000); // 15s after logging in

    return () => clearTimeout(interval);
  }, [user]);

  // Handle category clicked on Home -> Open Booking Modal
  const handleSelectCategory = (cat: any) => {
    setSelectedCategoryToBook(cat);
    // Auto-fill some defaults based on category
    setProblemScale("Moderate");
    setProblemDetails("");
    setAddress("Pulchowk, Lalitpur"); // Typical local default
  };

  // Perform Booking Submission
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryToBook) return;

    // Pick a mock technician for this category
    const providers = SERVICE_PROVIDERS.filter((p) => p.category === selectedCategoryToBook.id);
    const selectedTech = providers.length > 0 ? providers[0] : SERVICE_PROVIDERS[0];

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      categoryId: selectedCategoryToBook.id,
      categoryName: selectedCategoryToBook.nameEn,
      technicianName: selectedTech.name,
      technicianPhone: selectedTech.phone,
      technicianAvatar: selectedTech.avatarUrl,
      problemScale: problemScale,
      problemDetails: problemDetails || `${selectedCategoryToBook.nameEn} general service request`,
      status: JobStatus.DISPATCHED,
      date: new Date().toISOString().split("T")[0],
      cost: problemScale === "Minor" ? "Rs. 600" : problemScale === "Moderate" ? "Rs. 1,200" : "Rs. 3,500",
      address: address || "Kathmandu, Nepal",
      isAiDiagnostic: false,
      applianceName: selectedCategoryToBook.nameEn,
      nextServicingIntervalDays: 90,
      nextServicingReminderDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    setBookings((prev) => [newBooking, ...prev]);
    setActiveBooking(newBooking);
    setSelectedCategoryToBook(null);

    // Trigger immediate "Dispatched" push notification
    const dispatchPush: NotificationItem = {
      id: `p-${Date.now()}`,
      titleEn: "Technician Dispatched!",
      titleNe: "प्राविधिक पठाइयो!",
      bodyEn: `${selectedTech.name} (${selectedCategoryToBook.nameEn} Specialist) is traveling to your location.`,
      bodyNe: `${selectedTech.name} (${selectedCategoryToBook.nameNe} विशेषज्ञ) तपाईंको स्थानतर्फ प्रस्थान गर्नुभएको छ।`,
      timestamp: "Just now",
      read: false,
    };
    setNotifications((prev) => [dispatchPush, ...prev]);

    // Go to Live tracking automatically!
    setActiveView("tracking");
  };

  // Confirm booking triggered by Fixit AI card
  const handleBookFixerFromAI = (catId: string, aiDiagnosticDetails: any) => {
    const matchedCategory = SERVICE_CATEGORIES.find((c) => c.id === catId) || SERVICE_CATEGORIES[0];
    const providers = SERVICE_PROVIDERS.filter((p) => p.category === catId);
    const selectedTech = providers.length > 0 ? providers[0] : SERVICE_PROVIDERS[0];

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      categoryId: catId,
      categoryName: matchedCategory.nameEn,
      technicianName: selectedTech.name,
      technicianPhone: selectedTech.phone,
      technicianAvatar: selectedTech.avatarUrl,
      problemScale: aiDiagnosticDetails.severity === "Minor" ? "Minor" : aiDiagnosticDetails.severity === "Moderate" ? "Moderate" : "Major",
      problemDetails: aiDiagnosticDetails.problemIdentified,
      status: JobStatus.DISPATCHED,
      date: new Date().toISOString().split("T")[0],
      cost: aiDiagnosticDetails.estimatedCostRange,
      address: "Baneshwor, Kathmandu",
      isAiDiagnostic: true,
      diagnosticDetails: aiDiagnosticDetails,
      applianceName: matchedCategory.nameEn,
      nextServicingIntervalDays: 90,
      nextServicingReminderDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    setBookings((prev) => [newBooking, ...prev]);
    setActiveBooking(newBooking);

    // AI dispatch notification
    const aiPush: NotificationItem = {
      id: `p-ai-${Date.now()}`,
      titleEn: "AI Auto-Dispatched Fixer!",
      titleNe: "एआई द्वारा स्वतः मिस्त्री खटाइयो!",
      bodyEn: `${selectedTech.name} is arriving with specific tools for: ${aiDiagnosticDetails.problemIdentified.slice(0, 30)}...`,
      bodyNe: `${selectedTech.name} तपाईंको समस्या समाधान गर्न विशेष उपकरणहरू सहित आउँदै हुनुहुन्छ।`,
      timestamp: "Just now",
      read: false,
    };
    setNotifications((prev) => [aiPush, ...prev]);

    setActiveView("tracking");
  };

  // Schedule routine checkup from reminders scheduler
  const handleScheduleRoutineRemind = (catId: string, applianceName: string) => {
    const matchedCategory = SERVICE_CATEGORIES.find((c) => c.id === catId) || SERVICE_CATEGORIES[0];
    setSelectedCategoryToBook(matchedCategory);
    setProblemScale("Moderate");
    setProblemDetails(`Routine interval maintenance for ${applianceName}`);
    setAddress("Pulchowk, Lalitpur");
  };

  const handleUpdateBookingStatus = (bookingId: string, status: JobStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
    if (activeBooking && activeBooking.id === bookingId) {
      setActiveBooking((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleJobComplete = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: JobStatus.COMPLETED } : b))
    );
    // Keep active booking so user can review/rate right away or clear when done
  };

  const handleSaveFeedback = (
    bookingId: string,
    rating: number,
    feedbackText: string,
    feedbackPhotoUrl?: string
  ) => {
    const timestamp = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              rating,
              feedbackText,
              feedbackPhotoUrl,
              feedbackTimestamp: timestamp,
            }
          : b
      )
    );
    if (activeBooking && activeBooking.id === bookingId) {
      setActiveBooking(null);
    }
    // Automatically redirect to Home screen after rating and feedback submission
    setActiveView("home");
  };

  const handleUpdateFinalCost = (bookingId: string, finalAgreedCost: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, finalAgreedCost } : b))
    );
    if (activeBooking && activeBooking.id === bookingId) {
      setActiveBooking((prev) => (prev ? { ...prev, finalAgreedCost } : null));
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // View rendered based on active navigation route
  const renderActiveTabContent = () => {
    switch (activeView) {
      case "bookings":
        return (
          <BookingsView
            language={language}
            bookings={bookings}
            onScheduleService={handleScheduleRoutineRemind}
            onViewInvoice={(b) => setSelectedInvoice(b)}
            onSaveFeedback={handleSaveFeedback}
            onUpdateFinalCost={handleUpdateFinalCost}
          />
        );
      case "tracking":
        return (
          <TrackingView
            language={language}
            activeBooking={activeBooking}
            trackingState={null}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onJobComplete={handleJobComplete}
            onSaveFeedback={handleSaveFeedback}
            onUpdateFinalCost={handleUpdateFinalCost}
          />
        );
      case "support":
        return (
          <CustomerSupport
            language={language}
            onBackToHome={() => setActiveView("home")}
          />
        );
      case "profile":
        return (
          <div id="profile-pane" className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 select-none">
            {/* Header info */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 text-center space-y-3 relative">
              <img
                src={userAvatar}
                alt="Profile Avatar"
                className="w-20 h-20 rounded-full mx-auto border-2 border-[#004021] object-cover"
              />
              <div>
                <h3 className="text-base font-bold text-slate-800">{user?.name || "Dipesh Bhattarai"}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{user?.email || "dipeshbhattarai879@gmail.com"}</span>
              </div>

              {/* Language toggle shown in profile */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">{t.languageLabel}</span>
                <button
                  id="profile-lang-toggle"
                  onClick={() => setLanguage(language === "en" ? "ne" : "en")}
                  className="px-3 py-1.5 border border-[#D7911D] text-[#D7911D] rounded-full font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{language === "en" ? "नेपाली (Nepali)" : "English (अंग्रेजी)"}</span>
                </button>
              </div>
            </div>

            {/* General Settings options */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs text-slate-700 font-semibold">
              <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <span>{language === "en" ? "Account Details" : "खाता विवरण"}</span>
                <span className="text-slate-400 text-[10px]">▶</span>
              </div>
              <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <span>{language === "en" ? "Saved Home Address" : "बचत गरिएको ठेगाना"}</span>
                <span className="text-[#004021] text-[11px] truncate max-w-[150px]">Pulchowk, Lalitpur</span>
              </div>
              <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <span>{language === "en" ? "App Security / PIN" : "सुरक्षा पिन"}</span>
                <span className="text-slate-400 text-[10px]">▶</span>
              </div>
              <button
                id="profile-btn-signout"
                onClick={() => setUser(null)}
                className="w-full p-4 flex justify-between items-center bg-red-50/40 text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <span>{t.navSignOut}</span>
                <span className="text-red-400 text-[10px]">▶</span>
              </button>
            </div>
          </div>
        );
      case "settings":
        return (
          <div id="settings-pane" className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 select-none">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t.navSettings}</h3>
            <div className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span>{language === "en" ? "Push Notifications" : "पुश सूचनाहरू"}</span>
                <div className="w-9 h-5 bg-[#004021] rounded-full p-0.5 flex items-center justify-end">
                  <div className="bg-white w-4 h-4 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold pt-3 border-t border-slate-100">
                <span>{language === "en" ? "Location Access" : "स्थान पहुँच"}</span>
                <div className="w-9 h-5 bg-[#004021] rounded-full p-0.5 flex items-center justify-end">
                  <div className="bg-white w-4 h-4 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <HomeView
            language={language}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenNotifications={() => {
              setIsNotificationOpen(true);
              markAllNotificationsAsRead();
            }}
            onSelectCategory={handleSelectCategory}
            unreadNotificationsCount={unreadNotificationsCount}
          />
        );
    }
  };

  // Splash screen renderer for opening app
  const renderSplashScreen = () => (
    <div
      id="splash-screen-overlay"
      className="fixed inset-0 z-[9999] bg-[#004021] flex flex-col items-center justify-between p-6 select-none animate-fade-in"
    >
      <div className="w-full max-w-md flex justify-end pt-3">
        <button
          onClick={() => setShowSplash(false)}
          className="text-emerald-200/70 hover:text-white text-xs font-bold px-3.5 py-1 rounded-full border border-emerald-800/60 bg-emerald-950/40 cursor-pointer active:scale-95 transition-all"
        >
          {language === "en" ? "Skip" : "छोड्नुहोस्"}
        </button>
      </div>

      {/* Center Logo & Branding */}
      <div className="flex flex-col items-center text-center space-y-5 my-auto">
        <div className="relative">
          <div className="absolute -inset-4 bg-[#D7911D]/30 rounded-[42px] blur-xl animate-pulse"></div>
          <img
            src={splashLogo}
            alt="Najik ko Sathi App Icon"
            className="w-40 h-40 rounded-[36px] object-cover shadow-2xl border-2 border-[#D7911D]/50 relative z-10"
          />
        </div>

        <div className="space-y-1 pt-3">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>Najik</span>
            <span className="text-[#D7911D]">ko</span>
            <span>Sathi</span>
          </h1>
          <p className="text-xs font-bold text-emerald-200/90 tracking-wide">
            साथी सधैं, हरेक बाटोमा
          </p>
        </div>
      </div>

      {/* Progress Bar for 3 seconds */}
      <div className="w-full max-w-xs space-y-2 text-center pb-8">
        <div className="w-full h-1.5 bg-emerald-950/90 rounded-full overflow-hidden p-0.5 border border-emerald-800/40">
          <div
            className="h-full bg-gradient-to-r from-[#D7911D] to-amber-300 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${splashProgress}%` }}
          ></div>
        </div>
        <span className="text-[10px] font-extrabold text-emerald-300/70 tracking-widest uppercase">
          {language === "en" ? "Opening App..." : "एप खुल्दैछ..."}
        </span>
      </div>
    </div>
  );

  // If user is not logged in, enforce authentication flow exactly
  if (!user) {
    return (
      <>
        {showSplash && renderSplashScreen()}
        <AuthView
          language={language}
          setLanguage={setLanguage}
          onLoginSuccess={(userData) => setUser(userData)}
        />
      </>
    );
  }

  return (
    <div id="app-wrapper-frame" className="h-screen w-full max-w-md mx-auto bg-white flex flex-col overflow-hidden relative font-sans shadow-sm">
      {showSplash && renderSplashScreen()}
      {/* Native Status Bar */}
        <div id="app-status-bar" className="bg-white px-6 py-3 flex justify-between items-center text-xs font-bold text-slate-700 select-none z-10 shrink-0">
          <span>10:14</span>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-500">5G</span>
            <div className="w-5 h-2.5 border border-slate-600 rounded-sm p-0.5 flex items-center">
              <div className="bg-slate-700 h-full w-3/4 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Dynamic Service Headers (unless displaying home/login/support) */}
        {activeView !== "home" && (
          <div id="app-screen-sub-header" className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white select-none shrink-0">
            <div className="flex items-center gap-3">
              <button
                id="btn-back-to-home"
                onClick={() => {
                  setActiveView("home");
                  setIsSidebarOpen(false);
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                ◀
              </button>
              <h2 className="text-sm font-extrabold text-[#004021] tracking-tight">
                {activeView === "bookings" ? t.bookingsLedger : activeView === "tracking" ? t.navTracking : activeView === "support" ? t.supportTitle : activeView === "settings" ? t.navSettings : t.navMyProfile}
              </h2>
            </div>
            <button
              id="header-hamburger"
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-600"
            >
              <span className="font-extrabold text-sm">☰</span>
            </button>
          </div>
        )}

        {/* Global Floating Active Job Bar (if user is in another screen and job is active) */}
        {activeBooking && activeView !== "tracking" && (
          <button
            id="active-job-banner"
            onClick={() => setActiveView("tracking")}
            className="mx-4 mt-2 px-4 py-2.5 bg-gradient-to-r from-[#004021] to-[#006030] text-white rounded-xl shadow-md border border-[#D7911D] flex justify-between items-center animate-pulse z-10 shrink-0 text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D7911D]" />
              <span className="text-xs font-bold">{t.activeJobBanner}</span>
            </div>
            <span className="text-[10px] font-black uppercase bg-[#D7911D] text-[#004021] px-2 py-0.5 rounded">
              {t.navTracking} ▶
            </span>
          </button>
        )}

        {/* Active Tab Screen Area */}
        <div id="app-screen-view" className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
          {renderActiveTabContent()}
        </div>

        {/* Fixit AI screen triggered inside the same frame (when the Center button is clicked) */}
        {activeView === "settings" && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col pt-12 pb-24">
            <FixitAI language={language} onBookFixer={handleBookFixerFromAI} />
          </div>
        )}

        {/* SLIDE-OUT MENU NAVIGATION DRAWER (Slide out card overlay) */}
        <NavigationSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          language={language}
          onNavigate={(view) => {
            if (view === "settings") {
              // Redirect Settings button to Fixit AI screen inside mock framework
              setActiveView("settings");
            } else {
              setActiveView(view);
            }
          }}
          onSignOut={() => setUser(null)}
        />

        {/* DIRECT CATEGORY BOOKING MODAL */}
        {selectedCategoryToBook && (
          <div id="booking-modal-overlay" className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end">
            <div id="booking-modal-box" className="bg-white rounded-t-3xl p-5 space-y-4 animate-slide-up">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-[#004021]">{t.newBookingTitle}</h3>
                <button
                  id="booking-modal-close"
                  onClick={() => setSelectedCategoryToBook(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form id="booking-form" onSubmit={handleConfirmBooking} className="space-y-3.5">
                {/* Category card display */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🛠️</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {language === "en" ? selectedCategoryToBook.nameEn : selectedCategoryToBook.nameNe}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#004021]">
                    {language === "en" ? selectedCategoryToBook.priceEn : selectedCategoryToBook.priceNe}
                  </span>
                </div>

                {/* Problem Scale Segment (Minor, Moderate, Major) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">{t.problemScale}</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="scale"
                        checked={problemScale === "Minor"}
                        onChange={() => setProblemScale("Minor")}
                        className="accent-[#004021]"
                      />
                      <span>{t.minor}</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="scale"
                        checked={problemScale === "Moderate"}
                        onChange={() => setProblemScale("Moderate")}
                        className="accent-[#004021]"
                      />
                      <span>{t.moderate}</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="scale"
                        checked={problemScale === "Major"}
                        onChange={() => setProblemScale("Major")}
                        className="accent-[#004021]"
                      />
                      <span>{t.major}</span>
                    </label>
                  </div>
                </div>

                {/* Service Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{t.addressLabel}</label>
                  <input
                    id="booking-address-input"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.enterAddress}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#004021]/15 focus:border-[#004021] font-semibold"
                  />
                </div>

                {/* Problem details text field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Details</label>
                  <textarea
                    id="booking-details-input"
                    value={problemDetails}
                    onChange={(e) => setProblemDetails(e.target.value)}
                    placeholder={t.descPlaceholder}
                    rows={2}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#004021]/15 focus:border-[#004021] font-medium"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    id="booking-cancel-btn"
                    type="button"
                    onClick={() => setSelectedCategoryToBook(null)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-500 active:scale-95 transition-all cursor-pointer text-center"
                  >
                    {t.cancel}
                  </button>
                  <button
                    id="booking-confirm-btn"
                    type="submit"
                    className="flex-1 py-2.5 bg-[#004021] hover:bg-[#003018] text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer text-center"
                  >
                    {t.confirmBooking}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* POPUP NOTIFICATION PANEL OVERLAY */}
        {isNotificationOpen && (
          <div id="notification-overlay" className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end select-none">
            <div className="bg-white rounded-t-3xl max-h-[75%] flex flex-col shadow-2xl animate-slide-up">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#004021]" />
                  <h4 className="text-sm font-bold text-[#004021]">{t.notificationLabel}</h4>
                </div>
                <button
                  id="notify-close"
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-3xs flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <h5 className="text-xs font-bold text-slate-800">
                        {language === "en" ? n.titleEn : n.titleNe}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        {language === "en" ? n.bodyEn : n.bodyNe}
                      </p>
                      <span className="block text-[9px] text-slate-400 font-bold pt-1">{n.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DETAILED RECEIPT / INVOICE OVERLAY */}
        {selectedInvoice && (
          <div id="invoice-overlay" className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl p-5 space-y-4 animate-slide-up shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-[#3038A4]" />
                  <h3 className="text-sm font-black text-slate-800">{language === "en" ? "Service Invoice" : "सेवा विजक / बिल"}</h3>
                </div>
                <button
                  id="invoice-close"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Receipt Body */}
              <div id="receipt-sheet" className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 text-xs">
                <div className="flex justify-between font-bold text-slate-400 text-[10px] uppercase">
                  <span>Invoice: #{selectedInvoice.id}</span>
                  <span>Date: {selectedInvoice.date}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{language === "en" ? "Appliance / Task:" : "उपकरण / कार्य:"}</span>
                    <span>{selectedInvoice.applianceName || selectedInvoice.categoryName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>{language === "en" ? "Service Type:" : "सेवा प्रकार:"}</span>
                    <span>{selectedInvoice.categoryName} Specialist</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>{language === "en" ? "Address:" : "ठेगाना:"}</span>
                    <span className="text-right truncate max-w-[180px]">{selectedInvoice.address}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-dashed border-slate-200 flex justify-between items-baseline">
                  <span className="font-extrabold text-[#004021] text-xs uppercase">{language === "en" ? "Total Charge:" : "कुल रकम:"}</span>
                  <span className="text-lg font-black text-[#004021]">{selectedInvoice.cost}</span>
                </div>

                <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl border border-emerald-200 text-center font-bold text-[10px] uppercase flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Paid via Cash/eSewa on delivery</span>
                </div>
              </div>

              <button
                id="invoice-btn-done"
                onClick={() => setSelectedInvoice(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* FIXED BOTTOM NAVIGATION BAR LAYOUT (Sleek Interface design 5-tab bar) */}
        <div id="bottom-nav-bar" className="h-20 bg-white border-t border-gray-100 flex items-center justify-between px-4 pb-2 shrink-0 z-10 relative select-none">
          
          {/* Home Tab */}
          <button
            id="nav-tab-home"
            onClick={() => setActiveView("home")}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 transition-all cursor-pointer ${
              activeView === "home" ? "text-[#004021]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide">{t.navHome}</span>
          </button>

          {/* Bookings Tab */}
          <button
            id="nav-tab-bookings"
            onClick={() => setActiveView("bookings")}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 transition-all cursor-pointer ${
              activeView === "bookings" ? "text-[#004021]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide">{t.navBookings}</span>
          </button>

          {/* Fixit AI Large Center Floating Action Camera Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 select-none">
            <button
              id="nav-tab-fixit-camera"
              onClick={() => {
                setActiveView("settings");
              }}
              className="w-16 h-16 rounded-full bg-[#D7911D] border-4 border-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer relative group"
            >
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {/* Highlight star decoration */}
              <Sparkles className="w-4 h-4 text-white absolute -top-1 -right-1 animate-pulse" />
            </button>
            <span className="block text-[8px] font-bold text-center text-[#004021] mt-1.5 uppercase tracking-wider">{t.navFixitAi}</span>
          </div>

          {/* Spacer for center protruding button */}
          <div className="w-16"></div>

          {/* Tracking Tab */}
          <button
            id="nav-tab-tracking"
            onClick={() => setActiveView("tracking")}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 transition-all cursor-pointer ${
              activeView === "tracking" ? "text-[#004021]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide">{t.navTracking}</span>
          </button>

          {/* Profile Tab */}
          <button
            id="nav-tab-profile"
            onClick={() => setActiveView("profile")}
            className={`flex flex-col items-center gap-1 py-1 px-3.5 transition-all cursor-pointer ${
              activeView === "profile" ? "text-[#004021]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] font-bold tracking-wide">{t.navProfile}</span>
          </button>

        </div>

        {/* Home Indicator line */}
        <div id="phone-home-indicator" className="h-6 bg-white w-full flex justify-center items-center pb-2 select-none shrink-0 border-t border-gray-50">
          <div className="w-32 h-1 bg-slate-200 rounded-full"></div>
        </div>
    </div>
  );
}
