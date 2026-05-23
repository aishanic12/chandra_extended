import type { AgentObservation, CostMetricsOutput, CostSnapshotItem, KraStatus } from "./api";
import { predefinedKraCatalog } from "@/store/kraCatalog";

export type Severity = "P1" | "P2" | "P3" | "P4";
export type ApprovalState = "Awaiting Review" | "Approved" | "Rejected" | "Escalated" | "Timed Out";
export type IncidentStatus = "Resolved" | "Investigating" | "Escalated" | "Monitoring" | "Awaiting Approval";

export type LiveOpsEvent = {
  id: string;
  time: string;
  severity: Severity;
  status: IncidentStatus;
  incident: string;
  service: string;
  account: string;
  confidence: number;
  resolution: string;
  approvalState: ApprovalState;
  reviewer: string;
  lockState: string;
  escalation: string;
};

export type LiveIncident = LiveOpsEvent & {
  triage: string;
  eta: string;
  rootCause: string;
  humanEscalation: string;
};

export type LiveApprovalRow = {
  id: string;
  incident: string;
  severity: Severity;
  state: ApprovalState;
  reviewer: string;
  requested: string;
  decided: string;
  note: string;
  account: string;
  confidence: number;
  requestedBy: string;
  lockState: string;
  emailStatus: "pending" | "sent" | "viewed" | "approved" | "rejected";
  pendingReason: string;
};

export type LiveCostCard = {
  label: string;
  value: string;
  delta: string;
  tone: string;
  note: string;
};

export type LiveKraEvaluation = {
  code: string;
  name: string;
  status: string;
  achievement: string;
  note: string;
  tone: string;
  isCustom: boolean;
};

const KRA_CODE_OFFSET = predefinedKraCatalog.length;

export function buildKraPayload(
  selectedPredefined: string[],
  customKras: string[]
): { code: string; description: string }[] {
  const payload: { code: string; description: string }[] = [];
  predefinedKraCatalog.forEach((kra, index) => {
    if (selectedPredefined.includes(kra.id)) {
      payload.push({ code: formatKraCode(index + 1), description: kra.desc });
    }
  });
  customKras.forEach((kra, index) => {
    payload.push({ code: formatKraCode(KRA_CODE_OFFSET + index + 1), description: kra });
  });
  return payload;
}

export function formatKraCode(seq: number): string {
  return `KRA-${String(seq).padStart(2, "0")}`;
}

export function kraCodeToName(code: string, customKras: string[]): string {
  const match = code.match(/KRA-0*(\d+)/i);
  if (!match) return code;
  const seq = parseInt(match[1], 10);
  if (seq >= 1 && seq <= predefinedKraCatalog.length) {
    return predefinedKraCatalog[seq - 1].id;
  }
  const customIndex = seq - KRA_CODE_OFFSET - 1;
  if (customIndex >= 0 && customIndex < customKras.length) {
    return customKras[customIndex];
  }
  return code;
}

function statusTone(status: string): string {
  const upper = (status ?? "").toUpperCase();
  if (upper.includes("RED")) return "text-signal";
  if (upper.includes("YELLOW") || upper.includes("AMBER")) return "text-amber";
  if (upper.includes("GREEN")) return "text-emerald-300";
  return "text-frost";
}

export function deriveKraEvaluations(
  kraStatuses: KraStatus[],
  customKras: string[]
): LiveKraEvaluation[] {
  return kraStatuses.map((entry) => {
    const name = kraCodeToName(entry.kra_code, customKras);
    const code = entry.kra_code;
    const seq = parseInt(code.replace(/[^0-9]/g, ""), 10);
    const isCustom = !Number.isNaN(seq) && seq > KRA_CODE_OFFSET;
    return {
      code,
      name,
      status: entry.status,
      achievement: entry.achievement,
      note: entry.note,
      tone: statusTone(entry.status),
      isCustom
    };
  });
}

