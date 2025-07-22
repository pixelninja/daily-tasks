import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { useSettings } from '../contexts/SettingsContext';
import type { TaskFormData } from '../utils/types';
import { PlusIcon } from './icons';

interface TaskFormProps {
  categoryId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onTaskAdded?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ categoryId, onCancel, onTaskAdded }) => {
  const { state, actions } = useTaskContext();
  const { state: settingsState } = useSettings();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    categoryId: categoryId || state.categories[0]?.id || '',
    unitValue: 0,
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
        unitValue: formData.unitValue,
      });
      
      setFormData({
        title: '',
        categoryId: categoryId || formData.categoryId,
        unitValue: 0,
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

      {/* Unit Value Input - only show when unit tracker is enabled */}
      {settingsState.unitTracker.enabled && (
        <div className="form-control">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0"
              className="input input-bordered input-primary w-20 text-base"
              value={formData.unitValue || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, unitValue: parseFloat(e.target.value) || 0 }))}
              disabled={isSubmitting}
              step="any"
            />
            <div className="flex items-center text-sm text-base-content/60">
              <span>
                {settingsState.unitTracker.unit === 'custom' 
                  ? settingsState.unitTracker.customUnit 
                  : settingsState.unitTracker.unit
                } (+/- when completed)
              </span>
            </div>
          </div>
        </div>
      )}

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
              <PlusIcon className="h-4 w-4" />
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