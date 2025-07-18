import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { CategorySection } from './CategorySection';
import { CategoryForm } from './CategoryForm';
import { BottomToolbar } from './BottomToolbar';

export const TaskList: React.FC = () => {
  const { state } = useTaskContext();
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
        <h1 className="text-2xl font-bold text-base-content">Daily Tasks</h1>
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
      />
    </div>
  );
};