import type { Task, Category } from './types';
import type { SettingsState } from '../contexts/SettingsContext';
import { taskStorage, categoryStorage, appStorage } from './storage';

export interface ExportData {
  version: string;
  exportDate: string;
  data: {
    tasks: Task[];
    categories: Category[];
    settings: Omit<SettingsState, 'isLoading'>;
    appState: {
      lastResetDate: string | null;
    };
  };
}

export interface ImportResult {
  success: boolean;
  error?: string;
  message?: string;
}

// Current export format version
const EXPORT_VERSION = '1.0';

/**
 * Export all application data to a JSON object
 */
export const exportData = async (settingsState: SettingsState): Promise<ExportData> => {
  try {
    // Get all data from storage
    const [tasks, categories, lastResetDate] = await Promise.all([
      taskStorage.getTasks(),
      categoryStorage.getCategories(),
      appStorage.getLastResetDate(),
    ]);

    // Create export data structure
    const exportData: ExportData = {
      version: EXPORT_VERSION,
      exportDate: new Date().toISOString(),
      data: {
        tasks,
        categories,
        settings: {
          editMode: settingsState.editMode,
          dailyResetEnabled: settingsState.dailyResetEnabled,
          animationsEnabled: settingsState.animationsEnabled,
          selectedTheme: settingsState.selectedTheme,
          appTitle: settingsState.appTitle,
          unitTracker: settingsState.unitTracker,
          notesEnabled: settingsState.notesEnabled,
          notesTitle: settingsState.notesTitle,
          notesContent: settingsState.notesContent,
        },
        appState: {
          lastResetDate,
        },
      },
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Validate imported data structure
 */
export const validateImportData = (data: any): ImportResult => {
  try {
    // Check if data is valid JSON object
    if (!data || typeof data !== 'object') {
      return { success: false, error: 'Invalid JSON format' };
    }

    // Check required top-level fields
    if (!data.version || !data.data) {
      return { success: false, error: 'Missing required fields (version, data)' };
    }

    const { data: appData } = data;

    // Check required data fields
    if (!appData.tasks || !Array.isArray(appData.tasks)) {
      return { success: false, error: 'Invalid or missing tasks data' };
    }

    if (!appData.categories || !Array.isArray(appData.categories)) {
      return { success: false, error: 'Invalid or missing categories data' };
    }

    if (!appData.settings || typeof appData.settings !== 'object') {
      return { success: false, error: 'Invalid or missing settings data' };
    }

    // Validate tasks structure
    for (const task of appData.tasks) {
      if (!task.id || !task.title || typeof task.completed !== 'boolean') {
        return { success: false, error: 'Invalid task structure' };
      }
    }

    // Validate categories structure
    for (const category of appData.categories) {
      if (!category.id || !category.name) {
        return { success: false, error: 'Invalid category structure' };
      }
    }

    return { success: true, message: 'Data validation successful' };
  } catch (error) {
    return { success: false, error: 'Failed to validate import data' };
  }
};

/**
 * Import data and restore to storage
 */
export const importData = async (
  importedData: ExportData,
  settingsActions: any,
  taskActions: any,
  replaceExisting: boolean = true
): Promise<ImportResult> => {
  try {
    // Validate data first
    const validation = validateImportData(importedData);
    if (!validation.success) {
      return validation;
    }

    const { data } = importedData;

    // Convert date strings back to Date objects for tasks
    const processedTasks: Task[] = data.tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));

    // Convert date strings back to Date objects for categories
    const processedCategories: Category[] = data.categories.map(category => ({
      ...category,
      createdAt: new Date(category.createdAt),
      updatedAt: new Date(category.updatedAt),
    }));

    if (replaceExisting) {
      // Replace all existing data
      await taskStorage.saveTasks(processedTasks);
      await categoryStorage.saveCategories(processedCategories);
      
      // Set last reset date if provided
      if (data.appState?.lastResetDate) {
        await appStorage.setLastResetDate(data.appState.lastResetDate);
      }
    } else {
      // Merge with existing data (this would need additional logic)
      // For now, we'll just implement replace mode
      return { success: false, error: 'Merge mode not yet implemented' };
    }

    // Update settings
    const { settings } = data;
    await settingsActions.setEditMode(settings.editMode ?? true);
    await settingsActions.setDailyResetEnabled(settings.dailyResetEnabled ?? true);
    await settingsActions.setAnimationsEnabled(settings.animationsEnabled ?? true);
    await settingsActions.setSelectedTheme(settings.selectedTheme ?? 'cyberpunk');
    await settingsActions.setAppTitle(settings.appTitle ?? 'Daily Tasks');
    await settingsActions.setNotesEnabled(settings.notesEnabled ?? false);
    await settingsActions.setNotesTitle(settings.notesTitle ?? 'Notes');
    await settingsActions.setNotesContent(settings.notesContent ?? '');

    // Update unit tracker settings
    if (settings.unitTracker) {
      await settingsActions.setTrackerEnabled(settings.unitTracker.enabled);
      if (settings.unitTracker.enabled) {
        await settingsActions.setTrackerConfig(settings.unitTracker);
      }
    }

    // Reload data in contexts
    await taskActions.loadData();

    return { 
      success: true, 
      message: `Successfully imported ${processedTasks.length} tasks and ${processedCategories.length} categories` 
    };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: 'Failed to import data' };
  }
};

/**
 * Download data as JSON file
 */
export const downloadDataAsFile = (data: ExportData): void => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `daily-tasks-backup-${timestamp}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Copy data to clipboard
 */
export const copyDataToClipboard = async (data: ExportData): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(jsonString);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
};

/**
 * Parse JSON from clipboard or file input
 */
export const parseImportData = (jsonString: string): ExportData | null => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed as ExportData;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

/**
 * Read file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};