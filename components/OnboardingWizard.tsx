"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/store/OnboardingContext";
import { normalizeKraName, predefinedKraCatalog } from "@/store/kraCatalog";

const roles = [
  "AWS Cloud Engineer",
  "Java Developer",
  "Azure Cloud Engineer",
  "DevOps Engineer",
  "Security Analyst",
  "Kubernetes Administrator"
];

const maturities = ["L1", "L2", "L3", "L4"];

export default function OnboardingWizard() {
  const router = useRouter();
  const {
    agentName,
    setAgentName,
    role,
    setRole,
    maturity,
    setMaturity,
    selectedKRAs,
    customKras,
    toggleKRA,
    addCustomKRA,
    removeCustomKRA
  } = useOnboarding();
  const [step, setStep] = useState(0);
  const [localName, setLocalName] = useState(agentName || "");
  const [deployStage, setDeployStage] = useState<number>(0);
  const [customKraInput, setCustomKraInput] = useState("");

  useEffect(() => {
    setLocalName(agentName);
  }, [agentName]);

  const canNext = useMemo(() => {
    if (step === 0) return localName.trim().length > 0;
    if (step === 1) return role === "AWS Cloud Engineer";
    if (step === 2) return maturity === "L2";
    if (step === 3) return selectedKRAs.length > 0;
    return true;
  }, [step, localName, role, maturity, selectedKRAs.length]);

  function next() {
    if (step === 0) setAgentName(localName.trim());
    if (step === 3) {
      setStep(4);
      runDeploymentSequence();
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function addCustomKrasFromInput() {
    const entries = customKraInput
      .split(/[\n,]+/)
      .map((entry) => normalizeKraName(entry))
      .filter(Boolean);

    entries.forEach((entry) => addCustomKRA(entry));
    if (entries.length) setCustomKraInput("");
  }

  function runDeploymentSequence() {
    const stages = [
      "Initializing agent identity",
      "Configuring AWS cloud operations",
      "Provisioning monitoring and alerting",
      "Configuring deployment intelligence",
      "Activating audit and compliance stream",
      "Deployment complete"
    ];
    let index = 0;
    setDeployStage(0);
    const timer = window.setInterval(() => {
      index += 1;
      setDeployStage(index);
      if (index >= stages.length) {
        window.clearInterval(timer);
        setTimeout(() => router.push("/dashboard"), 700);
      }
    }, 900);
  }

  return (
    <div className="min-h-screen bg-obsidian text-frost flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-2xl border border-white/8 bg-black/40 p-6 shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="name" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-semibold">Name your digital employee</h2>
                  <p className="text-muted mt-2">Give the agent a polished identity that appears throughout the dashboard.</p>
                </div>
                <label className="block">
                  <input
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Enter agent name…"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xl text-frost outline-none transition focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/15"
                  />
                </label>
                {localName.trim().length > 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-frost/75">Initializing identity for <span className="font-semibold text-frost">{localName.toUpperCase()}</span></div>
                ) : null}
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push("/dashboard")} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-muted">Cancel</button>
                  <button onClick={next} disabled={!canNext} className="ml-auto rounded-2xl bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-200 disabled:opacity-50">Continue</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="role" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-semibold">Select Role</h3>
              <p className="text-muted mt-2">Choose the operating role for your digital employee.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((r) => {
                  const disabled = r !== "AWS Cloud Engineer";
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => !disabled && setRole(r)}
                      disabled={disabled}
                      className={`text-left rounded-3xl border px-4 py-5 transition ${disabled ? "cursor-not-allowed opacity-60 border-white/10 bg-black/20" : role === r ? "border-emerald-300/60 bg-emerald-300/10" : "border-white/10 bg-black/30 hover:border-emerald-300/20 hover:bg-black/40"}`}
                    >
                      <div className="font-semibold text-frost">{r}</div>
                      <div className="mt-2 text-sm leading-6 text-frost/75">{disabled ? "Coming Soon" : "Available now"}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={prev} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-muted">Back</button>
                <button onClick={next} disabled={!canNext} className="ml-auto rounded-2xl bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-200 disabled:opacity-50">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="maturity" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-semibold">Select Maturity Level</h3>
              <p className="text-muted mt-2">Pick the capability maturity for this deployment.</p>
              <div className="mt-6 grid gap-4 grid-cols-4">
                {maturities.map((m) => {
                  const disabled = m !== "L2";
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => !disabled && setMaturity(m)}
                      disabled={disabled}
                      className={`rounded-lg p-4 text-center transition ${disabled ? "cursor-not-allowed opacity-60 border-white/10 bg-black/20" : maturity === m ? "border-emerald-300/60 bg-emerald-300/10" : "border-white/10 bg-black/30 hover:border-emerald-300/20 hover:bg-black/40"}`}
                    >
                      <div className="text-lg font-bold">{m}</div>
                      <div className="text-sm text-frost/70 mt-2">{m === "L1" ? "Beginner Digital Worker" : m === "L2" ? "Intermediate Cloud Engineer" : m === "L3" ? "Senior Autonomous Engineer" : "Enterprise Operations Architect"}</div>
                      <div className="mt-2 text-[11px] uppercase tracking-[0.08em] text-muted">{disabled ? "Future Release" : "Available"}</div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={prev} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-muted">Back</button>
                <button onClick={next} disabled={!canNext} className="ml-auto rounded-2xl bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-200 disabled:opacity-50">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="kras" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-semibold">Select capability modules</h3>
              <p className="text-muted mt-2">Choose the KRAs that will shape your operational dashboard.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {predefinedKraCatalog.map((kra) => (
                  <label key={kra.id} className="flex cursor-pointer items-start gap-4 rounded-3xl border border-white/10 bg-black/30 p-5 transition hover:border-emerald-300/20">
                    <input
                      type="checkbox"
                      checked={selectedKRAs.includes(kra.id)}
                      onChange={() => toggleKRA(kra.id)}
                      className="mt-1 h-4 w-4 accent-emerald-300"
                    />
                    <div>
                      <div className="font-semibold text-frost">{kra.id}</div>
                      <div className="mt-2 text-sm text-frost/70">{kra.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={customKraInput}
                    onChange={(event) => setCustomKraInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomKrasFromInput();
                      }
                    }}
                    placeholder="Add custom KRA..."
                    className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-frost outline-none transition placeholder:text-muted focus:border-emerald-300/40 focus:ring-2 focus:ring-emerald-300/15"
                  />
                  <button
                    type="button"
                    onClick={addCustomKrasFromInput}
                    disabled={!customKraInput.trim()}
                    className="rounded-2xl border border-white/10 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/30 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                {customKras.length > 0 ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {customKras.map((kra) => (
                      <label key={kra} className="flex cursor-pointer items-start gap-4 rounded-3xl border border-white/10 bg-black/30 p-5 transition hover:border-emerald-300/20">
                        <input
                          type="checkbox"
                          checked
                          onChange={() => removeCustomKRA(kra)}
                          className="mt-1 h-4 w-4 accent-emerald-300"
                        />
                        <div>
                          <div className="font-semibold text-frost">{kra}</div>
                          <div className="mt-2 text-sm text-frost/70">Custom operational KRA included in agent evaluation.</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={prev} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-muted">Back</button>
                <button onClick={next} disabled={!canNext} className="ml-auto rounded-2xl bg-signal px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">Deploy Digital Employee</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="deploy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center">
                <h3 className="text-2xl font-semibold">Deploying {agentName || localName}…</h3>
                <p className="text-muted mt-2">Provisioning intelligence, connecting to cloud telemetry, and activating operational workflows.</p>
                <div className="mt-8 space-y-4">
                  {[
                    "Initializing agent identity",
                    "Configuring AWS cloud operations",
                    "Provisioning monitoring and alerting",
                    "Configuring deployment intelligence",
                    "Activating audit and compliance stream",
                    "Deployment complete"
                  ].map((label, idx) => (
                    <div key={label} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left">
                      <div className="text-sm text-muted">{label}</div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-emerald-300"
                          animate={{ width: `${Math.min(100, ((deployStage - 0) / 5) * 100)}%` }}
                          transition={{ duration: 0.9 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5 text-left text-sm text-frost/70">
                  {deployStage >= 5
                    ? `${agentName || localName} is operational and ready for the dashboard.`
                    : "Preparing deployment pipeline and activating your AI operations employee."}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
