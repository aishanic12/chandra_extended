"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Command,
  Download,
  FileSpreadsheet,
  FileText,
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
  CartesianGrid,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";

type Severity = "P1" | "P2" | "P3" | "P4";
type IncidentStatus = "Resolved" | "Investigating" | "Escalated" | "Monitoring" | "Awaiting Approval";
type ApprovalState = "Awaiting Review" | "Approved" | "Rejected" | "Escalated";

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

type AuditRow = {
  timestamp: string;
  incidentId: string;
  remediation: string;
  account: string;
  confidence: number;
  reviewer: string;
  compliance: string;
  evidencePack: string;
};

type ApprovalRow = {
  id: string;
  incident: string;
  severity: Severity;
  state: ApprovalState;
  reviewer: string;
  requested: string;
  decided: string;
  note: string;
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
    resolution: "Reverted policy to least-privilege baseline. Evidence attached to CHG-4912."
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
    resolution: "Public ACL blocked. Bucket policy quarantined. Awaiting human approval for production write-lock."
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
    resolution: "Idle burst fleet terminated post owner validation. Rightsizing ticket + billing trace generated."
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
    resolution: "Trail target bucket encryption corrected. Delivery validation written to SOC2 pack."
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
    resolution: "Conditional access rule applied to 18 stale users. Notification queued for identity ops."
  }
];

const incidents: Incident[] = [
  {
    ...baseEvents[1],
    triage: "01m 12s",
    eta: "06m",
    rootCause: "Legacy data transfer role attempted public ACL write against regulated bucket.",
    humanEscalation: "Production data plane approval"
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
    resolution: "Session token revoked, source role isolated, forensic bundle queued for security review.",
    triage: "01m 49s",
    eta: "18m",
    rootCause: "Suspicious AssumeRole chain from unmanaged workstation network.",
    humanEscalation: "Security owner assigned"
  }
];

const tickerItems = [
  { label: "Security anomalies", value: 7, tone: "text-signal" },
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
    impact: "Prevented $182K idle spend this quarter",
    how: ["CloudWatch anomaly triggers", "Auto EC2 rightsizing", "Lambda remediation", "Continuous billing scans"]
  },
  {
    id: "KRA-02",
    title: "GxP Audit Evidence Coverage",
    target: "Maintain > 92% evidence completeness",
    actual: "95.4% completeness",
    confidence: 96,
    automation: "81%",
    impact: "Zero open findings in last 3 audit cycles",
    how: ["CloudTrail validation", "Security Hub control mapping", "Evidence pack generation", "Immutable S3 retention"]
  },
  {
    id: "KRA-03",
    title: "Privileged Access Drift Reduction",
    target: "Reduce privilege drift within 30 minutes",
    actual: "22 min median",
    confidence: 91,
    automation: "68%",
    impact: "94% of drift auto-remediated without human action",
    how: ["IAM Access Analyzer", "Least-privilege baselines", "Terraform PR prep", "Human approval for prod"]
  },
  {
    id: "KRA-04",
    title: "Mean Time to Remediate Incidents",
    target: "MTTR < 8 minutes for P1/P2",
    actual: "5m 42s median",
    confidence: 93,
    automation: "76%",
    impact: "60% reduction in supervisor pager load",
    how: ["Severity-aware runbooks", "Automated rollback orchestration", "Live blast-radius scoring", "Parallel evidence capture"]
  },
  {
    id: "KRA-05",
    title: "Regulatory Control Continuity",
    target: "100% control coverage across SOC2 + 21 CFR Part 11",
    actual: "98.7% control coverage",
    confidence: 95,
    automation: "84%",
    impact: "Audit-ready posture sustained across 47 accounts",
    how: ["Control-to-evidence mapping", "Drift alerting on regulated buckets", "Automated reviewer packets", "Continuous control attestation"]
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
  { label: "us-east-1", state: "active", load: 78, incidents: 2 },
  { label: "us-west-2", state: "watch", load: 64, incidents: 1 },
  { label: "eu-west-1", state: "active", load: 71, incidents: 0 },
  { label: "ap-south-1", state: "review", load: 88, incidents: 3 },
  { label: "ca-central-1", state: "active", load: 52, incidents: 0 },
  { label: "eu-central-1", state: "active", load: 66, incidents: 1 }
];

const costCards = [
  { label: "API Cost Today", value: "$427.18", delta: "+3.2%", tone: "text-amber" },
  { label: "AWS Cost MTD", value: "$182,940", delta: "-4.8%", tone: "text-emerald-300" },
  { label: "Model Tokens (24h)", value: "84.3M", delta: "+11.6%", tone: "text-amber" },
  { label: "Infra Load", value: "67%", delta: "stable", tone: "text-emerald-300" },
  { label: "Est. Monthly Spend", value: "$248K", delta: "-2.1%", tone: "text-emerald-300" }
];

