import { useHandymanJobs } from "@/hooks/useHandymanJobs";
import { useStartJobStore } from "@/lib/state/jobs";
import { useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper } from "../ui/actionsheet";
import { Input, InputField } from "../ui/input";
import { PlayCircle } from "lucide-react-native";

export default function StartJobSheet({requestId}:{requestId:string}){
  const {setShowStartJob, showStartJob, setIsStarting} = useStartJobStore()

  const router = useRouter()

    const {
    startJobAsync,
    isStarting,
    startError,
  } = useHandymanJobs();

  
  const [finalFee, setFinalFee] = useState("");
  const [feeError, setFeeError] = useState("");


   const handleStartJob = async () => {
      // Validate fee input
      const feeValue = parseFloat(finalFee);
      if (!finalFee || isNaN(feeValue) || feeValue <= 0) {
        setFeeError("Please enter a valid fee amount");
        return;
      }
  
      try {
        setIsStarting(true)
        await startJobAsync(requestId, feeValue);
        setShowStartJob(false);
        setIsStarting(false)
        Alert.alert(
          "Success",
          "Job started successfully! You can now work on this job.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } catch (err) {
        setShowStartJob(false);
        Alert.alert(
          "Error",
          startError || "Failed to start job. Please try again.",
          [{ text: "OK" }]
        );
      }
    };
  
  return (
     <Actionsheet isOpen={showStartJob} onClose={() => setShowStartJob(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="w-full px-6 pb-8">
            {/* Icon and Header - Left Aligned */}
            <View className="mb-8">
              <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
                <PlayCircle size={32} color="#10B981" fill="#10B981" />
              </View>
              <Heading size="2xl" className="text-black font-dmsans-bold mb-2">
                Start Job
              </Heading>
              <Text className="text-gray-600 font-dmsans text-base leading-6">
                Confirm the final fee with the customer before starting work. This amount will be charged upon completion.
              </Text>
            </View>

            {/* Fee Input */}
            <View className="mb-8">
              <Text className="text-gray-900 font-dmsans-bold mb-3 text-sm uppercase tracking-wide">
                Final Fee Amount
              </Text>
              <View className="relative">
                <View className="absolute left-6 top-0 bottom-0 justify-center z-10">
                  <Text className="text-gray-500 font-dmsans-bold text-2xl">GH₵</Text>
                </View>
                <Input className="bg-gray-50 border border-gray-200 rounded-2xl h-16">
                  <InputField
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={finalFee}
                    onChangeText={(text) => {
                      setFinalFee(text);
                      setFeeError("");
                    }}
                    className="pl-20 font-dmsans-bold text-2xl text-black"
                    autoFocus
                  />
                </Input>
              </View>
              {feeError ? (
                <View className="mt-3 bg-red-50 rounded-xl p-3">
                  <Text className="text-red-600 text-sm font-dmsans">
                    {feeError}
                  </Text>
                </View>
              ) : (
                <Text className="text-gray-500 text-xs font-dmsans mt-3">
                  This fee will be visible to the customer and locked once the job starts
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowStartJob(false)}
                disabled={isStarting}
                className={`flex-1 ${isStarting ? 'bg-gray-50' : 'bg-gray-100'} py-4 rounded-full items-center justify-center`}
              >
                <Text className="text-black font-dmsans-bold text-base">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleStartJob}
                disabled={isStarting}
                className={`flex-1 ${isStarting ? 'bg-gray-800' : 'bg-black'} py-4 rounded-full items-center justify-center`}
              >
                {isStarting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text className="text-white font-dmsans-bold text-base">Start Job</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ActionsheetContent>
      </Actionsheet>
  )
}
