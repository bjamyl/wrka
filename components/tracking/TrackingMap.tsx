import { useHandymanLocation } from "@/hooks/tracking";
import { calculateETA, formatETA } from "@/lib/utils";
import { HandymanLocationBroadcast } from "@/types/service";
import { Navigation, MapPin } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type Props = {
  bookingId: string;
  destinationLat: number;
  destinationLng: number;
  destinationAddress: string;
  isTracking: boolean;
};

/**
 * Real-time tracking map component for customers
 * Shows handyman's live location and ETA while they're on the way
 */
export function TrackingMap({
  bookingId,
  destinationLat,
  destinationLng,
  destinationAddress,
  isTracking,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const { location, isConnected } = useHandymanLocation(bookingId, isTracking);
  const [eta, setEta] = useState<number | null>(null);

  // Calculate ETA when location updates
  useEffect(() => {
    if (location) {
      const minutes = calculateETA(
        location.lat,
        location.lng,
        destinationLat,
        destinationLng
      );
      setEta(minutes);
    }
  }, [location, destinationLat, destinationLng]);

  // Fit map to show both markers when location updates
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: location.lat, longitude: location.lng },
          { latitude: destinationLat, longitude: destinationLng },
        ],
        {
          edgePadding: { top: 80, right: 50, bottom: 80, left: 50 },
          animated: true,
        }
      );
    }
  }, [location, destinationLat, destinationLng]);

  return (
    <View className="mb-6">
      {/* Header with ETA */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-gray-500 text-xs font-dmsans-bold">
          LIVE TRACKING
        </Text>
        {eta !== null && (
          <View className="bg-black px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-dmsans-bold">
              ETA: {formatETA(eta)}
            </Text>
          </View>
        )}
      </View>

      {/* Connection Status */}
      {isTracking && !isConnected && (
        <View className="bg-yellow-50 p-3 rounded-xl mb-3 flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#CA8A04" />
          <Text className="text-yellow-700 text-sm font-dmsans">
            Connecting to live tracking...
          </Text>
        </View>
      )}

      {/* Map */}
      <View
        className="rounded-2xl overflow-hidden border border-gray-200"
        style={{ height: 250 }}
      >
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{
            latitude: destinationLat,
            longitude: destinationLng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {/* Destination Marker */}
          <Marker
            coordinate={{
              latitude: destinationLat,
              longitude: destinationLng,
            }}
            title="Job Location"
            description={destinationAddress}
          >
            <View className="bg-black p-2 rounded-full">
              <MapPin size={20} color="#fff" />
            </View>
          </Marker>

          {/* Handyman Location Marker */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.lat,
                longitude: location.lng,
              }}
              title="Handyman"
              description="On the way to you"
              rotation={location.heading || 0}
            >
              <View className="bg-blue-500 p-2 rounded-full border-2 border-white shadow-lg">
                <Navigation size={18} color="#fff" />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Waiting for location */}
      {isTracking && isConnected && !location && (
        <View className="mt-3 bg-gray-50 p-3 rounded-xl flex-row items-center gap-2">
          <ActivityIndicator size="small" color="#6B7280" />
          <Text className="text-gray-600 text-sm font-dmsans">
            Waiting for handyman's location...
          </Text>
        </View>
      )}
    </View>
  );
}
