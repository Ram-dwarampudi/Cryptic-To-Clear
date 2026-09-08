"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, AlertCircle, Sparkles, ExternalLink, X, CheckCircle2 } from "lucide-react";

interface OAuthButtonsProps {
  onSelectProvider?: (provider: "google" | "github") => void;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function OAuthButtons({ onSelectProvider, onSuccess }: OAuthButtonsProps) {
  const { loginWithGoogleAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [demoEmail, setDemoEmail] = useState("alex.student@gmail.com");
  const [demoName, setDemoName] = useState("Alex Turner");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Handler for Google button click
  const handleGoogleClick = async () => {
    if (onSelectProvider) {
      onSelectProvider("google");
      return;
    }

    setErrorMessage(null);

    // If Google Client ID is configured and Google SDK is loaded: run live Google OAuth popup!
    if (googleClientId && googleClientId.trim() !== "" && typeof window !== "undefined" && window.google?.accounts?.oauth2) {
      try {
        setLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId.trim(),
          scope: "email profile openid",
          callback: async (response: any) => {
            if (response.error) {
              setLoading(false);
              setErrorMessage("Google Sign-In was canceled or failed: " + (response.error_description || response.error));
              return;
            }

            if (response.access_token) {
              const res = await loginWithGoogleAccount({ accessToken: response.access_token });
              setLoading(false);
              if (res.success) {
                if (onSuccess) onSuccess();
                else window.location.href = "/compiler";
              } else {
                setErrorMessage(res.message || "Failed to log in with Google.");
              }
            }
          },
        });
        tokenClient.requestAccessToken();
      } catch (err: any) {
        setLoading(false);
        setErrorMessage(err.message || "Failed to initialize Google Sign-In.");
      }
      return;
    }

    // If client ID is not configured yet, open the setup & demo modal
    setShowConfigModal(true);
  };

  const handleRunDemoGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithGoogleAccount({
        isDemoGoogle: true,
        userInfo: {
          email: demoEmail.trim().toLowerCase(),
          name: demoName.trim() || "Google Student",
          picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(demoEmail.trim())}`,
        },
      });

      setLoading(false);
      if (res.success) {
        setShowConfigModal(false);
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = "/compiler";
        }
      } else {
        setErrorMessage(res.message || "Google test login failed.");
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || "Error during Google login.");
    }
  };

  const handleGithubClick = () => {
    if (onSelectProvider) {
      onSelectProvider("github");
    } else {
      alert("GitHub OAuth is configured as an architectural placeholder.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 my-4">
        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-[var(--ink)] glass hover:bg-white/[0.08] active:scale-[0.98] transition-all border border-white/10 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#E8C97A]" />
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
          )}
          <span>Google</span>
        </button>

        {/* GitHub Button */}
        <button
          type="button"
          onClick={handleGithubClick}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-[var(--ink)] glass hover:bg-white/[0.08] active:scale-[0.98] transition-all border border-white/10 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GitHub</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google Setup & Instant Demo Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0e1626] border border-[#d4af37]/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Google Sign-In</h3>
                <p className="text-xs text-white/50">Production OAuth & Local Testing</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-white/70">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5">
                <p className="font-medium text-white/90">How Real Google Sign-In Works:</p>
                <ol className="list-decimal list-inside space-y-1 text-white/60">
                  <li>Get a Client ID from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-[#E8C97A] underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
                  <li>Paste it into <code className="bg-white/10 px-1 py-0.5 rounded text-[#E8C97A]">frontend/.env.local</code>:</li>
                </ol>
                <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-[#E8C97A] break-all border border-white/5">
                  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com
                </div>
              </div>

              {/* Instant Test Mode */}
              <div className="border-t border-white/10 pt-3">
                <p className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8C97A]" />
                  Instant Database Test (No setup required):
                </p>
                <p className="text-[11px] text-white/50 mb-3">
                  Test creating/logging into a Google account in your live database right now:
                </p>

                <form onSubmit={handleRunDemoGoogleLogin} className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-[#E8C97A] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-mono text-white/50 mb-1">Google Email</label>
                    <input
                      type="email"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-[#E8C97A] outline-none"
                      required
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px]">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0a0f1d] font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0a0f1d]" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sign In as Google User & Save to DB</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
