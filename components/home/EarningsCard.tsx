import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ChevronDownIcon } from "@/components/ui/icon";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
import { useCountry } from "@/contexts/CountryContext";
import React, { useState } from "react";
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
  const { config } = useCountry();
  const [selectedTime, setSelectedTime] = useState("All time");

  const handleSelect = (value: string, label: string) => {
    setSelectedTime(label);
    // TODO: Add data fetching logic based on 'value'
    console.log("Selected value:", value);
  };

  return (
    <View className="border border-gray-200 rounded-xl p-5">
      <View className="flex flex-row justify-between items-center">
        <View>
          <View className="flex flex-row items-center">
            <View>{icon}</View>
            <Text className="font-dmsans-semibold text-lg ml-2">{title}</Text>
          </View>
          <View className="mt-3">
            <View>
              <Text className="font-dmsans-bold text-3xl text-gray-700">
                {config.currency.code} {statsValue}
              </Text>
            </View>
          </View>
        </View>

        <Menu
          offset={4}
          placement="bottom"
          trigger={(triggerProps) => {
            return (
              <Button
                {...triggerProps}
                variant="outline"
                size="md"
                className="rounded-xl"
              >
                <ButtonText>{selectedTime}</ButtonText>
                <ButtonIcon as={ChevronDownIcon} className="ml-2" />
              </Button>
            );
          }}
        >
          <MenuItem
            key="all_time"
            textValue="all_time"
            className="p-2"
            onPress={() => handleSelect("all_time", "All time")}
          >
            <MenuItemLabel size="sm">All time</MenuItemLabel>
          </MenuItem>
          <MenuItem
            key="last_week"
            textValue="last_week"
            className="p-2"
            onPress={() => handleSelect("last_week", "Last week")}
          >
            <MenuItemLabel size="sm">Last week</MenuItemLabel>
          </MenuItem>
          <MenuItem
            key="yesterday"
            textValue="yesterday"
            className="p-2"
            onPress={() => handleSelect("yesterday", "Yesterday")}
          >
            <MenuItemLabel size="sm">Yesterday</MenuItemLabel>
          </MenuItem>
          <MenuItem
            key="last_month"
            textValue="last_month"
            className="p-2"
            onPress={() => handleSelect("last_month", "Last Month")}
          >
            <MenuItemLabel size="sm">Last Month</MenuItemLabel>
          </MenuItem>
        </Menu>
      </View>
    </View>
  );
}
