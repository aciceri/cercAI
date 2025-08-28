import { useState, useEffect, useCallback } from "react";
import { APISettings, APIProvider } from "../types";

const DEFAULT_SETTINGS: APISettings = {
  openrouter: {
    apiKey: "",
    model: "google/gemini-2.5-flash",
  },
  openai: {
    apiKey: "",
    model: "gpt-4o",
  },
};

const STORAGE_KEY = "search-engine-api-settings";

export function useAPISettings() {
  const [settings, setSettings] = useState<APISettings>(DEFAULT_SETTINGS);
  const [currentProvider, setCurrentProvider] =
    useState<APIProvider>("openrouter");

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });

        // Set current provider based on which one has an API key
        if (parsedSettings.openai?.apiKey) {
          setCurrentProvider("openai");
        } else if (parsedSettings.openrouter?.apiKey) {
          setCurrentProvider("openrouter");
        }
      }
    } catch (error) {
      console.error("Error loading API settings:", error);
    }
  }, []);

  // Save settings to localStorage whenever they change
  const updateSettings = useCallback((newSettings: APISettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving API settings:", error);
    }
  }, []);

  // Check if any provider is configured
  const hasValidConfiguration = useCallback(() => {
    return (
      settings.openrouter.apiKey.length > 0 || settings.openai.apiKey.length > 0
    );
  }, [settings]);

  // Get the best available provider (with API key)
  const getBestProvider = useCallback((): APIProvider | null => {
    if (settings[currentProvider]?.apiKey) {
      return currentProvider;
    }

    if (settings.openrouter.apiKey) {
      return "openrouter";
    }

    if (settings.openai.apiKey) {
      return "openai";
    }

    return null;
  }, [settings, currentProvider]);

  // Change current provider
  const changeProvider = useCallback(
    (provider: APIProvider) => {
      if (settings[provider]?.apiKey) {
        setCurrentProvider(provider);
      }
    },
    [settings],
  );

  return {
    settings,
    updateSettings,
    currentProvider,
    changeProvider,
    hasValidConfiguration,
    getBestProvider,
  };
}
