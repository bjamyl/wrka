import { Text } from "@/components/ui/text";
import { useCountry } from "@/contexts/CountryContext";
import { useHandymanJobs } from "@/hooks/useHandymanJobs";
import { Clock, Hourglass, HandCoins } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";

interface JobInProgressCardProps {
  requestId: string;
  startedAt: string;
  finalCost?: number | null;
  estimatedCost?: number | null;
  onJobFinished?: () => void;
}

export default function JobInProgressCard({
  requestId,
  startedAt,
  finalCost,
  estimatedCost,
  onJobFinished,
}: JobInProgressCardProps) {
  const { config } = useCountry();
  const { completeJobAsync, isCompleting } = useHandymanJobs();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Use final cost if available, otherwise estimated cost
  const paymentAmount = finalCost ?? estimatedCost ?? 0;

  useEffect(() => {
    const startTime = new Date(startedAt).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishJob = async () => {
    Alert.alert(
      "Finish Job",
      `Are you sure you want to mark this job as completed?\n\nA payment request of ${config.currency.symbol}${paymentAmount.toFixed(2)} will be sent to the customer.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Finish & Request Payment",
          style: "default",
          onPress: async () => {
            try {
              await completeJobAsync(requestId, paymentAmount);

              Alert.alert(
                "Job Completed!",
                "Great work! A payment request has been sent to the customer. You'll be notified when payment is received.",
                [
                  {
                    text: "OK",
                    onPress: () => onJobFinished?.(),
                  },
                ]
              );
            } catch (err) {
              Alert.alert(
                "Error",
                "Failed to complete job. Please try again.",
                [{ text: "OK" }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View className="mx-6 mb-6">
      {/* Main Card with Gradient-like effect */}
      <View className="bg-blue-600 rounded-3xl p-6 shadow-lg">
        {/* Status Header */}
        <View className="flex-row items-center justify-center mb-4">
          <View className="bg-white/20 px-4 py-2 rounded-full">
            <Text className="font-dmsans-bold text-lg tracking-wider">
             JOB IN PROGRESS
            </Text>
          </View>
        </View>

        <View className="items-center mb-6">
          <Hourglass size={50} className="" />
        </View>

        <View className=" rounded-2xl p-5 mb-4 border border-gray-300 ">
          <View className="flex-row items-center justify-center mb-2">
            <Clock size={20} />
            <Text className="font-dmsans-bold text-xs ml-2 tracking-wider">
              TIME ELAPSED
            </Text>
          </View>
          <Text className="font-dmsans-bold text-5xl text-center tracking-wider">
            {formatTime(elapsedTime)}
          </Text>
        </View>

        {/* Payment Amount */}
        <View className="bg-white rounded-2xl p-5 mb-4">
          <View className="flex-row items-center justify-center mb-2">
            <HandCoins size={20} color="#2563EB" />
            <Text className=" ml-2 text-blue-600 font-dmsans-bold text-xs tracking-wider">
              PAYMENT ON COMPLETION
            </Text>
          </View>
          <Text className="text-gray-900 font-dmsans-bold text-4xl text-center">
            {config.currency.symbol}{paymentAmount.toFixed(2)}
          </Text>
        </View>

        {/* Finish Job Button */}
        <TouchableOpacity
          onPress={handleFinishJob}
          disabled={isCompleting}
          className={`${
            isCompleting ? "bg-white/80" : "bg-white"
          } py-4 rounded-full items-center justify-center border`}
        >
          {isCompleting ? (
            <ActivityIndicator color="#2563EB" />
          ) : (
            <Text className=" font-dmsans-bold text-lg">
              Finish Job
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
