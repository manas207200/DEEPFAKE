import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import { useApp } from "../context/AppContext";
import { AboutScreen } from "../screens/AboutScreen";
import { ActiveCallScreen } from "../screens/ActiveCallScreen";
import { AddContactScreen } from "../screens/AddContactScreen";
import { HistoryDetailScreen } from "../screens/HistoryDetailScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { IncomingCallScreen } from "../screens/IncomingCallScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { PrivacyScreen } from "../screens/PrivacyScreen";
import { ReportNumberScreen } from "../screens/ReportNumberScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { TrustedContactsScreen } from "../screens/TrustedContactsScreen";
import { VoiceprintsScreen } from "../screens/VoiceprintsScreen";
import type { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ color: focused ? "#34D399" : "#64748B", fontSize: 10, fontWeight: "700" }}>
      {label}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#070B14" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#121A2A", borderTopColor: "#243049" },
        tabBarActiveTintColor: "#34D399",
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "Activity",
          tabBarIcon: ({ focused }) => <TabIcon label="Log" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Contacts"
        component={TrustedContactsScreen}
        options={{
          title: "Trusted",
          tabBarIcon: ({ focused }) => <TabIcon label="People" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="More" focused={focused} /> }}
      />
    </Tabs.Navigator>
  );
}

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: "#070B14", card: "#070B14", text: "#fff" },
};

export function RootNavigator() {
  const { ready, settings } = useApp();
  if (!ready) return null;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#070B14" },
          headerTintColor: "#fff",
          contentStyle: { backgroundColor: "#070B14" },
        }}
      >
        {!settings.onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="IncomingCall"
              component={IncomingCallScreen}
              options={{ headerShown: false, presentation: "fullScreenModal" }}
            />
            <Stack.Screen
              name="ActiveCall"
              component={ActiveCallScreen}
              options={{ headerShown: false, presentation: "fullScreenModal" }}
            />
            <Stack.Screen name="ReportNumber" component={ReportNumberScreen} options={{ title: "Report a number" }} />
            <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ title: "Risk summary" }} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Voiceprints" component={VoiceprintsScreen} />
            <Stack.Screen name="AddContact" component={AddContactScreen} options={{ title: "Add contact" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
