import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import type { TaskFormData } from '../utils/types';

interface TaskFormProps {
  categoryId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onTaskAdded?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ categoryId, onCancel, onTaskAdded }) => {
  const { state, actions } = useTaskContext();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    categoryId: categoryId || state.categories[0]?.id || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100); // Small delay to ensure DOM is ready
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.categoryId) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await actions.addTask({
        title: formData.title.trim(),
        categoryId: formData.categoryId,
        completed: false,
        order: state.tasks.filter(t => t.categoryId === formData.categoryId).length,
      });
      
      setFormData({
        title: '',
        categoryId: categoryId || formData.categoryId,
      });
      
      // Re-focus input and scroll form into view after adding task
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
        onTaskAdded?.(); // Trigger scroll from parent
      }, 100);
      
      // Don't call onSuccess to keep form open for multiple additions
      // onSuccess?.();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onCancel?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter new task..."
          className="input input-bordered input-primary w-full text-base"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          onKeyDown={handleKeyPress}
          disabled={isSubmitting}
        />
      </div>

      {!categoryId && (
        <div className="form-control">
          <select
            className="select select-bordered select-primary w-full text-base"
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {state.categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={!formData.title.trim() || !formData.categoryId || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Adding...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </>
          )}
        </button>
        
        {onCancel && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};