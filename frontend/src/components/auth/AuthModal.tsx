"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "./LoginForm";
import FacultyLoginForm from "./FacultyLoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPassword from "./ForgotPassword";
import GuestButton from "./GuestButton";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, GraduationCap } from "lucide-react";

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "faculty" | "register" | "forgot">(authModalTab);
  const [registerRole, setRegisterRole] = useState<"student" | "faculty">("student");

  useEffect(() => {
    setActiveTab(authModalTab);
    if (authModalTab === "faculty") {
      setRegisterRole("faculty");
    } else {
      setRegisterRole("student");
    }
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/50 backdrop-blur-md"
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md rounded-2xl glass-strong border border-[var(--border-strong)] shadow-2xl p-6 sm:p-8 z-10 editor-grid overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="blob h-[200px] w-[200px] bg-[var(--syn-keyword)] -top-20 -left-20" />
          <div className="blob h-[200px] w-[200px] bg-[var(--syn-function)] -bottom-20 -right-20" />

          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-5 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/logo-icon.png"
                alt="Cryptic to Clear Logo Icon"
                className="h-10 w-auto object-contain filter drop-shadow-[0_0_14px_rgba(255,255,255,0.25)]"
              />
              <div className="flex flex-col text-left leading-none">
                <span className="font-logo-title font-bold text-xl tracking-[0.06em] text-[var(--ink)]">
                  CRYPTIC
                </span>
                <span className="font-sans font-semibold text-[10.5px] tracking-[0.3em] text-[#E8C97A] mt-1">
                  TO CLEAR
                </span>
              </div>
            </div>
            <h2 className="font-display text-xl font-semibold text-[var(--ink)] tracking-tight">
              {activeTab === "login" && "Student Login"}
              {activeTab === "faculty" && "Faculty & Institutional Portal"}
              {activeTab === "register" && (registerRole === "faculty" ? "Create Faculty Account" : "Create Account")}
              {activeTab === "forgot" && "Account Recovery"}
            </h2>
            <p className="text-xs text-[var(--ink-dim)] mt-1 font-medium">
              Cryptic to Clear • Multi-Role Compiler Platform
            </p>
          </div>

          {/* Role Switcher Tabs */}
          {(activeTab === "login" || activeTab === "faculty") && (
            <div className="flex rounded-xl p-1 bg-[var(--bg)] border border-[var(--border)] mb-5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "login"
                    ? "bg-[var(--panel)] text-[var(--ink)] font-semibold shadow-sm border border-[var(--border-strong)]"
                    : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                }`}
              >
                <User className="w-3.5 h-3.5 text-[var(--syn-function)]" />
                <span>Student Login</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("faculty")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "faculty"
                    ? "bg-[var(--panel)] text-[var(--ink)] font-semibold shadow-sm border border-[var(--border-strong)]"
                    : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-[var(--syn-keyword)]" />
                <span>Faculty Login</span>
              </button>
            </div>
          )}

          {/* Form container */}
          <div className="relative z-10">
            {activeTab === "login" && <LoginForm onSwitchTab={(tab) => setActiveTab(tab)} />}
            {activeTab === "faculty" && (
              <FacultyLoginForm
                onSwitchTab={(tab) => {
                  if (tab === "register") setRegisterRole("faculty");
                  setActiveTab(tab);
                }}
              />
            )}
            {activeTab === "register" && (
              <RegisterForm
                initialRole={registerRole}
                onSwitchTab={() => setActiveTab("login")}
              />
            )}
            {activeTab === "forgot" && <ForgotPassword onSwitchTab={() => setActiveTab("login")} />}
          </div>

          {/* Guest Footer & Full Screen Portal Link */}
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <GuestButton />
            <Link
              href="/login"
              onClick={closeAuthModal}
              className="text-[#E8C97A] hover:underline flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span>Full Page Portal</span>
              <span>↗</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
