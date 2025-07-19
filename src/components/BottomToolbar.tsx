import React, { useState } from 'react';
import { useDailyReset } from '../hooks/useDailyReset';

interface BottomToolbarProps {
  onAddCategory: () => void;
  totalTasks: number;
  completedTasks: number;
  dailyResetEnabled: boolean;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({ onAddCategory, totalTasks, completedTasks, dailyResetEnabled }) => {
  const { timeUntilReset, manualReset } = useDailyReset();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-50 pwa-bottom-bar">
      {/* Progress Bar - Always visible */}
      <div 
        className="w-full bg-base-300 h-1 cursor-pointer hover:h-2 transition-all duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      
      {/* Expandable Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-3 border-b border-base-300">
          <div className="flex justify-between items-center text-sm max-w-md mx-auto">
            <span className="text-base-content/70">Overall Progress</span>
            <span className="font-medium">{completedTasks}/{totalTasks} tasks</span>
          </div>
          <div className="text-center text-sm text-base-content/60 mt-1">
            {overallProgress.toFixed(1)}% Complete
          </div>
        </div>
      </div>
      
      {/* Main Toolbar */}
      <div className="px-4 pt-4 pb-safe">
        <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
          {/* Reset Section */}
          {dailyResetEnabled ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                className="btn btn-ghost btn-sm btn-circle flex-shrink-0"
                onClick={manualReset}
                title="Reset all tasks now"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="text-sm text-base-content/70 truncate">
                {timeUntilReset}
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Add Category Button */}
          <button
            className="btn btn-primary btn-sm gap-2 flex-shrink-0"
            onClick={onAddCategory}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};