import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import * as yup from "yup";

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
  latitude: yup.string().optional(),
  longitude: yup.string().optional(),
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
      latitude: "",
      longitude: "",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        setLocationLoading(true);
        setLocationStatus("Requesting location permission...");

        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to complete your profile. Please enable it in settings.",
            [{ text: "OK" }]
          );
          setLocationStatus("Location permission denied");
          setLocationLoading(false);
          return;
        }

        setLocationStatus("Getting your location...");

        // Get current location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Set the latitude and longitude in the form
        setValue("latitude", location.coords.latitude.toString());
        setValue("longitude", location.coords.longitude.toString());

        setLocationStatus("Location captured successfully ✓");
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert(
          "Location Error",
          "Unable to get your location. Please ensure location services are enabled.",
          [{ text: "OK" }]
        );
        setLocationStatus("Failed to get location");
      } finally {
        setLocationLoading(false);
      }
    })();
  }, [setValue]);

  const onSubmit = (data: FormData) => {
    console.log("Form data:", data);

    if (onSubmitProp) {
      onSubmitProp(data);
    }
    // Handle form submission here
  };

  return (
    <VStack space="lg" className="w-full pt-4">
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
                Hourly Rate (GHS)
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

      {/* Location Status Indicator */}
      <View className="bg-gray-100 p-4 rounded-xl">
        <Text className="text-sm font-onest-semibold text-gray-700 mb-2">
          Location
        </Text>
        {locationLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#000" />
            <Text className="text-sm text-gray-600 ml-2">{locationStatus}</Text>
          </View>
        ) : (
          <Text className="text-sm text-gray-600">{locationStatus}</Text>
        )}
        {errors.latitude || errors.longitude ? (
          <Text className="text-sm text-red-500 mt-1">
            Location is required to continue
          </Text>
        ) : null}
      </View>

      <VStack space={"lg"} className="mt-4">
        <Button
          className="w-full rounded-full h-14 bg-black"
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
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
        >
          <ButtonText>Back</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}
