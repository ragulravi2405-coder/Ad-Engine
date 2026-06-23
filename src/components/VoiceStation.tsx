import React, { useState, useRef, useEffect } from "react";
import { BrandingCampaign } from "../types";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  Video, 
  Volume, 
  Check, 
  Copy, 
  FileText 
} from "lucide-react";

interface VoiceStationProps {
  campaign: BrandingCampaign;
  onUpdateCampaign: (updated: BrandingCampaign) => void;
}

const AVAILABLE_VOICES = [
  { id: "Kore", name: "Kore (Sincere & Professional)", gender: "Female", vibe: "Corporate / Executive" },
  { id: "Zephyr", name: "Zephyr (Warm & Narrative)", gender: "Male", vibe: "Casual / Modern" },
  { id: "Puck", name: "Puck (Energetic & Fun)", gender: "Male", vibe: "Exciting Promo / TikTok" },
  { id: "Fenrir", name: "Fenrir (Rich & Deep)", gender: "Male", vibe: "Cinematic / Bold" },
  { id: "Charon", name: "Charon (Soft & Ambient)", gender: "Female", vibe: "Relaxing / Boutique" }
];

export default function VoiceStation({ campaign, onUpdateCampaign }: VoiceStationProps) {
  const [selectedVoice, setSelectedVoice] = useState("Puck");
  const [generating, setGenerating] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop playback when the campaign changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [campaign]);

  const handleGenerateVoice = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: campaign.voiceScript,
          voiceName: selectedVoice
        })
      });

      const data = await response.json();
      if (data.audioUrl) {
        onUpdateCampaign({
          ...campaign,
          generatedAudioUrl: data.audioUrl
        });
        
        // Initialize audio
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch(e => console.log("Auto-play blocked or canceled:", e));
          }
        }, 100);
      } else {
        alert(data.error || "Failed to synthesize voice.");
      }
    } catch (err) {
      console.error(err);
      alert("Encountered connection issues compiling the voice script. Make sure Gemini TTS is supported by your key.");
    } finally {
      setGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.error(e));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    const newMute = !muted;
    setMuted(newMute);
    if (audioRef.current) {
      audioRef.current.muted = newMute;
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Voice-over generation controls Left */}
      <div className="artistic-glass rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <h4 className="font-display text-base font-black text-white flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
          <Volume className="w-5 h-5 text-artistic-blue animate-pulse" />
          AI Voice-Over Station
        </h4>

        {/* Script text review */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-black text-artistic-blue uppercase tracking-widest font-mono">
              Voice-Over Narration Script
            </label>
            <button
              onClick={() => copyToClipboard(campaign.voiceScript, setCopiedScript)}
              className="text-xs text-artistic-pink hover:text-pink-400 flex items-center gap-1 font-extrabold transition cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedScript ? "Copied!" : "Copy Script"}
            </button>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-2xl text-xs text-white/90 leading-relaxed font-sans border border-white/10 max-h-40 overflow-y-auto">
            {campaign.voiceScript}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="mb-6">
          <label className="block text-xs font-black text-artistic-blue uppercase tracking-widest mb-3 font-mono">
            🎙️ Choose voice profile
          </label>
          <div className="space-y-2">
            {AVAILABLE_VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVoice(v.id)}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition cursor-pointer ${
                  selectedVoice === v.id
                    ? "border-artistic-pink bg-artistic-pink/20 text-white shadow-md shadow-pink-500/10 font-bold"
                    : "border-white/10 bg-slate-950/60 hover:bg-slate-900/95 text-white/70"
                }`}
              >
                <div>
                  <p className="text-xs font-extrabold text-white">{v.name}</p>
                  <p className="text-[10px] text-[#00E5FF] font-mono mt-0.5">{v.vibe}</p>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/80 bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
                  {v.gender}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trigger generation */}
        <button
          onClick={handleGenerateVoice}
          disabled={generating}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-artistic-pink to-pink-600 hover:scale-[1.01] active:scale-95 text-white font-black text-xs transition shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Synthesizing Audio via Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              Generate Premium AI Voice-Over
            </>
          )}
        </button>

        {/* Premium Audio Player */}
        {campaign.generatedAudioUrl && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h5 className="text-xs font-black uppercase tracking-widest text-[#00E5FF] mb-4 font-mono">
              🎵 Active Audio Narration Track
            </h5>

            <audio
              ref={audioRef}
              src={campaign.generatedAudioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleAudioEnded}
              className="hidden"
            />

            <div className="bg-gradient-to-r from-[#1E1B4B] to-[#311042] text-white rounded-3xl p-5 shadow-2xl border border-artistic-pink/20 relative overflow-hidden">
              {/* Absorb space */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-white text-indigo-950 flex items-center justify-center shadow-lg active:scale-90 hover:scale-105 transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-indigo-950 text-indigo-950" /> : <Play className="w-5 h-5 fill-indigo-950 text-indigo-950 ml-1" />}
                </button>

                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-widest text-pink-300">Ad Engine Custom TTS Track</p>
                  <p className="text-[11px] font-extrabold truncate mt-0.5">{campaign.companyName} Promotion Audio</p>
                </div>

                <a
                  href={campaign.generatedAudioUrl}
                  download={`${campaign.companyName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_branding_voice.wav`}
                  className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer border border-white/5"
                  title="Download Voice-Over File"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>

              {/* Slider meter and progress timestamps */}
              <div className="mt-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-artistic-pink"
                />
                <div className="flex justify-between items-center text-[10px] text-pink-200 mt-1.5 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume sliders */}
              <div className="mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
                <button onClick={toggleMute} className="text-pink-200 hover:text-white transition cursor-pointer">
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-artistic-pink"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reel script & Social outputs Right */}
      <div className="space-y-6">
        {/* Reel Script Card */}
        {campaign.reelScript && (
          <div className="artistic-glass rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <h4 className="font-display text-base font-black text-white flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
              <Video className="w-5 h-5 text-artistic-pink animate-pulse" />
              Instagram Reel / Video Script
            </h4>
            
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">
              Title Idea: <span className="text-pink-300 italic font-sans capitalize">"{campaign.reelScript.title}"</span>
            </p>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {campaign.reelScript.scenes.map((scene) => (
                <div key={scene.sceneNumber} className="bg-slate-950/60 rounded-2xl p-4 border border-white/10 shadow-lg relative pl-12">
                  <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-artistic-pink/20 text-white border border-artistic-pink/35 flex items-center justify-center font-black text-xs">
                    {scene.sceneNumber}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-artistic-blue uppercase tracking-widest font-mono block mb-1">
                      Visual Direction
                    </span>
                    <p className="text-white/70 text-xs italic mb-2">
                      {scene.visualDescription}
                    </p>
                    <span className="text-[10px] font-black text-[#FFB7C5] uppercase tracking-widest font-mono block mb-0.5">
                      Audio Speech
                    </span>
                    <p className="text-white font-extrabold text-xs">
                      "{scene.audioSpeech}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Copy caption card */}
        <div className="artistic-glass rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
            <h4 className="font-display text-base font-black text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00E5FF] animate-pulse" />
              Promotional Social Caption
            </h4>
            <button
              onClick={() => copyToClipboard(campaign.socialCaption, setCopiedCaption)}
              className="text-xs text-artistic-pink hover:text-pink-400 flex items-center gap-1 font-black transition cursor-pointer"
            >
              {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCaption ? "Copied!" : "Copy Caption"}
            </button>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-2xl text-xs text-white/95 leading-relaxed font-sans border border-white/10 whitespace-pre-line max-h-52 overflow-y-auto">
            {campaign.socialCaption}
          </div>
        </div>
      </div>
    </div>
  );
}
