import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import confetti from 'canvas-confetti';
import type { Task } from '../utils/types';
import { useTaskContext } from '../contexts/TaskContext';
import { useSettings } from '../contexts/SettingsContext';
import { triggerNyanCat, triggerRaptor, triggerEmojiParade, triggerUnicorn, triggerBalloons } from './celebrations';
import { PencilIcon, DeleteIcon, DragIcon } from './icons';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { actions } = useTaskContext();
  const { state: settingsState } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Helper function to format unit value display
  const formatUnitValue = (value: number): React.ReactElement | null => {
    if (value === 0 || !value) return null;
    
    // Get the short version of the unit
    let unit: string;
    if (settingsState.unitTracker.unit === 'custom') {
      unit = settingsState.unitTracker.customUnit;
    } else {
      // Use short forms for predefined units
      switch (settingsState.unitTracker.unit) {
        case 'minutes': unit = 'min'; break;
        case 'hours': unit = 'hrs'; break;
        case 'dollars': unit = '$'; break;
        default: unit = settingsState.unitTracker.unit;
      }
    }
    
    const sign = value > 0 ? '+' : '';
    return (
      <span className="text-xs text-base-content/60 ml-1">
        ({sign}{value}{unit})
      </span>
    );
  };
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const handleToggle = async () => {
    // If task is being completed (not uncompleted), show random celebration!
    if (!task.completed && settingsState.animationsEnabled) {
      const randomChoice = Math.random();
      
      if (randomChoice < 0.2) {
        // 20% chance for Nyan Cat!
        triggerNyanCat();
      } else if (randomChoice < 0.4) {
        // 20% chance for Raptor!
        triggerRaptor();
      } else if (randomChoice < 0.6) {
        // 20% chance for Emoji Parade!
        triggerEmojiParade();
      } else if (randomChoice < 0.8) {
        // 20% chance for confetti
        if (checkboxRef.current) {
          const rect = checkboxRef.current.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          
          confetti({
            particleCount: 50,
            spread: 45,
            origin: { x, y },
            colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
            startVelocity: 25,
            gravity: 0.7,
            ticks: 150,
            scalar: 0.8
          });
        }
      } else if (randomChoice < 0.9) {
        // 10% chance for Balloons!
        triggerBalloons();
      } else {
        // 10% chance for Unicorn!
        triggerUnicorn();
      }
    }
    await actions.toggleTask(task.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleSave = async () => {
    if (editTitle.trim() && editTitle !== task.title) {
      await actions.updateTask({ ...task, title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      await actions.deleteTask(task.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        card bg-base-100 shadow-sm border border-base-300 rounded-sm mb-2 transition-all duration-200 select-none
        ${isSortableDragging ? 'opacity-50 rotate-2 z-50' : 'hover:shadow-md'}
        ${task.completed ? 'opacity-75' : ''}
      `}
    >
      <div className="card-body p-3">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          {settingsState.editMode && (
            <div 
              className="cursor-move text-base-content/50 hover:text-base-content transition-colors"
              {...attributes}
              {...listeners}
            >
              <DragIcon className="h-4 w-4" />
            </div>
          )}

          {/* Checkbox - only show when not in edit mode */}
          {!settingsState.editMode && (
            <div className="form-control">
              <label className="label cursor-pointer p-0 block">
                <input
                  ref={checkboxRef}
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={task.completed}
                  onChange={handleToggle}
                />
              </label>
            </div>
          )}

          {/* Task content */}
          <div className="flex-1">
            {isEditing && settingsState.editMode ? (
              <input
                type="text"
                className="input input-bordered input-sm w-full text-base"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSave}
                autoFocus
              />
            ) : (
              <span 
                className={`
                  text-base-content ${settingsState.editMode ? 'cursor-pointer' : ''}
                  ${task.completed ? 'line-through text-base-content/60' : ''}
                  flex items-center gap-1
                `}
                onClick={settingsState.editMode ? handleEdit : undefined}
              >
                {task.title}
                {settingsState.unitTracker.enabled && task.unitValue !== undefined && task.unitValue !== 0 && formatUnitValue(task.unitValue)}
                {settingsState.editMode && (
                  <PencilIcon className="h-3 w-3 text-base-content/50 shrink-0" />
                )}
              </span>
            )}
          </div>

          {/* Action buttons */}
          {settingsState.editMode && (
            <div className="flex gap-1">
              {!isEditing && (
                <button
                  className="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                  onClick={handleDelete}
                  title="Delete task"
                >
                  <DeleteIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};