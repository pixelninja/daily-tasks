import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, AppAction, Task, Category } from '../utils/types';
import { taskStorage, categoryStorage, appStorage, migrateData } from '../utils/storage';
import { isNewDay, getMidnightTimestamp } from '../utils/dateUtils';
import { useSettings } from './SettingsContext';

// Initial state
const initialState: AppState = {
  tasks: [],
  categories: [],
  isLoading: true,
  error: null,
  lastResetDate: null,
};

// Reducer function
const taskReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_TASKS':
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
      };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date() }
            : task
        ),
      };

    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          const reorderedTask = action.payload.tasks.find(t => t.id === task.id);
          return reorderedTask || task;
        }),
      };

    case 'RESET_DAILY_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(task => ({
          ...task,
          completed: false,
          updatedAt: new Date(),
        })),
      };

    case 'LOAD_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        isLoading: false,
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
        tasks: state.tasks.filter(task => task.categoryId !== action.payload),
      };

    case 'REORDER_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_LAST_RESET_DATE':
      return {
        ...state,
        lastResetDate: action.payload,
      };

    default:
      return state;
  }
};

// Context
interface TaskContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    loadData: () => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    toggleTask: (taskId: string) => Promise<void>;
    reorderTasks: (categoryId: string, tasks: Task[]) => Promise<void>;
    addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateCategory: (category: Category) => Promise<void>;
    deleteCategory: (categoryId: string) => Promise<void>;
    reorderCategories: (categories: Category[]) => Promise<void>;
    checkDailyReset: () => Promise<void>;
    resetDailyTasks: () => Promise<void>;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { state: settingsState } = useSettings();

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Migrate data if needed
      await migrateData();
      
      // Load tasks and categories
      const [tasks, categories, lastResetDate] = await Promise.all([
        taskStorage.getTasks(),
        categoryStorage.getCategories(),
        appStorage.getLastResetDate(),
      ]);
      
      
      dispatch({ type: 'LOAD_TASKS', payload: tasks });
      dispatch({ type: 'LOAD_CATEGORIES', payload: categories });
      dispatch({ type: 'SET_LAST_RESET_DATE', payload: lastResetDate || '' });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      console.error('Error loading data:', error);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await taskStorage.addTask(newTask);
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add task' });
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (task: Task): Promise<void> => {
    try {
      const updatedTask = { ...task, updatedAt: new Date() };
      await taskStorage.updateTask(updatedTask);
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      await taskStorage.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
      console.error('Error deleting task:', error);
    }
  };

  const toggleTask = async (taskId: string): Promise<void> => {
    try {
      // Get current tasks from storage
      const tasks = await taskStorage.getTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        // Update the task in storage
        const updatedTask = {
          ...task,
          completed: !task.completed,
          updatedAt: new Date()
        };
        
        await taskStorage.updateTask(updatedTask);
        
        // Update local state with the updated task
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle task' });
      console.error('Error toggling task:', error);
    }
  };

  const reorderTasks = async (categoryId: string, tasks: Task[]): Promise<void> => {
    try {
      const reorderedTasks = tasks.map((task, index) => ({
        ...task,
        order: index,
        updatedAt: new Date(),
      }));
      
      await taskStorage.saveTasks([
        ...state.tasks.filter(t => t.categoryId !== categoryId),
        ...reorderedTasks,
      ]);
      
      dispatch({ type: 'REORDER_TASKS', payload: { categoryId, tasks: reorderedTasks } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder tasks' });
      console.error('Error reordering tasks:', error);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      const newCategory: Category = {
        ...categoryData,
        id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await categoryStorage.addCategory(newCategory);
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add category' });
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (category: Category): Promise<void> => {
    try {
      const updatedCategory = { ...category, updatedAt: new Date() };
      await categoryStorage.updateCategory(updatedCategory);
      dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCategory });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update category' });
      console.error('Error updating category:', error);
    }
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    try {
      await categoryStorage.deleteCategory(categoryId);
      dispatch({ type: 'DELETE_CATEGORY', payload: categoryId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete category' });
      console.error('Error deleting category:', error);
    }
  };

  const reorderCategories = async (categories: Category[]): Promise<void> => {
    try {
      const reorderedCategories = categories.map((category, index) => ({
        ...category,
        order: index,
        updatedAt: new Date(),
      }));
      
      await categoryStorage.saveCategories(reorderedCategories);
      dispatch({ type: 'REORDER_CATEGORIES', payload: reorderedCategories });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reorder categories' });
      console.error('Error reordering categories:', error);
    }
  };

  const checkDailyReset = useCallback(async (): Promise<void> => {
    // Skip daily reset check if it's disabled in settings
    if (!settingsState.dailyResetEnabled) {
      return;
    }
    
    try {
      const lastResetDate = await appStorage.getLastResetDate();
      const currentDate = getMidnightTimestamp();
      
      // Only reset if there was a previous reset date and it's actually a new day
      if (lastResetDate && isNewDay(lastResetDate)) {
        await resetDailyTasks();
      } else if (!lastResetDate) {
        // If no reset date exists, set it to today without resetting tasks
        await appStorage.setLastResetDate(currentDate);
        dispatch({ type: 'SET_LAST_RESET_DATE', payload: currentDate });
      }
    } catch (error) {
      console.error('Error checking daily reset:', error);
    }
  }, [settingsState.dailyResetEnabled]);

  // Check for daily reset after data is loaded
  useEffect(() => {
    if (!state.isLoading && !settingsState.isLoading) {
      checkDailyReset();
      
      // Check for daily reset every minute
      const interval = setInterval(checkDailyReset, 60000);
      
      return () => clearInterval(interval);
    }
  }, [state.isLoading, settingsState.isLoading, settingsState.dailyResetEnabled, checkDailyReset]);

  const resetDailyTasks = async (): Promise<void> => {
    try {
      await taskStorage.resetDailyTasks();
      const currentDate = getMidnightTimestamp();
      await appStorage.setLastResetDate(currentDate);
      
      dispatch({ type: 'RESET_DAILY_TASKS' });
      dispatch({ type: 'SET_LAST_RESET_DATE', payload: currentDate });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to reset daily tasks' });
      console.error('Error resetting daily tasks:', error);
    }
  };

  const contextValue: TaskContextType = {
    state,
    dispatch,
    actions: {
      loadData,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      reorderTasks,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      checkDailyReset,
      resetDailyTasks,
    },
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use the context
export const useTaskContext = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};