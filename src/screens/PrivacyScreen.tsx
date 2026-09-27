import { ScrollView, Text } from "react-native";

export function PrivacyScreen() {
  return (
    <ScrollView className="flex-1 bg-ink px-5 pt-4">
      <Text className="text-2xl font-bold text-white">Privacy & Data</Text>
      <Text className="mt-4 text-base leading-6 text-slate-300">
        DEEPFAKE analyzes short audio windows while Safe Call Mode is on, then discards them. We
        never keep call recordings or transcripts — only a risk summary you can see in History.
      </Text>
      <Text className="mt-4 text-base leading-6 text-slate-300">
        Number checks and audio analysis happen in real time for the current session. Voiceprints,
        if you choose to save them, stay on this device as a hash, not as raw audio.
      </Text>
      <Text className="mt-4 text-base leading-6 text-slate-300">
        Under India's Digital Personal Data Protection Act, 2023, voice patterns can be treated as
        sensitive personal data. This app is designed around purpose limitation, local processing,
        and no silent collection of conversations.
      </Text>
    </ScrollView>
  );
}
