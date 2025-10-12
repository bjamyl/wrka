import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as yup from "yup";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Switch } from "@/components/ui/switch";

const ID_TYPES = [
  { label: "Ghana Card (National ID)", value: "ghana_card" },
  { label: "Voter's ID", value: "voters_id" },
  { label: "Passport", value: "passport" },
  { label: "Driver's License", value: "drivers_license" },
  { label: "SSNIT Card", value: "ssnit_card" },
];

const schema = yup.object().shape({
  id_type: yup.string().required("ID type is required"),
  id_number: yup
    .string()
    .required("ID number is required")
    .min(5, "ID number must be at least 5 characters"),
});

type FormData = yup.InferType<typeof schema>;

interface VerificationInfoProps {
  onSubmit?: (data: FormData & { certificates: any[] }) => void;
}

export default function VerificationInfo({
  onSubmit: onSubmitProp,
}: VerificationInfoProps) {
  const [showIdDropdown, setShowIdDropdown] = useState(false);
  const [addCertificates, setAddCertificates] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      id_type: "",
      id_number: "",
    },
  });

  const selectedIdType = watch("id_type");
  const selectedIdLabel =
    ID_TYPES.find((type) => type.value === selectedIdType)?.label ||
    "Select ID type";

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      
      // Check file size (max 5MB)
      if (file.size && file.size > 5 * 1024 * 1024) {
        Alert.alert("File Too Large", "Please select a file smaller than 5MB");
        return;
      }

      setCertificates((prev) => [...prev, file]);
      Alert.alert("Success", "Certificate uploaded successfully");
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to upload certificate. Please try again.");
    }
  };

  const removeCertificate = (index: number) => {
    setCertificates((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    const submissionData = {
      ...data,
      certificates: addCertificates ? certificates : [],
    };

    console.log("Verification data:", submissionData);

    if (onSubmitProp) {
      onSubmitProp(submissionData);
    }
  };

  return (
    <VStack space="lg" className="w-full pt-4">
      {/* ID Type Dropdown */}
      <Controller
        control={control}
        name="id_type"
        render={({ field: { value } }) => (
          <FormControl isInvalid={!!errors.id_type}>
            <FormControlLabel>
              <FormControlLabelText className="font-onest-semibold">
                ID Type
              </FormControlLabelText>
            </FormControlLabel>
            <TouchableOpacity
              onPress={() => setShowIdDropdown(!showIdDropdown)}
              className="my-1"
            >
              <View className="border border-gray-300 rounded-xl p-4 bg-white">
                <Text
                  className={`text-base ${
                    value ? "text-black" : "text-gray-400"
                  }`}
                >
                  {selectedIdLabel}
                </Text>
              </View>
            </TouchableOpacity>

            {showIdDropdown && (
              <View className="border border-gray-200 rounded-xl mt-1 bg-white overflow-hidden">
                {ID_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => {
                      setValue("id_type", type.value);
                      setShowIdDropdown(false);
                    }}
                    className={`p-4 border-b border-gray-100 ${
                      value === type.value ? "bg-gray-50" : ""
                    }`}
                  >
                    <Text className="text-base text-black">{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <FormControlError>
              <FormControlErrorText className="text-red-500">
                {errors.id_type?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />

      {/* ID Number */}
      <Controller
        control={control}
        name="id_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormControl isInvalid={!!errors.id_number}>
            <FormControlLabel>
              <FormControlLabelText className="font-onest-semibold">
                ID Number
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1 rounded-xl" size="xl">
              <InputField
                placeholder="Enter your ID number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="characters"
              />
            </Input>
            <FormControlError>
              <FormControlErrorText className="text-red-500">
                {errors.id_number?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        )}
      />

      {/* Certificates Section */}
      <View className="border-t border-gray-200 pt-4 mt-2">
        <HStack className="items-center justify-between mb-2">
          <View className="flex-1">
            <Text className="text-base font-onest-semibold text-black">
              Add Certificates
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Clients are more likely to trust workers with certifications
            </Text>
          </View>
          <Switch
            value={addCertificates}
            onValueChange={setAddCertificates}
            trackColor={{ false: "#d1d5db", true: "#000000" }}
            thumbColor="#ffffff"
          />
        </HStack>

        {addCertificates && (
          <View className="mt-4">
            <TouchableOpacity
              onPress={handlePickDocument}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50"
            >
              <Text className="text-4xl mb-2">📄</Text>
              <Text className="text-base font-onest-semibold text-black mb-1">
                Upload Certificate
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                PDF or Image (Max 5MB)
              </Text>
            </TouchableOpacity>

            {/* Display uploaded certificates */}
            {certificates.length > 0 && (
              <View className="mt-4 space-y-2">
                <Text className="text-sm font-onest-semibold text-gray-700">
                  Uploaded Certificates ({certificates.length})
                </Text>
                {certificates.map((cert, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                  >
                    <View className="flex-1">
                      <Text
                        className="text-sm font-onest-medium text-black"
                        numberOfLines={1}
                      >
                        {cert.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {(cert.size / 1024).toFixed(0)} KB
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeCertificate(index)}
                      className="ml-2 p-2"
                    >
                      <Text className="text-red-500 text-base">✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <View className="mt-6">
        <Button
          className="w-full rounded-full h-14 bg-black"
          onPress={handleSubmit(onSubmit)}
        >
          <ButtonText className="text-lg text-white font-onest-bold">
            Complete Setup
          </ButtonText>
        </Button>
      </View>
    </VStack>
  );
}