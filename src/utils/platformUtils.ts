export interface PlatformInfo {
  platform: 'ios' | 'android' | 'desktop';
  browser: 'safari' | 'chrome' | 'edge' | 'firefox' | 'other';
  isMobile: boolean;
  isStandalone: boolean;
  supportsInstall: boolean;
}

export function detectPlatform(): PlatformInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
  
  // Platform detection
  const isIOS = /ipad|iphone|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);
  
  let platform: 'ios' | 'android' | 'desktop' = 'desktop';
  if (isIOS) platform = 'ios';
  else if (isAndroid) platform = 'android';
  
  // Browser detection
  let browser: 'safari' | 'chrome' | 'edge' | 'firefox' | 'other' = 'other';
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    browser = 'safari';
  } else if (/chrome/.test(userAgent) && !/edg/.test(userAgent)) {
    browser = 'chrome';
  } else if (/edg/.test(userAgent)) {
    browser = 'edge';
  } else if (/firefox/.test(userAgent)) {
    browser = 'firefox';
  }
  
  // Install support detection
  const supportsInstall = 
    // Native beforeinstallprompt support (Android Chrome/Edge)
    (platform === 'android' && (browser === 'chrome' || browser === 'edge')) ||
    // iOS Safari supports manual install
    (platform === 'ios' && browser === 'safari') ||
    // Desktop browsers with PWA support
    (platform === 'desktop' && (browser === 'chrome' || browser === 'edge'));
  
  return {
    platform,
    browser,
    isMobile,
    isStandalone,
    supportsInstall
  };
}

export function getInstallInstructions(platformInfo: PlatformInfo): {
  title: string;
  steps: string[];
  canUseNativePrompt: boolean;
} {
  const { platform, browser } = platformInfo;
  
  if (platform === 'ios' && browser === 'safari') {
    return {
      title: 'Add to Home Screen',
      steps: [
        'Tap the Share button at the bottom of the screen',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm'
      ],
      canUseNativePrompt: false
    };
  }
  
  if (platform === 'ios' && (browser === 'chrome' || browser === 'edge')) {
    return {
      title: 'Install via Safari',
      steps: [
        'Open this page in Safari',
        'Tap the Share button',
        'Tap "Add to Home Screen"'
      ],
      canUseNativePrompt: false
    };
  }
  
  if (platform === 'android' && (browser === 'chrome' || browser === 'edge')) {
    return {
      title: 'Install App',
      steps: [
        'Tap "Install" when prompted',
        'Or tap the menu (⋮) and select "Install app"'
      ],
      canUseNativePrompt: true
    };
  }
  
  // Fallback for other platforms
  return {
    title: 'Install App',
    steps: [
      'Look for an install option in your browser menu',
      'Or bookmark this page for quick access'
    ],
    canUseNativePrompt: false
  };
}