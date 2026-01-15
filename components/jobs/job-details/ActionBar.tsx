import { Text } from "@/components/ui/text";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "secondary";
}

function ActionButton({
  label,
  onPress,
  disabled = false,
  isLoading = false,
  variant = "primary",
}: ActionButtonProps) {
  const isPrimary = variant === "primary";
  const bgClass = isPrimary
    ? disabled
      ? "bg-gray-800"
      : "bg-black"
    : disabled
    ? "bg-gray-50"
    : "bg-gray-100";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 ${bgClass} py-4 rounded-full items-center justify-center`}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? "#FFF" : "#000"} />
      ) : (
        <Text className={`${isPrimary ? "text-white" : "text-black"} font-bold`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

interface PendingActionsBarProps {
  onAccept: () => void;
  onDecline: () => void;
  isProcessing: boolean;
  isAccepting: boolean;
  isDeclining: boolean;
}

export function PendingActionsBar({
  onAccept,
  onDecline,
  isProcessing,
  isAccepting,
  isDeclining,
}: PendingActionsBarProps) {
  return (
    <View className="absolute bottom-1 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
      <View className="flex-row gap-3">
        <ActionButton
          label="Decline"
          onPress={onDecline}
          disabled={isProcessing}
          isLoading={isDeclining}
          variant="secondary"
        />
        <ActionButton
          label="Accept Job"
          onPress={onAccept}
          disabled={isProcessing}
          isLoading={isAccepting}
          variant="primary"
        />
      </View>
    </View>
  );
}

interface ArrivedActionsBarProps {
  onStartJob: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  isStarting: boolean;
}

export function ArrivedActionsBar({
  onStartJob,
  onCancel,
  isProcessing,
  isStarting,
}: ArrivedActionsBarProps) {
  return (
    <View className="absolute bottom-1 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
      <View className="flex-row gap-3">
        <ActionButton
          label="Cancel Job"
          onPress={onCancel}
          disabled={isProcessing}
          variant="secondary"
        />
        <ActionButton
          label="Start Job"
          onPress={onStartJob}
          disabled={isProcessing}
          isLoading={isStarting}
          variant="primary"
        />
      </View>
    </View>
  );
}
