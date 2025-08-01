import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface TrackerSettings {
  enabled: boolean;
  label: string;
  currentValue: number;
  startValue: number;
  minValue: number;
  maxValue: number;
  increment: number;
  unit: string;
  customUnit: string;
}

export interface SettingsState {
  editMode: boolean;
  dailyResetEnabled: boolean;
  animationsEnabled: boolean;
  selectedTheme: string;
  appTitle: string;
  unitTracker: TrackerSettings;
  notesEnabled: boolean;
  notesTitle: string;
  notesContent: string;
  isLoading: boolean;
}

export type SettingsAction = 
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'SET_DAILY_RESET'; payload: boolean }
  | { type: 'SET_ANIMATIONS'; payload: boolean }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_APP_TITLE'; payload: string }
  | { type: 'SET_TRACKER_ENABLED'; payload: boolean }
  | { type: 'SET_TRACKER_VALUE'; payload: number }
  | { type: 'SET_TRACKER_CONFIG'; payload: Partial<TrackerSettings> }
  | { type: 'RESET_TRACKER_VALUE' }
  | { type: 'SET_NOTES_ENABLED'; payload: boolean }
  | { type: 'SET_NOTES_TITLE'; payload: string }
  | { type: 'SET_NOTES_CONTENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_SETTINGS'; payload: SettingsState };

