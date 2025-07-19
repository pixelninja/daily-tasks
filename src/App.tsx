import { TaskProvider } from './contexts/TaskContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { TaskList } from './components/TaskList';

const AppContent = () => {
  const { state: settingsState } = useSettings();
  
  return (
    <TaskProvider>
      <div className="min-h-screen bg-base-200" data-theme={settingsState.selectedTheme}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
};

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
