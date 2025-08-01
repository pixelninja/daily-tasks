import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { PencilIcon, SettingsIcon } from './icons';
import { AVAILABLE_THEMES } from '../constants/themes';

const Header: React.FC = () => {
  const { state: settingsState, actions: settingsActions } = useSettings();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleClick = useCallback(() => {
    setEditTitle(settingsState.appTitle);
    setIsEditingTitle(true);
  }, [settingsState.appTitle]);

  const handleTitleSave = useCallback(() => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== settingsState.appTitle) {
      settingsActions.setAppTitle(trimmedTitle);
    }
    setIsEditingTitle(false);
  }, [editTitle, settingsState.appTitle, settingsActions]);

  const handleTitleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  }, [handleTitleSave]);

  const handleTitleBlur = useCallback(() => {
    handleTitleSave();
  }, [handleTitleSave]);

  return (
    <div className="sticky top-0 z-40 bg-base-100 border-b border-base-300 pt-safe pb-4 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center gap-4">
          {isEditingTitle && settingsState.editMode ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleTitleKeyPress}
              onBlur={handleTitleBlur}
              className="text-2xl font-bold text-base-content bg-transparent border-2 border-primary rounded px-2 py-1 focus:outline-none focus:border-primary-focus flex-1"
              maxLength={50}
            />
          ) : (
            <h1 
              className={`text-2xl font-bold text-base-content ${settingsState.editMode ? 'cursor-pointer hover:text-primary' : ''} transition-colors duration-200 flex items-center gap-2 flex-1`}
              onClick={settingsState.editMode ? handleTitleClick : undefined}
              title={settingsState.editMode ? "Click to edit title" : undefined}
            >
              {settingsState.appTitle}
              {settingsState.editMode && (
                <PencilIcon className="h-4 w-4 text-base-content/50" />
              )}
            </h1>
          )}
          
          {/* Edit Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/70">Edit</span>
            <input 
              type="checkbox" 
              className="toggle toggle-primary toggle-sm" 
              checked={settingsState.editMode}
              onChange={(e) => settingsActions.setEditMode(e.target.checked)}
              title="Toggle edit mode"
            />
          </div>
          
          {/* Settings Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" title="Settings">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-50 w-64 p-2 shadow">
              <li className="menu-title !p-2">Settings</li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
                  <span className="label-text">Daily Reset</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.dailyResetEnabled}
                    onChange={(e) => settingsActions.setDailyResetEnabled(e.target.checked)}
                  />
                </label>
              </li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
                  <span className="label-text">The Fun Zone</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.animationsEnabled}
                    onChange={(e) => settingsActions.setAnimationsEnabled(e.target.checked)}
                  />
                </label>
              </li>
              <li>
                <div className="flex justify-between items-center w-full p-2">
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
              </li>
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
                  <span className="label-text">Unit Tracker</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.unitTracker.enabled}
                    onChange={(e) => settingsActions.setTrackerEnabled(e.target.checked)}
                  />
                </label>
              </li>
              {settingsState.unitTracker.enabled && (
                <>
                  <li>
                    <div className="flex justify-between items-center w-full px-1 py-2">
                      <span className="label-text">Start Value</span>
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
                  </li>
                  <li>
                    <div className="flex justify-between items-center w-full px-1 py-2">
                      <span className="label-text">Range</span>
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
                  </li>
                  <li>
                    <div className="flex justify-between items-center w-full px-1 py-2">
                      <span className="label-text">Increment</span>
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
                  </li>
                  <li>
                    <div className="flex justify-between items-center w-full px-1 py-2">
                      <span className="label-text">Unit</span>
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
                            className="input input-primary input-xs w-20 px-2 mt-2"
                            value={settingsState.unitTracker.customUnit}
                            onChange={(e) => settingsActions.setTrackerConfig({ customUnit: e.target.value })}
                            placeholder="unit"
                            maxLength={10}
                          />
                        )}
                      </div>
                    </div>
                  </li>
                </>
              )}
              <li>
                <label className="flex justify-between items-center w-full p-2 cursor-pointer hover-touch-safe rounded-lg">
                  <span className="label-text">Notes</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settingsState.notesEnabled}
                    onChange={(e) => settingsActions.setNotesEnabled(e.target.checked)}
                  />
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MemoizedHeader = React.memo(Header);
export { MemoizedHeader as Header };