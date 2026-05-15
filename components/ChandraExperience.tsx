"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Command,
  FileClock,
  Filter,
  MailCheck,
  RadioTower,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Terminal,
  X
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type Severity = "P1" | "P2" | "P3" | "P4";
type IncidentStatus = "Resolved" | "Investigating" | "Escalated" | "Monitoring" | "Awaiting Approval";

type OpsEvent = {
  id: string;
  time: string;
  severity: Severity;
  status: IncidentStatus;
  incident: string;
  service: string;
  account: string;
  confidence: number;
  resolution: string;
};

type Incident = OpsEvent & {
  triage: string;
  eta: string;
  rootCause: string;
  humanEscalation: string;
};

const metricSeed = [
  { key: "P", label: "Productivity", value: 92, color: "#ff3b30", weight: "1.0x" },
  { key: "Q", label: "Quality", value: 96, color: "#f4efe7", weight: "1.0x" },
  { key: "E", label: "Efficiency", value: 89, color: "#ffb347", weight: "1.5x" },
  { key: "G", label: "Goal Attainment", value: 87, color: "#ff6a3d", weight: "1.0x" },
  { key: "R", label: "Reliability", value: 98, color: "#ffb347", weight: "1.5x" },
  { key: "C", label: "Collaboration", value: 83, color: "#8ed9a8", weight: "1.0x" },
  { key: "V", label: "Value Add", value: 94, color: "#ff3b30", weight: "1.0x" }
];

const trendData = [
  { t: "00", score: 83, risk: 24, kra: 76 },
  { t: "04", score: 86, risk: 19, kra: 80 },
  { t: "08", score: 91, risk: 16, kra: 84 },
  { t: "12", score: 89, risk: 21, kra: 86 },
  { t: "16", score: 94, risk: 13, kra: 90 },
  { t: "20", score: 96, risk: 11, kra: 92 },
  { t: "24", score: 95, risk: 12, kra: 93 }
];

const baseEvents: OpsEvent[] = [
  {
    id: "evt-001",
    time: "14:42:11",
    severity: "P2",
    status: "Resolved",
    incident: "IAM policy drift detected",
    service: "IAM",
    account: "LS-Prod-2147",
    confidence: 96,
    resolution: "Auto-remediated by reverting policy to least-privilege baseline and attaching evidence to CHG-4912."
  },
  {
    id: "evt-002",
    time: "14:43:26",
    severity: "P1",
    status: "Awaiting Approval",
    incident: "S3 bucket exposure blocked",
    service: "S3",
    account: "Clinical-Data-8821",
    confidence: 91,
    resolution: "Public ACL was blocked, bucket policy was quarantined, and human approval is pending for production write-lock."
  },
  {
    id: "evt-003",
    time: "14:44:03",
    severity: "P3",
    status: "Monitoring",
    incident: "EC2 cost anomaly terminated",
    service: "EC2",
    account: "Research-Compute-1190",
    confidence: 94,
    resolution: "Idle burst fleet was terminated after workload owner validation; rightsizing ticket and billing trace generated."
  },
  {
    id: "evt-004",
    time: "14:45:38",
    severity: "P2",
    status: "Resolved",
    incident: "CloudTrail delivery restored",
    service: "CloudTrail",
    account: "GxP-Audit-3308",
    confidence: 98,
    resolution: "Trail target bucket encryption was corrected and delivery validation evidence was written to the SOC2 pack."
  },
  {
    id: "evt-005",
    time: "14:46:19",
    severity: "P4",
    status: "Resolved",
    incident: "MFA enforcement applied",
    service: "IAM Identity Center",
    account: "Shared-Services-4472",
    confidence: 99,
    resolution: "Conditional access rule was applied to 18 stale users and notification draft queued for identity operations."
  }
];

