import { Pressable, Text, View } from "react-native";
import type { RiskLevel } from "../types";

const styles: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  low: { bg: "bg-emerald-500/20", text: "text-mint", label: "Low" },
  medium: { bg: "bg-amber-400/20", text: "text-warn", label: "Caution" },
  high: { bg: "bg-red-400/20", text: "text-danger", label: "High risk" },
};

export function RiskBadge({ level, label }: { level: RiskLevel; label?: string }) {
  const s = styles[level];
  return (
    <View className={`rounded-full px-3 py-1 ${s.bg}`}>
      <Text className={`text-xs font-semibold ${s.text}`}>{label ?? s.label}</Text>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  tone = "mint",
  disabled,
}: {
  title: string;
  onPress: () => void;
  tone?: "mint" | "danger" | "sky" | "muted";
  disabled?: boolean;
}) {
  const bg =
    tone === "danger"
      ? "bg-danger"
      : tone === "sky"
        ? "bg-sky"
        : tone === "muted"
          ? "bg-line"
          : "bg-mint";
  const fg = tone === "muted" ? "text-white" : "text-ink";
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`rounded-2xl px-5 py-4 ${bg} ${disabled ? "opacity-40" : ""}`}
    >
      <Text className={`text-center text-base font-bold ${fg}`}>{title}</Text>
    </Pressable>
  );
}
