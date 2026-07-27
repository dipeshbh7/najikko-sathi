import React, { useState } from "react";
import { Menu, Bell, Search, Star, Sparkles, MapPin, Zap } from "lucide-react";
import { Language, ServiceCategory } from "../types";
import { SERVICE_CATEGORIES, TRANSLATIONS } from "../data";
import splashLogo from "../assets/images/regenerated_image_1785073739278.png";

interface HomeViewProps {
  language: Language;
  onOpenSidebar: () => void;
  onOpenNotifications: () => void;
  onSelectCategory: (category: ServiceCategory) => void;
  unreadNotificationsCount: number;
}

export default function HomeView({
  language,
  onOpenSidebar,
  onOpenNotifications,
  onSelectCategory,
  unreadNotificationsCount,
}: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const t = TRANSLATIONS[language];

  const filteredCategories = SERVICE_CATEGORIES.filter((cat) =>
    (language === "en" ? cat.nameEn : cat.nameNe)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // High fidelity featured card details exactly like mockup IMG-20260625-WA0011.jpg
  const featuredServices = [
    {
      id: "f1",
      provider: "Sita Rai",
      titleEn: "House Maid Service- 4 Rooms",
      titleNe: "घर सफाइ सेवा - ४ कोठा",
      priceEn: "Rs. 11000",
      priceNe: "रु ११,०००",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=60",
    },
    {
      id: "f2",
      provider: "Ramesh Khadka",
      titleEn: "Full Bathroom Set Installation",
      titleNe: "पूरा बाथरूम सेट जडान",
      priceEn: "Rs. 32500",
      priceNe: "रु ३२,५००",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=60",
    },
  ];

  const popularServices = [
    {
      id: "p1",
      provider: "Sunita Tamang",
      titleEn: "Emergency Kitchen Rewiring",
      titleNe: "भान्साको आपतकालीन वाइरिङ मर्मत",
      priceEn: "Rs. 2500",
      priceNe: "रु २,५००",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=60",
    },
    {
      id: "p2",
      provider: "Karan Shrestha",
      titleEn: "Wall Drilling & Drawer Mounting",
      titleNe: "भित्ता ड्रिलिङ र दराज जडान",
      priceEn: "Rs. 1500",
      priceNe: "रु १,५००",
      rating: 4.6,
      imageUrl: "https://images.unsplash.com/photo-1581101767113-1677fc2ebac8?w=400&auto=format&fit=crop&q=60",
    },
  ];

  // Helper to map Lucide icons dynamically
  const renderIcon = (iconName: string, color: string) => {
    const props = { className: "w-6 h-6", style: { color: color } };
    switch (iconName) {
      case "Plug":
        return <Zap {...props} />;
      case "Droplets":
        return <DropletsIcon {...props} />;
      case "Wrench":
        return <WrenchIcon {...props} />;
      case "Paintbrush":
        return <PaintbrushIcon {...props} />;
      case "Sparkles":
        return <Sparkles {...props} />;
      default:
        return <MessageSquareIcon {...props} />;
    }
  };

  return (
    <div id="home-view-scroll" className="flex-1 overflow-y-auto bg-gray-50 flex flex-col pb-24">
      {/* Branding top bar layout matching Sleek Interface exactly */}
      <div id="branding-bar" className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 select-none">
        <button
          id="btn-open-sidebar"
          onClick={onOpenSidebar}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-slate-700 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img src={splashLogo} alt="Logo" className="w-8 h-8 rounded-xl object-cover border border-[#004021]/15 shadow-xs" />
          <h1 className="text-[#004021] font-extrabold text-base uppercase tracking-tight">{t.appName}</h1>
        </div>
        <button
          id="btn-open-notify"
          onClick={onOpenNotifications}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-slate-700 relative transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#8E1851] rounded-full"></span>
          )}
        </button>
      </div>

      {/* Full width Sleek Search input */}
      <div id="home-search-container" className="px-6 mb-6 mt-4 select-none">
        <div className="relative flex items-center">
          <input
            id="home-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-gray-50 border border-gray-100 py-3 pl-12 pr-4 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#004021]/30 font-medium transition-all"
          />
          <div className="absolute left-4">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Service Categories Section with Sleek 2x3 Grid layout */}
      <div id="home-categories" className="px-6 mb-6 select-none">
        <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">{t.serviceCategories || "Service Categories"}</h2>
        <div id="categories-grid" className="grid grid-cols-3 gap-3">
          {filteredCategories.map((cat) => (
            <button
              id={`category-btn-${cat.id}`}
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="bg-white border border-gray-100 p-4 rounded-2xl flex flex-col items-center justify-center shadow-sm hover:border-[#004021] active:scale-[0.97] transition-all cursor-pointer"
            >
              {/* Category Icon with subtle bg matching its color and exact sizing */}
              <div
                className="w-10 h-10 mb-2 rounded-lg flex items-center justify-center bg-opacity-10"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                {renderIcon(cat.iconName, cat.color)}
              </div>
              <span className="text-[10px] font-semibold text-center text-gray-800 leading-snug">
                {language === "en" ? cat.nameEn : cat.nameNe}
              </span>
            </button>
          ))}
          {filteredCategories.length === 0 && (
            <p className="col-span-3 text-center text-xs text-slate-400 font-medium py-4">No categories match search.</p>
          )}
        </div>
      </div>

      {/* Featured Services Horizontal Scroll with Sleek design */}
      <div id="featured-scroll-container" className="px-6 mb-6 select-none">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t.featuredServices}</h2>
          <button
            onClick={() => {
              const matchedCat = SERVICE_CATEGORIES.find(c => c.id === "haracomert");
              if (matchedCat) onSelectCategory(matchedCat);
            }}
            className="text-[#D7911D] text-xs font-semibold hover:underline"
          >
            {t.viewMore || "See All"}
          </button>
        </div>

        {/* Horizontal Scroll Containers */}
        <div id="featured-cards-scroll" className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
          {featuredServices.map((srv) => (
            <div
              id={`featured-card-${srv.id}`}
              key={srv.id}
              onClick={() => {
                const matchedCat = SERVICE_CATEGORIES.find(c => c.id === (srv.id === "f1" ? "haracomert" : "plumber"));
                if (matchedCat) onSelectCategory(matchedCat);
              }}
              className="min-w-[240px] bg-white border border-gray-100 rounded-3xl p-4 shadow-sm relative overflow-hidden flex-shrink-0 w-64 snap-start hover:border-[#004021]/30 transition-all cursor-pointer"
            >
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-bold text-[#004021] z-10">
                {srv.provider}
              </div>
              <div className="w-full h-28 rounded-2xl overflow-hidden mb-3.5 bg-slate-100">
                <img src={srv.imageUrl} alt={srv.titleEn} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-1">
                  <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
                    {language === "en" ? srv.titleEn : srv.titleNe}
                  </h3>
                  <div className="flex items-center gap-0.5 text-[#D7911D] shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[10px] font-bold">{srv.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-gray-500">Starting from</span>
                  <span className="text-xs font-bold text-[#004021]">{language === "en" ? srv.priceEn : srv.priceNe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Services Horizontal Scroll with Sleek design */}
      <div id="popular-scroll-container" className="px-6 mb-6 select-none">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">{t.popularServices}</h2>
          <button
            onClick={() => {
              const matchedCat = SERVICE_CATEGORIES.find(c => c.id === "electrician");
              if (matchedCat) onSelectCategory(matchedCat);
            }}
            className="text-[#D7911D] text-xs font-semibold hover:underline"
          >
            {t.viewMore || "See All"}
          </button>
        </div>

        <div id="popular-cards-scroll" className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
          {popularServices.map((srv) => (
            <div
              id={`popular-card-${srv.id}`}
              key={srv.id}
              onClick={() => {
                const matchedCat = SERVICE_CATEGORIES.find(c => c.id === (srv.id === "p1" ? "electrician" : "handyman"));
                if (matchedCat) onSelectCategory(matchedCat);
              }}
              className="min-w-[240px] bg-white border border-gray-100 rounded-3xl p-4 shadow-sm relative overflow-hidden flex-shrink-0 w-64 snap-start hover:border-[#004021]/30 transition-all cursor-pointer"
            >
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg text-[10px] font-bold text-[#004021] z-10">
                {srv.provider}
              </div>
              <div className="w-full h-28 rounded-2xl overflow-hidden mb-3.5 bg-slate-100">
                <img src={srv.imageUrl} alt={srv.titleEn} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-1">
                  <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
                    {language === "en" ? srv.titleEn : srv.titleNe}
                  </h3>
                  <div className="flex items-center gap-0.5 text-[#D7911D] shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[10px] font-bold">{srv.rating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-gray-500">Starting from</span>
                  <span className="text-xs font-bold text-[#004021]">{language === "en" ? srv.priceEn : srv.priceNe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Inline Icon helpers
function DropletsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05z"></path>
      <path d="M17 18.5c1.37 0 2.5-1.14 2.5-2.53 0-.72-.35-1.41-1.07-2s-1.43-1.47-1.61-2.37c-.18.9-.71 1.77-1.43 2.35s-1.07 1.13-1.07 1.85c0 1.39 1.13 2.53 2.5 2.53z"></path>
    </svg>
  );
}

function WrenchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  );
}

function PaintbrushIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 22 1-1c1.4-1.4 2.4-3.2 3-5.2l.5-1.8H6.5l.5 1.8c.6 2 1.6 3.8 3 5.2l1 1Z"></path>
      <path d="M18.5 14h-13L5 10.5C4.6 9 5.5 8 7 8h10c1.5 0 2.4 1 2 2.5L18.5 14Z"></path>
      <path d="M8 8V4.5C8 3 9.5 2 11 2h2c1.5 0 3 1 3 2.5V8"></path>
    </svg>
  );
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
