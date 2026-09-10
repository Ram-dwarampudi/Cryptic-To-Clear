"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Dices, Link2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export interface AvatarOption {
  id: string;
  name: string;
  category: "bots" | "humans" | "adventurers" | "pixel" | "minimal";
  url: string;
}

export const PRESET_AVATARS: AvatarOption[] = [
  // Tech Bots
  { id: "bot-spark", name: "Cyber Spark", category: "bots", url: "https://api.dicebear.com/7.x/bottts/svg?seed=CyberSpark" },
  { id: "bot-matrix", name: "Matrix Core", category: "bots", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Matrix" },
  { id: "bot-quantum", name: "Quantum Bot", category: "bots", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Quantum" },
  { id: "bot-gizmo", name: "Neon Gizmo", category: "bots", url: "https://api.dicebear.com/7.x/bottts/svg?seed=NeonGizmo" },
  { id: "bot-byte", name: "Byte Rover", category: "bots", url: "https://api.dicebear.com/7.x/bottts/svg?seed=ByteRover" },
  { id: "bot-circuit", name: "Circuit AI", category: "bots", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Circuit" },

  // Coders & Humans
  { id: "human-alex", name: "Alex (Engineer)", category: "humans", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
  { id: "human-sophia", name: "Sophia (Architect)", category: "humans", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia" },
  { id: "human-liam", name: "Liam (Fullstack)", category: "humans", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Liam" },
  { id: "human-maya", name: "Maya (Data Scientist)", category: "humans", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya" },
  { id: "human-jordan", name: "Jordan (Systems)", category: "humans", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan" },
  { id: "human-zoe", name: "Zoe (UI / Algorithmic)", category: "humans", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe" },

  // Adventurers
  { id: "adv-shadow", name: "Shadow Coder", category: "adventurers", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow" },
  { id: "adv-phoenix", name: "Phoenix Hacker", category: "adventurers", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Phoenix" },
  { id: "adv-viper", name: "Viper Blade", category: "adventurers", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Viper" },
  { id: "adv-ranger", name: "Ranger Scout", category: "adventurers", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ranger" },
  { id: "adv-sage", name: "Mystic Sage", category: "adventurers", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sage" },
  { id: "adv-aurora", name: "Aurora Knight", category: "adventurers", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aurora" },

  // Pixel Art
  { id: "pixel-arcade", name: "Arcade Master", category: "pixel", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Arcade" },
  { id: "pixel-knight", name: "Bit Knight", category: "pixel", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=BitKnight" },
  { id: "pixel-retro", name: "Retro Hacker", category: "pixel", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=RetroHacker" },
  { id: "pixel-cyber", name: "Cyber 8-Bit", category: "pixel", url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberPixel" },

  // Minimal / Notionists
  { id: "min-zen", name: "Zen Minimal", category: "minimal", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Zen" },
  { id: "min-scholar", name: "Clean Scholar", category: "minimal", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Scholar" },
  { id: "min-creative", name: "Creative Mind", category: "minimal", url: "https://api.dicebear.com/7.x/notionists/svg?seed=Creative" },
  { id: "min-deep", name: "Deep Thinker", category: "minimal", url: "https://api.dicebear.com/7.x/notionists/svg?seed=DeepCoder" },
];

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelectAvatar: (url: string) => void;
  compact?: boolean;
  label?: string;
  title?: string;
  subtitle?: string;
}

export default function AvatarPicker({
  selectedAvatar,
  onSelectAvatar,
  compact = false,
  label = "Choose Your Avatar",
  title,
  subtitle,
}: AvatarPickerProps) {
  const [activeCategory, setActiveCategory] = useState<"featured" | "bots" | "humans" | "adventurers" | "pixel" | "minimal" | "custom">("featured");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [customError, setCustomError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Quick randomizer
  const handleRandomize = () => {
    const styles = ["bottts", "avataaars", "adventurer", "pixel-art", "notionists", "lorelei"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomSeed = "Dev_" + Math.random().toString(36).substring(2, 8);
    const newAvatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`;
    onSelectAvatar(newAvatarUrl);
  };

  const handleApplyCustomUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customUrlInput.trim()) return;
    try {
      new URL(customUrlInput.trim());
      setCustomError(false);
      onSelectAvatar(customUrlInput.trim());
    } catch {
      setCustomError(true);
    }
  };

  // Filtered avatar list
  const filteredAvatars =
    activeCategory === "featured"
      ? PRESET_AVATARS.slice(0, 10)
      : PRESET_AVATARS.filter((a) => a.category === activeCategory);

  const categories = [
    { id: "featured" as const, label: "Popular" },
    { id: "bots" as const, label: "Bots" },
    { id: "humans" as const, label: "Coders" },
    { id: "adventurers" as const, label: "Adventurers" },
    { id: "pixel" as const, label: "8-Bit" },
    { id: "minimal" as const, label: "Minimal" },
    { id: "custom" as const, label: "Custom URL" },
  ];

  return (
    <div className="space-y-3 font-mono">
      {/* Header with Title & Current Preview */}
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#080d19]/90 border border-white/10 shadow-inner">
        <div className="flex items-center gap-3">
          {/* Active Avatar Highlight Ring */}
          <div className="relative group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#D4AF37] via-[#9c784f] to-[#22d3ee] p-0.5 shadow-md shadow-[#D4AF37]/20 flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#070b14] overflow-hidden flex items-center justify-center">
                {selectedAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedAvatar}
                    alt="Chosen Avatar"
                    className="w-full h-full object-cover"
                    onError={() => setCustomError(true)}
                  />
                ) : (
                  <Sparkles className="w-5 h-5 text-[#E8C97A]" />
                )}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-black font-bold ring-2 ring-[#070b14]">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-wide">{label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[rgba(212,175,55,0.15)] text-[#E8C97A] border border-[rgba(212,175,55,0.3)]">
                Selected
              </span>
            </div>
            <p className="text-[11px] text-[var(--ink-dim)]">
              {title || "Click any avatar below or randomize your persona"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRandomize}
            title="Surprise me with a random avatar"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#E8C97A] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Dices className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Shuffle</span>
          </button>

          {compact && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1.5 rounded-xl bg-[rgba(212,175,55,0.15)] hover:bg-[rgba(212,175,55,0.25)] border border-[rgba(212,175,55,0.35)] text-xs text-[#E8C97A] font-semibold transition-all cursor-pointer"
            >
              {isExpanded ? "Minimize" : "Browse All"}
            </button>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-[11px] text-[var(--ink-dim)] px-1">{subtitle}</p>
      )}

      {/* Expandable Avatar Selection Gallery */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-1"
          >
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#E8C97A] font-bold shadow-sm"
                      : "bg-white/5 border-white/5 text-[var(--ink-dim)] hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Custom URL Tab */}
            {activeCategory === "custom" ? (
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <label className="block text-[11px] text-[var(--ink-dim)]">
                  Paste Custom Avatar URL (GitHub, Gravatar, Unsplash, Imgur, etc.)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-faint)]" />
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => {
                        setCustomUrlInput(e.target.value);
                        setCustomError(false);
                      }}
                      placeholder="https://example.com/your-avatar.png"
                      className="w-full bg-[#070b14] border border-white/10 focus:border-[#D4AF37] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/20 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCustomUrl()}
                    className="btn-gold px-3 py-1.5 rounded-xl text-xs font-bold text-black cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {customError && (
                  <div className="flex items-center gap-1.5 text-[10px] text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>Please enter a valid image URL.</span>
                  </div>
                )}
              </div>
            ) : (
              /* Grid of Avatars */
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2 rounded-2xl bg-black/40 border border-white/10 max-h-48 sm:max-h-56 overflow-y-auto">
                {filteredAvatars.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => onSelectAvatar(avatar.url)}
                      className={`group relative flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#D4AF37]/20 border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-105"
                          : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 hover:scale-105"
                      }`}
                      title={avatar.name}
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-[#070b14] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>

                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D4AF37] text-black flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
