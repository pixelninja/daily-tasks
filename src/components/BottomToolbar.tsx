import React from 'react';
import { useDailyReset } from '../hooks/useDailyReset';

interface BottomToolbarProps {
  onAddCategory: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({ onAddCategory }) => {
  const { timeUntilReset, manualReset } = useDailyReset();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 p-4 z-50">
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        {/* Reset Section */}
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
  );
};