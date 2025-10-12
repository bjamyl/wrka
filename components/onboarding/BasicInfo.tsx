import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as yup from "yup";

const schema = yup.object().shape({
  full_name: yup.string().required("Full name is required"),
  phone_number: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9+\s()-]+$/, "Invalid phone number format"),
  city: yup.string().required("City is required"),
  region: yup.string().required("Region is required"),
  district: yup.string().required("District is required"),
  country: yup.string().required("Country is required"),
});

type FormData = yup.InferType<typeof schema>;

interface BasicInfoProps {
  onSubmit?: (data: FormData) => void | Promise<void>;
  isSubmitting?: boolean;
}

export default function BasicInfo({ 
  onSubmit: onSubmitProp,
  isSubmitting = false 
}: BasicInfoProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      city: "",
      region: "",
      district: "",
      country: "Ghana",
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form data:", data);
    
    if (onSubmitProp) {
      await onSubmitProp(data);
    }
  };

  return (
    <VStack space="lg" className="w-full pt-4">
      <Controller
        control={control}
        name="full_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormControl isInvalid={!!errors.full_name}>
            <FormControlLabel>
              <FormControlLabelText className="font-onest-semibold">
                Full name
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1 rounded-xl" size="xl">
              <InputField
                placeholder="e.g. Kofi Mensah"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            </Input>
            <FormControlError>
              <FormControlErrorText className="text-red-500">
                {errors.full_name?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="phone_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormControl isInvalid={!!errors.phone_number}>
            <FormControlLabel>
              <FormControlLabelText className="font-onest-semibold">
                Phone number
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1 rounded-xl" size="xl">
              <InputField
                placeholder="e.g. +233 24 123 4567"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
            </Input>
            <FormControlError>
              <FormControlErrorText className="text-red-500">
                {errors.phone_number?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="city"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormControl isInvalid={!!errors.city}>
            <FormControlLabel>
              <FormControlLabelText className="font-onest-semibold">
                City
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1 rounded-xl" size="xl">
              <InputField
                placeholder="e.g. Kumasi"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            </Input>
            <FormControlError>
              <FormControlErrorText className="text-red-500">
                {errors.city?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="region"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormControl isInvalid={!!errors.region}>
            <FormControlLabel>
              <FormControlLabelText className="font-onest-semibold">
                Region
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1 rounded-xl" size="xl">
              <InputField
                placeholder="e.g. Ashanti"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            </Input>
            <FormControlError>
              <FormControlErrorText className="text-red-500">
                {errors.region?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="district"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormControl isInvalid={!!errors.district}>
            <FormControlLabel>
              <FormControlLabelText className="font-onest-semibold">
                District
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1 rounded-xl" size="xl">
              <InputField
                placeholder="e.g. Kumasi Metro"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            </Input>
            <FormControlError>
              <FormControlErrorText className="text-red-500">
                {errors.district?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />

      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormControl isInvalid={!!errors.country}>
            <FormControlLabel>
              <FormControlLabelText className="font-onest-semibold">
                Country
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1 rounded-xl" size="xl">
              <InputField
                placeholder="e.g. Ghana"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isSubmitting}
              />
            </Input>
            <FormControlError>
              <FormControlErrorText className="text-red-500">
                {errors.country?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />

      <View className="mt-4">
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
      </View>
    </VStack>
  );
}