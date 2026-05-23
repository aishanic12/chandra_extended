export type KraInput = {
  code: string;
  description: string;
};

export type AgentObservationsRequest = {
  region: string;
  kras: KraInput[];
};

export type KraStatus = {
  kra_code: string;
  status: string;
  achievement: string;
  note: string;
};

export type CostSnapshotItem = {
  service: string;
  daily_avg_usd: number;
  change_24h_pct: number;
  note: string;
};

export type ActionItem = {
  actionName: string;
  actionDescription: string;
  service: string;
};

export type AgentObservation = {
  health: string;
  kra_status: KraStatus[];
  issues: string[];
  observations: string[];
  cost_snapshot: CostSnapshotItem[];
  security_posture: string[];
  compliance_summary: string;
  actions: ActionItem[];
};

export type AgentObservationsResponse = {
  statusCode: number;
  status: string;
  exception: string | null;
  output: AgentObservation;
};

export type CostRegion = {
  RegionTotal: number;
  Services: Record<string, number>;
};

export type CostDailyBreakdown = {
  Date: string;
  TotalDailyCost: number;
  Regions: Record<string, CostRegion>;
};

export type CostMetricsOutput = {
  LookbackPeriod: { Start: string; End: string };
  Granularity: string;
  DailyBreakdown: CostDailyBreakdown[];
};

export type CostMetricsResponse = {
  status: string;
  output: CostMetricsOutput;
};

const DEFAULT_TIMEOUT_MS = 90_000;
const DEV_PROXY_PREFIX = "/api/backend";

function isBrowserDev(): boolean {
  return typeof window !== "undefined" && process.env.NODE_ENV === "development";
}

function getApiBase(): string {
  if (isBrowserDev()) return DEV_PROXY_PREFIX;
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

export function getApiUrl(path: string): string {
  const base = getApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

class HttpError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const signal = init.signal ?? controller.signal;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(getApiUrl(path), {
      ...init,
      signal,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {})
      }
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new HttpError(response.status, body);
    }
    const text = await response.text();
    if (!text) {
      throw new Error("Empty response body");
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error("Malformed JSON response");
    }
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAgentObservations(
  payload: AgentObservationsRequest,
  options: { signal?: AbortSignal } = {}
): Promise<AgentObservation> {
  const data = await request<AgentObservationsResponse>("/getAgentObservations", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options.signal
  });
  if (!data?.output) {
    throw new Error("Backend response missing `output` field");
  }
  return data.output;
}

export async function fetchCostMetrics(options: { signal?: AbortSignal } = {}): Promise<CostMetricsOutput> {
  const data = await request<CostMetricsResponse>("/getCostMetrics", {
    method: "GET",
    signal: options.signal
  });
  if (!data?.output) {
    throw new Error("Cost metrics response missing `output` field");
  }
  return data.output;
}

// Future realtime preparation. Replaces interval-based simulator with a real WebSocket
// stream when the LangGraph backend exposes /ws/operations.
export type OperationsStreamHandlers = {
  onEvent?: (event: unknown) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
};

export function subscribeToOperationsStream(_handlers: OperationsStreamHandlers): () => void {
  // Intentional no-op placeholder. The architecture is shaped so that consumers
  // can call subscribeToOperationsStream() and receive an unsubscribe function;
  // when /ws/operations goes live, only this implementation needs to change.
  return () => {};
}
