import React, { useEffect, useState, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useTaskContext } from '../contexts/TaskContext';
import { AVAILABLE_THEMES } from '../constants/themes';
import { XIcon, DownloadIcon, UploadIcon, ClipboardIcon } from './icons';
import { downloadDataAsFile, copyDataToClipboard, parseImportData, readFileAsText } from '../utils/dataExport';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { state: settingsState, actions: settingsActions } = useSettings();
  const { actions: taskActions } = useTaskContext();
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Data management state
  const [importText, setImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle animation and rendering
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready for animation
      const timer = setTimeout(() => setIsAnimating(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore body scroll
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Clear feedback message after 5 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Data management handlers
  const handleExportToClipboard = async () => {
    try {
      setIsProcessing(true);
      const data = await taskActions.exportData();
      await copyDataToClipboard(data);
      setFeedbackMessage({ type: 'success', message: 'Data copied to clipboard!' });
    } catch (error) {
      setFeedbackMessage({ type: 'error', message: 'Failed to copy data to clipboard' });
      console.error('Export to clipboard error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportToFile = async () => {
    try {
      setIsProcessing(true);
      const data = await taskActions.exportData();
      downloadDataAsFile(data);
      setFeedbackMessage({ type: 'success', message: 'Data downloaded successfully!' });
    } catch (error) {
      setFeedbackMessage({ type: 'error', message: 'Failed to download data file' });
      console.error('Export to file error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportFromText = async () => {
    if (!importText.trim()) {
      setFeedbackMessage({ type: 'error', message: 'Please paste JSON data first' });
      return;
    }

    try {
      setIsProcessing(true);
      const data = parseImportData(importText);
      if (!data) {
        setFeedbackMessage({ type: 'error', message: 'Invalid JSON format' });
        return;
      }

      const result = await taskActions.importData(data);
      if (result.success) {
        setFeedbackMessage({ type: 'success', message: result.message || 'Data imported successfully!' });
        setImportText('');
        setShowImportArea(false);
      } else {
        setFeedbackMessage({ type: 'error', message: result.error || 'Import failed' });
      }
    } catch (error) {
      setFeedbackMessage({ type: 'error', message: 'Failed to import data' });
      console.error('Import from text error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setFeedbackMessage({ type: 'error', message: 'Please select a JSON file' });
      return;
    }

    try {
      setIsProcessing(true);
      const fileContent = await readFileAsText(file);
      const data = parseImportData(fileContent);
      
      if (!data) {
        setFeedbackMessage({ type: 'error', message: 'Invalid JSON file format' });
        return;
      }

      const result = await taskActions.importData(data);
      if (result.success) {
        setFeedbackMessage({ type: 'success', message: result.message || 'Data imported successfully!' });
      } else {
        setFeedbackMessage({ type: 'error', message: result.error || 'Import failed' });
      }
    } catch (error) {
      setFeedbackMessage({ type: 'error', message: 'Failed to read or import file' });
      console.error('File upload error:', error);
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Modal backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-200 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`} 
        onClick={onClose} 
      />
      
      {/* Modal content */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className={`bg-base-100 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-200 ease-out ${
            isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close settings"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            {/* Daily Reset */}
            <div className="flex justify-between items-center py-2 rounded-lg transition-colors">
              <span className="label-text">Daily Reset</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={settingsState.dailyResetEnabled}
                onChange={(e) => settingsActions.setDailyResetEnabled(e.target.checked)}
              />
            </div>

            {/* The Fun Zone */}
            <div className="flex justify-between items-center py-2 rounded-lg transition-colors">
              <span className="label-text">The Fun Zone</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={settingsState.animationsEnabled}
                onChange={(e) => settingsActions.setAnimationsEnabled(e.target.checked)}
              />
            </div>

            {/* Theme */}
            <div className="flex justify-between items-center py-2">
              <span className="label-text">Theme</span>
              <select 
                className="select select-primary select-sm w-32" 
                value={settingsState.selectedTheme}
                onChange={(e) => settingsActions.setSelectedTheme(e.target.value)}
              >
                {AVAILABLE_THEMES.map((theme) => (
                  <option key={theme.name} value={theme.name}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Tracker */}
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 rounded-lg transition-colors">
                <span className="label-text">Unit Tracker</span>
                <input 
                  type="checkbox" 
                  className="toggle toggle-primary" 
                  checked={settingsState.unitTracker.enabled}
                  onChange={(e) => settingsActions.setTrackerEnabled(e.target.checked)}
                />
              </div>

              {settingsState.unitTracker.enabled && (
                <div className="space-y-3 p-3 bg-base-200 rounded-lg">
                  {/* Start Value */}
                  <div className="flex justify-between items-center">
                    <span className="label-text text-sm">Start Value</span>
                    <input 
                      type="number" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="input input-primary input-xs w-16 px-2" 
                      value={settingsState.unitTracker.startValue}
                      onChange={(e) => settingsActions.setTrackerConfig({ startValue: parseInt(e.target.value) || 0 })}
                      min={settingsState.unitTracker.minValue}
                      max={settingsState.unitTracker.maxValue}
                    />
                  </div>

                  {/* Range */}
                  <div className="flex justify-between items-center">
                    <span className="label-text text-sm">Range</span>
                    <div className="flex gap-1 items-center">
                      <input 
                        type="number" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="input input-primary input-xs w-14 px-2" 
                        value={settingsState.unitTracker.minValue}
                        onChange={(e) => settingsActions.setTrackerConfig({ minValue: parseInt(e.target.value) || 0 })}
                        min={0}
                      />
                      <span className="text-xs">-</span>
                      <input 
                        type="number" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="input input-primary input-xs w-14 px-2" 
                        value={settingsState.unitTracker.maxValue}
                        onChange={(e) => settingsActions.setTrackerConfig({ maxValue: parseInt(e.target.value) || 100 })}
                        min={settingsState.unitTracker.minValue}
                      />
                    </div>
                  </div>

                  {/* Increment */}
                  <div className="flex justify-between items-center">
                    <span className="label-text text-sm">Increment</span>
                    <input 
                      type="number" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="input input-primary input-xs w-16 px-2" 
                      value={settingsState.unitTracker.increment}
                      onChange={(e) => settingsActions.setTrackerConfig({ increment: parseInt(e.target.value) || 1 })}
                      min={1}
                    />
                  </div>

                  {/* Unit */}
                  <div className="flex justify-between items-center">
                    <span className="label-text text-sm">Unit</span>
                    <div className="flex flex-col items-end gap-1">
                      <select 
                        className="select select-primary select-xs w-20 px-2" 
                        value={settingsState.unitTracker.unit}
                        onChange={(e) => settingsActions.setTrackerConfig({ unit: e.target.value })}
                      >
                        <option value="minutes">min</option>
                        <option value="hours">hrs</option>
                        <option value="dollars">$</option>
                        <option value="custom">custom</option>
                      </select>
                      {settingsState.unitTracker.unit === 'custom' && (
                        <input
                          type="text"
                          className="input input-primary input-xs w-20 px-2 mt-1"
                          value={settingsState.unitTracker.customUnit}
                          onChange={(e) => settingsActions.setTrackerConfig({ customUnit: e.target.value })}
                          placeholder="unit"
                          maxLength={10}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="flex justify-between items-center py-2 rounded-lg transition-colors">
              <span className="label-text">Notes</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={settingsState.notesEnabled}
                onChange={(e) => settingsActions.setNotesEnabled(e.target.checked)}
              />
            </div>

            {/* Data Management */}
            <div className="space-y-2 pt-4 border-t border-base-300">
              <h3 className="text-sm font-semibold text-base-content mb-2">Data Management</h3>
              
              {/* Export Data */}
              <div className="flex justify-between items-center py-2">
                <span className="label-text">Export Data</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportToClipboard}
                    disabled={isProcessing}
                    className="btn btn-square btn-sm btn-outline hover:bg-primary hover:text-primary-content"
                    title="Copy to clipboard"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleExportToFile}
                    disabled={isProcessing}
                    className="btn btn-square btn-sm btn-outline hover:bg-primary hover:text-primary-content"
                    title="Download as file"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Import Data */}
              <div className="flex justify-between items-center py-2">
                <span className="label-text">Import Data</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowImportArea(!showImportArea)}
                    disabled={isProcessing}
                    className="btn btn-square btn-sm btn-outline hover:bg-primary hover:text-primary-content"
                    title="Paste from clipboard"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="btn btn-square btn-sm btn-outline hover:bg-primary hover:text-primary-content"
                    title="Upload file"
                  >
                    <UploadIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Import text area */}
              {showImportArea && (
                <div className="space-y-2 p-3 bg-base-200 rounded-lg">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste JSON data here..."
                    className="textarea textarea-bordered textarea-sm w-full h-20 text-xs"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleImportFromText}
                      disabled={isProcessing || !importText.trim()}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Import
                    </button>
                    <button
                      onClick={() => {
                        setShowImportArea(false);
                        setImportText('');
                      }}
                      className="btn btn-ghost btn-sm flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      {feedbackMessage && (
        <div className="toast toast-center toast-bottom z-50">
          <div className={`alert alert-sm ${feedbackMessage.type === 'success' ? 'bg-primary text-primary-content' : 'alert-error'}`}>
            <span className="text-xs">{feedbackMessage.message}</span>
          </div>
        </div>
      )}
    </>
  );
};