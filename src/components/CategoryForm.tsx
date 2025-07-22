import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import type { CategoryFormData } from '../utils/types';
import { PlusIcon } from './icons';

interface CategoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const predefinedColors = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9',
  '#f8c471', '#82e0aa', '#f1948a', '#85929e', '#a569bd'
];

export const CategoryForm: React.FC<CategoryFormProps> = ({ onSuccess, onCancel }) => {
  const { state, actions } = useTaskContext();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: predefinedColors[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await actions.addCategory({
        name: formData.name.trim(),
        color: formData.color,
        order: state.categories.length,
      });
      
      setFormData({
        name: '',
        color: predefinedColors[0],
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Error adding category:', error);
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
    <div className="card bg-base-100 shadow-lg border border-base-300 rounded-md">
      <div className="card-body p-4">
        <h3 className="card-title mb-4">Add New Category</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text">Category Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter category name..."
              className="input input-bordered input-primary w-full text-base"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={handleKeyPress}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text">Colour</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all duration-200
                    ${formData.color === color 
                      ? 'border-primary scale-110' 
                      : 'border-base-300 hover:border-primary/50 hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  disabled={isSubmitting}
                  title={`Select ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={!formData.name.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Add Category
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
      </div>
    </div>
  );
};