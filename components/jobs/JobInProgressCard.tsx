import { Text } from "@/components/ui/text";
import { supabase } from "@/lib/supabase";
import { Clock, Hourglass,HandCoins } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity, View } from "react-native";

interface JobInProgressCardProps {
  requestId: string;
  startedAt: string;
  onJobFinished?: () => void;
}

export default function JobInProgressCard({
  requestId,
  startedAt,
  onJobFinished,
}: JobInProgressCardProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Fixed payment amount - will be fetched from backend later
  const PAYMENT_AMOUNT = 150.0;

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
      "Are you sure you want to mark this job as completed?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Finish",
          style: "default",
          onPress: async () => {
            setIsFinishing(true);
            try {
              const { error } = await supabase
                .from("service_requests")
                .update({ status: "completed" })
                .eq("id", requestId)
                .eq("status", "in_progress");

              if (error) throw error;

              Alert.alert(
                "Job Completed",
                "Great work! The job has been marked as completed.",
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
            } finally {
              setIsFinishing(false);
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
            GH₵{PAYMENT_AMOUNT.toFixed(2)}
          </Text>
        </View>

        {/* Finish Job Button */}
        <TouchableOpacity
          onPress={handleFinishJob}
          disabled={isFinishing}
          className={`${
            isFinishing ? "bg-white/80" : "bg-white"
          } py-4 rounded-full items-center justify-center border`}
          
        >
          {isFinishing ? (
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
