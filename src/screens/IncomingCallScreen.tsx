import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { checkNumber } from "../api";
import { PrimaryButton } from "../components/ui";
import { useApp } from "../context/AppContext";
import { riskLabel } from "../lib/risk";
import type { RootStackParamList } from "../navigation/types";
import type { NumberCheck } from "../types";

const FALLBACK: Record<string, NumberCheck> = {
  "+919876511111": { is_flagged: true, report_count: 47, category: "Digital Arrest" },
  "+919876522222": { is_flagged: true, report_count: 3, category: "Investment Scam" },
  "+919811100001": { is_flagged: false, report_count: 0, category: "Unknown" },
};

export function IncomingCallScreen() {
  const { settings } = useApp();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<RouteProp<RootStackParamList, "IncomingCall">>();
  const [check, setCheck] = useState<NumberCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkNumber(settings.apiUrl, params.phone)
      .then(setCheck)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Lookup failed");
        const digits = params.phone.replace(/\D/g, "").slice(-10);
        const hit = Object.entries(FALLBACK).find(([phone]) => phone.endsWith(digits));
        setCheck(hit ? hit[1] : { is_flagged: false, report_count: 0, category: "Unknown" });
      });
  }, [params.phone, settings.apiUrl]);

  const level = !check
    ? "low"
    : check.report_count >= 10
      ? "high"
      : check.is_flagged
        ? "medium"
        : "low";
  const emoji = level === "high" ? "🔴" : level === "medium" ? "🟡" : "🟢";
  const color = level === "high" ? "#F87171" : level === "medium" ? "#FBBF24" : "#34D399";

  return (
    <View className="flex-1 bg-ink px-6 pt-16">
      <Text className="text-center text-sm uppercase tracking-widest text-slate-400">
        Incoming call
      </Text>
      <View
        className="mt-6 rounded-3xl p-5"
        style={{ backgroundColor: `${color}22`, borderWidth: 1, borderColor: color }}
      >
        <Text className="text-center text-lg">
          {emoji} {check ? riskLabel(level, check.report_count) : "Checking number reputation…"}
        </Text>
      </View>
      <Text className="mt-10 text-center text-3xl font-extrabold text-white">{params.phone}</Text>
      {check?.is_flagged ? (
        <Text className="mt-3 text-center text-base text-warn">Category: {check.category}</Text>
      ) : null}
      {error ? (
        <Text className="mt-4 text-center text-sm text-danger">
          {error}. Using offline fallback for the demo.
        </Text>
      ) : null}

      <View className="mt-auto mb-10 gap-3">
        <PrimaryButton
          title="Answer"
          onPress={() =>
            nav.replace("ActiveCall", {
              phone: params.phone,
              category: check?.category,
              reportCount: check?.report_count,
            })
          }
        />
        <PrimaryButton title="Decline" tone="danger" onPress={() => nav.goBack()} />
      </View>
    </View>
  );
}