const auditSeed: AuditRow[] = [
  { timestamp: "2026-05-18 14:42:11", incidentId: "INC-2044", remediation: "Revert IAM policy to baseline", account: "LS-Prod-2147", confidence: 96, reviewer: "Auto / Mira Shah", compliance: "SOC2-CC6.1", evidencePack: "EVD-9821" },
  { timestamp: "2026-05-18 14:43:26", incidentId: "INC-2045", remediation: "Block public S3 ACL", account: "Clinical-Data-8821", confidence: 91, reviewer: "Pending / D. Okafor", compliance: "GxP-117", evidencePack: "EVD-9822" },
  { timestamp: "2026-05-18 14:44:03", incidentId: "INC-2046", remediation: "Terminate idle EC2 fleet", account: "Research-Compute-1190", confidence: 94, reviewer: "Auto / FinOps", compliance: "Cost-Policy-04", evidencePack: "EVD-9823" },
  { timestamp: "2026-05-18 14:45:38", incidentId: "INC-2047", remediation: "Repair CloudTrail KMS alias", account: "GxP-Audit-3308", confidence: 98, reviewer: "Auto / Mira Shah", compliance: "SOC2-CC7.2", evidencePack: "EVD-9824" },
  { timestamp: "2026-05-18 14:46:19", incidentId: "INC-2048", remediation: "Enforce MFA on stale users", account: "Shared-Services-4472", confidence: 99, reviewer: "Auto / IAM Ops", compliance: "21CFR-Part11", evidencePack: "EVD-9825" },
  { timestamp: "2026-05-18 14:47:54", incidentId: "INC-2049", remediation: "Revoke session, isolate role", account: "Pharma-Prod-7710", confidence: 87, reviewer: "Pending / SecOps", compliance: "SOC2-CC6.3", evidencePack: "EVD-9826" },
  { timestamp: "2026-05-18 14:49:08", incidentId: "INC-2050", remediation: "Rotate KMS data key", account: "GxP-Audit-3308", confidence: 95, reviewer: "Auto / Mira Shah", compliance: "GxP-118", evidencePack: "EVD-9827" },
  { timestamp: "2026-05-18 14:50:44", incidentId: "INC-2051", remediation: "Patch SG ingress drift", account: "LS-Prod-2147", confidence: 92, reviewer: "Auto / NetOps", compliance: "SOC2-CC6.6", evidencePack: "EVD-9828" }
];

const approvalSeed: ApprovalRow[] = [
  { id: "APV-501", incident: "S3 bucket exposure - production write-lock", severity: "P1", state: "Awaiting Review", reviewer: "Dr. Mira Shah", requested: "14:43:34", decided: "-", note: "Public ACL blocked; awaiting prod write-lock confirmation." },
  { id: "APV-502", incident: "GuardDuty unauthorized API call", severity: "P2", state: "Escalated", reviewer: "SecOps - D. Okafor", requested: "14:48:02", decided: "-", note: "Forensic bundle awaiting security owner review." },
  { id: "APV-503", incident: "Privileged role deletion (legacy admin)", severity: "P1", state: "Approved", reviewer: "Dr. Mira Shah", requested: "13:52:11", decided: "13:58:40", note: "Approved per least-privilege baseline. Rollback armed." },
  { id: "APV-504", incident: "RDS snapshot cross-region copy", severity: "P3", state: "Approved", reviewer: "Data Gov - L. Chen", requested: "12:11:09", decided: "12:14:51", note: "Encryption-at-rest verified." },
  { id: "APV-505", incident: "VPC peering deletion request", severity: "P2", state: "Rejected", reviewer: "Network - R. Patel", requested: "11:08:22", decided: "11:14:03", note: "Rejected: active workload dependency detected." }
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ label, sub, action }: { label: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="section-head">
      <span className="section-label">{label}</span>
      <div className="ml-auto flex items-center gap-3">
        {sub ? <span className="section-sub">{sub}</span> : null}
        {action}
      </div>
    </div>
  );
}

function SeverityPill({ value }: { value: Severity }) {
  const tone = {
    P1: "border-signal/55 bg-signal/20 text-signal",
    P2: "border-amber/50 bg-amber/15 text-amber",
    P3: "border-white/20 bg-white/[0.05] text-frost",
    P4: "border-emerald-300/35 bg-emerald-300/12 text-emerald-300"
  }[value];
  return <span className={cx("inline-flex w-9 items-center justify-center border px-1.5 py-0.5 text-[0.62rem] font-semibold tracking-wider", tone)}>{value}</span>;
}

function StatusDot({ status }: { status: IncidentStatus }) {
  const tone = status === "Resolved" ? "bg-emerald-300" : status === "Escalated" || status === "Awaiting Approval" ? "bg-signal" : "bg-amber";
  return (
    <span className="inline-flex items-center gap-2 text-[0.7rem]">
      <span className={cx("h-1.5 w-1.5 rounded-full", tone, status !== "Resolved" && "pulse-core")} />
      {status}
    </span>
  );
}

function ApprovalBadge({ state }: { state: ApprovalState }) {
  const tone = {
    "Awaiting Review": "border-amber/45 bg-amber/12 text-amber",
    "Approved": "border-emerald-300/40 bg-emerald-300/12 text-emerald-300",
    "Rejected": "border-signal/45 bg-signal/15 text-signal",
    "Escalated": "border-signal/50 bg-signal/15 text-signal"
  }[state];
  return <span className={cx("inline-flex items-center border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.18em]", tone)}>{state}</span>;
}