const incidents: Incident[] = [
  {
    ...baseEvents[1],
    triage: "01m 12s",
    eta: "06m",
    rootCause: "Legacy data transfer role attempted public ACL write against regulated bucket.",
    humanEscalation: "Required: production data plane approval"
  },
  {
    ...baseEvents[0],
    triage: "42s",
    eta: "Complete",
    rootCause: "Terraform module drift from emergency role patch.",
    humanEscalation: "None"
  },
  {
    ...baseEvents[2],
    triage: "02m 04s",
    eta: "Monitoring",
    rootCause: "Batch genomics workload left c7i fleet running after completion signal failed.",
    humanEscalation: "Leadership digest queued"
  },
  {
    ...baseEvents[3],
    triage: "51s",
    eta: "Complete",
    rootCause: "KMS key alias mismatch after cross-account evidence bucket rotation.",
    humanEscalation: "None"
  },
  {
    id: "evt-006",
    time: "14:47:54",
    severity: "P2",
    status: "Escalated",
    incident: "GuardDuty unauthorized API call",
    service: "GuardDuty",
    account: "Pharma-Prod-7710",
    confidence: 87,
    resolution: "Session token was revoked, source role was isolated, and forensic evidence bundle is awaiting security review.",
    triage: "01m 49s",
    eta: "18m",
    rootCause: "Suspicious AssumeRole chain from unmanaged workstation network.",
    humanEscalation: "Security owner assigned"
  }
];

const tickerItems = [
  { label: "Security anomalies detected", value: 7, tone: "text-signal" },
  { label: "IAM drift events", value: 2, tone: "text-amber" },
  { label: "Public exposure risks", value: 1, tone: "text-signal" },
  { label: "Cost spikes", value: 3, tone: "text-amber" },
  { label: "Compliance gaps", value: 4, tone: "text-frost" },
  { label: "Unauthorized API calls", value: 1, tone: "text-signal" },
  { label: "GuardDuty findings", value: 5, tone: "text-emerald-300" }
];

const kraRows = [
  {
    id: "KRA-01",
    title: "Cloud Cost Anomaly Detection",
    target: "Detect anomalies > $500/day within 1 hour",
    actual: "97% detection rate",
    confidence: 94,
    automation: "72%",
    how: ["CloudWatch anomaly triggers", "Automated EC2 rightsizing", "Lambda remediation workflows", "Continuous billing scans"],
    evidence: ["CUR trace CUR-8821", "Incident INC-2044", "Remediation log RMD-5510", "Ticket PD-9832"],
    timeline: ["14:13 anomaly detected", "14:14 owner context resolved", "14:16 idle fleet stopped", "14:19 finance evidence generated"]
  },
  {
    id: "KRA-02",
    title: "GxP Audit Evidence Coverage",
    target: "Maintain > 92% evidence completeness",
    actual: "95.4% evidence completeness",
    confidence: 96,
    automation: "81%",
    how: ["CloudTrail validation", "Security Hub control mapping", "Evidence pack generation", "Immutable S3 retention checks"],
    evidence: ["SOC2 pack SOC2-MAY-15", "GxP control map GXP-117", "Evidence hash 9f3a2c", "Reviewer note QA-54"],
    timeline: ["09:00 control scope loaded", "10:12 missing artifact found", "10:18 evidence regenerated", "10:21 reviewer packet queued"]
  },
  {
    id: "KRA-03",
    title: "Privileged Access Drift Reduction",
    target: "Reduce privilege drift within 30 minutes",
    actual: "22 minute median remediation",
    confidence: 91,
    automation: "68%",
    how: ["IAM Access Analyzer", "Least-privilege baselines", "Terraform PR preparation", "Human approval for production deletes"],
    evidence: ["IAM diff IAM-771", "PR TF-3019", "Approval APV-448", "Rollback log RB-901"],
    timeline: ["12:02 drift detected", "12:08 blast radius scored", "12:16 PR generated", "12:24 baseline restored"]
  }
];

const complianceData = [
  { day: "Mon", soc2: 88, gxp: 84, policy: 91 },
  { day: "Tue", soc2: 91, gxp: 87, policy: 92 },
  { day: "Wed", soc2: 93, gxp: 90, policy: 94 },
  { day: "Thu", soc2: 92, gxp: 93, policy: 95 },
  { day: "Fri", soc2: 96, gxp: 95, policy: 96 }
];

const regionNodes = [
  { label: "us-east-1", x: 18, y: 24, state: "active" },
  { label: "us-west-2", x: 31, y: 68, state: "watch" },
  { label: "eu-west-1", x: 58, y: 30, state: "active" },
  { label: "ap-south-1", x: 76, y: 64, state: "review" },
  { label: "ca-central-1", x: 43, y: 48, state: "active" }
];

