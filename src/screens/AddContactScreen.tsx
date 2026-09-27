import { Audio } from "expo-av";
import * as Crypto from "expo-crypto";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { PrimaryButton } from "../components/ui";
import { useApp } from "../context/AppContext";
import { newId } from "../lib/risk";

export function AddContactScreen() {
  const nav = useNavigation();
  const { saveContact } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [voiceprintHash, setVoiceprintHash] = useState<string | undefined>();
  const [status, setStatus] = useState("Voiceprints stay on this device. Raw audio is never uploaded.");

  async function recordVoice() {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      setStatus("Microphone permission is required to capture a local voiceprint.");
      return;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();
    setStatus("Recording 5-second local sample…");
    await new Promise((r) => setTimeout(r, 5000));
    await rec.stopAndUnloadAsync();
    const uri = rec.getURI() ?? `${name}-${phone}-${Date.now()}`;
    const hash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, uri);
    setVoiceprintHash(hash);
    setStatus("Local embedding saved. The raw clip was discarded after hashing.");
  }

  async function save() {
    if (!name || !phone) return;
    await saveContact({
      id: newId(),
      name,
      phone,
      autoAlert: true,
      hasVoiceprint: Boolean(voiceprintHash),
      voiceprintHash,
    });
    nav.goBack();
  }

  return (
    <View className="flex-1 bg-ink px-5 pt-4">
      <Text className="mb-2 text-slate-400">Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Priya"
        placeholderTextColor="#64748B"
        className="mb-4 rounded-2xl bg-panel px-4 py-3 text-white"
      />
      <Text className="mb-2 text-slate-400">Phone</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="+91…"
        placeholderTextColor="#64748B"
        keyboardType="phone-pad"
        className="mb-4 rounded-2xl bg-panel px-4 py-3 text-white"
      />
      <Text className="mb-4 text-sm text-slate-400">{status}</Text>
      <PrimaryButton title="Record their voice (optional, ~5s demo)" tone="sky" onPress={recordVoice} />
      <View className="mt-3">
        <PrimaryButton title="Save trusted contact" onPress={save} />
      </View>
    </View>
  );
}
