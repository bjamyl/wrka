import { useEffect } from "react";
import { useAvailability } from "./useAvailability";

export const useActivityTracking = () => {
  const { recordActivity } = useAvailability();
  let activityTimeout: NodeJS.Timeout;

  // Debounced activity recording (max once per minute)
  const handleUserActivity = () => {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      recordActivity();
    }, 1000);
  };

  useEffect(() => {
    return () => {
      clearTimeout(activityTimeout);
    };
  }, []);

  return { handleUserActivity };
};
