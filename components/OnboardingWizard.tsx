"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/store/OnboardingContext";

const roles = [
  "AWS Cloud Engineer",
  "Java Developer",
  "Azure Cloud Engineer",
  "DevOps Engineer",
  "Security Analyst",
  "Kubernetes Administrator"
];

const maturities = ["L1", "L2", "L3", "L4"];

const defaultKRAs = [
  { id: "Infrastructure Monitoring", desc: "Proactively monitor infrastructure and surface anomalies." },
  { id: "Incident Detection", desc: "Detect incidents with high confidence and triage autonomously." },
  { id: "Cost Optimization", desc: "Identify cost anomalies and recommend rightsizing." },
  { id: "Deployment Intelligence", desc: "Automate safe deployment flows with guardrails." },
  { id: "Audit & Compliance", desc: "Preserve evidence and enforce policy controls." }
];

export default function OnboardingWizard() {
  const router = useRouter();
  const { agentName, setAgentName, role, setRole, maturity, setMaturity, selectedKRAs, toggleKRA } = useOnboarding();
  const [step, setStep] = useState(0);
  const [localName, setLocalName] = useState(agentName || "");
  const [deployStage, setDeployStage] = useState<number>(0);

  useEffect(() => {
    setLocalName(agentName);
  }, [agentName]);

  const canNext = useMemo(() => {
    if (step === 1) return localName.trim().length > 0;
    if (step === 2) return role === "AWS Cloud Engineer";
    if (step === 3) return maturity === "L2";
    return true;
  }, [step, localName, role, maturity]);

  function next() {
    if (step === 1) setAgentName(localName.trim());
    if (step === 5) {
      setStep(6); // deployment
      runDeploymentSequence();
      return;
    }
    setStep((s) => Math.min(s + 1, 6));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function runDeploymentSequence() {
    const stages = [0, 1, 2, 3, 4, 5];
    let i = 0;
    setDeployStage(0);
    const timer = setInterval(() => {
      i += 1;
      setDeployStage(i);
      if (i >= stages.length) {
        clearInterval(timer);
        // finish and navigate to dashboard after brief pause
        setTimeout(() => router.push("/"), 800);
      }
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-obsidian text-frost flex items-center justify-center p-6">
      <div className="w-full max-w-5xl rounded-2xl border border-white/8 bg-black/40 p-6 shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="landing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="text-4xl font-bold">Build Your Digital Cloud Workforce</h2>
                  <p className="mt-3 text-muted">Deploy AI-powered cloud engineers capable of monitoring, troubleshooting, and optimizing enterprise infrastructure.</p>
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setStep(1)} className="rounded-lg bg-signal px-4 py-2 font-semibold text-black">Create Digital Employee</button>
                    <button onClick={() => router.push("/")} className="rounded-lg border border-white/10 px-4 py-2 text-muted">Skip Onboarding</button>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-56 rounded-xl bg-gradient-to-tr from-signal/10 via-amber/6 to-emerald/8 p-4">
                    <div className="h-full w-full flex items-center justify-center text-3xl font-semibold text-frost/80">Cinematic Cloud Visualization</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="name" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-semibold">Name Your Digital Employee</h3>
              <p className="text-muted mt-2">Give your digital employee an identity that will appear across the platform.</p>
              <div className="mt-6">
                <input
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder="Enter agent name…"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xl outline-none focus:border-signal/60 focus:ring-2 focus:ring-signal/20"
                />
                <div className="mt-2 text-amber">Examples: Chandra · Nova · Athena · Sentinel</div>
                {localName.trim().length > 0 ? (
                  <div className="mt-3 text-frost/75">Initializing identity for {localName.toUpperCase()}…</div>
                ) : null}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={prev} className="rounded-lg border border-white/10 px-3 py-2 text-muted">Back</button>
                <button onClick={next} disabled={!canNext} className="ml-auto rounded-lg bg-emerald-300/10 px-4 py-2 font-semibold text-emerald-200 disabled:opacity-50">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="role" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-semibold">Select Role</h3>
              <p className="text-muted mt-2">Choose the operating role for your digital employee.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((r) => {
                  const disabled = r !== "AWS Cloud Engineer";
                  return (
                    <div key={r} className={`rounded-xl p-4 transition ${disabled ? "opacity-50 blur-sm" : "hover:shadow-2xl hover:scale-102 border-signal/30"} border`}
                      onClick={() => !disabled && setRole(r)}>
                      <div className="font-semibold">{r}</div>
                      <div className="text-sm text-muted mt-2">{disabled ? "Coming Soon" : "Premium enterprise capability"}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={prev} className="rounded-lg border border-white/10 px-3 py-2 text-muted">Back</button>
                <button onClick={next} disabled={!canNext} className="ml-auto rounded-lg bg-emerald-300/10 px-4 py-2 font-semibold text-emerald-200 disabled:opacity-50">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="maturity" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-semibold">Select Maturity Level</h3>
              <p className="text-muted mt-2">Pick the capability maturity for this deployment.</p>
              <div className="mt-6 grid gap-4 grid-cols-4">
                {maturities.map((m) => {
                  const disabled = m !== "L2";
                  return (
                    <div key={m} onClick={() => !disabled && setMaturity(m)} className={`rounded-lg p-4 text-center ${disabled ? "opacity-50 border-white/6" : "border-signal/40 shadow-lg"}`}>
                      <div className="text-lg font-bold">{m}</div>
                      <div className="text-sm text-muted mt-2">{m === "L1" ? "Beginner Digital Worker" : m === "L2" ? "Intermediate Cloud Engineer" : m === "L3" ? "Senior Autonomous Engineer" : "Enterprise Operations Architect"}</div>
                      {disabled ? <div className="mt-2 text-[11px] uppercase text-muted">Future Release</div> : <div className="mt-2 text-[11px] text-emerald-300">Selected</div>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={prev} className="rounded-lg border border-white/10 px-3 py-2 text-muted">Back</button>
                <button onClick={next} disabled={!canNext} className="ml-auto rounded-lg bg-emerald-300/10 px-4 py-2 font-semibold text-emerald-200 disabled:opacity-50">Continue</button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="kras" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-semibold">Auto-Generated KRAs</h3>
              <p className="text-muted mt-2">Tailored objectives for an {role} at {maturity}.</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {defaultKRAs.map((kra) => (
                  <label key={kra.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/8 p-4">
                    <input type="checkbox" checked={selectedKRAs.includes(kra.id)} onChange={() => toggleKRA(kra.id)} className="mt-1" />
                    <div>
                      <div className="font-semibold">{kra.id}</div>
                      <div className="text-sm text-muted mt-1">{kra.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={prev} className="rounded-lg border border-white/10 px-3 py-2 text-muted">Back</button>
                <button onClick={() => setStep(5)} className="ml-auto rounded-lg bg-emerald-300/10 px-4 py-2 font-semibold text-emerald-200">Review & Deploy</button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="text-2xl font-semibold">Review & Deploy</h3>
              <p className="text-muted mt-2">Confirm configuration before provisioning your digital employee.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-white/8 p-4">
                  <div className="text-sm text-muted">Agent Name</div>
                  <div className="mt-1 text-lg font-semibold">{agentName || localName}</div>
                </div>
                <div className="rounded-lg border border-white/8 p-4">
                  <div className="text-sm text-muted">Role</div>
                  <div className="mt-1 text-lg font-semibold">{role}</div>
                </div>
                <div className="rounded-lg border border-white/8 p-4">
                  <div className="text-sm text-muted">Maturity</div>
                  <div className="mt-1 text-lg font-semibold">{maturity}</div>
                </div>
                <div className="rounded-lg border border-white/8 p-4">
                  <div className="text-sm text-muted">KRAs</div>
                  <div className="mt-1 text-lg">{selectedKRAs.join(", ")}</div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={prev} className="rounded-lg border border-white/10 px-3 py-2 text-muted">Back</button>
                <button onClick={next} className="ml-auto rounded-lg bg-signal px-4 py-2 font-semibold text-black">Deploy Digital Employee</button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="deploy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center">
                <h3 className="text-2xl font-semibold">Deploying {agentName || localName}…</h3>
                <p className="text-muted mt-2">Provisioning intelligence, connecting to cloud telemetry, and activating operational workflows.</p>
                <div className="mt-8 space-y-4">
                  {[
                    "Initializing Agent Identity...",
                    "Configuring AWS Cloud Engineering Capabilities...",
                    "Provisioning Operational Intelligence...",
                    "Connecting Cloud Monitoring Systems...",
                    "Deploying Digital Employee...",
                    "Agent Successfully Activated"
                  ].map((label, idx) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="min-w-[240px] text-left text-sm text-muted">{label}</div>
                      <div className="flex-1">
                        <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
                          <motion.div className="h-full bg-emerald-300" animate={{ width: `${Math.min(100, ((deployStage - 0) / 5) * 100)}%` }} transition={{ duration: 0.9 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <div className="text-emerald-300 font-semibold">{deployStage >= 5 ? `${agentName || localName} is now operational.` : "Provisioning in progress…"}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
