import { DEFAULT_API_URL } from "./config";
import type {
  AudioAnalysis,
  DemoClipId,
  NumberCheck,
  ScamCategory,
} from "./types";

async function request<T>(
  apiUrl: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function checkNumber(
  apiUrl: string,
  phone_number: string
): Promise<NumberCheck> {
  return request<NumberCheck>(apiUrl || DEFAULT_API_URL, "/check-number", {
    method: "POST",
    body: JSON.stringify({ phone_number }),
  });
}

export async function analyzeAudio(
  apiUrl: string,
  payload: {
    audio_base64?: string;
    demo_clip?: DemoClipId;
    chunk_index?: number;
  }
): Promise<AudioAnalysis> {
  return request<AudioAnalysis>(apiUrl || DEFAULT_API_URL, "/analyze-audio", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function alertContact(
  apiUrl: string,
  body: {
    contact_name: string;
    contact_phone: string;
    caller_number: string;
    risk_level: string;
    matched_pattern: string;
  }
): Promise<{ sent: boolean; message: string }> {
  return request(apiUrl || DEFAULT_API_URL, "/alert-contact", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getGoldenHourInfo(apiUrl: string): Promise<{
  helpline: string;
  helpline_label: string;
  complaint_url: string;
  golden_hour_minutes: number;
  copy: string;
}> {
  return request(apiUrl || DEFAULT_API_URL, "/golden-hour-info");
}

export async function reportNumber(
  apiUrl: string,
  body: { phone_number: string; category: ScamCategory; note?: string }
): Promise<{ ok: boolean; report_count: number }> {
  return request(apiUrl || DEFAULT_API_URL, "/report-number", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
