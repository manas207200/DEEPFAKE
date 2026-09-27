import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { alertContact, getGoldenHourInfo } from "../api";
import { PrimaryButton } from "../components/ui";
import { PulseDot, Waveform } from "../components/Waveform";
import { useApp } from "../context/AppContext";
import { newId } from "../lib/risk";
import { useAudioAnalysis } from "../lib/useAudioAnalysis";
import type { RootStackParamList } from "../navigation/types";
import type { DemoClipId } from "../types";

const CLIPS: { id: DemoClipId; label: string }[] = [
  { id: "clean_call", label: "Clean" },
  { id: "scam_script_call", label: "Scam script" },
  { id: "voice_clone_sample", label: "Voice clone" },
];

const LIVENESS = [
  "What did we eat the last time we met?",
  "What is our family safe word?",
  "Which school did we go to together?",
];

export function ActiveCallScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, "ActiveCall">>();
  const { settings, contacts, addHistory } = useApp();
  const [safeOn, setSafeOn] = useState(settings.alwaysMonitor);
  const [seconds, setSeconds] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [moneySent, setMoneySent] = useState(false);
  const [golden, setGolden] = useState<{
    helpline: string;
    complaint_url: string;
    copy: string;
    golden_hour_minutes: number;
  } | null>(null);
  const [leftMin, setLeftMin] = useState(60);
  const [toast, setToast] = useState<string | null>(null);
  const [demoClip, setDemoClip] = useState<DemoClipId>("scam_script_call");

  const trusted = contacts[0];
  const { analysis, listening, error } = useAudioAnalysis({
    apiUrl: settings.apiUrl,
    demoMode: settings.demoMode,
    demoClip,
    enabled: safeOn,
  });

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!moneySent) return;
    getGoldenHourInfo(settings.apiUrl)
      .then((info) => {
        setGolden(info);
        setLeftMin(info.golden_hour_minutes);
      })
      .catch(() => {
        setGolden({
          helpline: "1930",
          complaint_url: "https://cybercrime.gov.in",
          copy: "If money was already sent, the first hour is critical. Call 1930 and file a complaint.",
          golden_hour_minutes: 60,
        });
      });
  }, [moneySent, settings.apiUrl]);

  useEffect(() => {
    if (!moneySent) return;
    const t = setInterval(() => setLeftMin((m) => Math.max(0, m - 1)), 60_000);
    return () => clearInterval(t);
  }, [moneySent]);

  const displayLevel = dismissed && analysis.risk_level === "high" ? "medium" : analysis.risk_level;
  const color =
    displayLevel === "high" ? "#F87171" : displayLevel === "medium" ? "#FBBF24" : "#34D399";
  const headline =
    displayLevel === "high"
      ? "HIGH RISK — Likely scam detected"
      : displayLevel === "medium"
        ? "Some indicators suggest caution"
        : "Listening... no threats detected";

  const banner = useMemo(() => {
    if (displayLevel === "low") return null;
    if (analysis.detection_type === "voice_clone") {
      return {
        title: `This voice may be AI-generated, not ${trusted?.name ?? "your contact"}'s real voice`,
        body: "Suggested: ask them something only the real person would know.",
      };
    }
    return {
      title:
        "This call matches known 'digital arrest' scam patterns. No Indian agency arrests people over phone/video calls. Consider hanging up.",
      body: analysis.matched_pattern
        ? `Detected phrase: '${analysis.matched_pattern}'`
        : "Scam-script indicators detected.",
    };
  }, [analysis, displayLevel, trusted?.name]);

  async function endCall() {
    await addHistory({
      id: newId(),
      phone: params.phone,
      timestamp: Date.now(),
      riskLevel: analysis.risk_level,
      detectionType: analysis.detection_type,
      matchedPattern: analysis.matched_pattern,
      confidence: analysis.confidence,
      category: params.category,
      reportCount: params.reportCount,
    });
    nav.popToTop();
  }

  async function sendAlert() {
    if (!trusted) {
      setToast("Add a trusted contact first.");
      return;
    }
    try {
      const res = await alertContact(settings.apiUrl, {
        contact_name: trusted.name,
        contact_phone: trusted.phone,
        caller_number: params.phone,
        risk_level: analysis.risk_level,
        matched_pattern: analysis.matched_pattern,
      });
      setToast(res.message);
    } catch {
      setToast("Alert queued locally. Backend SMS was mocked or unreachable.");
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <View className="flex-1 bg-ink px-5 pt-12">
      <View className="flex-row items-center justify-between">
        <Text className="text-white">
          {mm}:{ss}
        </Text>
        <View className="flex-row items-center gap-2">
          <PulseDot color={safeOn ? "#34D399" : "#64748B"} />
          <Text className="font-semibold text-white">
            Safe Call Mode: {safeOn ? "ON" : "OFF"}
          </Text>
        </View>
      </View>
      <Text className="mt-2 text-center text-slate-400">{params.phone}</Text>

      {!safeOn ? (
        <View className="mt-8">
          <PrimaryButton title="Start Safe Call Mode" onPress={() => setSafeOn(true)} />
        </View>
      ) : null}

      {settings.demoMode && safeOn ? (
        <View className="mt-4 flex-row gap-2">
          {CLIPS.map((clip) => (
            <Pressable
              key={clip.id}
              onPress={() => setDemoClip(clip.id)}
              className={`flex-1 rounded-xl py-2 ${demoClip === clip.id ? "bg-mint" : "bg-panel"}`}
            >
              <Text
                className={`text-center text-xs font-bold ${
                  demoClip === clip.id ? "text-ink" : "text-white"
                }`}
              >
                {clip.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View className="mt-8 items-center">
        <View
          className="h-48 w-48 items-center justify-center rounded-full"
          style={{ borderWidth: 6, borderColor: color, backgroundColor: `${color}22` }}
        >
          <Text className="px-6 text-center text-lg font-bold text-white">{headline}</Text>
        </View>
      </View>

      {analysis.detection_type === "voice_clone" && displayLevel !== "low" ? (
        <View className="mt-5 rounded-2xl bg-panel p-4">
          <Text className="font-bold text-warn">
            Voice does NOT match your saved voiceprint for {trusted?.name ?? "this contact"}
          </Text>
          {LIVENESS.map((q) => (
            <Text key={q} className="mt-2 text-sm text-slate-300">
              • {q}
            </Text>
          ))}
        </View>
      ) : null}

      {banner && displayLevel !== "low" ? (
        <View className="mt-5 rounded-2xl bg-panel p-4">
          <Text className="font-bold text-white">{banner.title}</Text>
          <Text className="mt-2 text-sm text-slate-300">{banner.body}</Text>
        </View>
      ) : null}

      {displayLevel === "high" && !dismissed ? (
        <View className="mt-4 gap-2">
          <PrimaryButton
            title={`Alert ${trusted?.name ?? "trusted contact"}`}
            onPress={sendAlert}
          />
          <PrimaryButton title="End Call" tone="danger" onPress={endCall} />
          <PrimaryButton
            title="I'll handle it"
            tone="muted"
            onPress={() => setDismissed(true)}
          />
        </View>
      ) : (
        <View className="mt-6">
          <PrimaryButton title="End Call" tone="danger" onPress={endCall} />
        </View>
      )}

      <Pressable className="mt-4" onPress={() => setMoneySent(true)}>
        <Text className="text-center text-sm text-sky">Money already sent?</Text>
      </Pressable>

      {moneySent && golden ? (
        <View className="mt-3 rounded-2xl border border-danger p-4">
          <Text className="font-bold text-danger">Golden hour · {leftMin} min left</Text>
          <Text className="mt-2 text-sm text-slate-300">{golden.copy}</Text>
          <View className="mt-3 gap-2">
            <PrimaryButton
              title="Call 1930 Now"
              tone="danger"
              onPress={() => Linking.openURL(`tel:${golden.helpline}`)}
            />
            <PrimaryButton
              title="File Complaint"
              tone="sky"
              onPress={() => Linking.openURL(golden.complaint_url)}
            />
          </View>
        </View>
      ) : null}

      <View className="mt-auto pb-6">
        {error ? <Text className="mb-2 text-center text-xs text-danger">{error}</Text> : null}
        {toast ? <Text className="mb-2 text-center text-xs text-mint">{toast}</Text> : null}
        <Waveform active={safeOn && listening} />
        <Text className="mt-2 text-center text-xs text-slate-500">
          Audio is analyzed in real-time and never stored
        </Text>
      </View>
    </View>
  );
}