function nowTime(offset = 0) {
  const d = new Date(Date.now() + offset);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ label, title, copy }: { label: string; title: string; copy?: string }) {
  return (
    <Reveal className="mb-12 max-w-5xl">
      <div className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-amber">
        <span className="h-px w-12 bg-signal" />
        {label}
      </div>
      <h2 className="display text-4xl leading-[0.95] text-frost md:text-6xl lg:text-7xl">{title}</h2>
      {copy ? <p className="mt-6 max-w-3xl text-sm leading-7 text-muted md:text-base">{copy}</p> : null}
    </Reveal>
  );
}

function ParticleField() {
  const points = useMemo(
    () => Array.from({ length: 34 }, (_, i) => ({ x: 5 + ((i * 23) % 91), y: 8 + ((i * 31) % 78), delay: i * 0.08 })),
    []
  );

  return (
    <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="flowLine" x1="0" x2="1">
          <stop stopColor="#ff3b30" stopOpacity="0.08" />
          <stop offset="0.55" stopColor="#ffb347" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8ed9a8" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      {regionNodes.slice(0, -1).map((node, index) => (
        <motion.line
          key={node.label}
          x1={node.x}
          y1={node.y}
          x2={regionNodes[index + 1].x}
          y2={regionNodes[index + 1].y}
          stroke="url(#flowLine)"
          strokeWidth="0.16"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.18, 0.8, 0.18] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: index * 0.35 }}
        />
      ))}
      {points.map((point, index) => (
        <motion.circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="0.22"
          fill={index % 5 === 0 ? "#8ed9a8" : index % 3 === 0 ? "#ffb347" : "#ff3b30"}
          animate={{ opacity: [0.18, 0.9, 0.18], scale: [0.8, 1.8, 0.8] }}
          transition={{ duration: 3.4, repeat: Infinity, delay: point.delay }}
        />
      ))}
    </svg>
  );
}

function SeverityPill({ value }: { value: Severity }) {
  const tone = {
    P1: "border-signal/50 bg-signal/15 text-signal",
    P2: "border-amber/45 bg-amber/12 text-amber",
    P3: "border-white/18 bg-white/[0.04] text-frost",
    P4: "border-emerald-300/35 bg-emerald-300/10 text-emerald-300"
  }[value];

  return <span className={cx("inline-flex w-12 items-center justify-center border px-2 py-1 text-xs font-semibold", tone)}>{value}</span>;
}

function StatusDot({ status }: { status: IncidentStatus }) {
  const tone = status === "Resolved" ? "bg-emerald-300" : status === "Escalated" || status === "Awaiting Approval" ? "bg-signal" : "bg-amber";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cx("h-2 w-2 rounded-full", tone, status !== "Resolved" && "pulse-core")} />
      {status}
    </span>
  );
}

