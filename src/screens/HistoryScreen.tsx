import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import { RiskBadge } from "../components/ui";
import { useApp } from "../context/AppContext";
import type { RootStackParamList } from "../navigation/types";

export function HistoryScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { history } = useApp();

  return (
    <ScrollView className="flex-1 bg-ink px-5 pt-4">
      <Text className="mb-2 text-sm text-slate-400">
        We don't store conversations — only this risk summary.
      </Text>
      {history.length === 0 ? (
        <Text className="text-slate-400">No call checks yet.</Text>
      ) : (
        history.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => nav.navigate("HistoryDetail", { id: item.id })}
            className="mb-2 flex-row items-center justify-between rounded-2xl bg-panel px-4 py-4"
          >
            <View>
              <Text className="font-semibold text-white">{item.phone}</Text>
              <Text className="text-xs text-slate-400">
                {new Date(item.timestamp).toLocaleString()} · {item.detectionType}
              </Text>
            </View>
            <RiskBadge level={item.riskLevel} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
