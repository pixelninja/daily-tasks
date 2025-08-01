import localforage from 'localforage';
import type { Task, Category } from './types';

// Configure localforage for IndexedDB
localforage.config({
  name: 'DailyTasks',
  version: 1.0,
  storeName: 'daily_tasks_store',
  description: 'Storage for daily tasks application'
});

// Storage keys
const TASKS_KEY = 'tasks';
const CATEGORIES_KEY = 'categories';
const LAST_RESET_KEY = 'lastReset';

// Task storage operations
export const taskStorage = {
  async getTasks(): Promise<Task[]> {
    try {
      const tasks = await localforage.getItem<Task[]>(TASKS_KEY);
      if (!tasks) return [];
      
      // Ensure dates are Date objects (in case they were stored as strings)
      const processedTasks = tasks.map(task => ({
        ...task,
        createdAt: task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt),
        updatedAt: task.updatedAt instanceof Date ? task.updatedAt : new Date(task.updatedAt)
      }));
      
      
      return processedTasks;
    } catch (error) {
      console.error('Error loading tasks from IndexedDB:', error);
      // Fallback to localStorage
      return this.getTasksFromLocalStorage();
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await localforage.setItem(TASKS_KEY, tasks);
    } catch (error) {
      console.error('Error saving tasks to IndexedDB:', error);
      // Fallback to localStorage only on error
      this.saveTasksToLocalStorage(tasks);
    }
  },

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this.saveTasks(tasks);
  },

  async updateTask(updatedTask: Task): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      await this.saveTasks(tasks);
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    await this.saveTasks(filteredTasks);
  },

  async toggleTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.updatedAt = new Date();
      await this.saveTasks(tasks);
    }
  },

  async resetDailyTasks(): Promise<void> {
    const tasks = await this.getTasks();
    const resetTasks = tasks.map(task => ({
      ...task,
      completed: false,
      updatedAt: new Date()
    }));
    await this.saveTasks(resetTasks);
  },

  // LocalStorage fallback methods
  getTasksFromLocalStorage(): Task[] {
    try {
      const tasks = localStorage.getItem(TASKS_KEY);
      if (!tasks) return [];
      
      const parsedTasks = JSON.parse(tasks);
      // Convert date strings back to Date objects
      return parsedTasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  },

  saveTasksToLocalStorage(tasks: Task[]): void {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }
};

