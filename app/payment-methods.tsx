import { Button, ButtonText } from "@/components/ui/button";
import CustomBottomSheet from "@/components/ui/custom-bottom-sheet";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCountry } from "@/contexts/CountryContext";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Plus,
  Trash2,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentMethods() {
  const router = useRouter();
  const addSheetRef = useRef<BottomSheetModal>(null);
  const { config } = useCountry();
  const momoProviders = config.momoProviders;

  // Helper functions using country config
  const getProviderLabel = (id: string) => {
    return momoProviders.find((p) => p.id === id)?.label || id;
  };

  const getProviderColor = (id: string) => {
    return momoProviders.find((p) => p.id === id)?.color || "#6B7280";
  };

  const {
    paymentMethods,
    loading,
    refetch,
    addPaymentMethod,
    removePaymentMethod,
    setDefault,
    adding,
  } = usePaymentMethods();

  const [refreshing, setRefreshing] = useState(false);
  const [provider, setProvider] = useState(momoProviders[0]?.id || "mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const openAddSheet = () => {
    setProvider(momoProviders[0]?.id || "mtn");
    setPhoneNumber("");
    setAccountName("");
    setIsDefault(paymentMethods.length === 0);
    addSheetRef.current?.present();
  };

  const closeAddSheet = () => {
    addSheetRef.current?.dismiss();
    setPhoneNumber("");
    setAccountName("");
  };

  const handleAddPaymentMethod = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number");
      return;
    }

    try {
      await addPaymentMethod({
        momo_provider: provider,
        momo_number: phoneNumber,
        account_name: accountName || undefined,
        is_default: isDefault,
      });
      closeAddSheet();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = (id: string, number: string) => {
    Alert.alert(
      "Remove Payment Method",
      `Are you sure you want to remove ${number}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removePaymentMethod(id),
        },
      ]
    );
  };

  const handleSetDefault = async (id: string) => {
    await setDefault(id);
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200 bg-white">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4 p-2 -ml-2"
            >
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Heading size="xl" className="text-black font-dmsans-bold">
              Payment Methods
            </Heading>
          </View>
          <Text className="text-gray-600 font-dmsans">
            Manage your Mobile Money accounts for withdrawals
          </Text>
        </View>

        <View className="px-6 mt-6">
          {/* Add New Button */}
          <TouchableOpacity
            onPress={openAddSheet}
            className="bg-black rounded-2xl p-4 mb-6 flex-row items-center justify-center gap-2"
          >
            <Plus size={20} color="#FFFFFF" />
            <Text className="text-white font-dmsans-bold">
              Add Payment Method
            </Text>
          </TouchableOpacity>

          {/* Payment Methods List */}
          {paymentMethods.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <CreditCard size={28} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 font-dmsans-bold text-lg mb-2">
                No Payment Methods
              </Text>
              <Text className="text-gray-500 font-dmsans text-center">
                Add a Mobile Money account to enable fast withdrawals
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {paymentMethods.map((method) => (
                <View
                  key={method.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100"
                >
                  <View className="flex-row items-center">
                    {/* Provider Icon */}
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: `${getProviderColor(method.momo_provider)}20`,
                      }}
                    >
                      <CreditCard
                        size={22}
                        color={getProviderColor(method.momo_provider)}
                      />
                    </View>

                    {/* Details */}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-gray-900 font-dmsans-bold">
                          {getProviderLabel(method.momo_provider)}
                        </Text>
                        {method.is_default && (
                          <View className="bg-green-100 px-2 py-0.5 rounded-full">
                            <Text className="text-green-700 font-dmsans-medium text-xs">
                              Default
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-600 font-dmsans">
                        {method.momo_number}
                      </Text>
                      {method.account_name && (
                        <Text className="text-gray-400 font-dmsans text-sm">
                          {method.account_name}
                        </Text>
                      )}
                    </View>

                    {/* Actions */}
                    <View className="flex-row gap-2">
                      {!method.is_default && (
                        <TouchableOpacity
                          onPress={() => handleSetDefault(method.id)}
                          className="p-2 bg-gray-100 rounded-full"
                        >
                          <Check size={18} color="#6B7280" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() =>
                          handleDelete(method.id, method.momo_number)
                        }
                        className="p-2 bg-red-50 rounded-full"
                      >
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Payment Method Bottom Sheet */}
      <CustomBottomSheet
        ref={addSheetRef}
        title="Add Payment Method"
        snapPoints={["75%"]}
      >
        <View className="w-full px-4 mt-2">
          <Text size="sm" className="text-gray-600 font-dmsans mb-6">
            Add a Mobile Money account for withdrawals
          </Text>

          <VStack space="lg">
            {/* Provider Selection */}
            <VStack space="xs">
              <Text
                size="sm"
                className="text-gray-700 font-dmsans-medium mb-2"
              >
                Select Provider
              </Text>
              <View className="gap-2">
                {momoProviders.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setProvider(p.id)}
                    className={`p-4 rounded-xl border-2 flex-row items-center ${
                      provider === p.id
                        ? "border-black bg-gray-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${p.color}20` }}
                    >
                      <CreditCard size={20} color={p.color} />
                    </View>
                    <Text
                      className={`font-dmsans-medium flex-1 ${
                        provider === p.id ? "text-black" : "text-gray-600"
                      }`}
                    >
                      {p.label}
                    </Text>
                    {provider === p.id && <Check size={20} color="#000" />}
                  </TouchableOpacity>
                ))}
              </View>
            </VStack>

            {/* Phone Number */}
            <VStack space="xs">
              <Text
                size="sm"
                className="text-gray-700 font-dmsans-medium mb-1"
              >
                Phone Number
              </Text>
              <Input
                variant="outline"
                size="lg"
                className="border-gray-300 rounded-xl"
              >
                <InputField
                  placeholder={config.phone.placeholder}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={15}
                  className="font-dmsans"
                />
              </Input>
            </VStack>

            {/* Account Name (Optional) */}
            <VStack space="xs">
              <Text
                size="sm"
                className="text-gray-700 font-dmsans-medium mb-1"
              >
                Account Name (Optional)
              </Text>
              <Input
                variant="outline"
                size="lg"
                className="border-gray-300 rounded-xl"
              >
                <InputField
                  placeholder="Name on account"
                  value={accountName}
                  onChangeText={setAccountName}
                  className="font-dmsans"
                />
              </Input>
            </VStack>

            {/* Set as Default */}
            <TouchableOpacity
              onPress={() => setIsDefault(!isDefault)}
              className="flex-row items-center"
            >
              <View
                className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                  isDefault ? "bg-black border-black" : "border-gray-300"
                }`}
              >
                {isDefault && <Check size={14} color="#FFFFFF" />}
              </View>
              <Text className="text-gray-700 font-dmsans">
                Set as default payment method
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <HStack space="sm" className="mt-4">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 rounded-full border-gray-300"
                onPress={closeAddSheet}
                disabled={adding}
              >
                <ButtonText className="text-gray-700 font-dmsans-bold">
                  Cancel
                </ButtonText>
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-black rounded-full"
                onPress={handleAddPaymentMethod}
                disabled={adding || phoneNumber.length < 10}
              >
                {adding ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ButtonText className="text-white font-dmsans-bold">
                    Add
                  </ButtonText>
                )}
              </Button>
            </HStack>
          </VStack>
        </View>
      </CustomBottomSheet>
    </SafeAreaView>
  );
}
