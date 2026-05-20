"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type OnboardingState = {
  agentName: string;
  role: string;
  maturity: string;
  selectedKRAs: string[];
  setAgentName: (name: string) => void;
  setRole: (role: string) => void;
  setMaturity: (m: string) => void;
  toggleKRA: (kra: string) => void;
  reset: () => void;
};

const defaultState: OnboardingState = {
  agentName: "",
  role: "AWS Cloud Engineer",
  maturity: "L2",
  selectedKRAs: [],
  setAgentName: () => {},
  setRole: () => {},
  setMaturity: () => {},
  toggleKRA: () => {},
  reset: () => {}
};

const OnboardingCtx = createContext<OnboardingState>(defaultState);

const STORAGE_KEY = "digital-employee-onboarding";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [agentName, setAgentName] = useState<string>("");
  const [role, setRole] = useState<string>("AWS Cloud Engineer");
  const [maturity, setMaturity] = useState<string>("L2");
  const [selectedKRAs, setSelectedKRAs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.agentName) setAgentName(parsed.agentName);
        if (parsed.role) setRole(parsed.role);
        if (parsed.maturity) setMaturity(parsed.maturity);
        if (Array.isArray(parsed.selectedKRAs)) setSelectedKRAs(parsed.selectedKRAs);
      }
    } catch {
      // ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ agentName, role, maturity, selectedKRAs })
      );
    } catch {
      // ignore storage errors
    }
  }, [agentName, role, maturity, selectedKRAs, hydrated]);

  function toggleKRA(kra: string) {
    setSelectedKRAs((current) => (current.includes(kra) ? current.filter((k) => k !== kra) : [...current, kra]));
  }

  function reset() {
    setAgentName("");
    setRole("AWS Cloud Engineer");
    setMaturity("L2");
    setSelectedKRAs([]);
  }

  return (
    <OnboardingCtx.Provider
      value={{ agentName, role, maturity, selectedKRAs, setAgentName, setRole, setMaturity, toggleKRA, reset }}
    >
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingCtx);
}
