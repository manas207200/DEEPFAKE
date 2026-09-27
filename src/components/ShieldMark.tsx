import { Text, View } from "react-native";
import { PulseDot } from "./Waveform";

export function ShieldMark({ status }: { status: "protected" | "caution" | "alert" }) {
  const color = status === "alert" ? "#F87171" : status === "caution" ? "#FBBF24" : "#34D399";
  const label = status === "alert" ? "At risk" : status === "caution" ? "Caution" : "Protected";
  return (
    <View className="items-center">
      <View
        className="h-28 w-28 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}22`, borderWidth: 3, borderColor: color }}
      >
        <Text className="text-5xl">🛡️</Text>
      </View>
      <View className="mt-3 flex-row items-center gap-2">
        <PulseDot color={color} />
        <Text className="text-lg font-semibold text-white">{label}</Text>
      </View>
    </View>
  );
}