function Hero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.18], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.18], [1, 0.25]);

  return (
    <section className="relative min-h-screen overflow-hidden px-5 py-8 md:px-10">
      <ParticleField />
      <motion.div style={{ y, opacity }} className="absolute inset-x-0 top-12 mx-auto h-[680px] max-w-7xl">
        <div className="absolute right-0 top-12 hidden h-[560px] w-[560px] rounded-full border border-signal/15 bg-signal/5 blur-sm md:block" />
        <div className="absolute left-0 top-36 h-72 w-72 rounded-full border border-emerald-300/10 bg-emerald-300/5 blur-xl" />
      </motion.div>
      <div className="absolute right-6 top-8 z-10 flex items-center gap-2 border border-emerald-300/35 bg-emerald-300/10 px-3 py-2 text-xs uppercase tracking-[0.25em] text-emerald-200">
        <span className="h-2 w-2 rounded-full bg-emerald-300 pulse-core" />
        Operating Status: Active
      </div>
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-end pb-10 pt-28">
        <Reveal>
          <div className="mb-7 flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-muted">
            <span>Digital Cloud Engineer</span>
            <span className="text-amber">Life Sciences | 21 CFR Part 11 / GxP</span>
            <span className="text-signal">L3 | Human-Supervised Agent</span>
          </div>
          <h1 className="display max-w-5xl text-[17vw] uppercase leading-[0.76] text-frost md:text-[11rem] lg:text-[14rem]">
            Chandra
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-frost/80 md:text-2xl md:leading-9">
            Enterprise AI workforce operations for supervised AWS infrastructure, audit evidence, incident remediation, and regulated cloud continuity.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="glass relative overflow-hidden p-5">
            <div className="scan absolute left-0 top-0 h-24 w-full bg-gradient-to-b from-transparent via-signal/10 to-transparent" />
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                ["Monitoring", "AWS estate"],
                ["47", "accounts monitored"],
                [nowTime(), "last action timestamp"],
                ["Dr. Mira Shah", "human supervisor"],
                ["14", "AWS regions monitored"],
                ["6", "current incident load"],
                ["24/7", "operational"],
                ["99.982%", "worker uptime"]
              ].map(([value, label]) => (
                <div key={label} className="border-l border-white/12 pl-4">
                  <div className="text-xl text-frost md:text-2xl">{value}</div>
                  <div className="mt-2 text-[0.62rem] uppercase tracking-[0.2em] text-muted">{label}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal className="glass relative h-56 overflow-hidden p-5">
            <div className="mb-4 text-xs uppercase tracking-[0.24em] text-amber">operational waveform</div>
            <ResponsiveContainer width="100%" height="78%">
              <LineChart data={trendData.concat(trendData)}>
                <XAxis dataKey="t" hide />
                <YAxis hide />
                <Line type="monotone" dataKey="score" stroke="#ff3b30" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="kra" stroke="#8ed9a8" strokeWidth={1.6} dot={false} />
                <Line type="monotone" dataKey="risk" stroke="#ffb347" strokeWidth={1.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function PerformanceIndex() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 2200);
    return () => window.clearInterval(timer);
  }, []);

  const metrics = metricSeed.map((metric, index) => ({
    ...metric,
    live: Math.max(72, Math.min(99, metric.value + ((tick + index) % 5) - 2))
  }));
  const score = Math.round(metrics.reduce((sum, metric) => sum + metric.live * (metric.weight === "1.5x" ? 1.5 : 1), 0) / 8);

  return (
    <section className="section-shell overflow-hidden">
      <div className="section-inner">
        <SectionTitle
          label="Real-Time Performance Index"
          title="An AI performance scoring engine in motion."
          copy="The worker score recalculates from productivity, quality, efficiency, goal delivery, reliability, collaboration, and measurable value. Weighted dimensions show where enterprise trust is earned."
        />
        <Reveal className="glass relative overflow-hidden p-5 md:p-8">
          <div className="hairline mb-8" />
          <motion.div
            className="display text-center text-3xl leading-tight text-frost md:text-6xl"
            initial={{ filter: "blur(14px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            (P x Q x <span className="text-amber">1.5E</span>) + (G x <span className="text-amber">1.5R</span>) + (C x V)
          </motion.div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative h-72 w-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="74%" outerRadius="100%" data={[{ name: "score", value: score, fill: "#ff3b30" }]} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" background={{ fill: "rgba(255,255,255,0.08)" }} cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div key={score} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="display text-7xl text-frost">
                    {score}
                  </motion.div>
                  <div className="text-xs uppercase tracking-[0.24em] text-muted">overall score / 100</div>
                </div>
              </div>
              <div className="grid w-full grid-cols-3 gap-3 text-center text-xs uppercase tracking-[0.16em] text-muted">
                <span>live calc</span>
                <span className="text-emerald-300">stable</span>
                <span>ws-ready</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div key={metric.key} className="border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl" style={{ color: metric.color }}>
                      {metric.key}
                    </span>
                    <span className="text-xs text-amber">{metric.weight}</span>
                  </div>
                  <div className="mt-3 text-sm text-frost">{metric.label}</div>
                  <div className="mt-3 h-1 bg-white/10">
                    <motion.div className="h-full" style={{ background: metric.color }} animate={{ width: `${metric.live}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-muted">
                    <span>KRA weight active</span>
                    <span>{metric.live}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="perfScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff3b30" stopOpacity={0.48} />
                    <stop offset="100%" stopColor="#ff3b30" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: "#928a80", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0d0d0f", border: "1px solid rgba(255,255,255,0.14)" }} />
                <Area type="monotone" dataKey="score" stroke="#ff3b30" fill="url(#perfScore)" strokeWidth={2} />
                <Line type="monotone" dataKey="kra" stroke="#8ed9a8" strokeWidth={1.6} dot={false} />
                <Line type="monotone" dataKey="risk" stroke="#ffb347" strokeWidth={1.4} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function useOperationalFeed() {
  const [events, setEvents] = useState<OpsEvent[]>(baseEvents);

  useEffect(() => {
    const templates = [
      {
        severity: "P2" as Severity,
        status: "Resolved" as IncidentStatus,
        incident: "IAM privilege reduced",
        service: "IAM",
        account: "Shared-Services-4472",
        confidence: 95,
        resolution: "Privilege boundary was restored, temporary admin grant was expired, and reviewer evidence was generated."
      },
      {
        severity: "P3" as Severity,
        status: "Monitoring" as IncidentStatus,
        incident: "Cost spike contained",
        service: "Compute Optimizer",
        account: "Research-Compute-1190",
        confidence: 92,
        resolution: "Autoscaling ceiling was reduced, orphaned volumes were tagged, and a finance summary was queued."
      },
      {
        severity: "P1" as Severity,
        status: "Escalated" as IncidentStatus,
        incident: "Unauthorized API call investigated",
        service: "GuardDuty",
        account: "Pharma-Prod-7710",
        confidence: 88,
        resolution: "Session was revoked, principal was isolated, and security review packet is awaiting approval."
      }
    ];
    const timer = window.setInterval(() => {
      const template = templates[Math.floor(Date.now() / 4000) % templates.length];
      setEvents((current) => [
        {
          ...template,
          id: `evt-live-${Date.now()}`,
          time: nowTime()
        },
        ...current
      ].slice(0, 10));
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return events;
}

function LiveOperationsFeed({ events }: { events: OpsEvent[] }) {
  return (
    <section className="section-shell">
      <div className="section-inner">
        <SectionTitle
          label="Live Operations Feed"
          title="Every event resolves into evidence."
          copy="The feed is modeled for backend WebSocket streams: incident detection, remediation action, escalation state, outcome, confidence, AWS account, and the exact resolution path."
        />
        <Reveal className="glass overflow-hidden p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-amber">
              <Terminal size={16} /> realtime stream / websocket-ready
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">context synced to copilot</div>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45 }}
                  className="grid gap-3 border-l border-white/12 bg-white/[0.025] p-4 text-sm lg:grid-cols-[86px_58px_1fr_120px_130px_88px]"
                >
                  <span className="text-amber">[{event.time}]</span>
                  <SeverityPill value={event.severity} />
                  <span className="text-frost/88">
                    {event.incident} - <span className="text-muted">{event.resolution}</span>
                  </span>
                  <span className="text-muted">{event.account}</span>
                  <span className="text-muted">{event.service}</span>
                  <span className="text-emerald-300">{event.confidence}%</span>
                  <span className="lg:col-span-6 text-xs uppercase tracking-[0.18em] text-muted">
                    state: <StatusDot status={event.status} />
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ActiveIncidentsTable() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [confidence, setConfidence] = useState("All");

  const filtered = incidents.filter((incident) => {
    const text = `${incident.incident} ${incident.account} ${incident.service} ${incident.rootCause} ${incident.resolution}`.toLowerCase();
    const confidencePass = confidence === "All" || (confidence === "90+" ? incident.confidence >= 90 : incident.confidence < 90);
    return (
      text.includes(query.toLowerCase()) &&
      (severity === "All" || incident.severity === severity) &&
      (status === "All" || incident.status === status) &&
      confidencePass
    );
  });

  return (
    <section className="section-shell">
      <div className="section-inner">
        <SectionTitle
          label="Active Incidents"
          title="A minimal command table for supervised operations."
          copy="Search and filtering are intentionally restrained: enough control for review, without turning the experience into a conventional admin console."
        />
        <Reveal className="glass overflow-hidden p-5">
          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_150px_180px_160px]">
            <label className="flex items-center gap-3 border border-white/12 bg-black/35 px-3 py-3 text-sm text-muted">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-frost outline-none placeholder:text-muted"
                placeholder="Search incidents, accounts, root cause"
              />
            </label>
            {[
              ["Severity", severity, setSeverity, ["All", "P1", "P2", "P3", "P4"]],
              ["Status", status, setStatus, ["All", "Resolved", "Investigating", "Escalated", "Monitoring", "Awaiting Approval"]],
              ["Confidence", confidence, setConfidence, ["All", "90+", "<90"]]
            ].map(([label, value, setter, options]) => (
              <label key={label as string} className="flex items-center gap-2 border border-white/12 bg-black/35 px-3 py-3 text-xs uppercase tracking-[0.14em] text-muted">
                <Filter size={14} />
                <select
                  value={value as string}
                  onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                  className="w-full bg-transparent text-frost outline-none"
                >
                  {(options as string[]).map((option) => (
                    <option key={option} value={option} className="bg-carbon text-frost">
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="text-[0.64rem] uppercase tracking-[0.18em] text-muted">
                <tr className="border-b border-white/12">
                  {["Severity", "Incident", "AWS Account", "Status", "Resolution", "Confidence", "Time to triage", "Resolution ETA", "Root cause", "Human escalation status"].map((head) => (
                    <th key={head} className="px-3 py-4 font-normal">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((incident) => (
                  <tr key={incident.id} className="border-b border-white/8 align-top text-frost/84">
                    <td className="px-3 py-4"><SeverityPill value={incident.severity} /></td>
                    <td className="px-3 py-4 text-frost">{incident.incident}</td>
                    <td className="px-3 py-4 text-muted">{incident.account}</td>
                    <td className="px-3 py-4"><StatusDot status={incident.status} /></td>
                    <td className="max-w-[280px] px-3 py-4 text-muted">{incident.resolution}</td>
                    <td className="px-3 py-4 text-emerald-300">{incident.confidence}%</td>
                    <td className="px-3 py-4 text-muted">{incident.triage}</td>
                    <td className="px-3 py-4 text-muted">{incident.eta}</td>
                    <td className="max-w-[240px] px-3 py-4 text-muted">{incident.rootCause}</td>
                    <td className="px-3 py-4 text-amber">{incident.humanEscalation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function OperationalTicker() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black/45 py-4">
      <div className="ticker-track flex min-w-max gap-4">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-5 py-3 text-xs uppercase tracking-[0.18em]">
            <CircleDot size={14} className={item.tone} />
            <span className="text-muted">{item.label}</span>
            <motion.span
              className={item.tone}
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.05 }}
            >
              {item.value + (index % 2)}
            </motion.span>
          </div>
        ))}
      </div>
    </section>
  );
}

function KRAReview() {
  return (
    <section className="section-shell">
      <div className="section-inner">
        <SectionTitle
          label="KRA Performance Review"
          title="AI accountability, prepared for the audit room."
          copy="Each KRA exposes target, actuals, decision history, evidence, automation contribution, and traceability to incidents and remediation logs."
        />
        <Reveal className="space-y-5">
          {kraRows.map((kra, index) => (
            <details key={kra.id} open={index === 0} className="glass group overflow-hidden p-5">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-amber">{kra.id}</div>
                  <h3 className="mt-2 text-2xl text-frost">{kra.title}</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right text-xs uppercase tracking-[0.16em] text-muted">
                  <span><b className="block text-lg text-frost">{kra.actual}</b>actual</span>
                  <span><b className="block text-lg text-emerald-300">{kra.confidence}%</b>confidence</span>
                  <span><b className="block text-lg text-signal">{kra.automation}</b>automation</span>
                </div>
                <ChevronDown className="text-muted transition group-open:rotate-180" />
              </summary>
              <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="border border-white/10 bg-black/25 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted">Target</div>
                  <p className="mt-3 text-frost">{kra.target}</p>
                  <div className="mt-6 text-xs uppercase tracking-[0.22em] text-muted">How achieved</div>
                  <div className="mt-3 space-y-2 text-sm text-frost/82">
                    {kra.how.map((item) => (
                      <div key={item} className="flex gap-3"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" />{item}</div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="border border-white/10 bg-black/25 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted">Audit artifacts</div>
                    <div className="mt-4 space-y-3">
                      {kra.evidence.map((item) => (
                        <div key={item} className="flex items-center gap-3 text-sm text-frost/82">
                          <FileClock size={16} className="text-amber" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-black/25 p-5">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted">Decision timeline</div>
                    <div className="mt-4 space-y-3">
                      {kra.timeline.map((item) => (
                        <div key={item} className="border-l border-signal/40 pl-3 text-sm text-frost/82">{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function ComplianceEvidence() {
  return (
    <section className="section-shell">
      <div className="section-inner">
        <SectionTitle
          label="Compliance & Evidence"
          title="Evidence generation as an operational habit."
          copy="SOC2, GxP, and internal policy controls are continuously assembled into reviewable evidence packs with retrieval latency and coverage signals."
        />
        <Reveal className="glass p-5 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#928a80", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[70, 100]} />
                  <Tooltip contentStyle={{ background: "#0d0d0f", border: "1px solid rgba(255,255,255,0.14)" }} />
                  <Area type="monotone" dataKey="soc2" stroke="#ff3b30" fill="rgba(255,59,48,0.22)" />
                  <Area type="monotone" dataKey="gxp" stroke="#ffb347" fill="rgba(255,179,71,0.16)" />
                  <Line type="monotone" dataKey="policy" stroke="#8ed9a8" strokeWidth={1.8} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["96%", "SOC2 evidence generation"],
                ["95%", "GxP evidence coverage"],
                ["97%", "internal policy compliance"],
                ["94%", "audit readiness"],
                ["14:45", "last evidence pack"],
                ["1.8s", "retrieval latency"]
              ].map(([value, label]) => (
                <div key={label} className="border border-white/10 bg-black/28 p-5">
                  <div className="text-3xl text-frost">{value}</div>
                  <div className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function RealtimeIntelligence() {
  return (
    <section className="section-shell overflow-hidden">
      <div className="section-inner">
        <SectionTitle
          label="Realtime Infrastructure Intelligence"
          title="Live state transitions across the AWS estate."
          copy="This view avoids developer architecture diagrams and focuses on operational intelligence: active regions, services watched, workflow chains, alert propagation, and open investigations."
        />
        <Reveal className="glass relative min-h-[560px] overflow-hidden p-5">
          <ParticleField />
          {regionNodes.map((node, index) => (
            <div
              key={node.label}
              className="slow-float absolute z-10 w-40 border border-white/12 bg-black/65 p-4"
              style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${index * 0.4}s` }}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-frost">
                <span className={cx("h-2 w-2 rounded-full", node.state === "active" ? "bg-emerald-300" : node.state === "review" ? "bg-signal" : "bg-amber")} />
                {node.label}
              </div>
              <div className="mt-3 text-[0.66rem] uppercase tracking-[0.16em] text-muted">{node.state} / live pulse</div>
            </div>
          ))}
          <div className="absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-5">
            {[
              ["14", "regions active"],
              ["63", "services monitored"],
              ["5", "active remediations"],
              ["11", "workflow chains"],
              ["4", "open investigations"]
            ].map(([value, label]) => (
              <div key={label} className="border border-white/10 bg-black/50 p-4">
                <div className="text-2xl text-frost">{value}</div>
                <div className="mt-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted">{label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function OperationsCopilot({ latestEvent }: { latestEvent: OpsEvent }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "system",
      text: "Context synchronized. Latest operational event and KRA evidence are available for supervisor review.",
      meta: "memory: incidents / KRA / audit / remediation"
    },
    {
      role: "chandra",
      text: "Latest P1 exposure event is awaiting production data-plane approval. Public ACL was blocked and evidence is attached to the review queue.",
      meta: "confidence 91% / source: live feed"
    }
  ]);

  const suggestions = ["/summarize-p1-incidents", "/show-kra-risk", "/generate-audit-report", "/draft-ops-mail"];

  function submit(value = prompt) {
    const command = value.trim();
    if (!command) return;
    setMessages((current) => [
      ...current,
      { role: "supervisor", text: command, meta: "human supervisor command" },
      {
        role: "chandra",
        text:
          command.includes("mail") || command.includes("notify")
            ? `Draft prepared for infrastructure operations: ${latestEvent.incident} is ${latestEvent.status.toLowerCase()} with ${latestEvent.confidence}% confidence. Resolution: ${latestEvent.resolution}`
            : `Operational answer: ${latestEvent.incident} in ${latestEvent.account} was handled through Chandra's current remediation chain. Resolution trace: ${latestEvent.resolution}`,
        meta: `trace: ${latestEvent.service} / ${latestEvent.account} / ${latestEvent.time}`
      }
    ]);
    setPrompt("");
    setOpen(true);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] w-[calc(100vw-2.5rem)] max-w-[440px]">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            className="glass overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <Bot size={18} className="text-signal" />
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-frost">Chandra Ops Copilot</div>
                  <div className="text-[0.64rem] uppercase tracking-[0.16em] text-emerald-300">live context synchronized</div>
                </div>
              </div>
              <button aria-label="Close copilot" onClick={() => setOpen(false)} className="text-muted hover:text-frost">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[390px] space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={index} className={cx("border p-3 text-sm", message.role === "supervisor" ? "ml-8 border-amber/30 bg-amber/8" : "mr-4 border-white/10 bg-black/35")}>
                  <div className="mb-2 text-[0.62rem] uppercase tracking-[0.18em] text-muted">{message.role}</div>
                  <div className="leading-6 text-frost/88">{message.text}</div>
                  <div className="mt-3 border-l border-signal/40 pl-3 text-[0.68rem] uppercase tracking-[0.14em] text-muted">{message.meta}</div>
                </div>
              ))}
              <div className="border border-emerald-300/20 bg-emerald-300/8 p-3 text-sm">
                <div className="mb-2 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.18em] text-emerald-300">
                  <MailCheck size={14} /> queued communication
                </div>
                <p className="text-frost/82">Incident closure note ready when all P1 items are resolved above 90% confidence. Approval state: supervisor review.</p>
              </div>
            </div>
            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button key={item} onClick={() => submit(item)} className="border border-white/10 bg-white/[0.03] px-2 py-1 text-[0.66rem] uppercase tracking-[0.12em] text-muted hover:border-signal/40 hover:text-frost">
                    {item}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
                className="flex items-center gap-2 border border-white/12 bg-black/45 px-3 py-2"
              >
                <Command size={15} className="text-amber" />
                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask Chandra about incidents, KRAs, evidence, or notifications"
                  className="min-w-0 flex-1 bg-transparent text-sm text-frost outline-none placeholder:text-muted"
                />
                <button aria-label="Send command" className="text-signal hover:text-frost">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="ml-auto flex items-center gap-3 border border-signal/35 bg-black/75 px-4 py-3 text-xs uppercase tracking-[0.18em] text-frost shadow-signal backdrop-blur"
        >
          <Sparkles size={15} className="text-signal" />
          Ops Copilot
          <span className="h-2 w-2 rounded-full bg-emerald-300 pulse-core" />
        </button>
      ) : null}
    </div>
  );
}

