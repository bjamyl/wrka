import { FC } from "react";
import { Box } from "../ui/box";
import { UserStatus } from "@/types/messages";

// Status Indicator Component
interface StatusIndicatorProps {
  status: UserStatus;
}

export const StatusIndicator: FC<StatusIndicatorProps> = ({ status }) => {
  const statusColors: Record<UserStatus, string> = {
    online: "#10B981",
    away: "#F59E0B",
    offline: "#9CA3AF",
  };

  return (
    <Box
      sx={{
        w: "$3",
        h: "$3",
        rounded: "$full",
        bg: statusColors[status],
        position: "absolute",
        bottom: 0,
        right: 0,
        borderWidth: 2,
        borderColor: "$white",
      }}
    />
  );
};
