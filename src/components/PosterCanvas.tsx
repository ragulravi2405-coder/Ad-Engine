import { useState, useRef, useEffect } from "react";
import { BrandingCampaign } from "../types";
import { 
  Download, 
  RotateCw, 
  Sparkles, 
  Undo, 
  Type, 
  Layout, 
  Layers, 
  Image as ImageIcon 
} from "lucide-react";

interface PosterCanvasProps {
  campaign: BrandingCampaign;
  onUpdateCampaign: (updated: BrandingCampaign) => void;
}

const PASTEL_GRADIENT_PRESETS = [
  {
    name: "Artistic Sakura Cherry Blossom",
    value: "linear-gradient(135deg, #FFB7C5 0%, #A2D2FF 50%, #FFD166 100%)",
    colors: ["#FFB7C5", "#A2D2FF", "#FFD166"]
  },
  {
    name: "Iridescent Dream",
    value: "linear-gradient(135deg, #FFCCD5 0%, #E8DBFC 50%, #D6ECFF 100%)",
    colors: ["#FFCCD5", "#E8DBFC", "#D6ECFF"]
  },
  {
    name: "Mint Fantasy",
    value: "linear-gradient(135deg, #D2F7EE 0%, #E8DBFC 50%, #FAF9F6 100%)",
    colors: ["#D2F7EE", "#E8DBFC", "#FAF9F6"]
  },
  {
    name: "Golden Sorbet",
    value: "linear-gradient(135deg, #FAF0D7 0%, #FFD6EC 50%, #D6ECFF 100%)",
    colors: ["#FAF0D7", "#FFD6EC", "#D6ECFF"]
  },
  {
    name: "Aether Twilight",
    value: "linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)",
    colors: ["#3A1C71", "#D76D77", "#FFAF7B"]
  },
  {
    name: "Minimal Alabaster",
    value: "linear-gradient(135deg, #FAF9F6 0%, #F1F0EA 50%, #E5E4DE 100%)",
    colors: ["#FAF9F6", "#F1F0EA", "#E5E4DE"]
  }
];