const SEVERITY_KEYWORDS: Array<{ pattern: RegExp; severity: Severity }> = [
  { pattern: /\b(public|exfiltration|brute force|credential|c2 beacon|impact|escalation|leak)\b/i, severity: "P1" },
  { pattern: /\b(anomalous|suspicious|unauthorized|malicious|persistence|unprotected|drift)\b/i, severity: "P2" },
  { pattern: /\b(spike|bottleneck|throttling|alarm|recon)\b/i, severity: "P3" }
];

function inferSeverity(text: string): Severity {
  for (const { pattern, severity } of SEVERITY_KEYWORDS) {
    if (pattern.test(text)) return severity;
  }
  return "P3";
}

const SERVICE_KEYWORDS: Array<{ pattern: RegExp; service: string }> = [
  { pattern: /\bS3\b/i, service: "S3" },
  { pattern: /\bRDS\b/i, service: "RDS" },
  { pattern: /\bEBS\b/i, service: "EBS" },
  { pattern: /\bEC2\b/i, service: "EC2" },
  { pattern: /\bECS\b|\bEKS\b/i, service: "ECS/EKS" },
  { pattern: /\bIAM\b/i, service: "IAM" },
  { pattern: /CloudTrail/i, service: "CloudTrail" },
  { pattern: /CloudWatch/i, service: "CloudWatch" },
  { pattern: /GuardDuty/i, service: "GuardDuty" },
  { pattern: /Config/i, service: "AWS Config" },
  { pattern: /Bedrock/i, service: "Bedrock" }
];

function inferService(text: string): string {
  for (const { pattern, service } of SERVICE_KEYWORDS) {
    if (pattern.test(text)) return service;
  }
  return "AWS";
}

const ACCOUNT_KEYWORDS: Array<{ pattern: RegExp; account: string }> = [
  { pattern: /chandra-database|RDS/i, account: "Chandra-Data-Prod" },
  { pattern: /chandra-synth-electric|S3/i, account: "Chandra-Storage-Prod" },
  { pattern: /EC2|i-0/i, account: "Chandra-Compute-Prod" },
  { pattern: /Bedrock|LLM/i, account: "Chandra-AI-Prod" },
  { pattern: /Config|Compliance/i, account: "Chandra-Audit-Prod" }
];

function inferAccount(text: string): string {
  for (const { pattern, account } of ACCOUNT_KEYWORDS) {
    if (pattern.test(text)) return account;
  }
  return "Chandra-Operations";
}

