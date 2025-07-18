import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import type { Category, Task } from '../utils/types';
import { useTaskContext } from '../contexts/TaskContext';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

interface CategorySectionProps {
  category: Category;
  tasks: Task[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({ category, tasks }) => {
  const { actions } = useTaskContext();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const oldIndex = tasks.findIndex(task => task.id === active.id);
    const newIndex = tasks.findIndex(task => task.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      await actions.reorderTasks(category.id, reorderedTasks);
    }
  };

  const handleEditCategory = () => {
    setIsEditing(true);
    setEditName(category.name);
  };

  const handleSaveCategory = async () => {
    if (editName.trim() && editName !== category.name) {
      await actions.updateCategory({ ...category, name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(category.name);
    setIsEditing(false);
  };

  const handleDeleteCategory = async () => {
    if (window.confirm(`Are you sure you want to delete "${category.name}" and all its tasks?`)) {
      await actions.deleteCategory(category.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveCategory();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg border border-base-300 rounded-md mb-6">
      {/* Progress Bar - Top of card */}
      {totalTasks > 0 && (
        <div className="w-full bg-base-300 h-1">
          <div
            className="bg-primary h-1 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}
      
      <div className="card-body p-4">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Category Color Indicator */}
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            
            {/* Category Name */}
            {isEditing ? (
              <input
                type="text"
                className="input input-bordered input-sm flex-1 max-w-xs text-base"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleSaveCategory}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <h2 
                  className="card-title text-lg cursor-pointer hover:text-primary transition-colors"
                  onClick={handleEditCategory}
                >
                  {category.name}
                </h2>
                
                {/* Progress Count */}
                <span className="text-xs text-base-content/60">
                  ({completedTasks}/{totalTasks})
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              className="btn btn-ghost btn-sm btn-square"
              onClick={() => setIsAddingTask(!isAddingTask)}
              title="Add task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            {!isEditing && (
              <>
                
                <button
                  className="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                  onClick={handleDeleteCategory}
                  title="Delete category"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>


        {/* Add Task Form */}
        {isAddingTask && (
          <div className="mb-4 p-4 bg-base-200 rounded-lg">
            <TaskForm 
              categoryId={category.id}
              onSuccess={() => setIsAddingTask(false)}
            />
          </div>
        )}

        {/* Tasks */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center text-base-content/60 py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No tasks yet</p>
              <p className="text-sm">Click the + button to add your first task</p>
            </div>
          ) : (
            <>
              {/* Active Tasks */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={tasks.filter(task => !task.completed).map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tasks.filter(task => !task.completed).map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </SortableContext>
              </DndContext>
              
              {/* Completed Tasks */}
              {tasks.filter(task => task.completed).length > 0 && (
                <div className="mt-6">
                  <div className="divider">
                    <span className="text-base-content/60 text-sm">
                      Completed ({tasks.filter(task => task.completed).length})
                    </span>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext 
                      items={tasks.filter(task => task.completed).map(task => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {tasks.filter(task => task.completed).map(task => (
                        <TaskItem key={task.id} task={task} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};