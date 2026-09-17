"use client";

import React, { useState, useRef } from "react";
import {
  Check,
  Sparkles,
  Shuffle,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  FolderOpen,
  X,
  Loader2,
  FileImage,
  ArrowUpRight,
} from "lucide-react";
import { processImageFile, ProcessedImageResult } from "@/lib/image-upload";

export interface AvatarPickerProps {
  currentAvatar?: string;
  onSelect: (avatarUrl: string) => void;
  onClose?: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  { id: "upload", label: "Upload Photo", icon: Upload, style: "" },
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
  const [activeCategory, setActiveCategory] = useState<string>("upload");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [seedOffset, setSeedOffset] = useState<number>(0);
  const [urlError, setUrlError] = useState<boolean>(false);

  // Local drag & drop / file upload state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProcessing, setUploadProcessing] = useState(false);
  const [uploadedInfo, setUploadedInfo] = useState<{
    fileName: string;
    fileSizeFormatted: string;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUploadedInfo(null);
    setUploadError(null);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setSelectedAvatar(customUrl.trim());
    setUrlError(false);
    setUploadedInfo(null);
    setUploadError(null);
  };

  const handleFileProcess = async (file: File) => {
    setUploadProcessing(true);
    setUploadError(null);
    setUrlError(false);

    try {
      const result: ProcessedImageResult = await processImageFile(file);
      setSelectedAvatar(result.dataUrl);
      setUploadedInfo({
        fileName: result.fileName,
        fileSizeFormatted: result.fileSizeFormatted,
      });
      setActiveCategory("upload");
    } catch (err: any) {
      setUploadError(err.message || "Failed to process the dropped image.");
    } finally {
      setUploadProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await handleFileProcess(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileProcess(files[0]);
    }
    // Reset file input value so selecting the same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
    }
  };

  return (
    <div
      className="space-y-5 text-xs font-mono relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for native file browser dialog */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Global Drag Overlay when user drags a file anywhere over the picker */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-[#070b14]/95 backdrop-blur-md rounded-2xl border-2 border-dashed border-[#D4AF37] flex flex-col items-center justify-center p-6 text-center shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="h-16 w-16 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mb-3 shadow-[0_0_25px_rgba(212,175,55,0.4)] animate-bounce">
            <Upload className="w-8 h-8 text-[#E8C97A]" />
          </div>
          <span className="text-base font-bold text-[#E8C97A]">Drop Photo to Set Avatar</span>
          <p className="text-xs text-white/70 mt-1 max-w-xs">
            Release to instantly load and optimize your profile image from local files.
          </p>
        </div>
      )}

      {/* Current Preview Card */}
      <div className="p-4 rounded-2xl bg-[rgba(7,11,20,0.8)] border border-[rgba(212,175,55,0.3)] flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#9c784f] to-[#16213b] p-0.5 shadow-md shrink-0">
            <div className="h-full w-full rounded-[14px] bg-[#070b14] flex items-center justify-center overflow-hidden relative">
              {uploadProcessing ? (
                <div className="flex flex-col items-center justify-center bg-black/60 inset-0 absolute">
                  <Loader2 className="w-6 h-6 text-[#E8C97A] animate-spin" />
                </div>
              ) : selectedAvatar ? (
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
              Drag and drop an image from your computer or pick a themed character preset.
            </p>
            {uploadedInfo && (
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold">
                <FileImage className="w-3 h-3" />
                <span className="truncate max-w-[180px]">{uploadedInfo.fileName}</span>
                <span className="text-white/60">({uploadedInfo.fileSizeFormatted})</span>
              </div>
            )}
            {uploadError && (
              <p className="text-[10px] text-red-400 mt-1 font-semibold">{uploadError}</p>
            )}
            {urlError && (
              <p className="text-[10px] text-red-400 mt-1 font-semibold">
                Unable to load custom image. Please check the URL.
              </p>
            )}
          </div>
        </div>

        {activeCategory !== "upload" ? (
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#E8C97A] hover:text-white transition-all cursor-pointer text-xs shrink-0"
            title="Shuffle avatar variations"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(212,175,55,0.15)] hover:bg-[rgba(212,175,55,0.25)] border border-[#D4AF37]/40 text-[#E8C97A] hover:text-white transition-all cursor-pointer text-xs shrink-0"
            title="Browse device files"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Browse</span>
          </button>
        )}
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
            className={`flex-1 min-w-[85px] py-1.5 px-2.5 rounded-lg font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeCategory === cat.id
                ? "bg-[rgba(212,175,55,0.2)] text-[#E8C97A] border border-[rgba(212,175,55,0.4)] shadow-sm"
                : "text-[var(--ink-dim)] hover:text-white border border-transparent"
            }`}
          >
            {"icon" in cat && <cat.icon className="w-3 h-3 text-[#D4AF37]" />}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Upload Photo (Drag & Drop Zone) */}
      {activeCategory === "upload" ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
            isDraggingOver
              ? "border-[#D4AF37] bg-[rgba(212,175,55,0.1)] shadow-[0_0_20px_rgba(212,175,55,0.25)]"
              : "border-white/15 bg-[#070b14]/70 hover:border-[#D4AF37]/60 hover:bg-[#070b14]"
          }`}
        >
          <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-[#D4AF37]/50 group-hover:bg-[rgba(212,175,55,0.15)] flex items-center justify-center transition-all shadow-md">
            {uploadProcessing ? (
              <Loader2 className="w-6 h-6 text-[#E8C97A] animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-[#E8C97A] group-hover:scale-110 transition-transform" />
            )}
          </div>

          <div className="space-y-1">
            <span className="text-sm font-bold text-white block">
              Drag & drop photo from your computer
            </span>
            <p className="text-[11px] text-[var(--ink-dim)]">
              or <span className="text-[#E8C97A] underline font-semibold">browse files</span> from your local storage
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-gray-400">
              PNG, JPG, JPEG, WEBP, GIF, SVG
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] text-[#E8C97A]">
              Auto-optimizes for profile & leaderboard
            </span>
          </div>
        </div>
      ) : (
        /* TAB CONTENT: Avatar Presets Grid */
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
      )}

      {/* Quick Local File Drop / Browse strip (always visible across all tabs) */}
      {activeCategory !== "upload" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/15 hover:border-[#D4AF37]/40 flex items-center justify-between gap-3 cursor-pointer transition-all text-[11px]"
        >
          <div className="flex items-center gap-2 text-[var(--ink-dim)]">
            <Upload className="w-3.5 h-3.5 text-[#E8C97A]" />
            <span>Have your own image? Drop it here or browse device</span>
          </div>
          <span className="text-[10px] text-[#E8C97A] font-bold underline flex items-center gap-0.5">
            Choose File <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      )}

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
          disabled={!selectedAvatar || isSubmitting || uploadProcessing}
          className="btn-gold px-5 py-2 rounded-xl text-black font-bold shadow-lg hover:shadow-[#D4AF37]/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Avatar</span>
          )}
        </button>
      </div>
    </div>
  );
}