function nowTime(offset = 0): string {
  return new Date(Date.now() + offset).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function deriveOpsEvents(issues: string[]): LiveOpsEvent[] {
  if (!issues?.length) return [];
  const baseTime = Date.now();
  return issues.map((issue, index) => {
    const severity = inferSeverity(issue);
    return {
      id: `live-evt-${index}`,
      time: nowTime(-index * 90_000),
      severity,
      status: severity === "P1" ? "Awaiting Approval" : "Investigating",
      incident: issue,
      service: inferService(issue),
      account: inferAccount(issue),
      confidence: 86 + ((baseTime + index) % 11),
      resolution: "Auto-triage initiated; awaiting operator decision.",
      approvalState: "Awaiting Review",
      reviewer: "Pending operator review",
      lockState: "Remediation Paused",
      escalation: severity === "P1" ? "Security owner" : "Operator review"
    };
  });
}

export function deriveIncidents(events: LiveOpsEvent[]): LiveIncident[] {
  return events.map((event, index) => ({
    ...event,
    triage: `${String(40 + index * 13).padStart(2, "0")}s`,
    eta: event.severity === "P1" ? "Pending approval" : "Under review",
    rootCause: event.incident,
    humanEscalation:
      event.severity === "P1" ? "Security owner assigned" : "Operator review queued"
  }));
}

export function deriveApprovals(
  actions: { actionName: string; actionDescription: string; service: string }[]
): LiveApprovalRow[] {
  if (!actions?.length) return [];
  return actions.map((action, index) => {
    const severity = inferSeverity(`${action.actionName} ${action.actionDescription}`);
    return {
      id: `APV-${600 + index}`,
      incident: action.actionName,
      severity,
      state: "Awaiting Review",
      reviewer: "Operator",
      requested: nowTime(-index * 60_000),
      decided: "-",
      note: action.actionDescription,
      account: action.service,
      confidence: 84 + ((index * 7) % 12),
      requestedBy: "Chandra AI",
      lockState: "Remediation Paused",
      emailStatus: index === 0 ? "sent" : "pending",
      pendingReason: action.actionName
    };
  });
}

function costTone(changePct: number): string {
  if (Math.abs(changePct) >= 100) return "text-signal";
  if (Math.abs(changePct) >= 25) return "text-amber";
  if (changePct < 0) return "text-emerald-300";
  return "text-frost";
}

function formatCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(2)}`;
}

function formatDelta(changePct: number): string {
  const sign = changePct > 0 ? "+" : "";
  return `${sign}${changePct.toFixed(1)}%`;
}

export function deriveCostCards(snapshot: CostSnapshotItem[]): LiveCostCard[] {
  if (!snapshot?.length) return [];
  return snapshot.map((item) => ({
    label: item.service,
    value: `${formatCurrency(item.daily_avg_usd)}/day`,
    delta: formatDelta(item.change_24h_pct),
    tone: costTone(item.change_24h_pct),
    note: item.note
  }));
}

export type RegionSpend = { region: string; total: number };
export type ServiceSpend = { service: string; total: number };

export function deriveCostBreakdown(
  output: CostMetricsOutput | null
): { regions: RegionSpend[]; services: ServiceSpend[]; total: number; window: string } {
  if (!output || !output.DailyBreakdown?.length) {
    return { regions: [], services: [], total: 0, window: "" };
  }
  const regionTotals = new Map<string, number>();
  const serviceTotals = new Map<string, number>();
  let total = 0;
  output.DailyBreakdown.forEach((day) => {
    total += day.TotalDailyCost ?? 0;
    Object.entries(day.Regions ?? {}).forEach(([region, payload]) => {
      regionTotals.set(region, (regionTotals.get(region) ?? 0) + (payload.RegionTotal ?? 0));
      Object.entries(payload.Services ?? {}).forEach(([service, amount]) => {
        serviceTotals.set(service, (serviceTotals.get(service) ?? 0) + amount);
      });
    });
  });
  const regions = Array.from(regionTotals.entries())
    .map(([region, sum]) => ({ region, total: sum }))
    .sort((a, b) => b.total - a.total);
  const services = Array.from(serviceTotals.entries())
    .map(([service, sum]) => ({ service, total: sum }))
    .sort((a, b) => b.total - a.total);
  const window = `${output.LookbackPeriod?.Start ?? ""} → ${output.LookbackPeriod?.End ?? ""}`;
  return { regions, services, total, window };
}

export function healthTone(health: string): string {
  const upper = (health ?? "").toUpperCase();
  if (upper.includes("HEALTHY") || upper.includes("STABLE")) return "text-emerald-300";
  if (upper.includes("DEGRADED")) return "text-amber";
  if (upper.includes("CRITICAL") || upper.includes("FAILED")) return "text-signal";
  return "text-frost";
}

export function summarizeIssuesBySeverity(
  events: LiveOpsEvent[]
): { p1: number; p2: number; p3: number; p4: number; total: number } {
  const counts = { p1: 0, p2: 0, p3: 0, p4: 0, total: events.length };
  events.forEach((event) => {
    if (event.severity === "P1") counts.p1 += 1;
    else if (event.severity === "P2") counts.p2 += 1;
    else if (event.severity === "P3") counts.p3 += 1;
    else counts.p4 += 1;
  });
  return counts;
}

export type { AgentObservation, CostMetricsOutput };
