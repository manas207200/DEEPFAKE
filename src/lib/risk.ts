import { AudioAnalysis, RiskLevel } from "../types";

export function riskColor(level: RiskLevel) {
  if (level === "high") return "#F87171";
  if (level === "medium") return "#FBBF24";
  return "#34D399";
}

export function riskLabel(level: RiskLevel, reportCount?: number) {
  if (level === "high") {
    return reportCount
      ? `Reported ${reportCount} times — known scam number`
      : "HIGH RISK — Likely scam detected";
  }
  if (level === "medium") {
    return reportCount
      ? `Reported ${reportCount} times as suspicious`
      : "Some indicators suggest caution";
  }
  return "No reports found";
}

export function escalate(prev: AudioAnalysis, next: AudioAnalysis): AudioAnalysis {
  const rank = { low: 0, medium: 1, high: 2 };
  return rank[next.risk_level] >= rank[prev.risk_level] ? next : prev;
}

export function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
