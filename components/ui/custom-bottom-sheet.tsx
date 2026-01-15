import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import React, { forwardRef, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";

interface CustomBottomSheetProps extends BottomSheetModalProps {
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
  onClose?: () => void;
}

export type CustomBottomSheetRef = BottomSheetModal;

const CustomBottomSheet = forwardRef<
  CustomBottomSheetRef,
  CustomBottomSheetProps
>(({ title, children, snapPoints = ["50%"], onClose, ...props }, ref) => {
  // Variables
  const finalSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  // Callbacks
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleClose = useCallback(() => {
    // @ts-ignore
    ref?.current?.dismiss();
    if (onClose) onClose();
  }, [ref, onClose]);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={finalSnapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      {...props}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* Header (Optional) */}
        {(title || onClose) && (
          <View className="flex-row justify-between items-center px-6 pb-4 border-b border-gray-100 mb-4">
            <Text className="text-xl font-onest-bold text-black flex-1">
              {title}
            </Text>
            {onClose && (
              <Pressable onPress={handleClose} hitSlop={10}>
                <View className="bg-gray-100 p-2 rounded-full">
                  <X size={20} color="#000" />
                </View>
              </Pressable>
            )}
          </View>
        )}

        {/* Content */}
        <View className="px-6 flex-1 pb-10">{children}</View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  indicator: {
    backgroundColor: "#E5E7EB",
    width: 40,
  },
  background: {
    backgroundColor: "white",
    borderRadius: 24,
  },
});

CustomBottomSheet.displayName = "CustomBottomSheet";
export default CustomBottomSheet;
