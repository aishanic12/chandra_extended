"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { generateEmployeeId, type AgentGender } from "./agentProfile";
import { buildKraAgentPayload, buildSelectedKras, normalizeKraName, predefinedKraIds, type KraAgentPayload } from "./kraCatalog";

export type OnboardingState = {
  agentName: string;
  employeeId: string;
  gender: AgentGender;
  avatarId: string;
  role: string;
  maturity: string;
  permissions: string[];
  predefinedKras: string[];
  customKras: string[];
  selectedKRAs: string[];
  kraPayload: KraAgentPayload;
  onboardingCompleted: boolean;
  hydrated: boolean;
  setAgentName: (name: string) => void;
  setEmployeeId: (id: string) => void;
  setGender: (gender: AgentGender) => void;
  setAvatarId: (avatarId: string) => void;
  setRole: (role: string) => void;
  setMaturity: (m: string) => void;
  togglePermission: (permission: string) => void;
  toggleKRA: (kra: string) => void;
  addCustomKRA: (kra: string) => void;
  removeCustomKRA: (kra: string) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

const defaultState: OnboardingState = {
  agentName: "",
  employeeId: "",
  gender: "Neutral / Synthetic AI",
  avatarId: "",
  role: "AWS Cloud Engineer",
  maturity: "L2",
  permissions: [],
  predefinedKras: [],
  customKras: [],
  selectedKRAs: [],
  kraPayload: { predefinedKras: [], customKras: [], selectedKras: [] },
  onboardingCompleted: false,
  hydrated: false,
  setAgentName: () => {},
  setEmployeeId: () => {},
  setGender: () => {},
  setAvatarId: () => {},
  setRole: () => {},
  setMaturity: () => {},
  togglePermission: () => {},
  toggleKRA: () => {},
  addCustomKRA: () => {},
  removeCustomKRA: () => {},
  completeOnboarding: () => {},
  reset: () => {}
};

const OnboardingCtx = createContext<OnboardingState>(defaultState);

const STORAGE_KEY = "digital-employee-onboarding";

function readSessionStorage(): Partial<OnboardingState> | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Partial<OnboardingState>;
  } catch {
    return null;
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [agentName, setAgentName] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [gender, setGender] = useState<AgentGender>("Neutral / Synthetic AI");
  const [avatarId, setAvatarId] = useState<string>("");
  const [role, setRole] = useState<string>("AWS Cloud Engineer");
  const [maturity, setMaturity] = useState<string>("L2");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [predefinedKras, setPredefinedKras] = useState<string[]>([]);
  const [customKras, setCustomKras] = useState<string[]>([]);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);
  const selectedKRAs = useMemo(() => buildSelectedKras(predefinedKras, customKras), [predefinedKras, customKras]);
  const kraPayload = useMemo(() => buildKraAgentPayload(predefinedKras, customKras), [predefinedKras, customKras]);

  useEffect(() => {
    const parsed = readSessionStorage();
    if (parsed) {
      if (parsed.agentName) {
        setAgentName(parsed.agentName);
        setEmployeeId(parsed.employeeId || generateEmployeeId(parsed.agentName));
      }
      if (parsed.employeeId) setEmployeeId(parsed.employeeId);
      if (parsed.gender) setGender(parsed.gender);
      if (parsed.avatarId) setAvatarId(parsed.avatarId);
      if (parsed.role) setRole(parsed.role);
      if (parsed.maturity) setMaturity(parsed.maturity);
      if (Array.isArray(parsed.permissions)) setPermissions(parsed.permissions);
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
      if (typeof parsed.onboardingCompleted === "boolean") setOnboardingCompleted(parsed.onboardingCompleted);
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          agentName,
          employeeId,
          gender,
          avatarId,
          role,
          maturity,
          permissions,
          predefinedKras,
          customKras,
          selectedKRAs,
          onboardingCompleted
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [agentName, employeeId, gender, avatarId, role, maturity, permissions, predefinedKras, customKras, selectedKRAs, onboardingCompleted, hydrated]);

  function toggleKRA(kra: string) {
    setPredefinedKras((current) => (current.includes(kra) ? current.filter((k) => k !== kra) : [...current, kra]));
  }

  function togglePermission(permission: string) {
    setPermissions((current) => (current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]));
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

  function completeOnboarding() {
    setOnboardingCompleted(true);
  }

  function reset() {
    setAgentName("");
    setEmployeeId("");
    setGender("Neutral / Synthetic AI");
    setAvatarId("");
    setRole("AWS Cloud Engineer");
    setMaturity("L2");
    setPermissions([]);
    setPredefinedKras([]);
    setCustomKras([]);
    setOnboardingCompleted(false);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <OnboardingCtx.Provider
      value={{
        agentName,
        employeeId,
        gender,
        avatarId,
        role,
        maturity,
        permissions,
        predefinedKras,
        customKras,
        selectedKRAs,
        kraPayload,
        onboardingCompleted,
        hydrated,
        setAgentName,
        setEmployeeId,
        setGender,
        setAvatarId,
        setRole,
        setMaturity,
        togglePermission,
        toggleKRA,
        addCustomKRA,
        removeCustomKRA,
        completeOnboarding,
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
