import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { PencilIcon, SettingsIcon } from './icons';

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
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
          
          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="btn btn-ghost btn-circle"
            title="Settings"
          >
            <SettingsIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MemoizedHeader = React.memo(Header);
export { MemoizedHeader as Header };