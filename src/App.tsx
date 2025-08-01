import { useState, useCallback } from 'react';
import { TaskProvider } from './contexts/TaskContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { TaskList } from './components/TaskList';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Analytics } from '@vercel/analytics/react';

const AppContent = () => {
  const { state: settingsState } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);
  
  return (
    <TaskProvider>
      <div className="min-h-screen bg-base-200" data-theme={settingsState.selectedTheme}>
        <Header onOpenSettings={handleOpenSettings} />
        <div className="container mx-auto px-4 pt-6 pb-8 max-w-4xl">
          <TaskList />
        </div>
        <PWAInstallPrompt />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={handleCloseSettings}
        />
      </div>
    </TaskProvider>
  );
};

function App() {
  return (
    <SettingsProvider>
      <AppContent />
      <Analytics />
    </SettingsProvider>
  );
}

export default App;
