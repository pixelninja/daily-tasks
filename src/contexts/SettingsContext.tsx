import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface SettingsState {
  dailyResetEnabled: boolean;
  isLoading: boolean;
}

export type SettingsAction = 
  | { type: 'SET_DAILY_RESET'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_SETTINGS'; payload: SettingsState };

const initialState: SettingsState = {
  dailyResetEnabled: true,
  isLoading: true,
};

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'SET_DAILY_RESET':
      return {
        ...state,
        dailyResetEnabled: action.payload,
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
    setDailyResetEnabled: (enabled: boolean) => Promise<void>;
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
              dailyResetEnabled: parsedSettings.dailyResetEnabled ?? true,
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
          dailyResetEnabled: state.dailyResetEnabled,
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [state.dailyResetEnabled, state.isLoading]);

  const setDailyResetEnabled = async (enabled: boolean): Promise<void> => {
    dispatch({ type: 'SET_DAILY_RESET', payload: enabled });
  };

  const actions = {
    setDailyResetEnabled,
  };

  return (
    <SettingsContext.Provider value={{ state, actions }}>
      {children}
    </SettingsContext.Provider>
  );
};