import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  TouchSensor,
  MouseSensor, 
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
import { useSettings } from '../contexts/SettingsContext';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { PencilIcon, PlusIcon, DeleteIcon, ClipboardIcon, CheckCircleIcon, ChevronRightIcon } from './icons';

interface CategorySectionProps {
  category: Category;
  tasks: Task[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({ category, tasks }) => {
  const { actions } = useTaskContext();
  const { state: settingsState } = useSettings();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const taskFormRef = useRef<HTMLDivElement>(null);
  
  // Scroll to task form when it opens
  useEffect(() => {
    if (isAddingTask && taskFormRef.current) {
      scrollToForm();
    }
  }, [isAddingTask]);
  
  // Function to scroll form into view
  const scrollToForm = () => {
    if (taskFormRef.current) {
      const timer = setTimeout(() => {
        if (taskFormRef.current) {
          taskFormRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 150);
      
      return () => clearTimeout(timer);
    }
  };
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isFullyCompleted = totalTasks > 0 && completedTasks === totalTasks;

  // Get stable completion message that doesn't change on re-renders
  const completionMessage = useMemo(() => {
    if (!isFullyCompleted) return '';
    
    if (settingsState.animationsEnabled) {
      const funMessages = [
        "🎉 You're on fire! Everything's done!",
        "🚀 Mission accomplished, champion!",
        "🎊 Boom! Category conquered!",
        "✨ All done! Time for a victory dance!",
        "🏆 Category champion status: ACHIEVED!"
      ];
      return funMessages[Math.floor(Math.random() * funMessages.length)];
    } else {
      return "All tasks have been completed";
    }
  }, [isFullyCompleted, settingsState.animationsEnabled]);
  
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
            {isEditing && settingsState.editMode ? (
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
                  className={`card-title text-lg ${settingsState.editMode ? 'cursor-pointer hover:text-primary' : ''} transition-colors flex items-center gap-2`}
                  onClick={settingsState.editMode ? handleEditCategory : undefined}
                >
                  {category.name}
                  {settingsState.editMode && (
                    <PencilIcon className="h-3 w-3 text-base-content/50" />
                  )}
                </h2>
                
                {/* Progress Count */}
                <span className="text-xs text-base-content/60">
                  ({completedTasks}/{totalTasks})
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {settingsState.editMode && (
            <div className="flex gap-1">
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setIsAddingTask(!isAddingTask)}
                title="Add task"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
              
              {!isEditing && (
                <>
                  
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error hover:text-error-content"
                    onClick={handleDeleteCategory}
                    title="Delete category"
                  >
                    <DeleteIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>


        {/* Tasks */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center text-base-content/60">
              <ClipboardIcon className="h-8 w-8 mx-auto mb-2 text-base-content/30" />
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs">Click the + button to add your first task</p>
            </div>
          ) : (
            <>
              {/* Completion Message */}
              {isFullyCompleted && (
                <div className="mb-0">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-success" />
                    <p className={`text-sm ${settingsState.animationsEnabled ? 'font-medium' : 'text-base-content/70'}`}>
                      {completionMessage}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Tasks Section */}
              {/* Active Tasks */}
              {settingsState.editMode ? (
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
              ) : (
                <div>
                  {tasks.filter(task => !task.completed).map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              )}
              
              {/* Completed Tasks */}
              {tasks.filter(task => task.completed).length > 0 && (
                <div className="mt-4">
                  <div 
                    className="flex items-center gap-2 mb-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
                  >
                    <ChevronRightIcon 
                      className={`h-4 w-4 transform transition-transform ${isCompletedExpanded ? 'rotate-90' : ''}`} 
                    />
                    <span className="text-base-content/60 text-sm">
                      Completed ({tasks.filter(task => task.completed).length})
                    </span>
                  </div>
                  {isCompletedExpanded && (
                    <div>
                      {settingsState.editMode ? (
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
                      ) : (
                        <div>
                          {tasks.filter(task => task.completed).map(task => (
                            <TaskItem key={task.id} task={task} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Add Task Form - at bottom */}
        {isAddingTask && settingsState.editMode && (
          <div ref={taskFormRef} className="mt-4 p-4 bg-base-200 rounded-lg">
            <TaskForm 
              categoryId={category.id}
              onSuccess={() => {}}
              onCancel={() => setIsAddingTask(false)}
              onTaskAdded={scrollToForm}
            />
          </div>
        )}
      </div>
    </div>
  );
};