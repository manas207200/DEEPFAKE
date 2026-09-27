import "./global.css";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { AppProvider } from "./src/context/AppContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  const Notifications = require("expo-notifications");
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProvider>
  );
}