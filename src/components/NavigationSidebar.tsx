import React from "react";
import { X, Home, Calendar, MapPin, Headphones, Settings, User, LogOut } from "lucide-react";
import { Language } from "../types";
import { TRANSLATIONS } from "../data";
import splashLogo from "../assets/images/regenerated_image_1785073739278.png";

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNavigate: (view: "home" | "bookings" | "tracking" | "support" | "settings" | "profile") => void;
  onSignOut: () => void;
}

export default function NavigationSidebar({
  isOpen,
  onClose,
  language,
  onNavigate,
  onSignOut,
}: NavigationSidebarProps) {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  return (
    <div id="sidebar-overlay" className="absolute inset-0 bg-black/40 z-50 flex animate-fade-in">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Slide Drawer (Exactly 70% width or similar like image) */}
      <div
        id="sidebar-container"
        className="w-[280px] bg-white h-full shadow-2xl flex flex-col animate-slide-right p-5"
      >
        {/* Header Branding Bar with X close icon */}
        <div id="sidebar-header" className="flex justify-between items-center pb-6 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <img src={splashLogo} alt="Logo" className="w-8 h-8 rounded-xl object-cover border border-[#004021]/15 shadow-xs" />
            <span className="text-lg font-black tracking-tight text-[#004021]">{t.appName}</span>
          </div>
          <button
            id="sidebar-btn-close"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-50 transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items Stack */}
        <div id="sidebar-menu-items" className="flex-1 space-y-2">
          {/* Home */}
          <button
            id="sidebar-menu-home"
            onClick={() => {
              onNavigate("home");
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3 px-3.5 rounded-xl text-slate-700 hover:bg-[#004021]/5 hover:text-[#004021] transition-all font-semibold text-left text-sm"
          >
            <Home className="w-5 h-5 text-slate-500 hover:text-[#004021]" />
            <span>{t.navHome}</span>
          </button>

          {/* Bookings */}
          <button
            id="sidebar-menu-bookings"
            onClick={() => {
              onNavigate("bookings");
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3 px-3.5 rounded-xl text-slate-700 hover:bg-[#004021]/5 hover:text-[#004021] transition-all font-semibold text-left text-sm"
          >
            <Calendar className="w-5 h-5 text-slate-500 hover:text-[#004021]" />
            <span>{t.navBookings}</span>
          </button>

          {/* Tracking */}
          <button
            id="sidebar-menu-tracking"
            onClick={() => {
              onNavigate("tracking");
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3 px-3.5 rounded-xl text-slate-700 hover:bg-[#004021]/5 hover:text-[#004021] transition-all font-semibold text-left text-sm"
          >
            <MapPin className="w-5 h-5 text-slate-500 hover:text-[#004021]" />
            <span>{t.navTracking}</span>
          </button>

          {/* Customer Support */}
          <button
            id="sidebar-menu-support"
            onClick={() => {
              onNavigate("support");
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3 px-3.5 rounded-xl text-slate-700 hover:bg-[#004021]/5 hover:text-[#004021] transition-all font-semibold text-left text-sm"
          >
            <Headphones className="w-5 h-5 text-slate-500 hover:text-[#004021]" />
            <span>{t.navCustomerSupport}</span>
          </button>

          {/* Settings */}
          <button
            id="sidebar-menu-settings"
            onClick={() => {
              onNavigate("settings");
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3 px-3.5 rounded-xl text-slate-700 hover:bg-[#004021]/5 hover:text-[#004021] transition-all font-semibold text-left text-sm"
          >
            <Settings className="w-5 h-5 text-slate-500 hover:text-[#004021]" />
            <span>{t.navSettings}</span>
          </button>
        </div>

        {/* Lower-Anchored Divider, Profile & Sign Out */}
        <div id="sidebar-footer" className="pt-4 border-t border-gray-100">
          <button
            id="sidebar-menu-profile"
            onClick={() => {
              onNavigate("profile");
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3 px-3.5 rounded-xl text-slate-700 hover:bg-[#004021]/5 hover:text-[#004021] transition-all font-semibold text-left text-sm"
          >
            <User className="w-5 h-5 text-slate-500" />
            <span>{t.navMyProfile}</span>
          </button>

          <button
            id="sidebar-menu-signout"
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="w-full flex items-center gap-4 py-3 px-3.5 rounded-xl text-red-600 hover:bg-red-50 transition-all font-semibold text-left text-sm mt-1"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span>{t.navSignOut}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
