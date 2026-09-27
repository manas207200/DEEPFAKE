import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useApp } from "../context/AppContext";

export function SettingsScreen() {
  const nav = useNavigation<any>();
  const { settings, updateSettings } = useApp();

  return (
    <ScrollView className="flex-1 bg-ink px-5 pt-4">
      <Toggle
        label="Always monitor incoming calls"
        hint="When off, Safe Call Mode starts only if you tap it during a call."
        value={settings.alwaysMonitor}
        onChange={(alwaysMonitor) => updateSettings({ alwaysMonitor })}
      />
      <Toggle
        label="Demo Mode"
        hint="Play the three bundled clips through the analysis pipeline instead of the live mic. Use this for a repeatable recording."
        value={settings.demoMode}
        onChange={(demoMode) => updateSettings({ demoMode })}
      />
      <Toggle
        label="Share risk data anonymously"
        hint="Off by default. Never sends audio — only optional risk metadata."
        value={settings.shareAnonymously}
        onChange={(shareAnonymously) => updateSettings({ shareAnonymously })}
      />

      <Text className="mt-4 mb-2 text-slate-400">Backend URL</Text>
      <TextInput
        value={settings.apiUrl}
        onChangeText={(apiUrl) => updateSettings({ apiUrl })}
        autoCapitalize="none"
        className="rounded-2xl bg-panel px-4 py-3 text-white"
      />
      <Text className="mt-2 text-xs text-slate-500">
        On a physical phone, localhost will not work. Use your computer's LAN IP, e.g. http://192.168.1.10:8000
      </Text>

      <Link title="Manage trusted contacts" onPress={() => nav.navigate("Contacts")} />
      <Link title="Manage voiceprints" onPress={() => nav.navigate("Voiceprints")} />
      <Link title="Privacy & Data" onPress={() => nav.navigate("Privacy")} />
      <Link title="About DEEPFAKE" onPress={() => nav.navigate("About")} />
    </ScrollView>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="mb-4 rounded-2xl bg-panel p-4">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 pr-3 font-semibold text-white">{label}</Text>
        <Switch value={value} onValueChange={onChange} />
      </View>
      <Text className="mt-2 text-sm text-slate-400">{hint}</Text>
    </View>
  );
}

function Link({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="mt-2 rounded-2xl bg-panel px-4 py-4">
      <Text className="font-semibold text-white">{title}</Text>
    </Pressable>
  );
}
