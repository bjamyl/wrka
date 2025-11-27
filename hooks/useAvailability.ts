import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useHandymanProfile } from "./useHandymanProfile";
import { useProfile } from "./useProfile";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export interface AvailabilityState {
  isAvailable: boolean;
  lastActivityAt: number;
  isAppActive: boolean;
}

export const useAvailability = () => {
  const { updateAvailability, handymanProfile: profile } = useHandymanProfile();
  const { updateProfile } = useProfile();
  const appState = useRef(AppState.currentState);
  const inactivityTimer = useRef<NodeJS.Timeout>(null);
  const lastActivityRef = useRef(Date.now());

  // Update last activity timestamp
  const recordActivity = async () => {
    lastActivityRef.current = Date.now();

    // Clear existing timer
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Set new inactivity timer
    inactivityTimer.current = setTimeout(async () => {
      if (profile?.is_available) {
        console.log("Auto-disabling due to inactivity");
        await updateAvailability(false);
      }
    }, INACTIVITY_TIMEOUT);

    await updateProfile({
      last_activity_at: new Date().toISOString(),
    });
  };

  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    const isGoingInactive =
      appState.current.match(/inactive|background/) === null &&
      nextAppState.match(/inactive|background/) !== null;

    if (isGoingInactive && profile?.is_available) {
      console.log("App backgrounded - starting inactivity timer");
      // Start inactivity counter
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        updateAvailability(false);
      }, INACTIVITY_TIMEOUT);
    } else if (
      appState.current.match(/inactive|background/) !== null &&
      nextAppState === "active"
    ) {
      // App came to foreground
      console.log("App foregrounded");
      recordActivity();
    }

    appState.current = nextAppState;
  };

  // Setup app state listener
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [profile?.is_available]);

  return {
    updateAvailability,
    recordActivity,
    lastActivityAt: lastActivityRef.current,
  };
};
