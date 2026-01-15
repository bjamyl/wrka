import { Skeleton } from "@/components/ui/Skeleton";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JobDetailsHeader } from "./JobDetailsHeader";

export function JobDetailsSkeleton() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <JobDetailsHeader />
      <View className="flex-1 px-6 pt-6">
        <Skeleton width="40%" height={24} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={32} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={32} style={{ marginBottom: 24 }} />
        <Skeleton width="100%" height={120} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={80} />
      </View>
    </SafeAreaView>
  );
}
