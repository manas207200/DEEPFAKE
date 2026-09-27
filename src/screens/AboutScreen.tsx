import { Text, View } from "react-native";

export function AboutScreen() {
  return (
    <View className="flex-1 bg-ink px-5 pt-6">
      <Text className="text-3xl font-extrabold text-white">DEEPFAKE</Text>
      <Text className="mt-1 text-slate-400">Version 1.0.0</Text>
      <Text className="mt-6 text-base leading-6 text-slate-300">
        A pre-pickup scam-number screen plus post-pickup Safe Call Mode for digital-arrest scripts
        and AI-cloned voices. The app never auto-hangs up — you always decide.
      </Text>
      <Text className="mt-6 text-sm text-slate-500">
        Credits: Expo / React Native, FastAPI detection service, cybercrime.gov.in / 1930 golden-hour
        guidance. Demo numbers and audio are synthetic samples for hackathon recording.
      </Text>
    </View>
  );
}