// Compact hero + global ops summary
function CommandHeader() {
  return (
    <section className="relative px-5 pt-10 pb-6 md:px-10 md:pt-12">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.28em] text-muted">
            <RadioTower size={14} className="text-signal" />
            <span>Chandra</span>
            <span className="text-amber">L3 Digital Cloud Engineer</span>
            <span className="text-frost/70">Human-Supervised</span>
          </div>
          <div className="flex items-center gap-2 border border-emerald-300/35 bg-emerald-300/10 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.22em] text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 pulse-core" />
            Operating Status: Active
          </div>
        </div>
        <Reveal>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h1 className="display text-5xl uppercase leading-[0.85] text-frost md:text-7xl">Chandra</h1>
            <div className="text-[0.66rem] uppercase tracking-[0.22em] text-muted">
              Life Sciences <span className="text-amber">/ 21 CFR Part 11 / GxP</span>
            </div>
          </div>
        </Reveal>
        <Reveal className="glass relative overflow-hidden p-4">
          <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
            {[
              ["47", "Accounts"],
              ["14", "AWS Regions"],
              ["6", "Active Incidents"],
              ["99.98%", "Worker Uptime"],
              ["5m 42s", "Median MTTR"],
              ["95.4%", "Evidence Coverage"],
              ["68", "Workflows"],
              [nowTime(), "Last Action"]
            ].map(([value, label]) => (
              <div key={label} className="border-l border-white/12 pl-3">
                <div className="text-lg text-frost">{value}</div>
                <div className="mt-1 text-[0.56rem] uppercase tracking-[0.2em] text-muted">{label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Operational waveform with legend
function OperationalWaveform() {
  return (
    <Reveal className="glass relative overflow-hidden p-4">
      <SectionHead label="OPERATIONAL WAVEFORM" sub="24h telemetry" />
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData.concat(trendData)} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="t" tick={{ fill: "#928a80", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#0d0d0f", border: "1px solid rgba(255,255,255,0.14)", fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#ff3b30" strokeWidth={1.8} dot={false} name="Incident Activity" />
              <Line type="monotone" dataKey="kra" stroke="#8ed9a8" strokeWidth={1.6} dot={false} name="Stable Operations" />
              <Line type="monotone" dataKey="risk" stroke="#ffb347" strokeWidth={1.4} dot={false} name="Background Load" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-2 text-[0.7rem]">
          <div className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">Legend</div>
          {[
            ["#ff3b30", "Incident Activity", "spike = active remediation"],
            ["#8ed9a8", "Stable Operations", "baseline KRA performance"],
            ["#ffb347", "Background Load", "ambient cloud workload"]
          ].map(([color, label, hint]) => (
            <div key={label} className="flex items-center gap-2 border-l border-white/8 pl-2">
              <span className="h-2 w-3" style={{ background: color }} />
              <div>
                <div className="text-frost">{label}</div>
                <div className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">{hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

// Cost Monitoring FinOps panel
function CostMonitoring() {
  return (
    <Reveal className="glass overflow-hidden p-4">
      <SectionHead label="COST MONITORING" sub="FinOps · live spend" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {costCards.map((card) => (
          <div key={card.label} className="kpi-card">
            <span className="kpi-label">{card.label}</span>
            <span className="kpi-value">{card.value}</span>
            <span className={cx("kpi-delta", card.tone)}>{card.delta}</span>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

// Live operations feed - max 5 visible, fixed height, internal scroll
function useOperationalFeed() {
  const [events, setEvents] = useState<OpsEvent[]>(baseEvents);

  useEffect(() => {
    const templates = [
      { severity: "P2" as Severity, status: "Resolved" as IncidentStatus, incident: "IAM privilege reduced", service: "IAM", account: "Shared-Services-4472", confidence: 95, resolution: "Privilege boundary restored. Reviewer evidence generated." },
      { severity: "P3" as Severity, status: "Monitoring" as IncidentStatus, incident: "Cost spike contained", service: "Compute Optimizer", account: "Research-Compute-1190", confidence: 92, resolution: "Autoscaling ceiling reduced. Orphaned volumes tagged." },
      { severity: "P1" as Severity, status: "Escalated" as IncidentStatus, incident: "Unauthorized API call", service: "GuardDuty", account: "Pharma-Prod-7710", confidence: 88, resolution: "Session revoked. Principal isolated. Awaiting review." }
    ];
    const timer = window.setInterval(() => {
      const template = templates[Math.floor(Date.now() / 4000) % templates.length];
      setEvents((current) => [{ ...template, id: `evt-live-${Date.now()}`, time: nowTime() }, ...current].slice(0, 12));
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  return events;
}

function severityRank(severity: Severity) {
  return { P1: 4, P2: 3, P3: 2, P4: 1 }[severity];
}

function LiveOpsStream({ events }: { events: OpsEvent[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const prioritized = useMemo(() => {
    return [...events].sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.time.localeCompare(a.time));
  }, [events]);

  const severityBorder: Record<Severity, string> = {
    P1: "border-l-signal",
    P2: "border-l-amber",
    P3: "border-l-white/30",
    P4: "border-l-emerald-300/60"
  };

  return (
    <Reveal className="glass overflow-hidden p-4">
      <SectionHead
        label="LIVE OPS STREAM"
        sub="websocket · 5 latest"
        action={
          <button className="flex items-center gap-2 border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.18em] text-frost/85 hover:border-signal/40 hover:text-signal">
            <Terminal size={12} /> View Full Audit Stream
          </button>
        }
      />
      <div className="feed-stream max-h-[300px] space-y-1.5 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {prioritized.slice(0, 5).map((event) => {
            const open = expandedId === event.id;
            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setExpandedId(open ? null : event.id)}
                className={cx(
                  "cursor-pointer border-l-2 bg-white/[0.025] px-3 py-2 text-[0.72rem] transition hover:bg-white/[0.05]",
                  severityBorder[event.severity]
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-amber/90">[{event.time}]</span>
                  <SeverityPill value={event.severity} />
                  <span className="flex-1 truncate text-frost">{event.incident}</span>
                  <span className="hidden text-muted md:inline">{event.service}</span>
                  <span className="text-emerald-300">{event.confidence}%</span>
                  <StatusDot status={event.status} />
                </div>
                <AnimatePresence>
                  {open ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 grid gap-1 border-l border-white/8 pl-3 text-[0.66rem] text-muted"
                    >
                      <span><span className="text-frost/70">Account:</span> {event.account}</span>
                      <span><span className="text-frost/70">Resolution:</span> {event.resolution}</span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-white/8 pt-2 text-[0.58rem] uppercase tracking-[0.18em] text-muted">
        <span>showing 5 of {prioritized.length} events</span>
        <span className="text-emerald-300">context synced to copilot</span>
      </div>
    </Reveal>
  );
}

// Operational Ticker
function OperationalTicker() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-black/45 py-2">
      <div className="ticker-track flex min-w-max gap-3">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.18em]">
            <CircleDot size={10} className={item.tone} />
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

// Compact AWS Estate
function AwsEstate() {
  const stateTone = (state: string) =>
    state === "active" ? "border-emerald-300/40 text-emerald-300" : state === "review" ? "border-signal/45 text-signal" : "border-amber/45 text-amber";

  return (
    <Reveal className="glass overflow-hidden p-4">
      <SectionHead label="AWS REGION HEALTH" sub="14 regions · 63 services" />
      <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
        {regionNodes.map((node) => (
          <div key={node.label} className={cx("border bg-black/40 px-3 py-2.5", stateTone(node.state))}>
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-frost">{node.label}</span>
              <span className={cx("h-1.5 w-1.5 rounded-full pulse-core", node.state === "active" ? "bg-emerald-300" : node.state === "review" ? "bg-signal" : "bg-amber")} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[0.58rem] uppercase tracking-[0.16em] text-muted">
              <span>{node.state}</span>
              <span>{node.load}% load</span>
            </div>
            <div className="mt-1 text-[0.58rem] uppercase tracking-[0.16em] text-muted">{node.incidents} open</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

// Performance index compressed
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
    <Reveal className="glass overflow-hidden p-4">
      <SectionHead label="PERFORMANCE INDEX" sub="(P×Q×1.5E) + (G×1.5R) + (C×V)" />
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="relative h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="74%" outerRadius="100%" data={[{ name: "score", value: score, fill: "#ff3b30" }]} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" background={{ fill: "rgba(255,255,255,0.08)" }} cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div key={score} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="display text-4xl text-frost">
                {score}
              </motion.div>
              <div className="text-[0.55rem] uppercase tracking-[0.22em] text-muted">overall / 100</div>
            </div>
          </div>
          <div className="flex w-full justify-between text-[0.55rem] uppercase tracking-[0.18em] text-muted">
            <span>live</span>
            <span className="text-emerald-300">stable</span>
            <span>ws-ready</span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.key} className="border border-white/10 bg-black/30 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-lg" style={{ color: metric.color }}>{metric.key}</span>
                <span className="text-[0.58rem] text-amber">{metric.weight}</span>
              </div>
              <div className="mt-1 text-[0.7rem] text-frost">{metric.label}</div>
              <div className="mt-2 h-1 bg-white/10">
                <motion.div className="h-full" style={{ background: metric.color }} animate={{ width: `${metric.live}%` }} transition={{ duration: 0.8 }} />
              </div>
              <div className="mt-1.5 text-right text-[0.58rem] text-muted">{metric.live}/100</div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

// KRA Governance - 5 KRAs in compact accordion grid
function KRAGovernance() {
  const [openId, setOpenId] = useState<string | null>(kraRows[0].id);
  return (
    <section className="section-shell">
      <div className="section-inner">
        <SectionHead label="KRA GOVERNANCE" sub="5 KRAs · audit-ready" />
        <Reveal>
          <div className="grid gap-3 lg:grid-cols-2">
            {kraRows.map((kra) => {
              const open = openId === kra.id;
              return (
                <div key={kra.id} className={cx("glass overflow-hidden p-3 transition", open && "ring-1 ring-signal/30")}>
                  <button
                    onClick={() => setOpenId(open ? null : kra.id)}
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <div className="flex-1">
                      <div className="text-[0.6rem] uppercase tracking-[0.22em] text-amber">{kra.id}</div>
                      <div className="mt-0.5 text-base text-frost">{kra.title}</div>
                      <div className="mt-1 text-[0.66rem] uppercase tracking-[0.16em] text-muted">{kra.target}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-right text-[0.56rem] uppercase tracking-[0.16em] text-muted">
                      <span><b className="block text-sm text-frost">{kra.actual.split(" ")[0]}</b>actual</span>
                      <span><b className="block text-sm text-emerald-300">{kra.confidence}%</b>conf</span>
                      <span><b className="block text-sm text-signal">{kra.automation}</b>auto</span>
                    </div>
                    <ChevronDown size={16} className={cx("mt-1 text-muted transition", open && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {open ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 grid gap-2 border-t border-white/8 pt-3 md:grid-cols-2"
                      >
                        <div>
                          <div className="text-[0.58rem] uppercase tracking-[0.22em] text-muted">Operational Impact</div>
                          <p className="mt-1 text-[0.72rem] text-frost/85">{kra.impact}</p>
                        </div>
                        <div>
                          <div className="text-[0.58rem] uppercase tracking-[0.22em] text-muted">How Achieved</div>
                          <div className="mt-1 grid gap-0.5">
                            {kra.how.map((h) => (
                              <div key={h} className="flex items-start gap-1.5 text-[0.7rem] text-frost/80">
                                <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-300" />
                                {h}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// Active Incidents with sticky header + expandable rows
function ActiveIncidents() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");
  const [status, setStatus] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = incidents.filter((incident) => {
    const text = `${incident.incident} ${incident.account} ${incident.service} ${incident.rootCause}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (severity === "All" || incident.severity === severity) &&
      (status === "All" || incident.status === status)
    );
  });

  return (
    <Reveal className="glass overflow-hidden p-4">
      <SectionHead label="ACTIVE INCIDENTS" sub={`${filtered.length} matched · supervised`} />
      <div className="mb-3 grid gap-2 lg:grid-cols-[1fr_120px_160px]">
        <label className="flex items-center gap-2 border border-white/12 bg-black/35 px-3 py-1.5 text-[0.7rem] text-muted">
          <Search size={13} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-frost outline-none placeholder:text-muted"
            placeholder="Search incidents, accounts, root cause"
          />
        </label>
        {[
          ["Severity", severity, setSeverity, ["All", "P1", "P2", "P3", "P4"]],
          ["Status", status, setStatus, ["All", "Resolved", "Investigating", "Escalated", "Monitoring", "Awaiting Approval"]]
        ].map(([label, value, setter, options]) => (
          <label key={label as string} className="flex items-center gap-1.5 border border-white/12 bg-black/35 px-2 py-1.5 text-[0.6rem] uppercase tracking-[0.14em] text-muted">
            <Filter size={11} />
            <select
              value={value as string}
              onChange={(event) => (setter as (value: string) => void)(event.target.value)}
              className="w-full bg-transparent text-frost outline-none"
            >
              {(options as string[]).map((option) => (
                <option key={option} value={option} className="bg-carbon text-frost">{option}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="max-h-[360px] overflow-auto scrollbar-mini">
        <table className="w-full min-w-[920px] border-collapse text-left text-[0.72rem]">
          <thead className="sticky top-0 z-10 bg-black/85 text-[0.58rem] uppercase tracking-[0.18em] text-muted backdrop-blur">
            <tr className="border-b border-white/12">
              {["Sev", "Incident", "Account", "Service", "Status", "Conf", "Triage", "ETA", ""].map((head) => (
                <th key={head} className="px-2 py-2 font-normal">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((incident) => {
              const open = expandedId === incident.id;
              return (
                <Fragment key={incident.id}>
                  <tr
                    onClick={() => setExpandedId(open ? null : incident.id)}
                    className="cursor-pointer border-b border-white/8 align-top text-frost/85 hover:bg-white/[0.03]"
                  >
                    <td className="px-2 py-2"><SeverityPill value={incident.severity} /></td>
                    <td className="px-2 py-2 text-frost">{incident.incident}</td>
                    <td className="px-2 py-2 text-muted">{incident.account}</td>
                    <td className="px-2 py-2 text-muted">{incident.service}</td>
                    <td className="px-2 py-2"><StatusDot status={incident.status} /></td>
                    <td className="px-2 py-2" title={`AI confidence: ${incident.confidence}%`}>
                      <span className={cx(incident.confidence >= 90 ? "text-emerald-300" : "text-amber")}>{incident.confidence}%</span>
                    </td>
                    <td className="px-2 py-2 text-muted">{incident.triage}</td>
                    <td className="px-2 py-2 text-muted">{incident.eta}</td>
                    <td className="px-2 py-2"><ChevronDown size={12} className={cx("text-muted transition", open && "rotate-180")} /></td>
                  </tr>
                  {open ? (
                    <tr className="border-b border-white/8 bg-black/40">
                      <td colSpan={9} className="px-3 py-2 text-[0.7rem]">
                        <div className="grid gap-2 md:grid-cols-3">
                          <div>
                            <div className="text-[0.56rem] uppercase tracking-[0.2em] text-muted">Root Cause</div>
                            <div className="mt-1 text-frost/85">{incident.rootCause}</div>
                          </div>
                          <div>
                            <div className="text-[0.56rem] uppercase tracking-[0.2em] text-muted">Resolution</div>
                            <div className="mt-1 text-frost/85">{incident.resolution}</div>
                          </div>
                          <div>
                            <div className="text-[0.56rem] uppercase tracking-[0.2em] text-muted">Human Escalation</div>
                            <div className="mt-1 text-amber">{incident.humanEscalation}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

// Human Approval Workflow
function HumanReviewQueue() {
  const counts = useMemo(() => {
    return approvalSeed.reduce(
      (acc, item) => {
        acc[item.state] = (acc[item.state] ?? 0) + 1;
        return acc;
      },
      {} as Record<ApprovalState, number>
    );
  }, []);

  return (
    <Reveal className="glass overflow-hidden p-4">
      <SectionHead label="HUMAN REVIEW QUEUE" sub="P1 + privileged + destructive actions" />
      <div className="mb-3 grid gap-2 md:grid-cols-4">
        {(["Awaiting Review", "Approved", "Rejected", "Escalated"] as ApprovalState[]).map((state) => (
          <div key={state} className="kpi-card">
            <span className="kpi-label">{state}</span>
            <span className="kpi-value">{counts[state] ?? 0}</span>
          </div>
        ))}
      </div>
      <div className="max-h-[280px] overflow-auto scrollbar-mini">
        <table className="w-full min-w-[820px] border-collapse text-left text-[0.7rem]">
          <thead className="sticky top-0 bg-black/85 text-[0.56rem] uppercase tracking-[0.18em] text-muted backdrop-blur">
            <tr className="border-b border-white/12">
              {["ID", "Incident", "Sev", "State", "Reviewer", "Requested", "Decided", "Note"].map((h) => (
                <th key={h} className="px-2 py-2 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {approvalSeed.map((row) => (
              <tr key={row.id} className="border-b border-white/8 text-frost/85">
                <td className="px-2 py-2 text-muted">{row.id}</td>
                <td className="px-2 py-2 text-frost">{row.incident}</td>
                <td className="px-2 py-2"><SeverityPill value={row.severity} /></td>
                <td className="px-2 py-2"><ApprovalBadge state={row.state} /></td>
                <td className="px-2 py-2 text-muted">{row.reviewer}</td>
                <td className="px-2 py-2 text-muted">{row.requested}</td>
                <td className="px-2 py-2 text-muted">{row.decided}</td>
                <td className="max-w-[240px] px-2 py-2 text-muted">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

// Export helpers
function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string | number) {
  const text = String(value);
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function exportCsv(rows: AuditRow[]) {
  const header = ["timestamp", "incident_id", "remediation", "account", "ai_confidence", "reviewer", "compliance", "evidence_pack"];
  const body = rows.map((row) =>
    [row.timestamp, row.incidentId, row.remediation, row.account, row.confidence, row.reviewer, row.compliance, row.evidencePack]
      .map(escapeCsv)
      .join(",")
  );
  downloadBlob([header.join(","), ...body].join("\n"), `chandra-audit-${Date.now()}.csv`, "text/csv;charset=utf-8");
}

function exportXlsx(rows: AuditRow[]) {
  // SpreadsheetML 2003 — opens natively in Excel/LibreOffice. Scaffold for full xlsx package later.
  const header = ["Timestamp", "Incident ID", "Remediation", "Account", "AI Confidence", "Reviewer", "Compliance", "Evidence Pack"];
  const headerXml = header.map((cell) => `<Cell><Data ss:Type="String">${cell}</Data></Cell>`).join("");
  const rowsXml = rows
    .map((row) => {
      const cells = [
        `<Cell><Data ss:Type="String">${row.timestamp}</Data></Cell>`,
        `<Cell><Data ss:Type="String">${row.incidentId}</Data></Cell>`,
        `<Cell><Data ss:Type="String">${row.remediation}</Data></Cell>`,
        `<Cell><Data ss:Type="String">${row.account}</Data></Cell>`,
        `<Cell><Data ss:Type="Number">${row.confidence}</Data></Cell>`,
        `<Cell><Data ss:Type="String">${row.reviewer}</Data></Cell>`,
        `<Cell><Data ss:Type="String">${row.compliance}</Data></Cell>`,
        `<Cell><Data ss:Type="String">${row.evidencePack}</Data></Cell>`
      ].join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Chandra Audit">
    <Table>
      <Row>${headerXml}</Row>
      ${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;
  downloadBlob(xml, `chandra-audit-${Date.now()}.xls`, "application/vnd.ms-excel");
}

function exportPdf(rows: AuditRow[]) {
  // Scaffold: opens a print-optimized view. Wire jsPDF for inline binary PDF if needed.
  const rowsHtml = rows
    .map(
      (row) => `
      <tr>
        <td>${row.timestamp}</td>
        <td>${row.incidentId}</td>
        <td>${row.remediation}</td>
        <td>${row.account}</td>
        <td>${row.confidence}%</td>
        <td>${row.reviewer}</td>
        <td>${row.compliance}</td>
        <td>${row.evidencePack}</td>
      </tr>`
    )
    .join("");
  const doc = `<!doctype html><html><head><title>Chandra Audit Export</title>
<style>
  body{font-family:ui-monospace,Consolas,monospace;color:#111;padding:24px;}
  h1{font-size:18px;margin:0 0 8px;}
  .meta{color:#555;font-size:11px;margin-bottom:18px;}
  table{width:100%;border-collapse:collapse;font-size:11px;}
  th,td{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left;}
  th{background:#f4f4f4;text-transform:uppercase;font-size:9px;letter-spacing:1px;}
  @media print{button{display:none;}}
</style></head>
<body>
  <h1>Chandra Audit Trail — Evidence Export</h1>
  <div class="meta">Generated ${new Date().toISOString()} · Records: ${rows.length} · L3 Human-Supervised AI Digital Worker</div>
  <button onclick="window.print()" style="margin-bottom:12px;padding:6px 10px;font-size:11px;">Print / Save as PDF</button>
  <table>
    <thead><tr><th>Timestamp</th><th>Incident</th><th>Remediation</th><th>Account</th><th>Conf</th><th>Reviewer</th><th>Compliance</th><th>Evidence</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <script>setTimeout(function(){window.print();},250);</script>
</body></html>`;
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(doc);
    printWindow.document.close();
  } else {
    downloadBlob(doc, `chandra-audit-${Date.now()}.html`, "text/html;charset=utf-8");
  }
}

// Audit Logs with filters + exports
function AuditLogs() {
  const [query, setQuery] = useState("");
  const [timeWindow, setTimeWindow] = useState<"hourly" | "daily" | "weekly" | "monthly">("daily");

  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return auditSeed.filter((row) =>
      `${row.incidentId} ${row.account} ${row.remediation} ${row.reviewer} ${row.compliance} ${row.evidencePack}`
        .toLowerCase()
        .includes(text)
    );
  }, [query]);

  return (
    <Reveal className="glass overflow-hidden p-4">
      <SectionHead
        label="AUDIT TRAIL"
        sub={`${filtered.length} records · ${timeWindow}`}
        action={
          <div className="flex items-center gap-1.5">
            <button onClick={() => exportCsv(filtered)} className="flex items-center gap-1 border border-white/15 bg-white/[0.04] px-2 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-frost/85 hover:border-emerald-300/40 hover:text-emerald-300">
              <FileText size={11} /> CSV
            </button>
            <button onClick={() => exportXlsx(filtered)} className="flex items-center gap-1 border border-white/15 bg-white/[0.04] px-2 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-frost/85 hover:border-amber/45 hover:text-amber">
              <FileSpreadsheet size={11} /> XLSX
            </button>
            <button onClick={() => exportPdf(filtered)} className="flex items-center gap-1 border border-white/15 bg-white/[0.04] px-2 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-frost/85 hover:border-signal/40 hover:text-signal">
              <Download size={11} /> PDF
            </button>
          </div>
        }
      />
      <div className="mb-3 grid gap-2 lg:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-2 border border-white/12 bg-black/35 px-3 py-1.5 text-[0.7rem] text-muted">
          <Search size={13} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-frost outline-none placeholder:text-muted"
            placeholder="Search incident, account, evidence pack, compliance control"
          />
        </label>
        <div className="flex items-center gap-1 border border-white/12 bg-black/35 p-1">
          {(["hourly", "daily", "weekly", "monthly"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setTimeWindow(option)}
              className={cx(
                "px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.16em] transition",
                timeWindow === option ? "bg-signal/15 text-signal" : "text-muted hover:text-frost"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-[300px] overflow-auto scrollbar-mini">
        <table className="w-full min-w-[1000px] border-collapse text-left text-[0.7rem]">
          <thead className="sticky top-0 z-10 bg-black/85 text-[0.56rem] uppercase tracking-[0.18em] text-muted backdrop-blur">
            <tr className="border-b border-white/12">
              {["Timestamp", "Incident", "Remediation", "Account", "Conf", "Reviewer", "Compliance", "Evidence"].map((h) => (
                <th key={h} className="px-2 py-2 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.incidentId} className="border-b border-white/8 text-frost/85">
                <td className="px-2 py-2 text-muted">{row.timestamp}</td>
                <td className="px-2 py-2 text-frost">{row.incidentId}</td>
                <td className="px-2 py-2 text-muted">{row.remediation}</td>
                <td className="px-2 py-2 text-muted">{row.account}</td>
                <td className="px-2 py-2 text-emerald-300">{row.confidence}%</td>
                <td className="px-2 py-2 text-muted">{row.reviewer}</td>
                <td className="px-2 py-2 text-amber">{row.compliance}</td>
                <td className="px-2 py-2 text-muted">{row.evidencePack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

// Compliance compact
function ComplianceStatus() {
  return (
    <Reveal className="glass p-4">
      <SectionHead label="COMPLIANCE STATUS" sub="SOC2 · GxP · 21 CFR Part 11" />
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={complianceData} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#928a80", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[70, 100]} />
              <Tooltip contentStyle={{ background: "#0d0d0f", border: "1px solid rgba(255,255,255,0.14)", fontSize: 12 }} />
              <Area type="monotone" dataKey="soc2" stroke="#ff3b30" fill="rgba(255,59,48,0.22)" name="SOC2" />
              <Area type="monotone" dataKey="gxp" stroke="#ffb347" fill="rgba(255,179,71,0.16)" name="GxP" />
              <Line type="monotone" dataKey="policy" stroke="#8ed9a8" strokeWidth={1.6} dot={false} name="Policy" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["96%", "SOC2 Evidence"],
            ["95%", "GxP Coverage"],
            ["97%", "Internal Policy"],
            ["94%", "Audit Readiness"],
            ["14:45", "Last Evidence"],
            ["1.8s", "Retrieval Latency"]
          ].map(([value, label]) => (
            <div key={label} className="kpi-card">
              <span className="kpi-label">{label}</span>
              <span className="kpi-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

// Ops Copilot with notification badge
function OperationsCopilot({ latestEvent, unread }: { latestEvent: OpsEvent; unread: number }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { role: "system", text: "Context synchronized. Latest event + KRA evidence available.", meta: "memory: incidents / KRA / audit" },
    { role: "chandra", text: "Latest P1 exposure event is awaiting production data-plane approval. Public ACL blocked; evidence attached.", meta: "confidence 91% / live feed" }
  ]);
  const [alerts] = useState([
    "P1 awaiting human approval (S3 exposure)",
    "GuardDuty finding escalated to SecOps",
    "Cost spike contained in Research-Compute"
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
            ? `Draft prepared: ${latestEvent.incident} is ${latestEvent.status.toLowerCase()} with ${latestEvent.confidence}% confidence.`
            : `Operational answer: ${latestEvent.incident} in ${latestEvent.account} handled via current remediation chain.`,
        meta: `trace: ${latestEvent.service} / ${latestEvent.account} / ${latestEvent.time}`
      }
    ]);
    setPrompt("");
    setOpen(true);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] w-[calc(100vw-2rem)] max-w-[420px]">
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: 0.96 }} className="glass overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-3">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-signal" />
                <div>
                  <div className="text-[0.72rem] uppercase tracking-[0.2em] text-frost">Chandra Ops Copilot</div>
                  <div className="text-[0.58rem] uppercase tracking-[0.16em] text-emerald-300">live context synced</div>
                </div>
              </div>
              <button aria-label="Close copilot" onClick={() => setOpen(false)} className="text-muted hover:text-frost">
                <X size={15} />
              </button>
            </div>
            <div className="border-b border-white/8 bg-signal/[0.06] px-3 py-2">
              <div className="mb-1 flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.18em] text-signal">
                <AlertTriangle size={11} /> {alerts.length} unread alerts
              </div>
              <ul className="space-y-0.5 text-[0.65rem] text-frost/85">
                {alerts.map((alert) => (
                  <li key={alert} className="flex items-start gap-1.5"><span className="mt-1 h-1 w-1 rounded-full bg-signal" />{alert}</li>
                ))}
              </ul>
            </div>
            <div className="max-h-[300px] space-y-2 overflow-y-auto p-3 scrollbar-mini">
              {messages.map((message, index) => (
                <div key={index} className={cx("border p-2 text-[0.7rem]", message.role === "supervisor" ? "ml-6 border-amber/30 bg-amber/8" : "mr-3 border-white/10 bg-black/35")}>
                  <div className="mb-1 text-[0.55rem] uppercase tracking-[0.18em] text-muted">{message.role}</div>
                  <div className="leading-5 text-frost/88">{message.text}</div>
                  <div className="mt-1.5 border-l border-signal/40 pl-2 text-[0.55rem] uppercase tracking-[0.14em] text-muted">{message.meta}</div>
                </div>
              ))}
              <div className="border border-emerald-300/20 bg-emerald-300/8 p-2 text-[0.7rem]">
                <div className="mb-1 flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.18em] text-emerald-300">
                  <MailCheck size={11} /> queued communication
                </div>
                <p className="text-frost/82">Incident closure note ready when all P1 items resolved above 90% confidence.</p>
              </div>
            </div>
            <div className="border-t border-white/10 p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {suggestions.map((item) => (
                  <button key={item} onClick={() => submit(item)} className="border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[0.58rem] uppercase tracking-[0.12em] text-muted hover:border-signal/40 hover:text-frost">
                    {item}
                  </button>
                ))}
              </div>
              <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="flex items-center gap-2 border border-white/12 bg-black/45 px-2 py-1.5">
                <Command size={13} className="text-amber" />
                <input
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Ask about incidents, KRAs, evidence, notifications"
                  className="min-w-0 flex-1 bg-transparent text-[0.7rem] text-frost outline-none placeholder:text-muted"
                />
                <button aria-label="Send" className="text-signal hover:text-frost"><Send size={13} /></button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="relative ml-auto flex items-center gap-2 border border-signal/35 bg-black/80 px-3 py-2 text-[0.62rem] uppercase tracking-[0.18em] text-frost shadow-signal backdrop-blur"
        >
          <Sparkles size={13} className="text-signal" />
          Ops Copilot
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 pulse-core" />
          {unread > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-signal bg-signal/90 px-1 text-[0.55rem] font-semibold text-frost">
              {unread}
            </span>
          ) : null}
        </button>
      ) : null}
    </div>
  );
}

export function ChandraExperience() {
  const events = useOperationalFeed();
  const unread = useMemo(() => events.filter((e) => e.severity === "P1" || e.status === "Awaiting Approval" || e.status === "Escalated").length, [events]);

  return (
    <main className="bg-obsidian text-frost">
      <CommandHeader />

      {/* Primary operational pane: waveform + cost + live stream + AWS health */}
      <section className="section-shell">
        <div className="section-inner grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-3">
            <OperationalWaveform />
            <CostMonitoring />
            <AwsEstate />
          </div>
          <div className="lg:col-span-5 space-y-3">
            <LiveOpsStream events={events} />
            <HumanReviewQueue />
          </div>
        </div>
      </section>

      <OperationalTicker />

      {/* Active incidents + performance index side-by-side */}
      <section className="section-shell">
        <div className="section-inner grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-7"><ActiveIncidents /></div>
          <div className="lg:col-span-5"><PerformanceIndex /></div>
        </div>
      </section>

      <KRAGovernance />

      {/* Compliance + Audit Trail */}
      <section className="section-shell">
        <div className="section-inner grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-5"><ComplianceStatus /></div>
          <div className="lg:col-span-7"><AuditLogs /></div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-10">
        <div className="mx-auto max-w-[1480px] border-t border-white/10 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-emerald-300" />
              Observable · Accountable · Supervised
            </div>
            <div>Chandra · Enterprise AI Workforce System · L3 Human-Supervised</div>
          </div>
        </div>
      </section>

      <OperationsCopilot latestEvent={events[0]} unread={unread} />
    </main>
  );
}
