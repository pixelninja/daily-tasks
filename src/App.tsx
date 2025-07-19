import { TaskProvider } from './contexts/TaskContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { TaskList } from './components/TaskList';

function App() {
  return (
    <SettingsProvider>
      <TaskProvider>
        <div className="min-h-screen bg-base-200" data-theme="cyberpunk">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <TaskList />
          </div>
        </div>
      </TaskProvider>
    </SettingsProvider>
  );
}

export default App;
