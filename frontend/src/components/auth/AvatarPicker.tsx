"use client";

import React, { useState } from "react";
import { Check, Sparkles, Shuffle, Link as LinkIcon, Image as ImageIcon } from "lucide-react";

export interface AvatarPickerProps {
  currentAvatar?: string;
  onSelect: (avatarUrl: string) => void;
  onClose?: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  { id: "bots", label: "Bots", style: "bottts" },
  { id: "coders", label: "Coders", style: "pixel-art" },
  { id: "adventurers", label: "Adventurers", style: "adventurer" },
  { id: "8bit", label: "8-Bit", style: "pixel-art-neutral" },
  { id: "minimal", label: "Minimal", style: "identicon" },
] as const;

const PRESET_SEEDS: Record<string, string[]> = {
  bots: ["CyberNova", "GlitchByte", "BitPulse", "QuantumCore", "EchoVortex", "RoboForge"],
  coders: ["AdaLovelace", "TuringMind", "LinusDev", "BinarySorcerer", "CleanCoder", "SyntaxSamurai"],
  adventurers: ["AriaQuest", "ShadowRunner", "BlazeStriker", "StormRider", "MysticSage", "FrostValkyrie"],
  "8bit": ["PixelKnight", "ArcadeMage", "RetroPixel", "SpriteWalker", "DungeonByte", "BitHero"],
  minimal: ["ApexPrism", "MatrixHex", "VectorGrid", "ZenNode", "FluxAura", "PulseWave"],
};

export default function AvatarPicker({
  currentAvatar = "",
  onSelect,
  onClose,
  isSubmitting = false,
}: AvatarPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("bots");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const [urlError, setUrlError] = useState<boolean>(false);

  const currentSeeds = PRESET_SEEDS[activeCategory] || PRESET_SEEDS.bots;
  const currentStyle =
    CATEGORIES.find((c) => c.id === activeCategory)?.style || "bottts";

  const getDiceBearUrl = (style: string, seed: string) =>
    `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

  const handleShuffle = () => {
    setSeedOffset((prev) => prev + 1);
  };

  const handleSelectPreset = (seed: string) => {
    const seedWithOffset = seedOffset > 0 ? `${seed}-${seedOffset}` : seed;
    const url = getDiceBearUrl(currentStyle, seedWithOffset);
    setSelectedAvatar(url);
    setUrlError(false);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setSelectedAvatar(customUrl.trim());
    setUrlError(false);
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
    }
  };

  return (
    <div className="space-y-5 text-xs font-mono">
      {/* Current Preview Card */}
      <div className="p-4 rounded-2xl bg-[rgba(7,11,20,0.8)] border border-[rgba(212,175,55,0.3)] flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#9c784f] to-[#16213b] p-0.5 shadow-md shrink-0">
            <div className="h-full w-full rounded-[14px] bg-[#070b14] flex items-center justify-center overflow-hidden">
              {selectedAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedAvatar}
                  alt="Selected avatar"
                  className="h-full w-full object-cover"
                  onError={() => setUrlError(true)}
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-[#E8C97A]" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[#E8C97A] font-bold text-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Choose Your Avatar</span>
            </div>
            <p className="text-[11px] text-[var(--ink-dim)] mt-0.5">
              Select a themed character preset or paste an image URL.
            </p>
            {urlError && (
              <p className="text-[10px] text-red-400 mt-1 font-semibold">
                Unable to load custom image. Please check the URL.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#E8C97A] hover:text-white transition-all cursor-pointer text-xs shrink-0"
          title="Shuffle avatar variations"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Shuffle</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg font-bold text-center transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-[rgba(212,175,55,0.2)] text-[#E8C97A] border border-[rgba(212,175,55,0.4)] shadow-sm"
                : "text-[var(--ink-dim)] hover:text-white border border-transparent"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Avatar Presets Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {currentSeeds.map((seed, idx) => {
          const seedWithOffset = seedOffset > 0 ? `${seed}-${seedOffset}` : seed;
          const url = getDiceBearUrl(currentStyle, seedWithOffset);
          const isSelected = selectedAvatar === url;

          return (
            <button
              key={`${seed}-${idx}`}
              type="button"
              onClick={() => handleSelectPreset(seed)}
              className={`group relative p-1.5 rounded-2xl transition-all cursor-pointer flex flex-col items-center gap-1.5 bg-[#070b14] border ${
                isSelected
                  ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.35)] scale-105"
                  : "border-white/10 hover:border-[#D4AF37]/50 hover:bg-white/[0.04]"
              }`}
            >
              <div className="h-14 w-14 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={seed}
                  className="h-full w-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>

              {isSelected && (
                <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-md">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Avatar URL Form */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <label className="block text-[11px] text-[var(--ink-dim)] font-medium">
          Or paste an image URL (PNG, JPG, SVG):
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--ink-faint)]" />
            <input
              type="url"
              placeholder="https://example.com/my-avatar.png"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyCustomUrl}
            disabled={!customUrl.trim()}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-40 cursor-pointer font-bold"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/10">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedAvatar || isSubmitting}
          className="btn-gold px-5 py-2 rounded-xl text-black font-bold shadow-lg hover:shadow-[#D4AF37]/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Avatar"}
        </button>
      </div>
    </div>
  );
}
