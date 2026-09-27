import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ShieldMark } from "../components/ShieldMark";
import { PrimaryButton, RiskBadge } from "../components/ui";
import { DEMO_NUMBERS } from "../config";
import { useApp } from "../context/AppContext";
import type { RootStackParamList } from "../navigation/types";

export function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { settings, stats, history, updateSettings } = useApp();
  const recent = history.slice(0, 4);

  return (
    <View className="flex-1 bg-ink">
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
        <Text className="text-sm text-slate-400">Dashboard</Text>
        <Text className="text-3xl font-extrabold text-white">DEEPFAKE</Text>
        <View className="mt-6">
          <ShieldMark status="protected" />
        </View>

        <View className="mt-8 rounded-3xl bg-panel p-5">
          <Text className="text-lg font-bold text-white">Safe Call Mode</Text>
          <Text className="mt-1 text-sm text-slate-400">
            Off by default. Turn it on per call, or always monitor incoming calls from Settings.
          </Text>
          <Pressable
            onPress={() => updateSettings({ alwaysMonitor: !settings.alwaysMonitor })}
            className={`mt-4 flex-row items-center justify-between rounded-2xl px-4 py-4 ${
              settings.alwaysMonitor ? "bg-mint/20" : "bg-ink"
            }`}
          >
            <Text className="font-semibold text-white">
              {settings.alwaysMonitor ? "Always monitor incoming calls" : "Manual activation only"}
            </Text>
            <View className={`h-7 w-12 rounded-full ${settings.alwaysMonitor ? "bg-mint" : "bg-line"}`}>
              <View
                className={`mt-1 h-5 w-5 rounded-full bg-white ${
                  settings.alwaysMonitor ? "ml-6" : "ml-1"
                }`}
              />
            </View>
          </Pressable>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-panel p-4">
            <Text className="text-2xl font-bold text-white">{stats.checkedThisWeek}</Text>
            <Text className="text-xs text-slate-400">numbers checked this week</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-panel p-4">
            <Text className="text-2xl font-bold text-white">{stats.threatsBlocked}</Text>
            <Text className="text-xs text-slate-400">threats flagged</Text>
          </View>
        </View>

        <Text className="mt-7 mb-3 text-base font-bold text-white">Simulate incoming call</Text>
        {DEMO_NUMBERS.map((item) => (
          <Pressable
            key={item.phone}
            onPress={() => nav.navigate("IncomingCall", { phone: item.phone })}
            className="mb-2 rounded-2xl bg-panel px-4 py-4"
          >
            <Text className="font-semibold text-white">{item.label}</Text>
            <Text className="text-sm text-slate-400">
              {item.phone} · {item.hint}
            </Text>
          </Pressable>
        ))}

        <Text className="mt-6 mb-3 text-base font-bold text-white">Recent activity</Text>
        {recent.length === 0 ? (
          <Text className="text-sm text-slate-400">No checks yet. Simulate a call to see history.</Text>
        ) : (
          recent.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => nav.navigate("HistoryDetail", { id: item.id })}
              className="mb-2 flex-row items-center justify-between rounded-2xl bg-panel px-4 py-3"
            >
              <View>
                <Text className="font-semibold text-white">{item.phone}</Text>
                <Text className="text-xs text-slate-400">
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
              <RiskBadge level={item.riskLevel} />
            </Pressable>
          ))
        )}
      </ScrollView>

      <View className="absolute bottom-6 right-5 left-5">
        <PrimaryButton title="Report a scam number" onPress={() => nav.navigate("ReportNumber")} />
      </View>
    </View>
  );
}
