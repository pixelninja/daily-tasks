import React, { useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const TimeTracker: React.FC = () => {
  const { state: settingsState, actions: settingsActions } = useSettings();
  const { timeTracker } = settingsState;


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


  // Only show time tracker when enabled
  if (!timeTracker.enabled) {
    return null;
  }

  // Calculate progress percentage for visual indicator
  const progressPercentage = ((timeTracker.currentValue - timeTracker.minValue) / (timeTracker.maxValue - timeTracker.minValue)) * 100;

  // Determine color based on progress (can be customized)
  const getProgressColor = () => {
    if (progressPercentage <= 50) return 'text-success';
    if (progressPercentage <= 75) return 'text-warning';
    return 'text-error';
  };

  return (
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
  );
};