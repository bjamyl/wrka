import BasicInfo from "@/components/onboarding/BasicInfo";
import ProfessionalInfo from "@/components/onboarding/ProfessionalInfo";
import VerificationInfo from "@/components/onboarding/VerificationInfo";
import { Heading } from "@/components/ui/heading";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { VStack } from "@/components/ui/vstack";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
  const pagerRef = useRef<PagerView>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const {
    isSubmitting,
    submitBasicInfo,
    submitProfessionalInfo,
    submitVerificationInfo,
  } = useOnboarding();

  const headings = [
    {
      title: "Basic Information",
      description:
        "Your full name and contact details will be visible to clients during bookings",
    },
    {
      title: "Professional Details",
      description:
        "We'll use this information to match you with relevant job opportunities",
    },
    {
      title: "Verification Information",
      description:
        "We ask for this information to help verify your identity and ensure a safe experience for everyone on Wrka",
    },
  ];

  const goToNextStep = () => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, 2);
      pagerRef.current?.setPage(next);
      return next;
    });
  };

  const goToPreviousStep = () => {
    setCurrentStep((prev) => {
      const previous = Math.max(prev - 1, 0);
      pagerRef.current?.setPage(previous);
      return previous;
    });
  };

  const progressValue = ((currentStep + 1) / 3) * 100;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-5">
        <View className="mb-5">
          <Text className="text-3xl font-bold text-black">wrka.</Text>
        </View>

        <Progress value={progressValue} size="sm">
          <ProgressFilledTrack />
        </Progress>

        <VStack className="mt-5 mb-4">
          <Heading size="3xl" className="text-3xl font-onest-bold text-black">
            {headings[currentStep].title}
          </Heading>
          <Text className="text-base text-gray-600 mt-2">
            {headings[currentStep].description}
          </Text>
        </VStack>

        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={false}
          onPageSelected={(e) => {
            // Sync with pager view changes if needed
          }}
        >
          <View key="1" className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <BasicInfo
                onSubmit={async (data) => {
                  await submitBasicInfo(data);
                  goToNextStep();
                }}
                isSubmitting={isSubmitting}
              />
            </ScrollView>
          </View>

          <View key="2" className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ProfessionalInfo
                onSubmit={async (data) => {
                  await submitProfessionalInfo(data);
                  goToNextStep();
                }}
                goToPreviousStep={goToPreviousStep}
                isSubmitting={isSubmitting}
              />
            </ScrollView>
          </View>

          <View key="3" className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <VerificationInfo
                onSubmit={submitVerificationInfo}
                goToPreviousStep={goToPreviousStep}
                isSubmitting={isSubmitting}
              />
            </ScrollView>
          </View>
        </PagerView>
      </View>
    </SafeAreaView>
  );
}
