import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { reportNumber } from "../api";
import { PrimaryButton } from "../components/ui";
import { useApp } from "../context/AppContext";
import type { ScamCategory } from "../types";

const CATEGORIES: ScamCategory[] = [
  "Digital Arrest",
  "Investment Scam",
  "Courier Scam",
  "Other",
];

export function ReportNumberScreen() {
  const nav = useNavigation();
  const { settings } = useApp();
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<ScamCategory>("Digital Arrest");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  async function submit() {
    try {
      await reportNumber(settings.apiUrl, {
        phone_number: phone,
        category,
        note,
      });
      setToast("Thank you — this helps protect others");
      setTimeout(() => nav.goBack(), 900);
    } catch {
      setToast("Could not reach the server. Try again when the backend is running.");
    }
  }

  return (
    <View className="flex-1 bg-ink px-5 pt-4">
      <Text className="mb-2 text-slate-400">Phone number</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="+91…"
        placeholderTextColor="#64748B"
        keyboardType="phone-pad"
        className="mb-4 rounded-2xl bg-panel px-4 py-3 text-white"
      />
      <Text className="mb-2 text-slate-400">Category</Text>
      {CATEGORIES.map((c) => (
        <Pressable
          key={c}
          onPress={() => setCategory(c)}
          className={`mb-2 rounded-2xl px-4 py-3 ${category === c ? "bg-mint/20" : "bg-panel"}`}
        >
          <Text className="text-white">{c}</Text>
        </Pressable>
      ))}
      <Text className="mb-2 mt-2 text-slate-400">Optional note</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="What happened?"
        placeholderTextColor="#64748B"
        className="mb-6 rounded-2xl bg-panel px-4 py-3 text-white"
      />
      <PrimaryButton title="Submit report" onPress={submit} />
      {toast ? <Text className="mt-4 text-center text-mint">{toast}</Text> : null}
    </View>
  );
}
