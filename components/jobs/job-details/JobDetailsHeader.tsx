import { Heading } from "@/components/ui/heading";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

interface JobDetailsHeaderProps {
  title?: string;
}

export function JobDetailsHeader({ title = "Job Details" }: JobDetailsHeaderProps) {
  const router = useRouter();

  return (
    <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
      <TouchableOpacity onPress={() => router.back()} className="mr-4">
        <ChevronLeft size={24} color="#000" />
      </TouchableOpacity>
      <Heading size="xl" className="text-black font-dmsans-bold">
        {title}
      </Heading>
    </View>
  );
}
