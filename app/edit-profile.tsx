import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  id_type: z.string().min(1, "ID type is required"),
  id_number: z.string().min(1, "ID number is required"),
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfile() {
  const { profile, loading, updateProfile, updating } = useProfile();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      id_type: "",
      id_number: "",
      country: "",
      region: "",
      district: "",
      city: "",
      locality: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || "",
        phone_number: profile.phone_number || "",
        id_type: profile.id_type || "",
        id_number: profile.id_number || "",
        country: profile.country || "",
        region: profile.region || "",
        district: profile.district || "",
        city: profile.city || "",
        locality: profile.locality || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    const { error } = await updateProfile(data);

    if (!error) {
      router.back();
    }
  };

  const FormField = ({
    name,
    label,
    placeholder,
    keyboardType = "default",
  }: {
    name: keyof ProfileFormData;
    label: string;
    placeholder: string;
    keyboardType?: "default" | "phone-pad" | "email-address";
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <VStack space="xs">
          <Text size="sm" className="text-gray-700 font-dmsans-medium">
            {label}
          </Text>
          <Input className={`border rounded-xl h-14 ${errors[name] ? "border-red-500" : "border-gray-300"}`}>
            <InputField
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              keyboardType={keyboardType}
              className="font-dmsans"
            />
          </Input>
          {errors[name] && (
            <Text size="xs" className="text-red-500 font-dmsans">
              {errors[name]?.message}
            </Text>
          )}
        </VStack>
      )}
    />
  );

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text size="sm" className="text-gray-600 mt-4 font-dmsans">
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text size="md" className="text-gray-600 text-center font-dmsans">
            Failed to load profile
          </Text>
          <Button
            size="md"
            className="bg-black rounded-full mt-4"
            onPress={() => router.back()}
          >
            <ButtonText className="text-white font-dmsans-medium">
              Go Back
            </ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 -ml-2"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Heading size="xl" className="text-black font-dmsans-bold">
              Edit Profile
            </Heading>
          </View>
          <Text size="sm" className="text-gray-600 font-dmsans">
            Update your profile information
          </Text>
        </View>

        <View className="px-6 py-6">
          <VStack space="lg">
            {/* Personal Information */}
            <VStack space="md">
              <Text size="md" className="text-gray-900 font-dmsans-bold">
                Personal Information
              </Text>

              <FormField
                name="full_name"
                label="Full Name"
                placeholder="Enter your full name"
              />

              <FormField
                name="phone_number"
                label="Phone Number"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </VStack>

            {/* Identification */}
            <VStack space="md">
              <Text size="md" className="text-gray-900 font-dmsans-bold">
                Identification
              </Text>

              <FormField
                name="id_type"
                label="ID Type"
                placeholder="e.g., National ID, Passport"
              />

              <FormField
                name="id_number"
                label="ID Number"
                placeholder="Enter your ID number"
              />
            </VStack>

            {/* Location */}
            <VStack space="md">
              <Text size="md" className="text-gray-900 font-dmsans-bold">
                Location
              </Text>

              <FormField
                name="country"
                label="Country"
                placeholder="Enter your country"
              />

              <FormField
                name="region"
                label="Region"
                placeholder="Enter your region"
              />

              <FormField
                name="district"
                label="District"
                placeholder="Enter your district"
              />

              <FormField
                name="city"
                label="City"
                placeholder="Enter your city"
              />

              <FormField
                name="locality"
                label="Locality"
                placeholder="Enter your locality"
              />
            </VStack>

            {/* Action Buttons */}
            <VStack space="md" className="mt-6">
              <Button
                size="lg"
                className="bg-black rounded-full h-14"
                onPress={handleSubmit(onSubmit)}
                disabled={updating}
              >
                <ButtonText className="text-base font-semibold text-white font-dmsans-bold">
                  {updating ? "Saving..." : "Save Changes"}
                </ButtonText>
              </Button>

              <Button
                size="lg"
                className="bg-gray-100 rounded-full h-14"
                onPress={() => router.back()}
                disabled={updating}
              >
                <ButtonText className="text-base font-semibold text-gray-900 font-dmsans-bold">
                  Cancel
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
