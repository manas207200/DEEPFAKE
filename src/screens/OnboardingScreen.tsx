import { useRef, useState } from "react";
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from "react-native";
import { PrimaryButton } from "../components/ui";
import { useApp } from "../context/AppContext";
import { AudioModule } from "expo-audio";
import Constants from "expo-constants";

const isExpoGo = Constants.appOwnership === "expo";
const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "We detect scam calls and AI-cloned voices before you lose money",
    body: "Pre-pickup number screening plus live Safe Call Mode after you answer.",
  },
  {
    title: "We never record or store your calls",
    body: "Everything happens on your device or in real-time only. Audio is analyzed in short rolling windows and discarded immediately. No conversation transcripts are saved.",
  },
  {
    title: "Add a trusted contact who gets alerted if something looks wrong",
    body: "If Safe Call Mode flags a high-risk scam, you can notify someone you trust with one tap.",
  },
];

export function OnboardingScreen() {
  const { updateSettings } = useApp();
  const scroll = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [permNote, setPermNote] = useState("Microphone, notifications, and contacts are requested only when needed.");

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  async function requestPerms() {
    const mic = await AudioModule.requestRecordingPermissionsAsync();

    let notifStatus = "skipped (Expo Go)";
    if (!isExpoGo) {
      const Notifications = require("expo-notifications");
      const notif = await Notifications.requestPermissionsAsync();
      notifStatus = notif.status;
    }

    setPermNote(
      `Mic: ${mic.granted ? "granted" : "denied"}. Notifications: ${notifStatus}. Contacts stay optional until you add a trusted person.`
    );
  }

  return (
    <View className="flex-1 bg-ink pt-16">
      <View className="items-center px-6">
        <Text className="text-5xl">🛡️</Text>
        <Text className="mt-2 text-3xl font-extrabold tracking-widest text-white">DEEPFAKE</Text>
        <Text className="mt-1 text-sm text-sky">AI voice scam & deepfake call detector</Text>
      </View>

      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="mt-8"
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={{ width }} className="px-7">
            <View className="rounded-3xl bg-panel p-6">
              <Text className="text-2xl font-bold text-white">{slide.title}</Text>
              <Text className="mt-4 text-base leading-6 text-slate-300">{slide.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="flex-row justify-center gap-2 py-4">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${i === page ? "w-6 bg-mint" : "w-2 bg-line"}`}
          />
        ))}
      </View>

      <View className="px-6 pb-10">
        <Text className="mb-4 text-center text-xs text-slate-400">{permNote}</Text>
        <Pressable onPress={requestPerms} className="mb-3 rounded-2xl border border-line px-5 py-4">
          <Text className="text-center font-semibold text-white">Request permissions</Text>
        </Pressable>
        <PrimaryButton
          title="Get Started"
          onPress={() => updateSettings({ onboardingComplete: true })}
        />
      </View>
    </View>
  );
}