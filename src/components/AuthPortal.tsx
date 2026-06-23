import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { motion } from "motion/react";
import { Mail, Lock, Building2, ArrowRight, Sparkles, AlertCircle, Eye, EyeOff } from "lucide-react";

interface AuthPortalProps {
  onAuthSuccess: (user: User | { uid: string; email: string; displayName: string }) => void;
}

export default function AuthPortal({ onAuthSuccess }: AuthPortalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!isLogin && !companyName) {
      setError("Please specify your Company Name.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Custom branding metadata attached side-by-side
        onAuthSuccess({
          uid: userCredential.user.uid,
          email: userCredential.user.email || email,
          displayName: companyName || "My Startup"
        });
      }
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      // Give local context for errors and support safe recovery
      if (err.code === "auth/invalid-api-key") {
        setError("Invalid client authorization credentials. Please use 'Demo Sandbox' mode below.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in!");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Incorrect email or password. Please verify your credentials.");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Elegant, barrier-free developer preview sandbox option
    onAuthSuccess({
      uid: "ad-engine-guest-id",
      email: "demo@adengine.ai",
      displayName: "Fantasy Brands Inc."
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center artistic-gradient-bg px-4 py-12 relative overflow-hidden">
      {/* Dynamic fantasy atmospheric glowing bubbles */}
      <div className="absolute top-1/10 left-1/10 w-80 h-80 rounded-full bg-artistic-pink/40 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/10 right-1/10 w-96 h-96 rounded-full bg-artistic-blue/40 blur-3xl" />
      <div className="absolute top-1/2 left-3/4 w-72 h-72 rounded-full bg-artistic-accent/20 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-artistic-pink to-artistic-blue logo-sphere-shape shadow-lg shadow-artistic-pink/40 mb-4 animate-spin-slow">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="font-display text-3.5xl font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(255,20,147,0.4)]">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-artistic-pink via-artistic-accent to-artistic-blue">Ad Engine</span>
          </h2>
          <p className="text-xs text-artistic-blue mt-2 max-w-xs mx-auto uppercase tracking-widest font-black drop-shadow-[0_1px_5px_rgba(0,229,255,0.4)]">
            Artistic AI Branding Studio
          </p>
        </div>

        {/* Card housing the form with Artistic Glass */}
        <div className="artistic-glass rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-artistic-pink via-artistic-accent to-artistic-blue" />

          {/* Toggle Tab */}
          <div className="flex bg-slate-950/65 p-1 rounded-2xl mb-8 border border-white/10">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 text-center py-2.5 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
                isLogin 
                  ? "bg-gradient-to-r from-artistic-pink to-pink-600 text-white shadow-md shadow-pink-500/25" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 text-center py-2.5 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
                !isLogin 
                  ? "bg-gradient-to-r from-artistic-pink to-pink-600 text-white shadow-md shadow-pink-500/25" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium mb-6 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-extrabold text-artistic-blue mb-1.5 uppercase tracking-wider">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-[#00E5FF]/70" />
                  </div>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Lumina Skin Care"
                    className="artistic-input block w-full pl-11 pr-4 py-3 rounded-xl text-xs placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold text-artistic-blue mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#00E5FF]/70" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enquiry@luminaskin.com"
                  className="artistic-input block w-full pl-11 pr-4 py-3 rounded-xl text-xs placeholder-white/30 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-artistic-blue mb-1.5 uppercase tracking-wider">
                Password / Branding Access Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#00E5FF]/70" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="artistic-input block w-full pl-11 pr-10 py-3 rounded-xl text-xs placeholder-white/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/50 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-artistic-pink to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-black text-xs uppercase tracking-wider transition duration-200 shadow-lg shadow-pink-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Activating Studio...
                </>
              ) : (
                <>
                  {isLogin ? "Summon Ad Engine" : "Confirm Branding Key"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Divider */}
          <div className="relative my-6 text-center select-none flex items-center justify-center">
            <span className="absolute inset-y-1/2 left-0 right-0 border-t border-white/10 pointer-events-none" />
            <span className="relative bg-[#0d051a] px-4 py-1 text-[9px] uppercase font-black tracking-widest text-[#00E5FF] border border-white/10 rounded-full shadow-inner">
              Instant trials & sandboxing
            </span>
          </div>

          {/* Frictionless One-Click Demo Mode button */}
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-artistic-blue/50 bg-[#00E5FF]/5 hover:bg-[#00E5FF]/15 text-[#00E5FF] font-extrabold text-xs transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer shadow-md shadow-cyan-500/5 hover:border-artistic-blue"
          >
            <Sparkles className="w-4 h-4 text-artistic-accent animate-pulse" />
            Launch Artistic Guest Mode (Offline Sandbox)
          </button>
        </div>

        {/* Footer info showing credential security */}
        <p className="text-[10px] text-center text-white/80 font-mono mt-6 font-bold uppercase tracking-widest bg-slate-950/40 py-2.5 px-4 rounded-2xl border border-white/5 max-w-sm mx-auto backdrop-blur-md">
          🌸 Synced securely with active Firebase database environment
        </p>
      </motion.div>
    </div>
  );
}
