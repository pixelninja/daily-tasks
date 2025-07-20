import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const TimeTracker: React.FC = () => {
  const { state: settingsState, actions: settingsActions } = useSettings();
  const { timeTracker } = settingsState;

  // Notes editing state
  const [isEditingNotesTitle, setIsEditingNotesTitle] = useState(false);
  const [isEditingNotesContent, setIsEditingNotesContent] = useState(false);
  const [editNotesTitle, setEditNotesTitle] = useState('');
  const [editNotesContent, setEditNotesContent] = useState('');
  const notesTitleInputRef = useRef<HTMLInputElement>(null);
  const notesContentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus inputs when editing starts
  useEffect(() => {
    if (isEditingNotesTitle && notesTitleInputRef.current) {
      notesTitleInputRef.current.focus();
      notesTitleInputRef.current.select();
    }
  }, [isEditingNotesTitle]);

  useEffect(() => {
    if (isEditingNotesContent && notesContentTextareaRef.current) {
      notesContentTextareaRef.current.focus();
    }
  }, [isEditingNotesContent]);

  // Notes title handlers
  const handleNotesTitleClick = () => {
    setEditNotesTitle(settingsState.notesTitle);
    setIsEditingNotesTitle(true);
  };

  const handleNotesTitleSave = () => {
    const trimmedTitle = editNotesTitle.trim();
    if (trimmedTitle && trimmedTitle !== settingsState.notesTitle) {
      settingsActions.setNotesTitle(trimmedTitle);
    }
    setIsEditingNotesTitle(false);
  };

  const handleNotesTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNotesTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingNotesTitle(false);
    }
  };

  const handleNotesTitleBlur = () => {
    handleNotesTitleSave();
  };

  // Notes content handlers
  const handleNotesContentClick = () => {
    setEditNotesContent(settingsState.notesContent);
    setIsEditingNotesContent(true);
  };

  const handleNotesContentSave = () => {
    if (editNotesContent !== settingsState.notesContent) {
      settingsActions.setNotesContent(editNotesContent);
    }
    setIsEditingNotesContent(false);
  };

  const handleNotesContentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditingNotesContent(false);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleNotesContentSave();
    }
  };

  const handleNotesContentBlur = () => {
    handleNotesContentSave();
  };

  // Format notes content for display
  const formatNotesContent = (content: string): React.ReactElement => {
    if (!content.trim()) {
      return <span className="text-base-content/40">Click to add notes...</span>;
    }

    const lines = content.split('\n');
    const formattedLines = lines.map((line, index) => {
      // Handle list items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listContent = line.trim().substring(2);
        return (
          <div key={index} className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>{listContent}</span>
          </div>
        );
      }
      
      // Handle empty lines for paragraph spacing
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Regular text
      return <div key={index}>{line}</div>;
    });

    return <>{formattedLines}</>;
  };

  // Format time display based on unit
  const formatValue = useCallback((value: number): string => {
    if (timeTracker.unit === 'minutes') {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${minutes}m`;
    }
    return `${value} ${timeTracker.unit}`;
  }, [timeTracker.unit]);

  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    settingsActions.setTrackerValue(newValue);
  }, [settingsActions]);


  // Show components based on settings
  const showTimeTracker = timeTracker.enabled;
  const showNotes = settingsState.notesEnabled;

  // Calculate progress percentage for visual indicator
  const progressPercentage = ((timeTracker.currentValue - timeTracker.minValue) / (timeTracker.maxValue - timeTracker.minValue)) * 100;

  // Determine color based on progress (can be customized)
  const getProgressColor = () => {
    if (progressPercentage <= 50) return 'text-success';
    if (progressPercentage <= 75) return 'text-warning';
    return 'text-error';
  };

  // Don't render anything if both are disabled
  if (!showTimeTracker && !showNotes) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Time Tracker - only show when enabled */}
      {showTimeTracker && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-4">
            {/* Header with label and current value */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-base-content">{timeTracker.label}</h3>
              <div className={`text-xl font-bold ${getProgressColor()}`}>
                {formatValue(timeTracker.currentValue)}
              </div>
            </div>

            {/* Range slider */}
            <div className="mb-3">
              <input
                type="range"
                min={timeTracker.minValue}
                max={timeTracker.maxValue}
                step={timeTracker.increment}
                value={timeTracker.currentValue}
                onChange={handleSliderChange}
                className="range range-primary w-full"
              />
              {/* Range markers */}
              <div className="flex justify-between text-xs text-base-content/60 mt-1">
                <span>{formatValue(timeTracker.minValue)}</span>
                <span>{formatValue(timeTracker.maxValue)}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Notes Section - only show when enabled */}
      {showNotes && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-4">
            {/* Notes Title */}
            <div>
              {isEditingNotesTitle ? (
                <input
                  ref={notesTitleInputRef}
                  type="text"
                  value={editNotesTitle}
                  onChange={(e) => setEditNotesTitle(e.target.value)}
                  onKeyDown={handleNotesTitleKeyPress}
                  onBlur={handleNotesTitleBlur}
                  className="text-lg font-semibold text-base-content bg-transparent border-2 border-primary rounded px-2 py-1 focus:outline-none focus:border-primary-focus w-full"
                  maxLength={50}
                />
              ) : (
                <h3 
                  className="text-lg font-semibold text-base-content cursor-pointer hover:text-primary transition-colors duration-200"
                  onClick={handleNotesTitleClick}
                  title="Click to edit title"
                >
                  {settingsState.notesTitle}
                </h3>
              )}
            </div>

            {/* Notes Content */}
            <div className="min-h-[50px]">
              {isEditingNotesContent ? (
                <textarea
                  ref={notesContentTextareaRef}
                  value={editNotesContent}
                  onChange={(e) => setEditNotesContent(e.target.value)}
                  onKeyDown={handleNotesContentKeyPress}
                  onBlur={handleNotesContentBlur}
                  className="w-full h-32 p-3 text-base-content bg-transparent border-2 border-primary rounded resize-none focus:outline-none focus:border-primary-focus"
                  placeholder="Enter your notes here...&#10;&#10;Use - or * for bullet points&#10;Ctrl+Enter to save, Esc to cancel"
                />
              ) : (
                <div 
                  className="min-h-[50px] cursor-pointer rounded transition-colors duration-200 text-base-content"
                  onClick={handleNotesContentClick}
                  title="Click to edit notes"
                >
                  {formatNotesContent(settingsState.notesContent)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};