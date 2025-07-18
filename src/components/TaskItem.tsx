import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../utils/types';
import { useTaskContext } from '../contexts/TaskContext';
import { formatTime } from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { actions } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const handleToggle = async () => {
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
        card bg-base-100 shadow-sm border border-base-300 rounded-md mb-2 transition-all duration-200
        ${isSortableDragging ? 'opacity-50 rotate-2 z-50' : 'hover:shadow-md'}
        ${task.completed ? 'opacity-75' : ''}
      `}
    >
      <div className="card-body p-4">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <div 
            className="cursor-move text-base-content/50 hover:text-base-content transition-colors"
            {...attributes}
            {...listeners}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          {/* Checkbox */}
          <div className="form-control">
            <label className="label cursor-pointer p-0">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={task.completed}
                onChange={handleToggle}
              />
            </label>
          </div>

          {/* Task content */}
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSave}
                autoFocus
              />
            ) : (
              <div className="flex flex-col">
                <span 
                  className={`
                    text-base-content cursor-pointer
                    ${task.completed ? 'line-through text-base-content/60' : ''}
                  `}
                  onClick={handleEdit}
                >
                  {task.title}
                </span>
                <span className="text-xs text-base-content/50 mt-1">
                  Created {formatTime(task.createdAt)}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-1">
            {!isEditing && (
              <>
                <button
                  className="btn btn-ghost btn-sm btn-square"
                  onClick={handleEdit}
                  title="Edit task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                  onClick={handleDelete}
                  title="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};