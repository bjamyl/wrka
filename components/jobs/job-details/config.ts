import { ServiceRequestStatus } from "@/types/service";

export type PriorityLevel = "urgent" | "normal" | "low";

export interface BadgeConfig {
  bg: string;
  text: string;
  label: string;
}

export const PRIORITY_CONFIG: Record<PriorityLevel, BadgeConfig> = {
  urgent: { bg: "bg-red-50", text: "text-red-600", label: "Urgent" },
  normal: { bg: "bg-blue-50", text: "text-blue-600", label: "Normal" },
  low: { bg: "bg-gray-50", text: "text-gray-600", label: "Low Priority" },
};

export const STATUS_CONFIG: Record<ServiceRequestStatus, BadgeConfig> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Pending" },
  accepted: { bg: "bg-green-50", text: "text-green-700", label: "Accepted" },
  on_the_way: { bg: "bg-blue-50", text: "text-blue-700", label: "On The Way" },
  arrived: { bg: "bg-teal-50", text: "text-teal-700", label: "Arrived" },
  in_progress: { bg: "bg-indigo-50", text: "text-indigo-700", label: "In Progress" },
  rejected: { bg: "bg-red-50", text: "text-red-700", label: "Rejected" },
  completed: { bg: "bg-purple-50", text: "text-purple-700", label: "Completed" },
  cancelled: { bg: "bg-gray-50", text: "text-gray-700", label: "Cancelled" },
};

export const TRACKING_STATUSES: ServiceRequestStatus[] = ["accepted", "on_the_way", "arrived"];
