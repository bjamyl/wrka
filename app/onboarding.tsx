import BasicInfo from "@/components/onboarding/BasicInfo";
import ProfessionalInfo from "@/components/onboarding/ProfessionalInfo";
import VerificationInfo from "@/components/onboarding/VerificationInfo";
import { Heading } from "@/components/ui/heading";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { VStack } from "@/components/ui/vstack";
import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [formData, setFormData] = useState<{
    basicInfo: any | null;
    professionalInfo: any | null;
  }>({
    basicInfo: null,
    professionalInfo: null,
  });

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

  const goToNextPage = () => {
    if (currentPage < 2) {
      pagerRef.current?.setPage(currentPage + 1);
    }
  };

  const handleBasicInfoSubmit = (data: any) => {
    console.log("Basic Info submitted:", data);
    setFormData((prev) => ({ ...prev, basicInfo: data }));
    goToNextPage();
  };

  const handleProfessionalInfoSubmit = (data: any) => {
    console.log("Professional Info submitted:", data);
    setFormData((prev) => ({ ...prev, professionalInfo: data }));
    
    // Combine all form data - check if basicInfo exists
    const completeData = {
      ...(formData.basicInfo || {}),
      ...data,
    };
    
    console.log("Complete onboarding data:", completeData);
    
    // Here you would typically:
    // 1. Send data to your API
    // 2. Navigate to the next screen or complete onboarding
    
    goToNextPage(); // Move to verification step (when you add it)
  };

  const progressValue = ((currentPage + 1) / 3) * 100;

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
            {headings[currentPage].title}
          </Heading>
          <Text className="text-base text-gray-600 mt-2">
            {headings[currentPage].description}
          </Text>
        </VStack>

        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={false}
          onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
        >
          <View key="1" className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <BasicInfo onSubmit={handleBasicInfoSubmit} />
            </ScrollView>
          </View>

          <View key="2" className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <ProfessionalInfo onSubmit={handleProfessionalInfoSubmit} />
            </ScrollView>
          </View>

          <View key="3" className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
             <VerificationInfo onSubmit={handleProfessionalInfoSubmit}/>
            </ScrollView>
          </View>
        </PagerView>
      </View>
    </SafeAreaView>
  );
}