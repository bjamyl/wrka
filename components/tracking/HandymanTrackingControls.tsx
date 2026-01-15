import { updateBookingStatus } from "@/hooks/tracking/updateBookingStatus";
import { useLocationBroadcast } from "@/hooks/tracking/useLocationBroadcast";
import { ServiceRequestStatus } from "@/types/service";
import { Navigation, MapPin, AlertCircle } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform } from "react-native";

type Props = {
  bookingId: string;
  status: ServiceRequestStatus;
  destinationLat: number;
  destinationLng: number;
  destinationAddress: string;
  onStatusChange?: (newStatus: ServiceRequestStatus) => void;
};

/**
 * Navigation controls for handyman during job travel
 * Handles status transitions: accepted → on_the_way → arrived
 */
export function HandymanTrackingControls({
  bookingId,
  status,
  destinationLat,
  destinationLng,
  destinationAddress,
  onStatusChange,
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isOnTheWay = status === "on_the_way";

  // Location broadcast is active only when on_the_way
  const { status: broadcastStatus, error: broadcastError } = useLocationBroadcast(
    bookingId,
    isOnTheWay
  );

  const openMapsNavigation = () => {
    const scheme = Platform.select({
      ios: "maps:",
      android: "geo:",
    });
    const url = Platform.select({
      ios: `maps:?daddr=${destinationLat},${destinationLng}`,
      android: `geo:${destinationLat},${destinationLng}?q=${destinationLat},${destinationLng}(${encodeURIComponent(destinationAddress)})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web URL
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}`
        );
      });
    }
  };

  const handleStartNavigation = async () => {
    Alert.alert(
      "Start Navigation",
      "This will share your live location with the customer until you arrive. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: async () => {
            setIsUpdating(true);
            const result = await updateBookingStatus(bookingId, "on_the_way");
            setIsUpdating(false);

            if (result.success) {
              onStatusChange?.("on_the_way");
              openMapsNavigation();
            } else {
              Alert.alert("Error", result.error || "Failed to update status");
            }
          },
        },
      ]
    );
  };

  const handleMarkArrived = async () => {
    Alert.alert(
      "Confirm Arrival",
      "Mark yourself as arrived at the job location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "I've Arrived",
          onPress: async () => {
            setIsUpdating(true);
            const result = await updateBookingStatus(bookingId, "arrived");
            setIsUpdating(false);

            if (result.success) {
              onStatusChange?.("arrived");
            } else {
              Alert.alert("Error", result.error || "Failed to update status");
            }
          },
        },
      ]
    );
  };

  // Show nothing if status is not relevant
  if (status !== "accepted" && status !== "on_the_way" && status !== "arrived") {
    return null;
  }

  return (
    <View className="mb-6">
      {/* Status Indicator for on_the_way */}
      {isOnTheWay && (
        <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200">
          <View className="flex-row items-center gap-2 mb-2">
            <Navigation size={18} color="#3B82F6" />
            <Text className="text-blue-700 text-sm font-dmsans-bold">
              NAVIGATING TO JOB
            </Text>
          </View>
          <Text className="text-blue-900 text-sm font-dmsans">
            Your live location is being shared with the customer
          </Text>

          {/* Broadcast Status */}
          {broadcastStatus === "broadcasting" && (
            <View className="flex-row items-center gap-2 mt-2">
              <View className="w-2 h-2 rounded-full bg-green-500" />
              <Text className="text-green-700 text-xs font-dmsans">
                Location sharing active
              </Text>
            </View>
          )}

          {broadcastError && (
            <View className="flex-row items-center gap-2 mt-2">
              <AlertCircle size={14} color="#DC2626" />
              <Text className="text-red-600 text-xs font-dmsans">
                {broadcastError}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Arrived Status */}
      {status === "arrived" && (
        <View className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-200">
          <View className="flex-row items-center gap-2 mb-2">
            <MapPin size={18} color="#10B981" />
            <Text className="text-green-700 text-sm font-dmsans-bold">
              YOU'VE ARRIVED
            </Text>
          </View>
          <Text className="text-green-900 text-sm font-dmsans">
            You can now start the job when ready
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        {status === "accepted" && (
          <TouchableOpacity
            onPress={handleStartNavigation}
            disabled={isUpdating}
            className={`flex-1 ${isUpdating ? "bg-blue-400" : "bg-blue-500"} py-4 rounded-full flex-row items-center justify-center gap-2`}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Navigation size={20} color="#fff" />
                <Text className="text-white font-dmsans-bold text-base">
                  Start Navigation
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {status === "on_the_way" && (
          <>
            <TouchableOpacity
              onPress={openMapsNavigation}
              className="flex-1 bg-gray-100 py-4 rounded-full flex-row items-center justify-center gap-2"
            >
              <Navigation size={20} color="#000" />
              <Text className="text-black font-dmsans-bold text-base">
                Open Maps
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMarkArrived}
              disabled={isUpdating}
              className={`flex-1 ${isUpdating ? "bg-green-400" : "bg-green-500"} py-4 rounded-full flex-row items-center justify-center gap-2`}
            >
              {isUpdating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MapPin size={20} color="#fff" />
                  <Text className="text-white font-dmsans-bold text-base">
                    I've Arrived
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
