import { TaskProvider } from './contexts/TaskContext';
import { TaskList } from './components/TaskList';

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-base-200" data-theme="cyberpunk">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <TaskList />
        </div>
      </div>
    </TaskProvider>
  );
}

export default App;
