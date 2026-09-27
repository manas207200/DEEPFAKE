export type RiskLevel = "low" | "medium" | "high";
export type DetectionType = "scam_script" | "voice_clone" | "none";
export type ScamCategory =
  | "Digital Arrest"
  | "Investment Scam"
  | "Courier Scam"
  | "Other";

export type NumberCheck = {
  is_flagged: boolean;
  report_count: number;
  category: string;
};

export type AudioAnalysis = {
  risk_level: RiskLevel;
  confidence: number;
  matched_pattern: string;
  detection_type: DetectionType;
};

export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
  autoAlert: boolean;
  hasVoiceprint: boolean;
  voiceprintHash?: string;
};

export type HistoryEntry = {
  id: string;
  phone: string;
  timestamp: number;
  riskLevel: RiskLevel;
  detectionType: DetectionType;
  matchedPattern?: string;
  confidence?: number;
  category?: string;
  reportCount?: number;
};

export type AppSettings = {
  onboardingComplete: boolean;
  alwaysMonitor: boolean;
  demoMode: boolean;
  shareAnonymously: boolean;
  apiUrl: string;
};

export type DemoClipId = "clean_call" | "scam_script_call" | "voice_clone_sample";
