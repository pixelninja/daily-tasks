export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string;
  order: number;
  unitValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  tasks: Task[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  lastResetDate: string | null;
}

export type TaskAction = 
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'REORDER_TASKS'; payload: { categoryId: string; tasks: Task[] } }
  | { type: 'RESET_DAILY_TASKS' };

export type CategoryAction = 
  | { type: 'LOAD_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'REORDER_CATEGORIES'; payload: Category[] };

export type AppAction = 
  | TaskAction
  | CategoryAction
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_RESET_DATE'; payload: string };

export interface TaskFormData {
  title: string;
  categoryId: string;
  unitValue?: number;
}

export interface CategoryFormData {
  name: string;
  color: string;
}