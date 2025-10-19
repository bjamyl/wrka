import { NotificationContext, Notification } from "@/contexts/NotificationsContext";
import React, { useContext, useEffect, useRef } from "react";
import { View, Text, Animated, TouchableOpacity } from "react-native";
import { CheckCircle, XCircle, AlertCircle, Info, X, Bell, MessageCircle, DollarSign } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NotificationItemProps = {
  notif: Notification;
  onDismiss: (id: string) => void;
  index: number;
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notif, onDismiss, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const isActionable = notif.actions && notif.actions.length > 0;
  const duration = notif.duration || 4000;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation (only for auto-dismissing notifications)
    if (!isActionable && duration !== Infinity) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start();
    }

    // Auto dismiss (handled by NotificationsContext for non-actionable)
    // Actionable notifications must be manually dismissed
    return () => {};
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(notif.id));
  };

  const getCategoryIcon = () => {
    switch (notif.category) {
      case "service_request":
        return Bell;
      case "message":
        return MessageCircle;
      case "payment":
        return DollarSign;
      default:
        return null;
    }
  };

  const getNotificationStyle = () => {
    const CategoryIcon = getCategoryIcon();

    switch (notif.type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          iconColor: "#10B981",
          textColor: "text-green-900",
          subTextColor: "text-green-700",
          Icon: CategoryIcon || CheckCircle,
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          iconColor: "#EF4444",
          textColor: "text-red-900",
          subTextColor: "text-red-700",
          Icon: CategoryIcon || XCircle,
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          iconColor: "#F59E0B",
          textColor: "text-amber-900",
          subTextColor: "text-amber-700",
          Icon: CategoryIcon || AlertCircle,
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          iconColor: "#3B82F6",
          textColor: "text-blue-900",
          subTextColor: "text-blue-700",
          Icon: CategoryIcon || Info,
        };
    }
  };

  const style = getNotificationStyle();
  const IconComponent = style.Icon;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: 12,
      }}
    >
      <View
        className={`mx-4 ${style.bg} ${style.border} border rounded-2xl overflow-hidden`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        <View className="p-4 flex-row items-start">
          {/* Icon */}
          <View className="mr-3">
            <IconComponent size={24} color={style.iconColor} strokeWidth={2} />
          </View>

          {/* Content */}
          <View className="flex-1 mr-2">
            <Text className={`${style.textColor} font-dmsans-bold text-base mb-1`}>
              {notif.title}
            </Text>
            <Text className={`${style.subTextColor} font-dmsans text-sm leading-5`}>
              {notif.message}
            </Text>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={handleDismiss}
            className="ml-2 p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons (if actionable notification) */}
        {isActionable && notif.actions && (
          <View className="px-4 pb-3 flex-row gap-2">
            {notif.actions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={async () => {
                  await action.action();
                  handleDismiss();
                }}
                className={`flex-1 py-2.5 rounded-full items-center ${
                  action.style === 'primary'
                    ? 'bg-black'
                    : action.style === 'danger'
                    ? 'bg-red-500'
                    : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`font-dmsans-bold text-sm ${
                    action.style === 'primary' || action.style === 'danger'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Progress bar (only for non-actionable) */}
        {!isActionable && duration !== Infinity && (
          <Animated.View
            style={{
              height: 3,
              width: progressWidth,
              backgroundColor: style.iconColor,
              opacity: 0.5,
            }}
          />
        )}
      </View>
    </Animated.View>
  );
};

export function NotificationToast() {
  const { notifications, removeNotification } = useContext(NotificationContext);
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-0 right-0 z-50"
      style={{
        top: insets.top + 8,
      }}
      pointerEvents="box-none"
    >
      {notifications.map((notif, index) => (
        <NotificationItem
          key={notif.id}
          notif={notif}
          onDismiss={removeNotification}
          index={index}
        />
      ))}
    </View>
  );
}
