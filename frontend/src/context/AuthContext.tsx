"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, loginUser, loginFacultyDemo, registerUser, logoutUser, fetchMe, requestForgotPassword, RegisterOptions, GoogleAuthPayload, loginWithGoogle } from "@/lib/api";

type AuthTab = "login" | "register" | "forgot" | "faculty";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthTab;
  openAuthModal: (tab?: AuthTab) => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginAsFacultyDemo: () => Promise<{ success: boolean; message?: string }>;
  loginWithGoogleAccount: (data: GoogleAuthPayload) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, options?: "student" | "faculty" | RegisterOptions) => Promise<{ success: boolean; message?: string }>;
  logout: (redirectTo?: string) => Promise<void>;
  continueAsGuest: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; demoNote?: string }>;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthTab>("login");

  useEffect(() => {
    // Check initial auth state
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("c2c_token") : null;
    const guestStatus = typeof window !== "undefined" ? localStorage.getItem("c2c_guest") === "true" : true;

    if (savedToken) {
      setToken(savedToken);
    }
    setIsGuest(guestStatus);

    fetchMe(savedToken || undefined)
      .then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
          setIsGuest(false);
        } else if (res.isNetworkError) {
          // Backend may be sleeping or temporarily connecting; keep session intact
          console.warn("Session check delayed due to network; keeping token for next retry.");
        } else {
          setUser(null);
          // Only if token explicitly failed validation (e.g. 401 Unauthorized), clean up
          if (savedToken) {
            localStorage.removeItem("c2c_token");
            setToken(null);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openAuthModal = (tab: AuthTab = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      setIsGuest(false);
      localStorage.setItem("c2c_guest", "false");
      if (res.token) {
        setToken(res.token);
        localStorage.setItem("c2c_token", res.token);
      }
      setIsAuthModalOpen(false);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || "Invalid credentials." };
  };

  const loginAsFacultyDemo = async () => {
    const res = await loginFacultyDemo();
    if (res.success && res.user) {
      setUser(res.user);
      setIsGuest(false);
      localStorage.setItem("c2c_guest", "false");
      if (res.token) {
        setToken(res.token);
        localStorage.setItem("c2c_token", res.token);
      }
      setIsAuthModalOpen(false);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || "Failed to sign into faculty demo." };
  };

  const loginWithGoogleAccount = async (data: GoogleAuthPayload) => {
    const res = await loginWithGoogle(data);
    if (res.success && res.user) {
      setUser(res.user);
      setIsGuest(false);
      localStorage.setItem("c2c_guest", "false");
      if (res.token) {
        setToken(res.token);
        localStorage.setItem("c2c_token", res.token);
      }
      setIsAuthModalOpen(false);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || "Google sign-in failed." };
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    options: "student" | "faculty" | RegisterOptions = "student"
  ) => {
    const res = await registerUser(name, email, pass, options);
    if (res.success && res.user) {
      setUser(res.user);
      setIsGuest(false);
      localStorage.setItem("c2c_guest", "false");
      if (res.token) {
        setToken(res.token);
        localStorage.setItem("c2c_token", res.token);
      }
      setIsAuthModalOpen(false);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || "Registration failed." };
  };

  const logout = async (redirectTo: string = "/login") => {
    try {
      await logoutUser();
    } catch {
      // ignore network errors
    }
    setUser(null);
    setToken(null);
    setIsGuest(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem("c2c_token");
      localStorage.setItem("c2c_guest", "true");
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("c2c_guest", "true");
    }
    setIsAuthModalOpen(false);
  };

  const forgotPassword = async (email: string) => {
    return requestForgotPassword(email);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isGuest,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        loginAsFacultyDemo,
        loginWithGoogleAccount,
        register,
        logout,
        continueAsGuest,
        forgotPassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