export default function PosterCanvas({ campaign, onUpdateCampaign }: PosterCanvasProps) {
  const [selectedBackgroundIndex, setSelectedBackgroundIndex] = useState(0);
  const [useAiBackdrop, setUseAiBackdrop] = useState(false);
  const [generatingBackdrop, setGeneratingBackdrop] = useState(false);
  const [cardOpacity, setCardOpacity] = useState(0.85);
  const [borderRadius, setBorderRadius] = useState(24);
  const [textColor, setTextColor] = useState("#1E293B");
  const [layoutStyle, setLayoutStyle] = useState<"center" | "split" | "bottom" | "minimal">("center");
  const [fontSizeRatio, setFontSizeRatio] = useState(1);
  const [customText, setCustomText] = useState({
    headline: campaign.headline,
    subheading: campaign.subheading,
    promoCallout: campaign.promoCallout,
    slogan: campaign.slogan
  });

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize campaign text when a new campaign loads
  useEffect(() => {
    setCustomText({
      headline: campaign.headline,
      subheading: campaign.subheading,
      promoCallout: campaign.promoCallout,
      slogan: campaign.slogan
    });
    // If campaign has an existing backdrop url, auto-enable it
    if (campaign.aiBackdropUrl) {
      setUseAiBackdrop(true);
    } else {
      setUseAiBackdrop(false);
    }
  }, [campaign]);

  // Handle call to our Express `/api/generate-backdrop` using the generated AI prompt
  const generateAiBackground = async () => {
    setGeneratingBackdrop(true);
    try {
      const response = await fetch("/api/generate-backdrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: campaign.posterTheme?.backgroundImagePrompt || campaign.productDetails
        })
      });
      const data = await response.json();
      if (data.imageUrl) {
        onUpdateCampaign({
          ...campaign,
          aiBackdropUrl: data.imageUrl
        });
        setUseAiBackdrop(true);
      } else {
        alert(data.error || "Failed to generate AI Backdrop.");
      }
    } catch (err) {
      console.error(err);
      alert("Encountered connection issues generating AI Backdrop. Verify API Key is set.");
    } finally {
      setGeneratingBackdrop(false);
    }
  };

  // Convert the live-view markup into a clean pixel-perfect Canvas for PNG download
  const downloadPosterPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Helper to draw clean gradients
    const drawBackground = () => {
      if (useAiBackdrop && campaign.aiBackdropUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1200, 1200);
          drawPosterContent();
        };
        img.src = campaign.aiBackdropUrl;
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 1200, 1200);
        const activePreset = PASTEL_GRADIENT_PRESETS[selectedBackgroundIndex];
        gradient.addColorStop(0, activePreset.colors[0]);
        gradient.addColorStop(0.5, activePreset.colors[1]);
        gradient.addColorStop(1, activePreset.colors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 1200);
        
        // Add beautifully stylized abstract vector shapes for professional flair
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.arc(1000, 200, 350, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.beginPath();
        ctx.arc(200, 1000, 400, 0, Math.PI * 2);
        ctx.fill();

        drawPosterContent();
      }
    };

    const drawPosterContent = () => {
      // Dimensions
      const margin = 80;
      let cardX = margin;
      let cardY = margin;
      let cardW = 1200 - margin * 2;
      let cardH = 1200 - margin * 2;

      // Adjust size based on layout style selection
      if (layoutStyle === "split") {
        cardW = 550;
        cardH = 1200 - margin * 2;
      } else if (layoutStyle === "bottom") {
        cardY = 650;
        cardH = 1200 - margin - 655;
      } else if (layoutStyle === "minimal") {
        cardX = margin + 100;
        cardW = 1200 - (margin + 100) * 2;
        cardY = margin + 150;
        cardH = 1200 - (margin + 150) * 2;
      }

      // Draw glassmorphism rounded overlay panel
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${cardOpacity})`;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 4;
      
      // Draw rounded rectangle path
      ctx.beginPath();
      ctx.moveTo(cardX + borderRadius, cardY);
      ctx.lineTo(cardX + cardW - borderRadius, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + borderRadius);
      ctx.lineTo(cardX + cardW, cardY + cardH - borderRadius);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - borderRadius, cardY + cardH);
      ctx.lineTo(cardX + borderRadius, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - borderRadius);
      ctx.lineTo(cardX, cardY + borderRadius);
      ctx.quadraticCurveTo(cardX, cardY, cardX + borderRadius, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shadow overlay
      ctx.shadowColor = "rgba(100, 110, 140, 0.15)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;
      ctx.restore();

      // Draw poster copywriting texts
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      
      // Setup dynamic scaling ratios
      const baseTitleSize = 58 * fontSizeRatio;
      const baseSubheadingSize = 28 * fontSizeRatio;
      const baseSloganSize = 22 * fontSizeRatio;

      // Vertical offset helper
      let writeY = cardY + 120;

      // 1. Draw Slogan
      ctx.font = `600 ${baseSloganSize}px 'Outfit', sans-serif`;
      ctx.fillStyle = "rgba(124, 58, 237, 0.9)"; // Beautiful deep brand purple accent
      ctx.fillText(customText.slogan.toUpperCase(), cardX + cardW / 2, writeY);
      writeY += 100;

      // 2. Headline containing multiple lines if necessary
      ctx.font = `800 ${baseTitleSize}px 'Outfit', sans-serif`;
      ctx.fillStyle = textColor;
      
      const words = customText.headline.split(" ");
      let line = "";
      const maxLineWidth = cardW - 120;
      const lines = [];

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && i > 0) {
          lines.push(line);
          line = words[i] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      for (let k = 0; k < lines.length; k++) {
        ctx.fillText(lines[k].trim(), cardX + cardW / 2, writeY);
        writeY += baseTitleSize + 15;
      }
      writeY += 30;

      // 3. Subheading
      ctx.font = `400 ${baseSubheadingSize}px 'Inter', sans-serif`;
      ctx.fillStyle = "rgba(30, 41, 59, 0.75)";
      const subWords = customText.subheading.split(" ");
      let subLine = "";
      const subLines = [];

      for (let i = 0; i < subWords.length; i++) {
        const testLine = subLine + subWords[i] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && i > 0) {
          subLines.push(subLine);
          subLine = subWords[i] + " ";
        } else {
          subLine = testLine;
        }
      }
      subLines.push(subLine);

      for (let k = 0; k < subLines.length; k++) {
        ctx.fillText(subLines[k].trim(), cardX + cardW / 2, writeY);
        writeY += baseSubheadingSize + 10;
      }
      writeY += 60;

      // 4. Promo Offer Callout Badge
      if (customText.promoCallout) {
        const badgeW = Math.min(ctx.measureText(customText.promoCallout).width + 60, cardW - 100);
        const badgeH = 70;
        const badgeX = cardX + cardW / 2 - badgeW / 2;
        
        ctx.save();
        // Shiny pastel background gradient for Promo Callout
        const badgeGrad = ctx.createLinearGradient(badgeX, writeY, badgeX + badgeW, writeY);
        badgeGrad.addColorStop(0, "#FFCCD5");
        badgeGrad.addColorStop(1, "#E8DBFC");
        ctx.fillStyle = badgeGrad;
        
        // Draw rounded badge
        ctx.beginPath();
        const badgeRadius = 20;
        ctx.roundRect ? ctx.roundRect(badgeX, writeY, badgeW, badgeH, badgeRadius) : ctx.rect(badgeX, writeY, badgeW, badgeH);
        ctx.fill();
        ctx.restore();

        // Badge Text
        ctx.fillStyle = "#1E1B4B"; // deep indigo
        ctx.font = `800 ${24 * fontSizeRatio}px 'Outfit', sans-serif`;
        ctx.fillText(customText.promoCallout.toUpperCase(), cardX + cardW / 2, writeY + 45);
        writeY += 120;
      }

      // 5. Draw bullet benefits
      ctx.textAlign = "left";
      ctx.font = `500 ${18 * fontSizeRatio}px 'Inter', sans-serif`;
      ctx.fillStyle = "rgba(30, 41, 59, 0.85)";

      const bulletStartWidth = cardX + cardW / 2 - 200;
      if (campaign.bulletPoints?.length > 0) {
        campaign.bulletPoints.slice(0, 3).forEach((bp) => {
          // Draw standard custom bullet particle
          ctx.fillStyle = "#9A7CF6";
          ctx.beginPath();
          ctx.arc(bulletStartWidth - 25, writeY - 6, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
          ctx.fillText(bp, bulletStartWidth, writeY);
          writeY += 45;
        });
      }

      // Draw logo stamp in the bottom
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(154, 124, 246, 0.3)";
      ctx.font = `600 16px 'Outfit', sans-serif`;
      ctx.fillText("AD ENGINE • AUTONOMOUS BRANDING", cardX + cardW / 2, cardY + cardH - 40);

      // Save complete download bundle
      const link = document.createElement("a");
      link.download = `${campaign.companyName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_ad_engine_poster.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    drawBackground();
  };

  const getPresetBackground = () => {
    return PASTEL_GRADIENT_PRESETS[selectedBackgroundIndex].value;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      {/* Visual Canvas Stage Left */}
      <div className="w-full xl:w-7/12 flex flex-col items-center">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block w-full text-center xl:text-left font-mono">
          🖥️ Real-time Pixel Perfect Visual Studio (1:1 format)
        </h4>

        {/* The Live Interactive Poster frame */}
        <div 
          ref={previewContainerRef}
          style={{ 
            backgroundImage: useAiBackdrop && campaign.aiBackdropUrl ? `url(${campaign.aiBackdropUrl})` : getPresetBackground(),
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
          className="w-full max-w-lg aspect-square rounded-3xl p-6 relative overflow-hidden shadow-xl border border-white/50 flex transition-all duration-500"
        >
          {/* Decorative overlay shine */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-white/5 to-white/10 pointer-events-none" />

          {/* Render styled overlay box depending on selected custom Layout options */}
          <div 
            style={{
              backgroundColor: `rgba(255, 255, 255, ${cardOpacity})`,
              borderRadius: `${borderRadius}px`
            }}
            className={`w-full h-full border border-white/40 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md transition-all duration-300 ${
              layoutStyle === "split" ? "max-w-[48%] h-full" : 
              layoutStyle === "bottom" ? "mt-auto h-[48%]" : 
              layoutStyle === "minimal" ? "m-6 h-[80%] w-[90%] mx-auto" : "w-full h-full"
            }`}
          >
            {/* Poster Header */}
            <div className="text-center">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-[#7C3AED] bg-brand-purple/10 px-3 py-1 rounded-full mb-3 shadow-inner">
                {customText.slogan || campaign.slogan}
              </span>
              
              <h3 
                style={{ fontSize: `${2.2 * fontSizeRatio}rem`, color: textColor }}
                className="font-display font-extrabold leading-tight tracking-tight px-2"
              >
                {customText.headline || campaign.headline}
              </h3>

              <p className="text-[11px] md:text-xs text-slate-500 mt-2 font-medium">
                {customText.subheading || campaign.subheading}
              </p>
            </div>

            {/* Middle Promotion Emblem */}
            <div className="my-2 flex flex-col items-center">
              {customText.promoCallout && (
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#1E1B4B] bg-gradient-to-r from-[#FFCCD5] via-pastel-lavender to-[#D6ECFF] px-4 py-2 rounded-2xl shadow-md uppercase tracking-wider animate-pulse border border-white/50">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  {customText.promoCallout}
                </div>
              )}
            </div>

            {/* Bottom Benefit Lists */}
            {layoutStyle !== "bottom" && layoutStyle !== "split" && (
              <div className="space-y-2 max-w-sm mx-auto my-1 bg-white/30 p-3 rounded-2xl border border-white/30">
                {campaign.bulletPoints?.slice(0, 3).map((bp, i) => (
                  <div key={i} className="flex items-center gap-2 text-left">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-purple shadow-sm shrink-0" />
                    <span className="text-[10px] md:text-[11px] font-medium text-slate-600 truncate">{bp}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Poster stamp */}
            <div className="text-center">
              <p className="text-[9px] font-bold text-slate-400 font-mono tracking-widest uppercase">
                ⚙️ Generated via Ad Engine
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic backdrop trigger */}
        <div className="mt-4 flex gap-3 w-full max-w-lg">
          <button
            onClick={generateAiBackground}
            disabled={generatingBackdrop}
            className="flex-1 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {generatingBackdrop ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Painting AI Backdrop...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-pink-300" />
                Generate AI Background
              </>
            )}
          </button>

          <button
            onClick={downloadPosterPng}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Download Poster PNG
          </button>
        </div>
      </div>

      {/* Editor Controls Right */}
      <div className="w-full xl:w-5/12 artistic-glass rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <h4 className="font-display text-base font-black text-white flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
          <Layers className="w-4 h-4 text-artistic-pink animate-pulse" />
          Visual Tuning Panel
        </h4>

        {/* Backdrop template list */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-artistic-blue uppercase tracking-widest mb-2 font-mono">
              🌌 1. Backdrop Template selection
            </label>
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setUseAiBackdrop(false)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-black transition flex items-center gap-1.5 cursor-pointer ${
                  !useAiBackdrop ? "bg-[#FF1493] text-white" : "bg-slate-900/60 text-white/70 hover:bg-slate-900/90 border border-white/5"
                }`}
              >
                Preset Gradients
              </button>
              {campaign.aiBackdropUrl && (
                <button
                  onClick={() => setUseAiBackdrop(true)}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-black transition flex items-center gap-1.5 cursor-pointer ${
                    useAiBackdrop ? "bg-[#FF1493] text-white" : "bg-slate-900/60 text-white/70 hover:bg-slate-900/90 border border-white/5"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Gemini Art Backdrop
                </button>
              )}
            </div>

            {!useAiBackdrop ? (
              <div className="grid grid-cols-2 gap-2">
                {PASTEL_GRADIENT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedBackgroundIndex(idx); setUseAiBackdrop(false); }}
                    className={`p-2 rounded-xl border flex items-center gap-2.5 transition text-left cursor-pointer ${
                      selectedBackgroundIndex === idx && !useAiBackdrop
                        ? "border-artistic-pink bg-artistic-pink/25 text-white"
                        : "border-white/10 bg-slate-950/60 hover:bg-slate-950/90 text-white/70"
                    }`}
                  >
                    <span 
                      style={{ background: preset.value }} 
                      className="w-5 h-5 rounded-full border border-black/5 shrink-0 animate-pulse" 
                    />
                    <span className="text-[10px] font-extrabold truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-dashed border-white/10 flex items-center gap-3">
                <img 
                  src={campaign.aiBackdropUrl} 
                  alt="AI generate" 
                  className="w-12 h-12 rounded-xl object-cover border border-white/25 shrink-0" 
                />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-white">Custom Generated Backdrop</p>
                  <p className="text-[9px] text-[#00E5FF] truncate max-w-full font-mono">{campaign.posterTheme?.backgroundImagePrompt}</p>
                </div>
              </div>
            )}
          </div>

          {/* Copywriting field edits */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="block text-xs font-black text-artistic-blue uppercase tracking-widest font-mono">
              ✒️ 2. Edit Poster Slogan & Sizing
            </label>

            <div>
              <label className="text-[10px] font-bold text-white/75 block mb-1">Headline Text</label>
              <textarea
                value={customText.headline}
                onChange={(e) => {
                  setCustomText({ ...customText, headline: e.target.value });
                }}
                rows={2}
                className="artistic-input block w-full py-2.5 px-3 rounded-xl text-xs placeholder-white/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-white/75 block mb-1">Slogan</label>
                <input
                  type="text"
                  value={customText.slogan}
                  onChange={(e) => setCustomText({ ...customText, slogan: e.target.value })}
                  className="artistic-input block w-full py-2.5 px-3 rounded-xl text-xs placeholder-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/75 block mb-1">Promo Label</label>
                <input
                  type="text"
                  value={customText.promoCallout}
                  onChange={(e) => setCustomText({ ...customText, promoCallout: e.target.value })}
                  className="artistic-input block w-full py-2.5 px-3 rounded-xl text-xs placeholder-white/30 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Style layouts */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-xs font-black text-artistic-blue uppercase tracking-widest mb-2 font-mono">
              📐 3. Choose Card Layout Style
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["center", "split", "bottom", "minimal"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setLayoutStyle(style)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-black uppercase tracking-wide border capitalize transition cursor-pointer ${
                    layoutStyle === style 
                      ? "border-artistic-pink bg-artistic-pink/20 text-white shadow-md shadow-pink-500/10" 
                      : "border-white/10 bg-slate-905/60 text-white/70 hover:text-white hover:bg-slate-900/90"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Typography & Slider properties */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <label className="block text-xs font-black text-artistic-blue uppercase tracking-widest font-mono">
              🎚️ 4. Style Parameters
            </label>

            <div>
              <div className="flex justify-between text-[10px] font-bold text-white/90 mb-1">
                <span>Glassmorphism Opacity</span>
                <span>{Math.round(cardOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.0"
                step="0.05"
                value={cardOpacity}
                onChange={(e) => setCardOpacity(parseFloat(e.target.value))}
                className="w-full accent-artistic-pink cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-white/90 mb-1">
                  <span>Rounding</span>
                  <span>{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="44"
                  step="2"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                  className="w-full accent-artistic-pink cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-white/90 mb-1">
                  <span>Font Scale</span>
                  <span>{fontSizeRatio}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.4"
                  step="0.05"
                  value={fontSizeRatio}
                  onChange={(e) => setFontSizeRatio(parseFloat(e.target.value))}
                  className="w-full accent-artistic-pink cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/75 block mb-1">Text Color Hex</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded border-none cursor-pointer outline-none bg-transparent shrink-0"
                />
                <input
                  type="text"
                  maxLength={7}
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="artistic-input block w-full py-2 px-3 rounded-xl text-xs placeholder-white/30 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
