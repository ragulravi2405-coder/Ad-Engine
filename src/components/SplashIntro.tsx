import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Compass, Lightbulb } from "lucide-react";

interface SplashIntroProps {
  onComplete: () => void;
}

export default function SplashIntro({ onComplete }: SplashIntroProps) {
  const [rotation, setRotation] = useState(0);
  const [statusText, setStatusText] = useState("Igniting engine...");

  useEffect(() => {
    // Rotation increments mimicking complex boot sequence
    const interval = setInterval(() => {
      setRotation((prev) => prev + 90);
    }, 800);

    const txtTimer1 = setTimeout(() => setStatusText("Formulating pastel palettes..."), 800);
    const txtTimer2 = setTimeout(() => setStatusText("Calibrating creative vectors..."), 1600);
    const txtTimer3 = setTimeout(() => setStatusText("Ready to brand! ✨"), 2400);
    const endTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(txtTimer1);
      clearTimeout(txtTimer2);
      clearTimeout(txtTimer3);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden artistic-gradient-bg">
      {/* Soft atmospheric background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-artistic-pink/30 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-artistic-blue/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.2, filter: "blur(8px)" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        {/* Spectacular Rotating Geometric Constellation logo (Ad Engine) - Styled with Artistic Flair Shape */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 60, damping: 12 }}
            className="w-28 h-28 relative flex items-center justify-center"
          >
            {/* Expanding/orbiting nodes inspired by neural networks & modern abstract logos */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-artistic-pink/60 animate-spin-slow" />
            
            {/* Overlapping spinning colored capsule petals representing marketing multi-channels */}
            <div className="absolute w-20 h-20 bg-gradient-to-tr from-artistic-pink to-artistic-blue logo-sphere-shape opacity-75 shadow-lg shadow-artistic-pink/30" />
            
            {/* The core engine power icon */}
            <div className="absolute inset-4 bg-slate-950/90 rounded-full shadow-lg flex items-center justify-center border-2 border-artistic-blue/50 shadow-artistic-blue/20">
              <Compass className="w-8 h-8 text-artistic-blue animate-pulse" />
            </div>
          </motion.div>

          {/* Sparkle decorative icons around the logo */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-3 -right-3 p-1.5 bg-[#150F2C] rounded-full shadow-[0_0_12px_rgba(255,20,147,0.6)] border border-[#FF1493]/60"
          >
            <Sparkles className="w-4 h-4 text-artistic-pink" />
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.3, 1], x: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
            className="absolute -bottom-1 -left-3 p-1.5 bg-[#150F2C] rounded-full shadow-[0_0_12px_rgba(255,215,0,0.6)] border border-[#FFD700]/60"
          >
            <Lightbulb className="w-4 h-4 text-artistic-accent" />
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ letterSpacing: "1px", opacity: 0 }}
          animate={{ letterSpacing: "5px", opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-display text-5xl font-black text-white uppercase mt-4 drop-shadow-[0_0_15px_rgba(255,20,147,0.7)]"
        >
          Ad Engine
        </motion.h1>

        {/* Subtitle */}
        <p className="mt-2 text-xs font-bold uppercase tracking-[4px] text-artistic-blue font-sans drop-shadow-[0_1px_2px_rgba(0,229,255,0.4)]">
          Autonomous Artistic Branding Hub
        </p>

        {/* Status indicator */}
        <div className="mt-12 flex flex-col items-center">
          <div className="flex space-x-1.5 justify-center items-center mb-2">
            <div className="w-2 h-2 bg-artistic-pink rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_8px_#FF1493]" />
            <div className="w-2 h-2 bg-artistic-accent rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_8px_#FFD700]" />
            <div className="w-2 h-2 bg-artistic-blue rounded-full animate-bounce shadow-[0_0_8px_#00E5FF]" />
          </div>
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-extrabold text-white font-mono uppercase tracking-wider bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm"
          >
            {statusText}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
