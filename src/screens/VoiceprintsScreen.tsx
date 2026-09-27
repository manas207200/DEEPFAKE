import { Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "../context/AppContext";

export function VoiceprintsScreen() {
  const { contacts, saveContact } = useApp();
  const withPrints = contacts.filter((c) => c.hasVoiceprint);

  return (
    <ScrollView className="flex-1 bg-ink px-5 pt-4">
      <Text className="mb-4 text-sm text-slate-400">
        Voiceprints are stored locally as hashes. Raw audio is not kept.
      </Text>
      {withPrints.length === 0 ? (
        <Text className="text-slate-400">No voiceprints saved.</Text>
      ) : (
        withPrints.map((c) => (
          <View key={c.id} className="mb-3 rounded-2xl bg-panel p-4">
            <Text className="font-bold text-white">{c.name}</Text>
            <Text className="text-xs text-slate-500">{c.voiceprintHash}</Text>
            <Pressable
              className="mt-2"
              onPress={() => saveContact({ ...c, hasVoiceprint: false, voiceprintHash: undefined })}
            >
              <Text className="text-danger">Delete voiceprint</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}
