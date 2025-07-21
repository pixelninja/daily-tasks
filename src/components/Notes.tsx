import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const Notes: React.FC = () => {
  const { state: settingsState, actions: settingsActions } = useSettings();

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

  // Don't render if notes are disabled
  if (!settingsState.notesEnabled) {
    return null;
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-300">
      <div className="card-body p-4">
        {/* Notes Title */}
        <div>
          {isEditingNotesTitle && settingsState.editMode ? (
            <input
              ref={notesTitleInputRef}
              type="text"
              value={editNotesTitle}
              onChange={(e) => setEditNotesTitle(e.target.value)}
              onKeyDown={handleNotesTitleKeyPress}
              onBlur={handleNotesTitleBlur}
              className="text-lg font-semibold text-base-content bg-transparent border-2 border-primary rounded px-2 py-1 focus:outline-none focus:border-primary-focus w-full text-base"
              maxLength={50}
            />
          ) : (
            <h3 
              className={`text-lg font-semibold text-base-content ${settingsState.editMode ? 'cursor-pointer hover:text-primary' : ''} transition-colors duration-200 flex items-center gap-2`}
              onClick={settingsState.editMode ? handleNotesTitleClick : undefined}
              title={settingsState.editMode ? "Click to edit title" : undefined}
            >
              {settingsState.notesTitle}
              {settingsState.editMode && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </h3>
          )}
        </div>

        {/* Notes Content */}
        <div className="min-h-[50px] relative">
          {isEditingNotesContent && settingsState.editMode ? (
            <textarea
              ref={notesContentTextareaRef}
              value={editNotesContent}
              onChange={(e) => setEditNotesContent(e.target.value)}
              onKeyDown={handleNotesContentKeyPress}
              onBlur={handleNotesContentBlur}
              className="w-full h-32 p-3 text-base-content bg-transparent border-2 border-primary rounded resize-none focus:outline-none focus:border-primary-focus text-base"
              placeholder="Enter your notes here...&#10;&#10;Use - or * for bullet points&#10;Ctrl+Enter to save, Esc to cancel"
            />
          ) : (
            <div 
              className={`min-h-[50px] ${settingsState.editMode ? 'cursor-pointer' : ''} rounded transition-colors duration-200 text-base-content relative`}
              onClick={settingsState.editMode ? handleNotesContentClick : undefined}
              title={settingsState.editMode ? "Click to edit notes" : undefined}
            >
              {formatNotesContent(settingsState.notesContent)}
              {settingsState.editMode && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-base-content/50 absolute top-1 right-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};