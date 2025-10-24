import React, { createContext, useState, useCallback } from "react";

// Base notification types
export type NotificationType = "success" | "error" | "info" | "warning";

// Different notification categories
export type NotificationCategory =
  | "toast" // Simple toast message
  | "service_request" // New service request (actionable)
  | "message" // New chat message
  | "system" // System alerts
  | "payment"; // Payment notifications

// Action button configuration
export type NotificationAction = {
  label: string;
  action: () => void | Promise<void>;
  style?: "primary" | "secondary" | "danger";
};

export type Notification = {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  duration?: number; // in ms, Infinity means manual dismiss only
  actions?: NotificationAction[]; // Optional action buttons
  data?: any; // Additional data payload (e.g., full ServiceRequest object)
  sound?: boolean; // Play notification sound
  vibrate?: boolean; // Vibrate device
};

type NotificationInput = Omit<Notification, "id">;

export const NotificationContext = createContext<{
  notifications: Notification[];
  addNotification: (notif: NotificationInput) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}>({
  notifications: [],
  addNotification: () => "",
  removeNotification: () => {},
  clearAll: () => {},
});

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  console.log("notifications", notifications);

  const addNotification = useCallback((notif: NotificationInput): string => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = { ...notif, id };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration (only for non-actionable notifications)
    if (notif.duration !== Infinity && !notif.actions?.length) {
      setTimeout(() => {
        removeNotification(id);
      }, notif.duration || 4000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