const initialState: SettingsState = {
  editMode: true,
  dailyResetEnabled: true,
  animationsEnabled: true,
  selectedTheme: 'cyberpunk',
  appTitle: 'Daily Tasks',
  unitTracker: {
    enabled: false,
    label: 'Units',
    currentValue: 60, // 1 hour in minutes
    startValue: 60,
    minValue: 0,
    maxValue: 480, // 8 hours in minutes
    increment: 5,
    unit: 'minutes',
    customUnit: '',
  },
  notesEnabled: false,
  notesTitle: 'Notes',
  notesContent: '',
  isLoading: true,
};

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'SET_EDIT_MODE':
      return {
        ...state,
        editMode: action.payload,
      };
    case 'SET_DAILY_RESET':
      return {
        ...state,
        dailyResetEnabled: action.payload,
      };
    case 'SET_ANIMATIONS':
      return {
        ...state,
        animationsEnabled: action.payload,
      };
    case 'SET_THEME':
      return {
        ...state,
        selectedTheme: action.payload,
      };
    case 'SET_APP_TITLE':
      return {
        ...state,
        appTitle: action.payload,
      };
    case 'SET_TRACKER_ENABLED':
      return {
        ...state,
        unitTracker: {
          ...state.unitTracker,
          enabled: action.payload,
        },
      };
    case 'SET_TRACKER_VALUE':
      return {
        ...state,
        unitTracker: {
          ...state.unitTracker,
          currentValue: action.payload,
        },
      };
    case 'SET_TRACKER_CONFIG':
      return {
        ...state,
        unitTracker: {
          ...state.unitTracker,
          ...action.payload,
        },
      };
    case 'RESET_TRACKER_VALUE':
      return {
        ...state,
        unitTracker: {
          ...state.unitTracker,
          currentValue: state.unitTracker.startValue,
        },
      };
    case 'SET_NOTES_ENABLED':
      return {
        ...state,
        notesEnabled: action.payload,
      };
    case 'SET_NOTES_TITLE':
      return {
        ...state,
        notesTitle: action.payload,
      };
    case 'SET_NOTES_CONTENT':
      return {
        ...state,
        notesContent: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOAD_SETTINGS':
      return {
        ...action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
};

interface SettingsContextType {
  state: SettingsState;
  actions: {
    setEditMode: (enabled: boolean) => Promise<void>;
    setDailyResetEnabled: (enabled: boolean) => Promise<void>;
    setAnimationsEnabled: (enabled: boolean) => Promise<void>;
    setSelectedTheme: (theme: string) => Promise<void>;
    setAppTitle: (title: string) => Promise<void>;
    setTrackerEnabled: (enabled: boolean) => Promise<void>;
    setTrackerValue: (value: number) => Promise<void>;
    setTrackerConfig: (config: Partial<TrackerSettings>) => Promise<void>;
    resetTrackerValue: () => Promise<void>;
    setNotesEnabled: (enabled: boolean) => Promise<void>;
    setNotesTitle: (title: string) => Promise<void>;
    setNotesContent: (content: string) => Promise<void>;
    loadSettings: (settings: Partial<SettingsState>) => Promise<void>;
  };
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

const SETTINGS_KEY = 'daily_tasks_settings';

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          dispatch({ 
            type: 'LOAD_SETTINGS', 
            payload: {
              editMode: parsedSettings.editMode ?? true,
              dailyResetEnabled: parsedSettings.dailyResetEnabled ?? true,
              animationsEnabled: parsedSettings.animationsEnabled ?? true,
              selectedTheme: parsedSettings.selectedTheme ?? 'cyberpunk',
              appTitle: parsedSettings.appTitle ?? 'Daily Tasks',
              unitTracker: {
                enabled: parsedSettings.unitTracker?.enabled ?? parsedSettings.timeTracker?.enabled ?? false,
                label: parsedSettings.unitTracker?.label ?? parsedSettings.timeTracker?.label ?? 'Units',
                currentValue: parsedSettings.unitTracker?.currentValue ?? parsedSettings.timeTracker?.currentValue ?? 60,
                startValue: parsedSettings.unitTracker?.startValue ?? parsedSettings.timeTracker?.startValue ?? 60,
                minValue: parsedSettings.unitTracker?.minValue ?? parsedSettings.timeTracker?.minValue ?? 0,
                maxValue: parsedSettings.unitTracker?.maxValue ?? parsedSettings.timeTracker?.maxValue ?? 480,
                increment: parsedSettings.unitTracker?.increment ?? parsedSettings.timeTracker?.increment ?? 5,
                unit: parsedSettings.unitTracker?.unit ?? parsedSettings.timeTracker?.unit ?? 'minutes',
                customUnit: parsedSettings.unitTracker?.customUnit ?? parsedSettings.timeTracker?.customUnit ?? '',
              },
              notesEnabled: parsedSettings.notesEnabled ?? false,
              notesTitle: parsedSettings.notesTitle ?? 'Notes',
              notesContent: parsedSettings.notesContent ?? '',
              isLoading: false,
            }
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        const settingsToSave = {
          editMode: state.editMode,
          dailyResetEnabled: state.dailyResetEnabled,
          animationsEnabled: state.animationsEnabled,
          selectedTheme: state.selectedTheme,
          appTitle: state.appTitle,
          unitTracker: state.unitTracker,
          notesEnabled: state.notesEnabled,
          notesTitle: state.notesTitle,
          notesContent: state.notesContent,
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [state.editMode, state.dailyResetEnabled, state.animationsEnabled, state.selectedTheme, state.appTitle, state.unitTracker, state.notesEnabled, state.notesTitle, state.notesContent, state.isLoading]);

  const setEditMode = async (enabled: boolean): Promise<void> => {
    dispatch({ type: 'SET_EDIT_MODE', payload: enabled });
  };

  const setDailyResetEnabled = async (enabled: boolean): Promise<void> => {
    dispatch({ type: 'SET_DAILY_RESET', payload: enabled });
  };

  const setAnimationsEnabled = async (enabled: boolean): Promise<void> => {
    dispatch({ type: 'SET_ANIMATIONS', payload: enabled });
  };

  const setSelectedTheme = async (theme: string): Promise<void> => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setAppTitle = async (title: string): Promise<void> => {
    dispatch({ type: 'SET_APP_TITLE', payload: title });
  };

  const setTrackerEnabled = async (enabled: boolean): Promise<void> => {
    dispatch({ type: 'SET_TRACKER_ENABLED', payload: enabled });
  };

  const setTrackerValue = async (value: number): Promise<void> => {
    dispatch({ type: 'SET_TRACKER_VALUE', payload: value });
  };

  const setTrackerConfig = async (config: Partial<TrackerSettings>): Promise<void> => {
    dispatch({ type: 'SET_TRACKER_CONFIG', payload: config });
  };

  const resetTrackerValue = async (): Promise<void> => {
    dispatch({ type: 'RESET_TRACKER_VALUE' });
  };

  const setNotesEnabled = async (enabled: boolean): Promise<void> => {
    dispatch({ type: 'SET_NOTES_ENABLED', payload: enabled });
  };

  const setNotesTitle = async (title: string): Promise<void> => {
    dispatch({ type: 'SET_NOTES_TITLE', payload: title });
  };

  const setNotesContent = async (content: string): Promise<void> => {
    dispatch({ type: 'SET_NOTES_CONTENT', payload: content });
  };

  const loadSettings = async (settings: Partial<SettingsState>): Promise<void> => {
    dispatch({ 
      type: 'LOAD_SETTINGS', 
      payload: {
        ...state,
        ...settings,
        isLoading: false,
      }
    });
  };

  const actions = {
    setEditMode,
    setDailyResetEnabled,
    setAnimationsEnabled,
    setSelectedTheme,
    setAppTitle,
    setTrackerEnabled,
    setTrackerValue,
    setTrackerConfig,
    resetTrackerValue,
    setNotesEnabled,
    setNotesTitle,
    setNotesContent,
    loadSettings,
  };

  return (
    <SettingsContext.Provider value={{ state, actions }}>
      {children}
    </SettingsContext.Provider>
  );
};