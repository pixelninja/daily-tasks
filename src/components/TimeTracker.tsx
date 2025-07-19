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

  // Handle increment/decrement buttons
  const adjustValue = useCallback((delta: number) => {
    const newValue = Math.max(
      timeTracker.minValue,
      Math.min(timeTracker.maxValue, timeTracker.currentValue + delta)
    );
    settingsActions.setTrackerValue(newValue);
  }, [timeTracker.currentValue, timeTracker.minValue, timeTracker.maxValue, settingsActions]);

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
    <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
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

        {/* Quick action buttons */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => adjustValue(-timeTracker.increment)}
              disabled={timeTracker.currentValue <= timeTracker.minValue}
              title={`Decrease by ${timeTracker.increment} ${timeTracker.unit}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => adjustValue(timeTracker.increment)}
              disabled={timeTracker.currentValue >= timeTracker.maxValue}
              title={`Increase by ${timeTracker.increment} ${timeTracker.unit}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Quick increment buttons */}
          <div className="flex gap-2">
            {timeTracker.unit === 'minutes' && (
              <>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => adjustValue(15)}
                  disabled={timeTracker.currentValue + 15 > timeTracker.maxValue}
                  title="Add 15 minutes"
                >
                  +15m
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => adjustValue(60)}
                  disabled={timeTracker.currentValue + 60 > timeTracker.maxValue}
                  title="Add 1 hour"
                >
                  +1h
                </button>
              </>
            )}
            <button
              className="btn btn-primary btn-xs"
              onClick={() => settingsActions.resetTrackerValue()}
              title="Reset to start value"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};