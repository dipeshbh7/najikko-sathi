import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Smartphone, Globe, Sparkles } from "lucide-react";
import { Language } from "../types";
import { TRANSLATIONS } from "../data";
import OnboardingView from "./OnboardingView";
import splashLogo from "../assets/images/regenerated_image_1785073739278.png";

interface AuthViewProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export default function AuthView({ language, setLanguage, onLoginSuccess }: AuthViewProps) {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const t = TRANSLATIONS[language];

  if (showOnboarding) {
    return (
      <OnboardingView
        language={language}
        setLanguage={setLanguage}
        onFinishOnboarding={() => setShowOnboarding(false)}
      />
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone) {
      setError(language === "en" ? "Please enter your mobile number or email" : "कृपया आफ्नो मोबाइल नम्बर वा इमेल प्रविष्ट गर्नुहोस्");
      return;
    }
    if (!password) {
      setError(language === "en" ? "Please enter your password" : "कृपया आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: emailOrPhone.includes("@") ? emailOrPhone.split("@")[0] : "Dipesh Bhattarai",
        email: emailOrPhone.includes("@") ? emailOrPhone : "dipeshbhattarai879@gmail.com",
      });
    }, 800);
  };

  const handleBypass = () => {
    onLoginSuccess({
      name: "Dipesh Bhattarai",
      email: "dipeshbhattarai879@gmail.com",
    });
  };

  return (
    <div id="auth-screen-container" className="h-screen w-full max-w-md mx-auto bg-white flex flex-col overflow-hidden relative font-sans shadow-sm">
        {/* Status Bar */}
        <div id="auth-status-bar" className="bg-white px-6 py-3 flex justify-between items-center text-xs font-semibold text-slate-700 select-none">
          <span>10:14</span>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-500">5G</span>
            <div className="w-5 h-2.5 border border-slate-600 rounded-sm p-0.5 flex items-center">
              <div className="bg-slate-700 h-full w-3/4 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Top Header Actions in auth: View Intro + Language Switcher */}
        <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-10 pointer-events-none">
          <button
            id="auth-intro-toggle"
            onClick={() => setShowOnboarding(true)}
            className="pointer-events-auto flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-emerald-300 text-[#004021] bg-emerald-50/80 hover:bg-emerald-100 transition-colors font-medium shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            {language === "en" ? "View Intro" : "सुरुवाती जानकारी"}
          </button>
          <button
            id="auth-lang-toggle"
            onClick={() => setLanguage(language === "en" ? "ne" : "en")}
            className="pointer-events-auto flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border border-[#D7911D] text-[#D7911D] hover:bg-[#D7911D]/10 transition-colors font-medium shadow-xs"
          >
            <Globe className="w-3 h-3" />
            {language === "en" ? "नेपाली" : "English"}
          </button>
        </div>

        {/* Content */}
        <div id="auth-scroll-content" className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
          {/* Brand Logo Section */}
          <div id="auth-logo-section" className="flex flex-col items-center mt-6 mb-8">
            <div className="relative mb-3">
              <img
                src={splashLogo}
                alt="Najik ko Sathi App Icon"
                className="w-24 h-24 rounded-3xl object-cover border-2 border-[#D7911D]/40 shadow-md"
              />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#004021]">{t.appName}</h1>
            <p className="text-xs font-bold text-[#D7911D] tracking-wide mt-0.5">साथी सधैं, हरेक बाटोमा</p>
            <h2 className="text-sm font-bold text-slate-800 mt-3">{t.loginTitle}</h2>
            <p className="text-xs text-slate-500 text-center max-w-xs mt-1">
              {t.loginSubtitle}
            </p>
          </div>

          {/* Form */}
          <form id="auth-login-form" onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div id="auth-error-banner" className="text-xs bg-red-50 text-red-600 p-2.5 rounded-lg text-center font-medium border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{t.inputPhoneEmail}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  id="auth-input-login"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => {
                    setEmailOrPhone(e.target.value);
                    setError("");
                  }}
                  placeholder="98XXXXXXXX / email@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004021]/20 focus:border-[#004021] bg-gray-50"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600">{t.inputPassword}</label>
                <a href="#" className="text-[11px] text-[#3038A4] hover:underline font-medium">{t.forgotPassword}</a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="auth-input-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#004021]/20 focus:border-[#004021] bg-gray-50"
                />
                <button
                  id="auth-toggle-pwd-vis"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="auth-btn-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-semibold rounded-xl text-white bg-[#004021] hover:bg-[#003018] active:scale-[0.98] transition-all flex justify-center items-center shadow-md cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                t.btnLogin
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div id="auth-social-divider" className="relative my-6 text-center select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-400">{t.orContinueWith}</span>
          </div>

          {/* Federated Sign Ins (Stacked vertically exactly like image) */}
          <div id="auth-federated-stack" className="space-y-2.5">
            <button
              id="auth-btn-google"
              onClick={handleBypass}
              className="w-full py-2 px-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center gap-2.5 text-sm text-slate-700 font-medium active:scale-[0.99] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.19 2.69 1.182 6.645l4.084 3.12z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.5h6.455c-.277 1.482-1.114 2.736-2.373 3.582l3.69 2.864c2.155-1.986 3.418-4.91 3.418-8.573z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.266 14.235A7.018 7.018 0 0 1 4.91 12c0-.79.136-1.545.355-2.235L1.182 6.645A11.905 11.905 0 0 0 0 12c0 1.936.464 3.764 1.282 5.39l3.984-3.155z"
                />
                <path
                  fill="#34A853"
                  d="M12 19.091c-1.845 0-3.482-.718-4.69-1.891l-4.028 3.19C5.336 22.845 8.445 24 12 24c4.73 0 8.718-2.69 10.727-6.645l-3.69-2.864a7.077 7.077 0 0 1-7.037 4.6z"
                />
              </svg>
              <span>{t.btnGoogle}</span>
            </button>

            <button
              id="auth-btn-apple"
              onClick={handleBypass}
              className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white flex items-center justify-center gap-2.5 text-sm font-medium active:scale-[0.99] transition-all cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94 1.07.08 2.15-.52 2.81-1.33" />
              </svg>
              <span>{t.btnApple}</span>
            </button>

            <button
              id="auth-btn-facebook"
              onClick={handleBypass}
              className="w-full py-2 px-4 rounded-xl border border-gray-100 bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center gap-2.5 text-sm font-medium active:scale-[0.99] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{t.btnFacebook}</span>
            </button>

            <button
              id="auth-btn-other-email"
              onClick={handleBypass}
              className="w-full py-2 px-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center gap-2.5 text-sm text-slate-700 font-medium active:scale-[0.99] transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>{t.btnEmail}</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-auto pt-6 text-center">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <button
              id="auth-btn-signup"
              type="button"
              onClick={handleBypass}
              className="text-xs font-semibold text-[#004021] hover:underline"
            >
              {t.signUp}
            </button>
          </div>
        </div>

        {/* Home Indicator */}
        <div id="auth-home-indicator" className="h-6 bg-white w-full flex justify-center items-center pb-2 select-none">
          <div className="w-32 h-1 bg-gray-200 rounded-full"></div>
        </div>
    </div>
  );
}
