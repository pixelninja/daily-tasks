import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useSettings } from '../contexts/SettingsContext';
import { CategorySection } from './CategorySection';
import { CategoryForm } from './CategoryForm';
import { BottomToolbar } from './BottomToolbar';

// Available DaisyUI themes
const AVAILABLE_THEMES = [
  { name: 'cyberpunk', label: 'Cyberpunk' },
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'synthwave', label: 'Synthwave' },
  { name: 'retro', label: 'Retro' },
  { name: 'dracula', label: 'Dracula' },
  { name: 'luxury', label: 'Luxury' },
  { name: 'business', label: 'Business' },
  { name: 'forest', label: 'Forest' },
  { name: 'aqua', label: 'Aqua' },
  { name: 'lofi', label: 'Lo-Fi' },
  { name: 'pastel', label: 'Pastel' },
  { name: 'fantasy', label: 'Fantasy' },
  { name: 'night', label: 'Night' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'winter', label: 'Winter' },
  { name: 'sunset', label: 'Sunset' },
  { name: 'nord', label: 'Nord' },
];

export const TaskList: React.FC = () => {
  const { state } = useTaskContext();
  const { state: settingsState, actions: settingsActions } = useSettings();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const categoryFormRef = useRef<HTMLDivElement>(null);
  
  // Scroll to category form when it opens
  useEffect(() => {
    if (isAddingCategory && categoryFormRef.current) {
      categoryFormRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isAddingCategory]);

  // Get tasks grouped by category
  const getTasksByCategory = (categoryId: string) => {
    return state.tasks
      .filter(task => task.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  };

  // Calculate overall progress
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(task => task.completed).length;

  if (state.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4 text-base-content/60">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="alert alert-error max-w-md mx-auto mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{state.error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-base-content">Daily Tasks</h1>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" title="Settings">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
              <li className="menu-title !p-2">Settings</li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover:bg-base-200 rounded-lg">
                  <span className="label-text">Daily Reset</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.dailyResetEnabled}
                    onChange={(e) => settingsActions.setDailyResetEnabled(e.target.checked)}
                  />
                </label>
              </li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover:bg-base-200 rounded-lg">
                  <span className="label-text">The Fun Zone</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.animationsEnabled}
                    onChange={(e) => settingsActions.setAnimationsEnabled(e.target.checked)}
                  />
                </label>
              </li>
              <li>
                <div className="flex justify-between items-center w-full p-2">
                  <span className="label-text">Theme</span>
                  <select 
                    className="select select-primary select-sm w-32" 
                    value={settingsState.selectedTheme}
                    onChange={(e) => settingsActions.setSelectedTheme(e.target.value)}
                  >
                    {AVAILABLE_THEMES.map((theme) => (
                      <option key={theme.name} value={theme.name}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>


      {/* Categories */}
      {state.categories.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No Categories Yet</h2>
          <p className="text-base-content/60 mb-4">
            Create your first category to start organising your daily tasks.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingCategory(true)}
          >
            Create Category
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {state.categories
            .sort((a, b) => a.order - b.order)
            .map(category => (
              <CategorySection
                key={category.id}
                category={category}
                tasks={getTasksByCategory(category.id)}
              />
            ))}
          
          {/* Category Form - at end of categories */}
          {isAddingCategory && (
            <div ref={categoryFormRef}>
              <CategoryForm
                onSuccess={() => setIsAddingCategory(false)}
                onCancel={() => setIsAddingCategory(false)}
              />
            </div>
          )}
        </div>
      )}
      
      {/* Bottom Toolbar */}
      <BottomToolbar 
        onAddCategory={() => setIsAddingCategory(!isAddingCategory)}
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        dailyResetEnabled={settingsState.dailyResetEnabled}
      />
    </div>
  );
};