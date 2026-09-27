export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  IncomingCall: { phone: string };
  ActiveCall: { phone: string; category?: string; reportCount?: number };
  ReportNumber: undefined;
  HistoryDetail: { id: string };
  Privacy: undefined;
  About: undefined;
  Voiceprints: undefined;
  AddContact: undefined;
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
  Contacts: undefined;
  Settings: undefined;
};
