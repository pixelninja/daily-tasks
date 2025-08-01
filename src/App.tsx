import { TaskProvider } from './contexts/TaskContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { TaskList } from './components/TaskList';
import { Header } from './components/Header';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Analytics } from '@vercel/analytics/react';

const AppContent = () => {
  const { state: settingsState } = useSettings();
  
  return (
    <TaskProvider>
      <div className="min-h-screen bg-base-200" data-theme={settingsState.selectedTheme}>
        <Header />
        <div className="container mx-auto px-4 pt-6 pb-8 max-w-4xl">
          <TaskList />
        </div>
        <PWAInstallPrompt />
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
