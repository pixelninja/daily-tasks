import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { PencilIcon } from './icons';

export const UnitTracker: React.FC = () => {
  const { state: settingsState, actions: settingsActions } = useSettings();
  const { unitTracker } = settingsState;
  
  // Label editing state
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const labelInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  // Label editing handlers
  const handleLabelClick = () => {
    setEditLabel(unitTracker.label);
    setIsEditingLabel(true);
  };

  const handleLabelSave = () => {
    const trimmedLabel = editLabel.trim();
    if (trimmedLabel && trimmedLabel !== unitTracker.label) {
      settingsActions.setTrackerConfig({ label: trimmedLabel });
    }
    setIsEditingLabel(false);
  };

  const handleLabelKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      setIsEditingLabel(false);
    }
  };

  // Format time display based on unit
  const formatValue = useCallback((value: number): string => {
    if (unitTracker.unit === 'minutes') {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
      return `${minutes}m`;
    }
    // Use custom unit if available, otherwise fall back to predefined unit
    const displayUnit = unitTracker.unit === 'custom' ? unitTracker.customUnit : unitTracker.unit;
    return `${value} ${displayUnit}`;
  }, [unitTracker.unit, unitTracker.customUnit]);

  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    settingsActions.setTrackerValue(newValue);
  }, [settingsActions]);


  // Only show unit tracker when enabled
  if (!unitTracker.enabled) {
    return null;
  }

  // Calculate progress percentage for visual indicator
  const progressPercentage = ((unitTracker.currentValue - unitTracker.minValue) / (unitTracker.maxValue - unitTracker.minValue)) * 100;

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
          {isEditingLabel ? (
            <input
              ref={labelInputRef}
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleLabelKeyPress}
              className="input input-ghost text-lg font-semibold p-0 h-auto min-h-0 border-none focus:outline-none focus:border-none bg-transparent"
              maxLength={20}
            />
          ) : (
            <h3 
              className={`text-lg font-semibold text-base-content ${settingsState.editMode ? 'cursor-pointer hover:text-primary' : ''} transition-colors duration-200 flex items-center gap-2`}
              onClick={settingsState.editMode ? handleLabelClick : undefined}
              title={settingsState.editMode ? "Click to edit label" : undefined}
            >
              {unitTracker.label}
              {settingsState.editMode && (
                <PencilIcon className="h-3 w-3 text-base-content/50" />
              )}
            </h3>
          )}
          <div className={`text-xl font-bold ${getProgressColor()}`}>
            {formatValue(unitTracker.currentValue)}
          </div>
        </div>

        {/* Range slider */}
        <div className="mb-3">
          <input
            type="range"
            min={unitTracker.minValue}
            max={unitTracker.maxValue}
            step={unitTracker.increment}
            value={unitTracker.currentValue}
            onChange={handleSliderChange}
            className="range range-primary w-full"
          />
          {/* Range markers */}
          <div className="flex justify-between text-xs text-base-content/60 mt-1">
            <span>{formatValue(unitTracker.minValue)}</span>
            <span>{formatValue(unitTracker.maxValue)}</span>
          </div>
        </div>

      </div>
    </div>
  );
};