import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_API_URL } from "../config";
import * as db from "../storage/db";
import type { AppSettings, HistoryEntry, TrustedContact } from "../types";

const SETTINGS_KEY = "deepfake.settings.v1";

const defaultSettings: AppSettings = {
  onboardingComplete: false,
  alwaysMonitor: false,
  demoMode: true,
  shareAnonymously: false,
  apiUrl: DEFAULT_API_URL,
};

type AppContextValue = {
  ready: boolean;
  settings: AppSettings;
  contacts: TrustedContact[];
  history: HistoryEntry[];
  stats: { checkedThisWeek: number; threatsBlocked: number };
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  saveContact: (contact: TrustedContact) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  addHistory: (entry: HistoryEntry) => Promise<void>;
  refresh: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const refresh = useCallback(async () => {
    const [nextContacts, nextHistory] = await Promise.all([db.listContacts(), db.listHistory()]);
    setContacts(nextContacts);
    setHistory(nextHistory);
  }, []);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        setSettings({ ...defaultSettings, ...JSON.parse(raw) });
      }
      await refresh();
      setReady(true);
    })();
  }, [refresh]);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }, [settings]);

  const saveContact = useCallback(async (contact: TrustedContact) => {
    await db.upsertContact(contact);
    await refresh();
  }, [refresh]);

  const removeContact = useCallback(async (id: string) => {
    await db.deleteContact(id);
    await refresh();
  }, [refresh]);

  const addHistory = useCallback(async (entry: HistoryEntry) => {
    await db.insertHistory(entry);
    await refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return {
      checkedThisWeek: history.filter((item) => item.timestamp >= weekAgo).length,
      threatsBlocked: history.filter((item) => item.riskLevel !== "low").length,
    };
  }, [history]);

  const value = useMemo(
    () => ({
      ready,
      settings,
      contacts,
      history,
      stats,
      updateSettings,
      saveContact,
      removeContact,
      addHistory,
      refresh,
    }),
    [ready, settings, contacts, history, stats, updateSettings, saveContact, removeContact, addHistory, refresh]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
