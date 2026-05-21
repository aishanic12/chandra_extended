"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { buildKraAgentPayload, buildSelectedKras, normalizeKraName, predefinedKraIds, type KraAgentPayload } from "./kraCatalog";

export type OnboardingState = {
  agentName: string;
  role: string;
  maturity: string;
  predefinedKras: string[];
  customKras: string[];
  selectedKRAs: string[];
  kraPayload: KraAgentPayload;
  setAgentName: (name: string) => void;
  setRole: (role: string) => void;
  setMaturity: (m: string) => void;
  toggleKRA: (kra: string) => void;
  addCustomKRA: (kra: string) => void;
  removeCustomKRA: (kra: string) => void;
  reset: () => void;
};

const defaultState: OnboardingState = {
  agentName: "",
  role: "AWS Cloud Engineer",
  maturity: "L2",
  predefinedKras: [],
  customKras: [],
  selectedKRAs: [],
  kraPayload: { predefinedKras: [], customKras: [], selectedKras: [] },
  setAgentName: () => {},
  setRole: () => {},
  setMaturity: () => {},
  toggleKRA: () => {},
  addCustomKRA: () => {},
  removeCustomKRA: () => {},
  reset: () => {}
};

const OnboardingCtx = createContext<OnboardingState>(defaultState);

const STORAGE_KEY = "digital-employee-onboarding";

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [agentName, setAgentName] = useState<string>("");
  const [role, setRole] = useState<string>("AWS Cloud Engineer");
  const [maturity, setMaturity] = useState<string>("L2");
  const [predefinedKras, setPredefinedKras] = useState<string[]>([]);
  const [customKras, setCustomKras] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const selectedKRAs = useMemo(() => buildSelectedKras(predefinedKras, customKras), [predefinedKras, customKras]);
  const kraPayload = useMemo(() => buildKraAgentPayload(predefinedKras, customKras), [predefinedKras, customKras]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.agentName) setAgentName(parsed.agentName);
        if (parsed.role) setRole(parsed.role);
        if (parsed.maturity) setMaturity(parsed.maturity);
        if (Array.isArray(parsed.predefinedKras)) {
          setPredefinedKras(parsed.predefinedKras);
        } else if (Array.isArray(parsed.selectedKRAs)) {
          setPredefinedKras(parsed.selectedKRAs.filter((kra: string) => predefinedKraIds.includes(kra)));
        }
        if (Array.isArray(parsed.customKras)) {
          setCustomKras(parsed.customKras);
        } else if (Array.isArray(parsed.selectedKRAs)) {
          setCustomKras(parsed.selectedKRAs.filter((kra: string) => !predefinedKraIds.includes(kra)));
        }
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
        JSON.stringify({ agentName, role, maturity, predefinedKras, customKras, selectedKRAs })
      );
    } catch {
      // ignore storage errors
    }
  }, [agentName, role, maturity, predefinedKras, customKras, selectedKRAs, hydrated]);

  function toggleKRA(kra: string) {
    setPredefinedKras((current) => (current.includes(kra) ? current.filter((k) => k !== kra) : [...current, kra]));
  }

  function addCustomKRA(kra: string) {
    const normalized = normalizeKraName(kra);
    if (!normalized) return;
    setCustomKras((current) => {
      const exists = buildSelectedKras(predefinedKras, current).some((item) => item.toLowerCase() === normalized.toLowerCase());
      return exists ? current : [...current, normalized];
    });
  }

  function removeCustomKRA(kra: string) {
    setCustomKras((current) => current.filter((item) => item !== kra));
  }

  function reset() {
    setAgentName("");
    setRole("AWS Cloud Engineer");
    setMaturity("L2");
    setPredefinedKras([]);
    setCustomKras([]);
  }

  return (
    <OnboardingCtx.Provider
      value={{
        agentName,
        role,
        maturity,
        predefinedKras,
        customKras,
        selectedKRAs,
        kraPayload,
        setAgentName,
        setRole,
        setMaturity,
        toggleKRA,
        addCustomKRA,
        removeCustomKRA,
        reset
      }}
    >
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingCtx);
}
