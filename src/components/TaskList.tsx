import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useSettings } from '../contexts/SettingsContext';
import { CategorySection } from './CategorySection';
import { CategoryForm } from './CategoryForm';
import { BottomToolbar } from './BottomToolbar';
import { UnitTracker } from './UnitTracker';
import { Notes } from './Notes';
import { PencilIcon, PlusIcon, SettingsIcon, ErrorIcon, FolderIcon } from './icons';

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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const categoryFormRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Scroll to category form when it opens
  useEffect(() => {
    if (isAddingCategory && categoryFormRef.current) {
      categoryFormRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isAddingCategory]);

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleClick = () => {
    setEditTitle(settingsState.appTitle);
    setIsEditingTitle(true);
  };

  const handleTitleSave = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== settingsState.appTitle) {
      settingsActions.setAppTitle(trimmedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleTitleBlur = () => {
    handleTitleSave();
  };

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
        <ErrorIcon className="stroke-current shrink-0 h-6 w-6" />
        <span>{state.error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          {isEditingTitle && settingsState.editMode ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleTitleKeyPress}
              onBlur={handleTitleBlur}
              className="text-2xl font-bold text-base-content bg-transparent border-2 border-primary rounded px-2 py-1 focus:outline-none focus:border-primary-focus"
              maxLength={50}
            />
          ) : (
            <h1 
              className={`text-2xl font-bold text-base-content ${settingsState.editMode ? 'cursor-pointer hover:text-primary' : ''} transition-colors duration-200 flex items-center gap-2`}
              onClick={settingsState.editMode ? handleTitleClick : undefined}
              title={settingsState.editMode ? "Click to edit title" : undefined}
            >
              {settingsState.appTitle}
              {settingsState.editMode && (
                <PencilIcon className="h-4 w-4 text-base-content/50" />
              )}
            </h1>
          )}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" title="Settings">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow">
              <li className="menu-title !p-2">Settings</li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
                  <span className="label-text">Edit Mode</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.editMode}
                    onChange={(e) => settingsActions.setEditMode(e.target.checked)}
                  />
                </label>
              </li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
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
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
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
              <li className="menu-title !p-2">Notes</li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
                  <span className="label-text">Enable Notes</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.notesEnabled}
                    onChange={(e) => settingsActions.setNotesEnabled(e.target.checked)}
                  />
                </label>
              </li>
              <li className="menu-title !p-2">Unit Tracker</li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
                  <span className="label-text">Enable Tracker</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.unitTracker.enabled}
                    onChange={(e) => settingsActions.setTrackerEnabled(e.target.checked)}
                  />
                </label>
              </li>
              {settingsState.unitTracker.enabled && (
                <>
                  <li>
                    <div className="flex justify-between items-center w-full px-1 py-2">
                      <span className="label-text">Start Value</span>
                      <input 
                        type="number" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="input input-primary input-xs w-16 px-2" 
                        value={settingsState.unitTracker.startValue}
                        onChange={(e) => settingsActions.setTrackerConfig({ startValue: parseInt(e.target.value) || 0 })}
                        min={settingsState.unitTracker.minValue}
                        max={settingsState.unitTracker.maxValue}
                      />
                    </div>
                  </li>
                  <li>
                    <div className="flex justify-between items-center w-full px-1 py-2">
                      <span className="label-text">Range</span>
                      <div className="flex gap-1 items-center">
                        <input 
                          type="number" 
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="input input-primary input-xs w-14 px-2" 
                          value={settingsState.unitTracker.minValue}
                          onChange={(e) => settingsActions.setTrackerConfig({ minValue: parseInt(e.target.value) || 0 })}
                          min={0}
                        />
                        <span className="text-xs">-</span>
                        <input 
                          type="number" 
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="input input-primary input-xs w-14 px-2" 
                          value={settingsState.unitTracker.maxValue}
                          onChange={(e) => settingsActions.setTrackerConfig({ maxValue: parseInt(e.target.value) || 100 })}
                          min={settingsState.unitTracker.minValue}
                        />
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="flex justify-between items-center w-full px-1 py-2">
                      <span className="label-text">Increment</span>
                      <input 
                        type="number" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="input input-primary input-xs w-16 px-2" 
                        value={settingsState.unitTracker.increment}
                        onChange={(e) => settingsActions.setTrackerConfig({ increment: parseInt(e.target.value) || 1 })}
                        min={1}
                      />
                    </div>
                  </li>
                  <li>
                    <div className="flex justify-between items-center w-full px-1 py-2">
                      <span className="label-text">Unit</span>
                      <div className="flex flex-col items-end gap-1">
                        <select 
                          className="select select-primary select-xs w-20 px-2" 
                          value={settingsState.unitTracker.unit}
                          onChange={(e) => settingsActions.setTrackerConfig({ unit: e.target.value })}
                        >
                          <option value="minutes">min</option>
                          <option value="hours">hrs</option>
                          <option value="dollars">$</option>
                          <option value="custom">custom</option>
                        </select>
                        {settingsState.unitTracker.unit === 'custom' && (
                          <input
                            type="text"
                            className="input input-primary input-xs w-20 px-2 mt-2"
                            value={settingsState.unitTracker.customUnit}
                            onChange={(e) => settingsActions.setTrackerConfig({ customUnit: e.target.value })}
                            placeholder="unit"
                            maxLength={10}
                          />
                        )}
                      </div>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Unit Tracker and Notes */}
      <div className="space-y-6">
        <UnitTracker />
        <Notes />
      </div>

      {/* Categories */}
      {state.categories.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="h-16 w-16 mx-auto mb-4 text-base-content/30" />
          <h2 className="text-xl font-semibold mb-2">No Categories Yet</h2>
          <p className="text-base-content/60 mb-4">
            Create your first category to start organising your daily tasks.
          </p>
          {settingsState.editMode && (
            <button
              className="btn btn-primary"
              onClick={() => setIsAddingCategory(true)}
            >
              Create Category
            </button>
          )}
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
          
          {/* Add Category Card */}
          {settingsState.editMode && !isAddingCategory && (
            <div 
              className="card bg-base-100 shadow-sm border border-base-300 border-dashed rounded-md cursor-pointer hover:shadow-md hover:border-primary transition-all duration-200"
              onClick={() => setIsAddingCategory(true)}
            >
              <div className="card-body p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <PlusIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-base-content mb-1">Add Category</h3>
                    <p className="text-xs text-base-content/60">Create a new category to organize your tasks</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Form - at end of categories */}
          {isAddingCategory && settingsState.editMode && (
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
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        dailyResetEnabled={settingsState.dailyResetEnabled}
      />
    </div>
  );
};