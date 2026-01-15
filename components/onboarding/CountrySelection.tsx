import { Button, ButtonText } from "@/components/ui/button";
import { COUNTRIES, CountryCode } from "@/constants/countries";
import { useCountry } from "@/contexts/CountryContext";
import { Check, Globe } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface CountrySelectionProps {
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
}

const countryOptions = Object.values(COUNTRIES).map((country) => ({
  code: country.code,
  name: country.name,
  currency: country.currency.name,
  flag: country.code === "GH" ? "🇬🇭" : "🇳🇬",
}));

export default function CountrySelection({
  onSubmit,
  isSubmitting = false,
}: CountrySelectionProps) {
  const { countryCode, setCountry } = useCountry();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCode);
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    setSaving(true);
    try {
      await setCountry(selectedCountry);
      await onSubmit();
    } finally {
      setSaving(false);
    }
  };

  const isLoading = isSubmitting || saving;

  return (
    <View className="flex-1">
      <View className="mb-6">
        <View className="flex-row items-center gap-2 mb-2">
          <Globe size={24} color="#000" />
          <Text className="text-lg font-dmsans-bold text-black">
            Select Your Country
          </Text>
        </View>
        <Text className="text-gray-600 font-dmsans">
          This helps us show you the right currency, payment methods, and ID
          verification options.
        </Text>
      </View>

      <View className="gap-3 mb-8">
        {countryOptions.map((country) => (
          <TouchableOpacity
            key={country.code}
            onPress={() => setSelectedCountry(country.code)}
            disabled={isLoading}
            className={`p-5 rounded-2xl border-2 flex-row items-center ${
              selectedCountry === country.code
                ? "border-black bg-gray-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text className="text-4xl mr-4">{country.flag}</Text>
            <View className="flex-1">
              <Text className="text-lg font-dmsans-bold text-black">
                {country.name}
              </Text>
              <Text className="text-gray-500 font-dmsans text-sm">
                {country.currency}
              </Text>
            </View>
            {selectedCountry === country.code && (
              <View className="w-8 h-8 rounded-full bg-black items-center justify-center">
                <Check size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-auto">
        <Button
          size="xl"
          className="rounded-full bg-black"
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <ButtonText className="text-white font-dmsans-bold">
              Continue
            </ButtonText>
          )}
        </Button>
      </View>
    </View>
  );
}
