import { ChevronDownIcon } from "@/components/ui/icon";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import React from "react";
import { Text, View } from "react-native";

type EarningsCardProps = {
  icon: React.ReactElement;
  title: string;
  statsValue: number;
};

export default function EarningsCard({
  icon,
  title,
  statsValue,
}: EarningsCardProps) {
  return (
    <View className="border border-gray-200 rounded-xl p-5">
      <View className="flex flex-row justify-between">
        <View>
          <View className="flex flex-row items-center">
            <View>{icon}</View>

            <Text className="font-dmsans-semibold text-lg ml-2">{title}</Text>
          </View>
          <View className="mt-3">
            <View>
              <Text className="font-dmsans-bold text-3xl text-gray-700">
                GHS {statsValue}
              </Text>
            </View>
          </View>
        </View>
        <Select>
          <SelectTrigger variant="outline" size="md" className="rounded-xl">
            <SelectInput placeholder="All time" />
            <SelectIcon className="mr-3" as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent >
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              <SelectItem label="Last week" value="last_week" />
              <SelectItem label="Yesterday" value="yesterday" />
              <SelectItem
                label="Last Month"
                value="last_month"
              />
            </SelectContent>
          </SelectPortal>
        </Select>
      </View>
    </View>
  );
}
