import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Photo = {
  url: string;
  cloudinary_public_id?: string;
};

type PhotoViewerModalProps = {
  photos: Photo[];
  selectedIndex: number | null;
  onClose: () => void;
};

export default function PhotoViewerModal({
  photos,
  selectedIndex,
  onClose,
}: PhotoViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex ?? 0);
  const photoListRef = useRef<FlatList>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  if (!photos || photos.length === 0) return null;

  return (
    <Modal
      visible={selectedIndex !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black">
        {/* Close Button */}
        <SafeAreaView
          edges={["top"]}
          className="absolute top-0 left-0 right-0 z-10"
        >
          <TouchableOpacity
            onPress={onClose}
            className="self-end m-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
          >
            <X size={24} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Swipeable Photo Gallery */}
        {selectedIndex !== null && (
          <FlatList
            ref={photoListRef}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedIndex}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / screenWidth
              );
              setCurrentIndex(index);
            }}
            keyExtractor={(item, index) =>
              item.cloudinary_public_id || index.toString()
            }
            renderItem={({ item }) => (
              <View
                style={{
                  width: screenWidth,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: item.url }}
                  style={{
                    width: screenWidth,
                    height: screenHeight * 0.8,
                  }}
                  contentFit="contain"
                />
              </View>
            )}
          />
        )}

        {/* Photo Counter */}
        {photos.length > 1 && (
          <SafeAreaView
            edges={["bottom"]}
            className="absolute bottom-0 left-0 right-0"
          >
            <Text className="text-white text-center mb-4 text-base">
              {currentIndex + 1} / {photos.length}
            </Text>
          </SafeAreaView>
        )}
      </View>
    </Modal>
  );
}
