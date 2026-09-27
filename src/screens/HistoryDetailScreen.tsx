import { RouteProp, useRoute } from "@react-navigation/native";
import { Text, View } from "react-native";
import { RiskBadge } from "../components/ui";
import { useApp } from "../context/AppContext";
import type { RootStackParamList } from "../navigation/types";

export function HistoryDetailScreen() {
  const { history } = useApp();
  const { params } = useRoute<RouteProp<RootStackParamList, "HistoryDetail">>();
  const item = history.find((h) => h.id === params.id);

  if (!item) {
    return (
      <View className="flex-1 bg-ink px-5 pt-6">
        <Text className="text-white">Entry not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ink px-5 pt-6">
      <Text className="text-2xl font-bold text-white">{item.phone}</Text>
      <Text className="mt-1 text-slate-400">{new Date(item.timestamp).toLocaleString()}</Text>
      <View className="mt-4">
        <RiskBadge level={item.riskLevel} />
      </View>
      <View className="mt-6 rounded-2xl bg-panel p-4">
        <Row label="Detection" value={item.detectionType} />
        <Row label="Confidence" value={item.confidence != null ? `${Math.round(item.confidence * 100)}%` : "—"} />
        <Row label="Matched pattern" value={item.matchedPattern || "None stored"} />
        <Row label="Category" value={item.category || "—"} />
      </View>
      <Text className="mt-6 text-sm leading-5 text-slate-400">
        We don't store conversations — only this risk summary. No transcript or raw audio is kept
        from this call.
      </Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-3">
      <Text className="text-xs uppercase tracking-wide text-slate-500">{label}</Text>
      <Text className="text-base text-white">{value}</Text>
    </View>
  );
}
