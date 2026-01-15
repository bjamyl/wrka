import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { useCountry } from "@/contexts/CountryContext";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { getIconComponent } from "@/lib/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import * as yup from "yup";

const MAX_CATEGORIES = 5;

const schema = yup.object().shape({
  bio: yup
    .string()
    .required("Bio is required")
    .min(20, "Bio must be at least 20 characters"),
  years_experience: yup
    .number()
    .required("Years of experience is required")
    .positive("Must be a positive number")
    .integer("Must be a whole number")
    .typeError("Must be a number"),
  hourly_rate: yup
    .number()
    .required("Hourly rate is required")
    .positive("Must be a positive number")
    .typeError("Must be a number"),
  service_categories: yup
    .array()
    .of(yup.string())
    .required("Please select at least one service category")
    .min(1, "Please select at least one service category")
    .max(
      MAX_CATEGORIES,
      `You can select a maximum of ${MAX_CATEGORIES} categories`,
    ),
  location_lat: yup.string().optional(),
  location_lng: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

interface ProfessionalInfoProps {
  onSubmit?: (data: FormData) => void | Promise<void>;
  isSubmitting?: boolean;
  goToPreviousStep: () => void;
}

export default function ProfessionalInfo({
  onSubmit: onSubmitProp,
  isSubmitting = false,
  goToPreviousStep,
}: ProfessionalInfoProps) {
  const { config } = useCountry();
  const {
    categories,
    error: categoriesError,
    loading: categoriesLoading,
  } = useServiceCategories();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      bio: "",
      years_experience: 0,
      hourly_rate: 0,
      service_categories: [],
      location_lat: "",
      location_lng: "",
    },
  });

  useEffect(() => {
    setValue("service_categories", selectedCategories);
  }, [selectedCategories, setValue]);

  useEffect(() => {
    (async () => {
      try {
        setLocationLoading(true);
        setLocationStatus("Requesting location permission...");

        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to complete your profile. Please enable it in settings.",
            [{ text: "OK" }],
          );
          setLocationStatus("Location permission denied");
          setLocationLoading(false);
          return;
        }

        setLocationStatus("Getting your location...");

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setValue("location_lat", location.coords.latitude.toString());
        setValue("location_lng", location.coords.longitude.toString());

        setLocationStatus("Location captured successfully ✓");
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert(
          "Location Error",
          "Unable to get your location. Please ensure location services are enabled.",
          [{ text: "OK" }],
        );
        setLocationStatus("Failed to get location");
      } finally {
        setLocationLoading(false);
      }
    })();
  }, [setValue]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else if (prev.length < MAX_CATEGORIES) {
        return [...prev, categoryId];
      }
      return prev;
    });
  };

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);

    if (onSubmitProp) {
      onSubmitProp(data);
    }
  };

  return (
    <ScrollView className="flex-1 w-full">
      <VStack space="lg" className="w-full pt-4 px-4 pb-8">
        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.bio}>
              <FormControlLabel>
                <FormControlLabelText className="font-onest-semibold">
                  Bio
                </FormControlLabelText>
              </FormControlLabel>
              <Textarea
                size="xl"
                isReadOnly={false}
                isInvalid={false}
                isDisabled={false}
                className="w-full rounded-xl"
              >
                <TextareaInput
                  placeholder="Tell us about your skills and experience..."
                  className="pt-1"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              </Textarea>
              <FormControlError>
                <FormControlErrorText className="text-red-500">
                  {errors.bio?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="years_experience"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.years_experience}>
              <FormControlLabel>
                <FormControlLabelText className="font-onest-semibold">
                  Years of Experience
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1 rounded-xl" size="xl">
                <InputField
                  placeholder="e.g. 5"
                  value={value?.toString()}
                  onChangeText={(text) => {
                    const numValue = text === "" ? 0 : parseInt(text);
                    onChange(isNaN(numValue) ? 0 : numValue);
                  }}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText className="text-red-500">
                  {errors.years_experience?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="hourly_rate"
          render={({ field: { onChange, onBlur, value } }) => (
            <FormControl isInvalid={!!errors.hourly_rate}>
              <FormControlLabel>
                <FormControlLabelText className="font-onest-semibold">
                  Hourly Rate ({config.currency.code})
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1 rounded-xl" size="xl">
                <InputField
                  placeholder="e.g. 50"
                  value={value?.toString()}
                  onChangeText={(text) => {
                    const numValue = text === "" ? 0 : parseFloat(text);
                    onChange(isNaN(numValue) ? 0 : numValue);
                  }}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  editable={!isSubmitting}
                />
              </Input>
              <FormControlError>
                <FormControlErrorText className="text-red-500">
                  {errors.hourly_rate?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
        />

        {/* Service Categories Selector */}
        <FormControl isInvalid={!!errors.service_categories}>
          <FormControlLabel>
            <FormControlLabelText className="font-onest-semibold">
              Service Categories
            </FormControlLabelText>
          </FormControlLabel>
          <Text className="text-xs text-gray-600 mb-3">
            Select up to {MAX_CATEGORIES} categories (
            {selectedCategories.length}/{MAX_CATEGORIES})
          </Text>

          {categoriesLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : categoriesError ? (
            <View className="bg-red-50 p-4 rounded-xl">
              <Text className="text-sm text-red-600">
                Failed to load service categories. Please try again.
              </Text>
            </View>
          ) : (
            <View className="flex-wrap flex-row gap-2">
              {categories?.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                const isDisabled =
                  !isSelected && selectedCategories.length >= MAX_CATEGORIES;

                return (
                  <Pressable
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    disabled={isDisabled || isSubmitting}
                    className={`p-3 rounded-lg border ${
                      isSelected
                        ? "bg-black border-black"
                        : isDisabled
                          ? "bg-gray-100 border-gray-200"
                          : "bg-white border-gray-300"
                    } items-center gap-1`}
                  >
                    {/*<Icon
                        size={18}
                        color={isSelected ? "#FFFFFF" : category.color}
                      />*/}
                    <Text
                      className={`text-xs font-onest-semibold text-center ${
                        isSelected
                          ? "text-white"
                          : isDisabled
                            ? "text-gray-400"
                            : "text-black"
                      }`}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <FormControlError>
            <FormControlErrorText className="text-red-500 mt-2">
              {errors.service_categories?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        {/* Location Status Indicator */}
        <View className="bg-gray-100 p-4 rounded-xl">
          <Text className="text-sm font-onest-semibold text-gray-700 mb-2">
            Location
          </Text>
          {locationLoading ? (
            <HStack space="md" className="items-center">
              <ActivityIndicator size="small" color="#000" />
              <Text className="text-sm text-gray-600">{locationStatus}</Text>
            </HStack>
          ) : (
            <Text className="text-sm text-gray-600">{locationStatus}</Text>
          )}
          {errors.location_lng || errors.location_lat ? (
            <Text className="text-sm text-red-500 mt-1">
              Location is required to continue
            </Text>
          ) : null}
        </View>

        <VStack space="lg" className="mt-4">
          <Button
            className="w-full rounded-full h-14 bg-black"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting || selectedCategories.length === 0}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText className="text-lg text-white font-onest-bold">
                Continue
              </ButtonText>
            )}
          </Button>
          <Button
            onPress={goToPreviousStep}
            variant="outline"
            className="rounded-full h-14"
            disabled={isSubmitting}
          >
            <ButtonText>Back</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
}
