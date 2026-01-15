import * as LucideIcons from "lucide-react-native";
import { Wrench } from "lucide-react-native";
 
 export const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Format full date and time
  export const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    // Format: "Mon, Jan 15, 2025 at 2:30 PM"
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleString("en-US", options);
  };


export const getIconComponent = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Wrench; // Fallback to Wrench if icon not found
};

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate estimated time of arrival
 * @param handymanLat - Handyman's current latitude
 * @param handymanLng - Handyman's current longitude
 * @param destinationLat - Job location latitude
 * @param destinationLng - Job location longitude
 * @param averageSpeedKmh - Average travel speed (default: 30 km/h for urban driving)
 * @returns ETA in minutes
 */
export function calculateETA(
  handymanLat: number,
  handymanLng: number,
  destinationLat: number,
  destinationLng: number,
  averageSpeedKmh: number = 30
): number {
  const distance = calculateDistance(
    handymanLat,
    handymanLng,
    destinationLat,
    destinationLng
  );
  // ETA in minutes
  return Math.round((distance / averageSpeedKmh) * 60);
}

/**
 * Format ETA minutes into human-readable string
 * @param minutes - ETA in minutes
 * @returns Formatted string like "5 min", "1 hr 30 min", etc.
 */
export function formatETA(minutes: number): string {
  if (minutes < 1) return "Arriving";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (remainingMins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMins} min`;
}
