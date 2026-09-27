import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { PrimaryButton } from "../components/ui";
import { useApp } from "../context/AppContext";
import type { RootStackParamList } from "../navigation/types";

export function TrustedContactsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { contacts, saveContact, removeContact } = useApp();

  return (
    <View className="flex-1 bg-ink px-5 pt-4">
      <ScrollView>
        {contacts.length === 0 ? (
          <Text className="text-slate-400">
            No trusted contacts yet. Add someone who should be alerted on high-risk calls.
          </Text>
        ) : (
          contacts.map((c) => (
            <View key={c.id} className="mb-3 rounded-2xl bg-panel p-4">
              <Text className="text-lg font-bold text-white">{c.name}</Text>
              <Text className="text-slate-400">{c.phone}</Text>
              <Text className="mt-1 text-xs text-sky">
                Voiceprint: {c.hasVoiceprint ? "saved locally" : "not recorded"}
              </Text>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-white">Alert automatically on High Risk</Text>
                <Switch
                  value={c.autoAlert}
                  onValueChange={(autoAlert) => saveContact({ ...c, autoAlert })}
                />
              </View>
              <Pressable className="mt-2" onPress={() => removeContact(c.id)}>
                <Text className="text-sm text-danger">Remove</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
      <View className="pb-6">
        <PrimaryButton title="Add Contact" onPress={() => nav.navigate("AddContact")} />
      </View>
    </View>
  );
}
