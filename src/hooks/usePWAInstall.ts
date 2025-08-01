import { useState, useEffect, useCallback, useMemo } from 'react';
import { detectPlatform, getInstallInstructions, type PlatformInfo } from '../utils/platformUtils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  showPrompt: boolean;
  platformInfo: PlatformInfo;
  installInstructions: ReturnType<typeof getInstallInstructions>;
}

const STORAGE_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Memoize platform detection to avoid re-calculation on every render
  const platformInfo = useMemo(() => detectPlatform(), []);
  const installInstructions = useMemo(() => getInstallInstructions(platformInfo), [platformInfo]);
  
  const [installState, setInstallState] = useState<PWAInstallState>(() => ({
    isInstallable: false,
    isInstalled: platformInfo.isStandalone,
    showPrompt: false,
    platformInfo,
    installInstructions
  }));

  // Check if user has dismissed the prompt recently
  const isDismissed = useCallback((): boolean => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) return false;
      
      const dismissedTime = parseInt(dismissed, 10);
      const now = Date.now();
      
      return (now - dismissedTime) < DISMISS_DURATION;
    } catch {
      return false;
    }
  }, []);

  // Mark prompt as dismissed
  const dismissPrompt = useCallback((permanent: boolean = false): void => {
    try {
      const dismissTime = permanent ? Date.now() + (365 * 24 * 60 * 60 * 1000) : Date.now();
      localStorage.setItem(STORAGE_KEY, dismissTime.toString());
    } catch {
      // Silently fail if localStorage is not available
    }
    
    setInstallState(prev => ({ ...prev, showPrompt: false }));
  }, []);

  // Show the install prompt
  const showInstallPrompt = useCallback((): void => {
    if (!installState.isInstalled && !isDismissed()) {
      setInstallState(prev => ({ ...prev, showPrompt: true }));
    }
  }, [installState.isInstalled, isDismissed]);

  // Hide the install prompt
  const hideInstallPrompt = useCallback((): void => {
    setInstallState(prev => ({ ...prev, showPrompt: false }));
  }, []);

  // Trigger native install prompt (Android Chrome/Edge)
  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setInstallState(prev => ({ 
          ...prev, 
          isInstalled: true, 
          showPrompt: false,
          isInstallable: false
        }));
        setDeferredPrompt(null);
        return true;
      } else {
        dismissPrompt(false);
        return false;
      }
    } catch (error) {
      console.warn('Error triggering install prompt:', error);
      return false;
    }
  }, [deferredPrompt, dismissPrompt]);

  // Set up event listeners
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(event);
      
      setInstallState(prev => ({ 
        ...prev, 
        isInstallable: true
      }));
    };

    const handleAppInstalled = () => {
      setInstallState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        showPrompt: false,
        isInstallable: false
      }));
      setDeferredPrompt(null);
    };

    // Listen for install events
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Auto-show prompt after delay if conditions are met
    const timer = setTimeout(() => {
      const platformInfo = detectPlatform();
      if (
        !platformInfo.isStandalone && 
        platformInfo.supportsInstall && 
        platformInfo.isMobile && 
        !isDismissed()
      ) {
        showInstallPrompt();
      }
    }, 5000); // Show after 5 seconds

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isDismissed, showInstallPrompt]);

  return {
    ...installState,
    canInstall: installState.isInstallable || installState.platformInfo.supportsInstall,
    showInstallPrompt,
    hideInstallPrompt,
    dismissPrompt,
    triggerInstall
  };
}