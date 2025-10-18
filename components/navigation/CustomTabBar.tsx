import { Text } from "@/components/ui/text";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Briefcase, DollarSign, Home, MessageSquare, User } from "lucide-react-native";
import { useEffect } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICON_SIZE = 20;
const ICON_SIZE_FOCUSED = 24;
const TAB_BAR_HEIGHT = 70;

const iconMap = {
  index: Home,
  jobs: Briefcase,
  messages: MessageSquare,
  earnings: DollarSign,
  profile: User,
};

const springConfig = {
  damping: 20,
  stiffness: 180,
  mass: 0.8,
};

interface TabBarButtonProps {
  route: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
}

function TabBarButton({
  route,
  isFocused,
  onPress,
  onLongPress,
  label,
}: TabBarButtonProps) {
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(isFocused ? 1.2 : 1);
  const iconTranslateY = useSharedValue(isFocused ? -2 : 0);

  useEffect(() => {
    iconScale.value = withSpring(isFocused ? 1.2 : 1, springConfig);
    iconTranslateY.value = withSpring(isFocused ? -2 : 0, springConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);


  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value * scale.value },
      { translateY: iconTranslateY.value },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (!isFocused) {
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.selectionAsync();
      }
    }
    onPress();
  };

  const IconComponent = iconMap[route.name as keyof typeof iconMap] || Home;
  const iconColor = isFocused ? "#000000" : "#6B7280";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="flex-1 items-center justify-center"
      style={{ height: TAB_BAR_HEIGHT, zIndex: isFocused ? 10 : 1 }}
    >
      <View className="items-center justify-center">
        <Animated.View style={animatedIconStyle} className="items-center">
          <IconComponent
            size={isFocused ? ICON_SIZE_FOCUSED : ICON_SIZE}
            color={iconColor}
            fill={isFocused ? iconColor : "none"}
            strokeWidth={isFocused ? 0 : 2}
          />
        </Animated.View>

        <View className="mt-1">
          <Text
            className="text-[10px] font-bold"
            style={{ color: isFocused ? '#000000' : '#6B7280' }}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0"
      style={{
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <View className="mx-6 mb-3 relative">
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={100}
            tint="extraLight"
            style={{
              height: TAB_BAR_HEIGHT,
              borderRadius: 32,
              overflow: 'hidden',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
            }}
          >
          <View className="flex-row h-full">
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <TabBarButton
                  key={route.key}
                  route={route}
                  isFocused={isFocused}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  label={label as string}
                />
              );
            })}
          </View>
        </BlurView>
        ) : (
          <View
            style={{
              height: TAB_BAR_HEIGHT,
              borderRadius: 32,
              overflow: 'hidden',
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View className="flex-row h-full">
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                  options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                    ? options.title
                    : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                  }
                };

                const onLongPress = () => {
                  navigation.emit({
                    type: "tabLongPress",
                    target: route.key,
                  });
                };

                return (
                  <TabBarButton
                    key={route.key}
                    route={route}
                    isFocused={isFocused}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    label={label as string}
                  />
                );
              })}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
