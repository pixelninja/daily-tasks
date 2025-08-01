import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useSettings } from '../contexts/SettingsContext';
import { CategorySection } from './CategorySection';
import { CategoryForm } from './CategoryForm';
import { BottomToolbar } from './BottomToolbar';
import { UnitTracker } from './UnitTracker';
import { Notes } from './Notes';
import { PlusIcon, ErrorIcon, FolderIcon } from './icons';

export const TaskList: React.FC = () => {
  const { state } = useTaskContext();
  const { state: settingsState } = useSettings();
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
        <ErrorIcon className="stroke-current shrink-0 h-6 w-6" />
        <span>{state.error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Unit Tracker and Notes */}
      {(settingsState.unitTracker.enabled || settingsState.notesEnabled) && (
        <div className="space-y-6">
          {settingsState.unitTracker.enabled && <UnitTracker />}
          {settingsState.notesEnabled && <Notes />}
        </div>
      )}

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