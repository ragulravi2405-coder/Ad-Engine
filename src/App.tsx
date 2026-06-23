import React, { useState, useEffect } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { BrandingCampaign, AdType, AD_TYPES } from "./types";
import { motion, AnimatePresence } from "motion/react";

import SplashIntro from "./components/SplashIntro";
import AuthPortal from "./components/AuthPortal";
import PosterCanvas from "./components/PosterCanvas";
import VoiceStation from "./components/VoiceStation";
import GalleryHub from "./components/GalleryHub";

import { 
  Sparkles, 
  Building2, 
  Target, 
  Tag, 
  Video, 
  FileText, 
  Compass, 
  LogOut, 
  ChevronRight, 
  Image as ImageIcon, 
  HelpCircle, 
  CheckCircle,
  Menu,
  Layers,
  Wand2,
  Trash2,
  Info
} from "lucide-react";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<{ uid: string; email: string; displayName: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Dashboard & Navigation controls
  const [activeTab, setActiveTab] = useState<"generate" | "poster" | "voice" | "gallery">("generate");
  
  // Inputs Campaign Parameters
  const [companyName, setCompanyName] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [promoOffer, setPromoOffer] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [adType, setAdType] = useState<AdType>("Promotional Poster");

  // Core Campaign states
  const [campaigns, setCampaigns] = useState<BrandingCampaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<BrandingCampaign | null>(null);
  
  // Loading & generation status
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  // Manage Firebase user session auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "partner@adengine.ai",
          displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "My Startup"
        });
      } else {
        setUser(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch saved campaigns for the specific authenticated user
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`ad_engine_campaigns_${user.email}`);
      if (stored) {
        const parsed = JSON.parse(stored) as BrandingCampaign[];
        setCampaigns(parsed);
        if (parsed.length > 0) {
          setActiveCampaign(parsed[0]);
        }
      } else {
        setCampaigns([]);
        setActiveCampaign(null);
      }
      // Autofill company name on load
      setCompanyName(user.displayName);
    }
  }, [user]);

  // Sync campaigns to persistent storage whenever they are modified
  const saveCampaigns = (updatedList: BrandingCampaign[]) => {
    setCampaigns(updatedList);
    if (user) {
      localStorage.setItem(`ad_engine_campaigns_${user.email}`, JSON.stringify(updatedList));
    }
  };

  const handleSelectCampaignFromGallery = (c: BrandingCampaign) => {
    setActiveCampaign(c);
    // Autofill form inputs to match selected campaign
    setCompanyName(c.companyName);
    setProductDetails(c.productDetails);
    setPromoOffer(c.promoOffer);
    setTargetAudience(c.targetAudience);
    setAdType(c.adType as AdType);
    
    // Switch to generate to look at outputs
    setActiveTab("generate");
  };

  const handleDeleteCampaignFromGallery = (id: string) => {
    const updated = campaigns.filter((c) => c.id !== id);
    saveCampaigns(updated);
    if (activeCampaign?.id === id) {
      setActiveCampaign(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleUpdateActiveCampaign = (updated: BrandingCampaign) => {
    setActiveCampaign(updated);
    const updatedList = campaigns.map((c) => c.id === updated.id ? updated : c);
    saveCampaigns(updatedList);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setActiveCampaign(null);
    setCampaigns([]);
  };

  // Run the core generative intelligence pipeline via server proxy
  const handleRunGenerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !productDetails) {
      alert("Please provide the company name and core product properties.");
      return;
    }

    setGenerating(true);
    setGenerationStep("Querying Ad Engine marketing mastermind...");
    
    try {
      const response = await fetch("/api/generate-branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          productDetails,
          promoOffer,
          targetAudience,
          adType
        })
      });

      if (!response.ok) {
        throw new Error("Gemini brand indexing failed. Please verify API Key.");
      }

      setGenerationStep("Polishing pastel branding codes...");
      const parsedData = await response.json();

      const newCampaign: BrandingCampaign = {
        id: "campaign_" + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        companyName,
        productDetails,
        promoOffer,
        targetAudience,
        adType,
        ...parsedData
      };

      const updatedCampaigns = [newCampaign, ...campaigns];
      saveCampaigns(updatedCampaigns);
      setActiveCampaign(newCampaign);
      
      setGenerationStep("Branding generated! ✨");
      setTimeout(() => {
        setGenerating(false);
        setActiveTab("poster"); // Automatically guide the user to the Poster Canvas customizer!
      }, 1000);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Branding synthesis encountered an issue. Please retry.");
      setGenerating(false);
    }
  };

  if (showSplash) {
    return <SplashIntro onComplete={() => setShowSplash(false)} />;
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen artistic-gradient-bg flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-artistic-pink to-artistic-blue logo-sphere-shape animate-spin-slow shadow-lg shadow-artistic-pink/20 mb-4" />
        <p className="text-xs font-bold text-[#4A4E69] font-mono tracking-wider uppercase">Evaluating auth credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPortal onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div className="min-h-screen artistic-gradient-bg text-white flex flex-col font-sans relative pb-16">
      {/* Gentle ambient background fantasy blobs with intense animated pulsing glow */}
      <div className="absolute top-[8%] left-[5%] w-96 h-96 rounded-full bg-artistic-pink/30 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-artistic-blue/20 blur-3xl pointer-events-none" />
      <div className="absolute top-[60%] left-[20%] w-[400px] h-[400px] rounded-full bg-artistic-accent/15 blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Modern High-End Sticky Top Navigation bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-artistic-pink to-artistic-blue flex items-center justify-center shadow-lg border border-white/15 logo-sphere-shape animate-spin-slow">
            <Compass className="w-5 h-5 text-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(255,20,147,0.3)]">
              Ad Engine
              <span className="text-[9px] font-extrabold uppercase tracking-widest bg-artistic-pink/20 text-artistic-pink px-2.5 py-0.5 rounded-full border border-artistic-pink/30 shadow-[0_0_8px_rgba(255,20,147,0.4)]">
                Studio
              </span>
            </h1>
            <p className="text-[10px] text-artistic-blue font-extrabold leading-none uppercase tracking-widest mt-1">Artistic Branding Hub</p>
          </div>
        </div>

        {/* User indicator and logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-black text-white">
              {companyName || user.displayName}
            </span>
            <span className="text-[10px] text-artistic-blue font-mono tracking-wider truncate max-w-[150px] font-extrabold">
              {user.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/40 hover:text-red-400 shadow-md border border-white/10 flex items-center gap-2 text-white/80 font-black text-xs transition duration-200 active:scale-95 cursor-pointer"
            title="Sign Out of Engine"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Secondary Ribbon Navigation Tabs */}
      <div className="bg-slate-950/60 border-b border-white/10 px-6 py-3 flex overflow-x-auto gap-3 items-center scrollbar-none scroll-smooth">
        <button
          onClick={() => setActiveTab("generate")}
          className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "generate"
              ? "bg-gradient-to-r from-artistic-pink to-pink-600 text-white shadow-lg shadow-pink-500/20 border border-artistic-pink/30 scale-[1.02]"
              : "text-white/70 hover:text-white bg-slate-900/60 hover:bg-slate-900/95 border border-white/5"
          }`}
        >
          <Wand2 className="w-4 h-4 text-artistic-pink" />
          1. Brand Strategy
        </button>

        <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />

        <button
          onClick={() => setActiveTab("poster")}
          disabled={!activeCampaign}
          className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
            activeTab === "poster"
              ? "bg-gradient-to-r from-artistic-pink to-pink-600 text-white shadow-lg shadow-pink-500/20 border border-artistic-pink/30 scale-[1.02]"
              : "text-white/70 hover:text-white bg-slate-900/60 hover:bg-slate-900/95 border border-white/5"
          }`}
        >
          <Layers className="w-4 h-4 text-artistic-blue" />
          2. Visual Tuning (Posters)
        </button>

        <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />

        <button
          onClick={() => setActiveTab("voice")}
          disabled={!activeCampaign}
          className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
            activeTab === "voice"
              ? "bg-gradient-to-r from-artistic-pink to-pink-600 text-white shadow-lg shadow-pink-500/20 border border-artistic-pink/30 scale-[1.02]"
              : "text-white/70 hover:text-white bg-slate-900/60 hover:bg-slate-900/95 border border-white/5"
          }`}
        >
          <Video className="w-4 h-4 text-artistic-accent" />
          3. Audio & Video Scripts
        </button>

        <div className="h-6 w-[1px] bg-white/10 mx-1 shrink-0" />

        <button
          onClick={() => setActiveTab("gallery")}
          className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "gallery"
              ? "bg-gradient-to-r from-artistic-pink to-pink-600 text-white shadow-lg shadow-pink-500/20 border border-artistic-pink/30 scale-[1.02]"
              : "text-white/70 hover:text-white bg-slate-900/60 hover:bg-slate-900/95 border border-white/5"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Digital Vault ({campaigns.length})
        </button>
      </div>

      {/* Main Workspace Frame */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
        
        {/* Loading Overlay Spinner when generating */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-indigo-950/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-400 border-t-white animate-spin" />
                <Sparkles className="w-8 h-8 text-pink-300 absolute inset-0 m-auto animate-pulse" />
              </div>

              <h3 className="font-display text-2xl font-extrabold tracking-tight mb-2 uppercase">
                Ad Engine is Constructing Assets
              </h3>

              <p className="text-sm text-indigo-200 max-w-sm mx-auto font-mono">
                {generationStep}
              </p>

              {/* Tips */}
              <div className="mt-8 p-4 bg-white/10 rounded-2xl max-w-md border border-white/10 text-xs text-left text-indigo-100 leading-relaxed font-sans shadow-lg">
                <p className="font-bold mb-1 flex items-center gap-1">
                  <Info className="w-4 h-4 text-pink-300 shrink-0" /> Modern Marketing Tip
                </p>
                Visual overlays and strong, single-focused promotions have up to 4x higher CTR (Click Through Rate) on Pinterest and Facebook. Ad Engine utilizes custom pastel-shaded geometry overlays to achieve this.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab content rendering */}
        <div className="w-full">
          {/* TAB 1: GENERATE / BUSINESS INPUT PANEL */}
          {activeTab === "generate" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Form (Dashboard controls) */}
              <div className="lg:col-span-5 artistic-glass rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-artistic-pink via-artistic-accent to-artistic-blue" />
                
                <h3 className="font-display text-lg font-black text-white flex items-center gap-2 mb-1.5">
                  <Building2 className="w-5 h-5 text-artistic-blue" />
                  Dashboard Input deck
                </h3>
                <p className="text-xs text-white/70 mb-6 font-bold uppercase tracking-wider">Input credentials & launch creative pipeline</p>

                <form onSubmit={handleRunGenerator} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-[#FFB7C5] mb-1.5 uppercase tracking-wide font-mono">
                      🏢 Company or brand name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lavender Meadows Spa"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="artistic-input block w-full py-3 px-4 rounded-xl text-xs placeholder-white/35 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#FFB7C5] mb-1.5 uppercase tracking-wide font-mono">
                      🌸 Product or Service description
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Elegant botanical aromatherapy oils curated from local flowers, delivering ultimate serenity to your home."
                      value={productDetails}
                      onChange={(e) => setProductDetails(e.target.value)}
                      className="artistic-input block w-full py-3 px-4 rounded-xl text-xs placeholder-white/35 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#FFB7C5] mb-1.5 uppercase tracking-wide font-mono">
                      🏷️ Current Promotional Offer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 20% OFF Summer Serenity Box or Buy 1 Get 1 Free"
                      value={promoOffer}
                      onChange={(e) => setPromoOffer(e.target.value)}
                      className="artistic-input block w-full py-3 px-4 rounded-xl text-xs placeholder-white/35 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#FFB7C5] mb-1.5 uppercase tracking-wide font-mono">
                      🎯 Target Demographic / Audience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Working moms, busy professionals, yoga enthusiasts"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="artistic-input block w-full py-3 px-4 rounded-xl text-xs placeholder-white/35 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#FFB7C5] mb-1.5 uppercase tracking-wide font-mono">
                      📐 Advertisement target format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AD_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAdType(type)}
                          className={`p-2.5 rounded-xl border font-black text-[10px] text-left transition uppercase tracking-wider cursor-pointer ${
                            adType === type
                              ? "border-artistic-pink bg-artistic-pink/20 text-white shadow-md shadow-pink-500/20"
                              : "border-white/10 bg-slate-900/60 text-white/70 hover:bg-slate-900/90"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 py-3.5 px-4 rounded-xl bg-gradient-to-r from-artistic-pink to-pink-600 hover:scale-[1.01] active:scale-95 text-white font-extrabold text-xs transition duration-200 shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    🌸 Ignite Artistic Branding Engine
                  </button>
                </form>
              </div>

              {/* Right Output overview */}
              <div className="lg:col-span-7 space-y-6">
                {activeCampaign ? (
                  <div className="artistic-glass rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-artistic-pink/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
                    
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/15">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00E5FF] font-mono">Active Creative Blueprint</span>
                        <h4 className="font-display text-xl font-black text-white mt-1 drop-shadow-[0_2px_8px_rgba(255,20,147,0.3)]">{activeCampaign.companyName}</h4>
                      </div>
                      
                      <span className="text-[10px] font-extrabold px-3 py-1 bg-artistic-pink/25 text-white border border-artistic-pink/40 rounded-full">
                        {activeCampaign.adType}
                      </span>
                    </div>

                    <div className="space-y-5">
                      {/* Catchy Slogan overview */}
                      <div className="bg-[#8B5CF6]/15 p-4 rounded-2xl border border-[#8B5CF6]/30 shadow-md">
                        <span className="text-[9px] font-black text-artistic-pink uppercase tracking-widest font-mono block mb-1">Catchy Brand Slogan</span>
                        <p className="text-white font-display text-base font-black italic">
                          "{activeCampaign.slogan}"
                        </p>
                      </div>

                      {/* Poster Text outlines */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <span className="text-[9px] font-black text-artistic-blue uppercase tracking-widest font-mono">Action Banner Slogan</span>
                          <p className="text-white font-bold text-xs mt-1">{activeCampaign.headline}</p>
                        </div>
                        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10">
                          <span className="text-[9px] font-black text-artistic-accent uppercase tracking-widest font-mono">Sub-headline Copy</span>
                          <p className="text-white/90 text-xs mt-1">{activeCampaign.subheading}</p>
                        </div>
                      </div>

                      {/* Caption list preview */}
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black text-[#00E5FF] uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-artistic-blue" /> Copy Paste Social Description
                          </span>
                        </div>
                        <p className="text-white/90 text-xs leading-relaxed whitespace-pre-line font-medium border-t border-white/5 pt-2 mt-2">
                          {activeCampaign.socialCaption}
                        </p>
                      </div>

                      {/* Direct action links pointing layout tab */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => setActiveTab("poster")}
                          className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Layers className="w-4 h-4 text-pink-300" />
                          Modify Poster Layout (Visual Studio)
                        </button>
                        <button
                          onClick={() => setActiveTab("voice")}
                          className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <Video className="w-4 h-4 text-violet-500" />
                          Access Scene Script & Voice Studio
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/50 border border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col justify-center items-center h-full min-h-[300px]">
                    <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center border border-slate-100 shadow-sm mb-4">
                      <Wand2 className="w-6 h-6 text-slate-300" />
                    </div>
                    <h4 className="font-display text-sm font-extrabold text-slate-600 block">Waiting on Business Metric Feed</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                      Define your company details and primary product attributes on the left to activate the brand mastermind.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: POSTER CANVAS CUSTOMIZER */}
          {activeTab === "poster" && activeCampaign && (
            <PosterCanvas 
              campaign={activeCampaign} 
              onUpdateCampaign={handleUpdateActiveCampaign} 
            />
          )}

          {/* TAB 3: VOICE-OVER & SCRIPT STATION */}
          {activeTab === "voice" && activeCampaign && (
            <VoiceStation 
              campaign={activeCampaign} 
              onUpdateCampaign={handleUpdateActiveCampaign} 
            />
          )}

          {/* TAB 4: GALLERY */}
          {activeTab === "gallery" && (
            <GalleryHub 
              campaigns={campaigns} 
              onSelectCampaign={handleSelectCampaignFromGallery} 
              onDeleteCampaign={handleDeleteCampaignFromGallery} 
              activeCampaignId={activeCampaign?.id} 
            />
          )}
        </div>
      </main>

      {/* Embedded visual guide / informative floating tip */}
      <footer className="max-w-7xl w-full mx-auto px-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[10px] font-mono mt-auto">
        <span>© 2026 Ad Engine • Active Firebase Environment: data-ed0d6</span>
        <span className="mt-1 sm:mt-0 flex items-center gap-1 font-semibold text-[#7C3AED]">
          <Sparkles className="w-3.5 h-3.5" /> Ethereal Pastel Creative Engine Running Live
        </span>
      </footer>
    </div>
  );
}