function Finale() {
  return (
    <section className="relative min-h-[78vh] overflow-hidden px-5 py-24 md:px-10">
      <ParticleField />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-signal/18 via-amber/8 to-transparent blur-2xl" />
      <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-6xl flex-col justify-center">
        <Reveal>
          <div className="mb-6 text-xs uppercase tracking-[0.32em] text-amber">enterprise AI workforce system</div>
          <h2 className="display text-5xl leading-[0.94] text-frost md:text-8xl">
            Observable. Accountable. Supervised.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
            Chandra monitors infrastructure, reasons over incidents, maintains evidence, communicates operationally, and collaborates with humans in realtime.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function ChandraExperience() {
  const events = useOperationalFeed();

  return (
    <main className="bg-obsidian text-frost">
      <div className="fixed left-5 top-5 z-50 hidden items-center gap-3 text-[0.62rem] uppercase tracking-[0.25em] text-muted md:flex">
        <RadioTower size={14} className="text-signal" />
        Chandra / Digital Cloud Engineer / L3 Supervised
      </div>
      <Hero />
      <PerformanceIndex />
      <LiveOperationsFeed events={events} />
      <ActiveIncidentsTable />
      <OperationalTicker />
      <KRAReview />
      <ComplianceEvidence />
      <RealtimeIntelligence />
      <Finale />
      <OperationsCopilot latestEvent={events[0]} />
    </main>
  );
}