// Category storage operations
export const categoryStorage = {
  async getCategories(): Promise<Category[]> {
    try {
      const categories = await localforage.getItem<Category[]>(CATEGORIES_KEY);
      if (!categories || categories.length === 0) {
        // Load default categories and tasks for new users
        const defaultCategories = this.getDefaultCategories();
        const defaultTasks = this.getDefaultTasks();
        
        // Save default categories and tasks
        await this.saveCategories(defaultCategories);
        await taskStorage.saveTasks(defaultTasks);
        
        return defaultCategories;
      }
      
      // Ensure dates are Date objects (in case they were stored as strings)
      return categories.map(category => ({
        ...category,
        createdAt: category.createdAt instanceof Date ? category.createdAt : new Date(category.createdAt),
        updatedAt: category.updatedAt instanceof Date ? category.updatedAt : new Date(category.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading categories from IndexedDB:', error);
      return this.getCategoriesFromLocalStorage();
    }
  },

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      await localforage.setItem(CATEGORIES_KEY, categories);
      this.saveCategoriesToLocalStorage(categories);
    } catch (error) {
      console.error('Error saving categories to IndexedDB:', error);
      this.saveCategoriesToLocalStorage(categories);
    }
  },

  async addCategory(category: Category): Promise<void> {
    const categories = await this.getCategories();
    categories.push(category);
    await this.saveCategories(categories);
  },

  async updateCategory(updatedCategory: Category): Promise<void> {
    const categories = await this.getCategories();
    const index = categories.findIndex(cat => cat.id === updatedCategory.id);
    if (index !== -1) {
      categories[index] = updatedCategory;
      await this.saveCategories(categories);
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const categories = await this.getCategories();
    const filteredCategories = categories.filter(cat => cat.id !== categoryId);
    await this.saveCategories(filteredCategories);
    
    // Also remove all tasks in this category
    const tasks = await taskStorage.getTasks();
    const filteredTasks = tasks.filter(task => task.categoryId !== categoryId);
    await taskStorage.saveTasks(filteredTasks);
  },

  getDefaultCategories(): Category[] {
    return [
      {
        id: 'default-todo',
        name: 'To Do',
        color: '#ff6b6b',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-chores',
        name: 'Chores',
        color: '#4ecdc4',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  getDefaultTasks(): Task[] {
    return [
      // To Do tasks (funny daily tasks)
      {
        id: 'default-task-1',
        title: 'Convince the cat that I am the real owner of this house',
        completed: false,
        categoryId: 'default-todo',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-task-2',
        title: 'Practice my award acceptance speech in the mirror',
        completed: false,
        categoryId: 'default-todo',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-task-3',
        title: 'Resist the urge to buy things I don\'t need online',
        completed: false,
        categoryId: 'default-todo',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-task-4',
        title: 'Pretend to understand what adults are talking about',
        completed: false,
        categoryId: 'default-todo',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-task-5',
        title: 'Count how many times I check my phone (spoiler: it\'s too many)',
        completed: false,
        categoryId: 'default-todo',
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Chores tasks (things a child might do)
      {
        id: 'default-task-6',
        title: 'Make my bed without it looking like a tornado hit it',
        completed: false,
        categoryId: 'default-chores',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-task-7',
        title: 'Feed the dog (and remember that I already fed them)',
        completed: false,
        categoryId: 'default-chores',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-task-8',
        title: 'Take out the trash before it becomes sentient',
        completed: false,
        categoryId: 'default-chores',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-task-9',
        title: 'Clean my room (find the floor under all those clothes)',
        completed: false,
        categoryId: 'default-chores',
        order: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'default-task-10',
        title: 'Help with dishes without breaking anything important',
        completed: false,
        categoryId: 'default-chores',
        order: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  getCategoriesFromLocalStorage(): Category[] {
    try {
      const categories = localStorage.getItem(CATEGORIES_KEY);
      if (!categories) {
        // Load default categories and tasks for new users
        const defaultCategories = this.getDefaultCategories();
        const defaultTasks = this.getDefaultTasks();
        
        // Save default categories and tasks to localStorage
        this.saveCategoriesToLocalStorage(defaultCategories);
        taskStorage.saveTasksToLocalStorage(defaultTasks);
        
        return defaultCategories;
      }
      
      const parsedCategories = JSON.parse(categories);
      // Convert date strings back to Date objects
      return parsedCategories.map((category: any) => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
      return this.getDefaultCategories();
    }
  },

  saveCategoriesToLocalStorage(categories: Category[]): void {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }
};

// App state storage operations
export const appStorage = {
  async getLastResetDate(): Promise<string | null> {
    try {
      const lastReset = await localforage.getItem<string>(LAST_RESET_KEY);
      return lastReset || localStorage.getItem(LAST_RESET_KEY);
    } catch (error) {
      console.error('Error loading last reset date:', error);
      return localStorage.getItem(LAST_RESET_KEY);
    }
  },

  async setLastResetDate(date: string): Promise<void> {
    try {
      await localforage.setItem(LAST_RESET_KEY, date);
      localStorage.setItem(LAST_RESET_KEY, date);
    } catch (error) {
      console.error('Error saving last reset date:', error);
      localStorage.setItem(LAST_RESET_KEY, date);
    }
  }
};

// Utility functions
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const migrateData = async (): Promise<void> => {
  // Check if we need to migrate data from localStorage to IndexedDB
  const hasIndexedDBData = await localforage.getItem(TASKS_KEY);
  
  if (!hasIndexedDBData || (Array.isArray(hasIndexedDBData) && hasIndexedDBData.length === 0)) {
    const localTasks = taskStorage.getTasksFromLocalStorage();
    const localCategories = categoryStorage.getCategoriesFromLocalStorage();
    
    if (localTasks.length > 0) {
      await taskStorage.saveTasks(localTasks);
    }
    
    if (localCategories.length > 0) {
      await categoryStorage.saveCategories(localCategories);
    }
  }
};