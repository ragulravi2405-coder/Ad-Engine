import { BrandingCampaign } from "../types";
import { 
  Sparkles, 
  Trash2, 
  Play, 
  Layers, 
  Volume2, 
  Calendar, 
  ExternalLink 
} from "lucide-react";

interface GalleryHubProps {
  campaigns: BrandingCampaign[];
  onSelectCampaign: (campaign: BrandingCampaign) => void;
  onDeleteCampaign: (id: string) => void;
  activeCampaignId?: string;
}

export default function GalleryHub({ 
  campaigns, 
  onSelectCampaign, 
  onDeleteCampaign,
  activeCampaignId 
}: GalleryHubProps) {
  
  if (campaigns.length === 0) {
    return (
      <div className="artistic-glass rounded-3xl p-12 shadow-2xl text-center max-w-lg mx-auto backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-artistic-pink to-artistic-blue" />
        <div className="w-16 h-16 bg-artistic-pink/25 rounded-full flex items-center justify-center mx-auto mb-5 border border-artistic-pink/40 shadow-lg shadow-pink-500/20 logo-sphere-shape animate-bounce">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h4 className="font-display text-lg font-black text-white">Your Gallery is Empty</h4>
        <p className="text-white/70 text-xs mt-3 max-w-sm mx-auto leading-relaxed">
          You haven't generated any corporate AI branding campaigns yet. Fill in your business credentials inside the Dashboard above and power up the creative engine!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display text-lg font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-artistic-blue mr-0.5" /> Company Asset Ledger
          </h4>
          <p className="text-xs text-white/70 mt-1">Review, load, and manage your autonomous branding artifacts</p>
        </div>
        <span className="text-[10px] font-black px-3 py-1 bg-artistic-pink/20 text-[#FFB7C5] rounded-full uppercase tracking-wider font-mono border border-artistic-pink/30">
          {campaigns.length} Saved {campaigns.length === 1 ? "Campaign" : "Campaigns"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => {
          const isActive = c.id === activeCampaignId;
          const formattedDate = new Date(c.timestamp).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div 
              key={c.id}
              onClick={() => onSelectCampaign(c)}
              className={`artistic-glass rounded-3xl p-5 border transition-all duration-300 relative cursor-pointer group flex flex-col justify-between ${
                isActive 
                  ? "border-artistic-pink ring-2 ring-artistic-pink/40 shadow-2xl scale-[1.01]" 
                  : "border-white/10 shadow-lg hover:border-artistic-blue hover:shadow-2xl"
              }`}
            >
              {/* Top Row with Delete and Date */}
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-white/50 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-artistic-blue" />
                    <span>{formattedDate}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this branding campaign?")) {
                        onDeleteCampaign(c.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-white/60 hover:text-rose-400 hover:bg-white/15 transition cursor-pointer"
                    title="Delete Campaign Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Company & Product Header */}
                <h5 className="font-display text-base font-black text-white leading-snug truncate">
                  {c.companyName}
                </h5>
                <p className="text-[11px] text-[#00E5FF] font-extrabold truncate mt-0.5">
                  {c.productDetails}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white bg-artistic-pink/25 px-2.5 py-1 rounded-lg border border-artistic-pink/30">
                    {c.adType}
                  </span>
                  {c.promoOffer && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#FFAF7B] bg-slate-900/70 px-2.5 py-1 rounded-lg truncate max-w-[130px] border border-[#FFAF7B]/30">
                      🏷️ {c.promoOffer}
                    </span>
                  )}
                </div>

                {/* AI generated Summary copy snippet preview */}
                <p className="mt-4 text-xs text-white/90 bg-slate-950/60 p-3 rounded-2xl border border-white/10 font-bold italic">
                  "{c.slogan}"
                </p>
              </div>

              {/* Footer action */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${c.aiBackdropUrl ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-900/60 text-white/30 border border-white/5"}`} title="AI Backdrop Image Created">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${c.generatedAudioUrl ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-slate-900/60 text-white/30 border border-white/5"}`} title="AI Voice-Over Track Synthesized">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 font-mono transition-colors ${
                  isActive ? "text-artistic-pink" : "text-white/50 group-hover:text-artistic-pink"
                }`}>
                  {isActive ? "Selected" : "Activate"}
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
