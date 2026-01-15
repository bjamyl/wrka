import { Text } from "@/components/ui/text";
import { Image } from "expo-image";
import { ImageIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

interface Photo {
  url: string;
  cloudinary_public_id?: string;
}

interface PhotosGalleryProps {
  photos: Photo[];
  onPhotoPress: (index: number) => void;
}

export function PhotosGallery({ photos, onPhotoPress }: PhotosGalleryProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <View className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-100">
      <View className="flex-row items-center gap-2 mb-3">
        <ImageIcon size={18} color="#6B7280" />
        <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Photos ({photos.length})
        </Text>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={photo.cloudinary_public_id || index}
            onPress={() => onPhotoPress(index)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: photo.url }}
              style={{ width: 100, height: 100, borderRadius: 12 }}
              contentFit="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
