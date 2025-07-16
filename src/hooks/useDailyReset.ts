import { useEffect, useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { formatTimeUntilMidnight } from '../utils/dateUtils';

export const useDailyReset = () => {
  const { actions } = useTaskContext();
  const [timeUntilReset, setTimeUntilReset] = useState(formatTimeUntilMidnight());

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilReset(formatTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for reset events (the actual reset is handled in TaskContext)
  // This hook only manages the notification display

  const manualReset = async () => {
    await actions.resetDailyTasks();
  };

  return {
    timeUntilReset,
    manualReset,
  };
};