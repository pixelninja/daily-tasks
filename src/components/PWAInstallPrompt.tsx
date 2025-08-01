import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ShareIcon, DownloadIcon, XIcon } from './icons';

export const PWAInstallPrompt: React.FC = () => {
  const {
    showPrompt,
    platformInfo,
    installInstructions,
    canInstall,
    triggerInstall,
    hideInstallPrompt,
    dismissPrompt
  } = usePWAInstall();

  if (!showPrompt || !canInstall) {
    return null;
  }

  const handleInstall = async () => {
    if (installInstructions.canUseNativePrompt) {
      const success = await triggerInstall();
      if (!success) {
        // Keep prompt open to show manual instructions as fallback
      }
    }
    // For manual installs, keep the prompt open to show instructions
  };

  const handleDismiss = () => {
    hideInstallPrompt();
  };

  const handleDontShowAgain = () => {
    dismissPrompt(true);
  };

  const renderPlatformSpecificContent = () => {
    const { platform, browser } = platformInfo;

    if (platform === 'ios' && browser === 'safari') {
      return (
        <div className="text-center">
          <ShareIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-sm text-base-content/70 mb-4">
            Add this app to your home screen for the best experience
          </p>
          <div className="text-left space-y-2">
            {installInstructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (platform === 'ios' && (browser === 'chrome' || browser === 'edge')) {
      return (
        <div className="text-center">
          <div className="text-4xl mb-4">🌐</div>
          <p className="text-sm text-base-content/70 mb-4">
            To install this app, please open it in Safari
          </p>
          <div className="text-left space-y-2">
            {installInstructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (platform === 'android' && (browser === 'chrome' || browser === 'edge')) {
      return (
        <div className="text-center">
          <DownloadIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-sm text-base-content/70 mb-6">
            Install this app for a better experience with offline access
          </p>
          <button
            onClick={handleInstall}
            className="btn btn-primary btn-block mb-4"
          >
            <DownloadIcon className="h-5 w-5" />
            Install App
          </button>
          <div className="text-left space-y-2 text-xs text-base-content/60">
            <p>Or manually:</p>
            {installInstructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Fallback for other platforms
    return (
      <div className="text-center">
        <DownloadIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
        <p className="text-sm text-base-content/70 mb-4">
          Install this app for quick access
        </p>
        <div className="text-left space-y-2">
          {installInstructions.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-sm w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="text-lg font-semibold">
            {installInstructions.title}
          </h3>
          <button
            onClick={handleDismiss}
            className="btn btn-ghost btn-sm btn-circle"
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderPlatformSpecificContent()}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 p-4 border-t border-base-300">
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="btn btn-ghost btn-sm flex-1"
            >
              Not now
            </button>
            <button
              onClick={handleDontShowAgain}
              className="btn btn-ghost btn-sm flex-1 text-xs"
            >
              Don't show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};