import React, { useState } from 'react';
import { useDailyReset } from '../hooks/useDailyReset';
import { useSettings } from '../contexts/SettingsContext';

interface BottomToolbarProps {
  totalTasks: number;
  completedTasks: number;
  dailyResetEnabled: boolean;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({ totalTasks, completedTasks, dailyResetEnabled }) => {
  const { timeUntilReset, manualReset } = useDailyReset();
  const { state: settingsState } = useSettings();
  
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-50 pwa-bottom-bar">
      {/* Progress Bar - Always visible at top */}
      <div className="w-full bg-base-300 h-1">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      
      {/* Main Content - Always expanded */}
      <div className="px-4 py-3 pb-safe">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          {/* Progress Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base-content/70">Progress:</span>
              <span className="font-medium">{completedTasks}/{totalTasks}</span>
              <span className="text-xs text-base-content/60">({overallProgress.toFixed(1)}%)</span>
            </div>
          </div>
          
          {/* Reset Section */}
          {dailyResetEnabled && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-base-content/60 text-right">
                {timeUntilReset}
              </div>
              <button
                className={`btn btn-sm btn-circle flex-shrink-0 ${settingsState.editMode ? 'btn-ghost' : 'btn-ghost cursor-default hover:bg-transparent hover:border-transparent'}`}
                onClick={settingsState.editMode ? manualReset : undefined}
                title={settingsState.editMode ? "Reset all tasks now" : "Reset disabled in view mode"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};