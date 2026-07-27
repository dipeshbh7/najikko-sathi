import React, { useState } from "react";
import { Search, Calendar, CreditCard, MessageSquare, UserCheck, MessageCircle, X, Send, Phone, Mail, Home } from "lucide-react";
import { Language } from "../types";
import { TRANSLATIONS } from "../data";

interface CustomerSupportProps {
  language: Language;
  onBackToHome: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function CustomerSupport({ language, onBackToHome }: CustomerSupportProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "bot",
      text: language === "en" 
        ? "Namaste! Welcome to Najikko Sathi support. How can I help you today?" 
        : "नमस्ते! नजिकको साथी सपोर्टमा स्वागत छ। म तपाईंलाई कसरी मद्दत गर्न सक्छु?",
      time: "10:14 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const t = TRANSLATIONS[language];

  const commonQuestions = [
    {
      q: language === "en" ? "How to book a fixer?" : "मिस्त्री कसरी बुक गर्ने?",
      a: language === "en" 
        ? "Simply tap any service on the home screen, select your problem scale, enter your address, and hit Confirm!" 
        : "गृह स्क्रिनमा रहेको कुनै पनि सेवामा ट्याप गर्नुहोस्, समस्याको गम्भीरता छनोट गर्नुहोस्, आफ्नो ठेगाना राख्नुहोस्, र कन्फर्म थिच्नुहोस्!"
    },
    {
      q: language === "en" ? "My fixer didn't show up. What now?" : "मेरो मिस्त्री आउनुभएन। अब के गर्ने?",
      a: language === "en" 
        ? "Go to Bookings, select the active job, and tap the call button. You can also start a live chat with our support team immediately." 
        : "बुकिङमा जानुहोस्, सक्रिय काम चयन गर्नुहोस्, र कल बटन थिच्नुहोस्। तपाईं तुरुन्तै हाम्रो ग्राहक सहायता टोलीसँग कुराकानी सुरु गर्न सक्नुहुन्छ।"
    },
    {
      q: language === "en" ? "How to fixer is Negxn to book?" : "मिस्त्री बुक गर्न कति शुल्क लाग्छ?",
      a: language === "en" 
        ? "Fixer booking costs vary based on minor (Rs. 300-800), moderate (Rs. 800-1500), or major (Rs. 1500+) scales. Estimates are shown in the app before booking." 
        : "मिस्त्री बुकिङ शुल्क सानो (रु ३००-८००), मध्यम (रु ८००-१५००), वा ठूलो (रु १५००+) गम्भीरतामा आधारित हुन्छ। बुकिङ गर्नु अघि नै एपमा अनुमानित खर्च देखाइन्छ।"
    }
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: inputText,
      time: "10:15 AM",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate Bot Response after 800ms
    setTimeout(() => {
      let botText = "";
      const lower = userMsg.text.toLowerCase();

      if (lower.includes("booking") || lower.includes("book") || lower.includes("बुकिङ")) {
        botText = language === "en"
          ? "I see you have a query about booking. You can easily book technicians from our home screen, or use the camera to let Fixit AI diagnose the issue automatically!"
          : "मैले बुझें, तपाईंको बुकिङ सम्बन्धी प्रश्न छ। तपाईं हाम्रो गृह स्क्रिनबाट प्राविधिकहरू बुक गर्न सक्नुहुन्छ, वा हाम्रो फिक्सिट एआई प्रयोग गर्न सक्नुहुन्छ!";
      } else if (lower.includes("money") || lower.includes("payment") || lower.includes("price") || lower.includes("पैसा") || lower.includes("भुक्तानी")) {
        botText = language === "en"
          ? "We accept Cash on Delivery and all digital payment services in Nepal like eSewa, Khalti, and fonepay once the service is successfully completed."
          : "हामी सेवा सफलतापूर्वक सम्पन्न भएपछि नेपालका इसेवा, खल्ती र फोनपे जस्ता डिजिटल भुक्तानी सेवाहरू स्वीकार गर्छौं।";
      } else {
        botText = language === "en"
          ? "Thank you for sharing. A support specialist is joining this conversation within 2 minutes. Please hold on!"
          : "जानकारीको लागि धन्यवाद। हाम्रो सहायता प्रतिनिधि २ मिनेट भित्र यो च्याटमा जोडिनुहुनेछ। कृपया केही समय प्रतीक्षा गर्नुहोस्!";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: botText,
          time: "10:15 AM",
        },
      ]);
    }, 800);
  };

  const filteredQuestions = commonQuestions.filter((item) =>
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGridButtonClick = (topic: string) => {
    setIsChatOpen(true);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: "bot",
        text: language === "en" 
          ? `I've opened a session for: "${topic}". Please tell me more details about your issue.`
          : `मैले "${topic}" को लागि सेसन सुरु गरेको छु। कृपया आफ्नो समस्याको विस्तृत विवरण दिनुहोस्।`,
        time: "10:14 AM",
      }
    ]);
  };

  return (
    <div id="support-screen" className="flex-1 flex flex-col bg-gray-50 relative h-full">
      {/* Scrollable Content (Matches exact stack in image IMG-20260625-WA0009.jpg) */}
      <div id="support-scrollable-body" className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
        {/* Center house logo placeholder */}
        <div id="support-logo-container" className="flex flex-col items-center mt-4 mb-6">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200 shadow-sm mb-3">
            {/* Exactly replicates the house logo shown in support screen */}
            <Home className="w-10 h-10 text-[#D7911D]" />
          </div>
          <h2 className="text-2xl font-bold text-[#004021] tracking-tight">{t.appName}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{t.supportTitle}</p>
        </div>

        {/* Full-width help search bar */}
        <div id="support-search-wrapper" className="relative mb-6">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="support-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.howCanWeHelp}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#004021]/10 focus:border-[#004021] shadow-sm font-medium"
          />
        </div>

        {/* Balanced 2x2 grid buttons */}
        <div id="support-grid" className="grid grid-cols-2 gap-3.5 mb-6">
          {/* Booking Issues */}
          <button
            id="support-grid-booking"
            onClick={() => handleGridButtonClick(t.bookingIssues)}
            className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center text-center hover:border-[#004021] hover:bg-gray-50 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mb-2 text-red-500">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{t.bookingIssues}</span>
          </button>

          {/* Payment Questions */}
          <button
            id="support-grid-payment"
            onClick={() => handleGridButtonClick(t.paymentQuestions)}
            className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center text-center hover:border-[#004021] hover:bg-gray-50 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{t.paymentQuestions}</span>
          </button>

          {/* Service Feedback */}
          <button
            id="support-grid-feedback"
            onClick={() => handleGridButtonClick(t.serviceFeedback)}
            className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center text-center hover:border-[#004021] hover:bg-gray-50 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2 text-[#3038A4]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{t.serviceFeedback}</span>
          </button>

          {/* Profile Help */}
          <button
            id="support-grid-profile"
            onClick={() => handleGridButtonClick(t.profileHelp)}
            className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col items-center text-center hover:border-[#004021] hover:bg-gray-50 active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-2 text-purple-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{t.profileHelp}</span>
          </button>
        </div>

        {/* Full-width "Start a Live Chat" button */}
        <button
          id="support-btn-live-chat"
          onClick={() => setIsChatOpen(true)}
          className="w-full py-3 bg-[#3038A4] hover:bg-[#252b80] text-white font-semibold rounded-xl flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] transition-all cursor-pointer mb-8"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t.startLiveChat}</span>
        </button>

        {/* "Common Questions" section */}
        <div id="support-faq-section" className="mb-6">
          <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">{t.commonQuestions}</h3>
          <div className="space-y-3.5">
            {filteredQuestions.map((faq, index) => (
              <details
                id={`support-faq-detail-${index}`}
                key={index}
                className="group bg-white border border-gray-100 rounded-2xl p-3.5 shadow-2xs [&_summary::-webkit-details-marker]:hidden cursor-pointer"
              >
                <summary className="flex justify-between items-center list-none outline-none">
                  <span className="text-xs font-semibold text-slate-800 group-open:text-[#004021]">{faq.q}</span>
                  <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed border-t border-gray-100 pt-2 font-medium">
                  {faq.a}
                </p>
              </details>
            ))}
            {filteredQuestions.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4 font-medium">No results found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Fixed footer with email (left) and "Call Us" button (right) */}
      <div id="support-footer-fixed" className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 px-6 flex items-center justify-between z-10 select-none">
        {/* Email Left */}
        <div className="flex items-center gap-2 max-w-[60%]">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
            <Mail className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">{t.footerEmail}</span>
            <span className="text-xs text-slate-700 font-semibold truncate select-all">support@najikkosathi.com</span>
          </div>
        </div>

        {/* Call Us Right */}
        <a
          id="support-btn-call"
          href="tel:9800000000"
          className="px-4 py-2 bg-[#004021] hover:bg-[#003018] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{t.btnCallUs}</span>
        </a>
      </div>

      {/* LIVE CHAT SIMULATOR MODAL */}
      {isChatOpen && (
        <div id="support-chat-modal" className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div id="support-chat-box" className="bg-white rounded-t-3xl h-[85%] flex flex-col shadow-2xl animate-slide-up">
            {/* Header */}
            <div id="support-chat-header" className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#004021] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  NS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{t.appName} Support</h4>
                  <span className="text-[10px] text-[#004021] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Online
                  </span>
                </div>
              </div>
              <button
                id="support-chat-close"
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div id="support-chat-history" className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#004021] text-white rounded-tr-none"
                        : "bg-white border border-gray-100 text-slate-800 rounded-tl-none shadow-xs"
                    }`}
                  >
                    <p className="font-medium">{msg.text}</p>
                    <span className={`block text-[9px] mt-1 text-right ${msg.sender === "user" ? "text-white/70" : "text-slate-400"}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Inputs Footer */}
            <div id="support-chat-inputs" className="p-3.5 border-t border-gray-100 flex items-center gap-2 bg-white pb-6">
              <input
                id="support-chat-input-text"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={language === "en" ? "Type your message..." : "आफ्नो सन्देश टाइप गर्नुहोस्..."}
                className="flex-1 px-4 py-2 bg-gray-100 border border-transparent rounded-full text-xs focus:outline-none focus:bg-white focus:border-gray-100"
              />
              <button
                id="support-chat-btn-send"
                onClick={handleSendMessage}
                className="p-2.5 bg-[#004021] hover:bg-[#003018] text-white rounded-full active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
