import { Text } from "@/components/ui/text";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}

export function LocationMap({ latitude, longitude, title, address }: LocationMapProps) {
  return (
    <View className="mb-6">
      <Text className="text-gray-500 text-xs font-dmsans-bold mb-3">LOCATION MAP</Text>
      <View
        className="rounded-2xl overflow-hidden border border-gray-200"
        style={{ height: 200 }}
      >
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={title}
            description={address}
          />
        </MapView>
      </View>
    </View>
  );
}
