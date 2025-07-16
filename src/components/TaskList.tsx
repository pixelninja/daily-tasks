import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { CategorySection } from './CategorySection';
import { CategoryForm } from './CategoryForm';
import { useDailyReset } from '../hooks/useDailyReset';

export const TaskList: React.FC = () => {
  const { state } = useTaskContext();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { timeUntilReset, manualReset } = useDailyReset();

  // Get tasks grouped by category
  const getTasksByCategory = (categoryId: string) => {
    return state.tasks
      .filter(task => task.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  };

  // Calculate overall progress
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(task => task.completed).length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
    <div className="space-y-6">

      {/* Header with overall progress */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="card-title text-2xl">Daily Tasks</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-base-content/60">
                {timeUntilReset}
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={manualReset}
                title="Reset all tasks now"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          
          {totalTasks > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{completedTasks}/{totalTasks} tasks</span>
              </div>
              <div className="w-full bg-base-300 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="text-center text-sm text-base-content/60">
                {overallProgress.toFixed(1)}% Complete
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Category Button */}
      <div className="flex justify-center">
        <button
          className="btn btn-primary"
          onClick={() => setIsAddingCategory(!isAddingCategory)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Category Form */}
      {isAddingCategory && (
        <CategoryForm
          onSuccess={() => setIsAddingCategory(false)}
          onCancel={() => setIsAddingCategory(false)}
        />
      )}

      {/* Categories */}
      {state.categories.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No Categories Yet</h2>
          <p className="text-base-content/60 mb-4">
            Create your first category to start organizing your daily tasks.
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
        </div>
      )}
    </div>
  );
};