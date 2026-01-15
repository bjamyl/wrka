import CustomBottomSheet, {
  CustomBottomSheetRef,
} from "@/components/ui/custom-bottom-sheet";
import { Text } from "@/components/ui/text";
import { useCountry } from "@/contexts/CountryContext";
import { WithdrawalRequest } from "@/types/earnings";
import { PaymentMethod } from "@/types/payment";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Check, CreditCard, Plus } from "lucide-react-native";
import React, { forwardRef, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface WithdrawSheetProps {
  availableBalance: number;
  minWithdrawal: number;
  onWithdraw: (request: WithdrawalRequest) => Promise<void>;
  withdrawing?: boolean;
  savedPaymentMethods?: PaymentMethod[];
  onAddPaymentMethod?: () => void;
}

export const WithdrawSheet = forwardRef<CustomBottomSheetRef, WithdrawSheetProps>(
  (
    {
      availableBalance,
      minWithdrawal,
      onWithdraw,
      withdrawing,
      savedPaymentMethods = [],
      onAddPaymentMethod,
    },
    ref
  ) => {
    const { config, formatAmount } = useCountry();
    const momoProviders = config.momoProviders;

    const [amount, setAmount] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [useManualEntry, setUseManualEntry] = useState(false);
    const [provider, setProvider] = useState(momoProviders[0]?.id || "mtn");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Helper to get provider color
    const getProviderColor = (id: string) => {
      return momoProviders.find((p) => p.id === id)?.color || "#6B7280";
    };

    // Helper to get provider label
    const getProviderLabel = (id: string) => {
      return momoProviders.find((p) => p.id === id)?.label || id;
    };

    // Pre-select default payment method
    useEffect(() => {
      const defaultMethod = savedPaymentMethods.find((pm) => pm.is_default);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod);
        setUseManualEntry(false);
      } else if (savedPaymentMethods.length > 0) {
        setSelectedPaymentMethod(savedPaymentMethods[0]);
        setUseManualEntry(false);
      } else {
        setUseManualEntry(true);
      }
    }, [savedPaymentMethods]);

    const handleWithdraw = async () => {
      const numAmount = parseFloat(amount);

      if (isNaN(numAmount) || numAmount <= 0) {
        Alert.alert("Invalid Amount", "Please enter a valid amount");
        return;
      }

      if (numAmount < minWithdrawal) {
        Alert.alert(
          "Minimum Not Met",
          `Minimum withdrawal amount is ${formatAmount(minWithdrawal)}`
        );
        return;
      }

      if (numAmount > availableBalance) {
        Alert.alert(
          "Insufficient Balance",
          "You cannot withdraw more than your available balance"
        );
        return;
      }

      let withdrawalProvider: MomoProvider;
      let withdrawalNumber: string;

      if (useManualEntry) {
        if (!phoneNumber || phoneNumber.length < 10) {
          Alert.alert("Invalid Phone", "Please enter a valid phone number");
          return;
        }
        withdrawalProvider = provider;
        withdrawalNumber = phoneNumber;
      } else if (selectedPaymentMethod) {
        withdrawalProvider = selectedPaymentMethod.momo_provider;
        withdrawalNumber = selectedPaymentMethod.momo_number;
      } else {
        Alert.alert("No Payment Method", "Please select a payment method");
        return;
      }

      try {
        await onWithdraw({
          amount: numAmount,
          momo_provider: withdrawalProvider,
          momo_number: withdrawalNumber,
        });

        // Reset form on success
        setAmount("");
        setPhoneNumber("");
        // @ts-ignore
        ref?.current?.dismiss();
      } catch (error) {
        // Error handled in hook
      }
    };

    const isValid = () => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < minWithdrawal || numAmount > availableBalance) {
        return false;
      }
      if (useManualEntry) {
        return phoneNumber.length >= 10;
      }
      return selectedPaymentMethod !== null;
    };

    return (
      <CustomBottomSheet
        ref={ref}
        title="Withdraw Funds"
        snapPoints={["75%"]}
        onClose={() => {
          setAmount("");
          setPhoneNumber("");
        }}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Available Balance */}
          <View className="bg-gray-100 rounded-2xl p-4 mb-6">
            <Text className="text-gray-500 font-dmsans text-sm mb-1">
              Available Balance
            </Text>
            <Text className="text-black font-dmsans-bold text-2xl">
              {formatAmount(availableBalance)}
            </Text>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-dmsans-medium mb-2">Amount</Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4">
              <Text className="text-gray-500 font-dmsans-bold text-lg mr-2">
                {config.currency.code}
              </Text>
              <BottomSheetTextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <Text className="text-gray-400 font-dmsans text-xs mt-1">
              Minimum: {formatAmount(minWithdrawal)}
            </Text>
          </View>

          {/* Payment Method Selection */}
          <View className="mb-6">
            <Text className="text-gray-700 font-dmsans-medium mb-3">
              Withdraw To
            </Text>

            {/* Saved Payment Methods */}
            {savedPaymentMethods.length > 0 && (
              <View className="gap-2 mb-3">
                {savedPaymentMethods.map((pm) => (
                  <TouchableOpacity
                    key={pm.id}
                    onPress={() => {
                      setSelectedPaymentMethod(pm);
                      setUseManualEntry(false);
                    }}
                    className={`p-4 rounded-xl border-2 flex-row items-center ${
                      selectedPaymentMethod?.id === pm.id && !useManualEntry
                        ? "border-black bg-gray-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${getProviderColor(pm.momo_provider)}20` }}
                    >
                      <CreditCard size={18} color={getProviderColor(pm.momo_provider)} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-dmsans-medium">
                        {getProviderLabel(pm.momo_provider)}
                      </Text>
                      <Text className="text-gray-500 font-dmsans text-sm">
                        {pm.momo_number}
                      </Text>
                    </View>
                    {selectedPaymentMethod?.id === pm.id && !useManualEntry && (
                      <Check size={20} color="#000" />
                    )}
                    {pm.is_default && (
                      <View className="bg-green-100 px-2 py-0.5 rounded-full mr-2">
                        <Text className="text-green-700 font-dmsans text-xs">
                          Default
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Enter Manually Option */}
            <TouchableOpacity
              onPress={() => {
                setUseManualEntry(true);
                setSelectedPaymentMethod(null);
              }}
              className={`p-4 rounded-xl border-2 flex-row items-center ${
                useManualEntry ? "border-black bg-gray-50" : "border-gray-200 bg-white"
              }`}
            >
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Plus size={18} color="#6B7280" />
              </View>
              <Text className="text-gray-700 font-dmsans-medium flex-1">
                Enter details manually
              </Text>
              {useManualEntry && <Check size={20} color="#000" />}
            </TouchableOpacity>

            {/* Add Payment Method Link */}
            {onAddPaymentMethod && (
              <TouchableOpacity onPress={onAddPaymentMethod} className="mt-3">
                <Text className="text-blue-600 font-dmsans-medium text-center">
                  Manage saved payment methods
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Manual Entry Fields */}
          {useManualEntry && (
            <View className="mb-6">
              {/* MoMo Provider Selection */}
              <Text className="text-gray-700 font-dmsans-medium mb-2">
                MoMo Provider
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {momoProviders.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setProvider(p.id)}
                    style={{ minWidth: "30%" }}
                    className={`flex-1 py-3 rounded-xl items-center border-2 ${
                      provider === p.id
                        ? "border-black bg-gray-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`font-dmsans-bold text-sm ${
                        provider === p.id ? "text-black" : "text-gray-500"
                      }`}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Phone Number Input */}
              <Text className="text-gray-700 font-dmsans-medium mb-2">
                Mobile Number
              </Text>
              <BottomSheetTextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder={config.phone.placeholder}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
                maxLength={15}
              />
            </View>
          )}

          {/* Withdraw Button */}
          <TouchableOpacity
            onPress={handleWithdraw}
            disabled={!isValid() || withdrawing}
            className={`py-4 rounded-full items-center mb-6 ${
              isValid() && !withdrawing ? "bg-black" : "bg-gray-300"
            }`}
          >
            {withdrawing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-dmsans-bold text-lg">
                Withdraw Now
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </CustomBottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    fontFamily: "DMSansBold",
    color: "#000",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: "DMSansMedium",
    color: "#000",
  },
});

WithdrawSheet.displayName = "WithdrawSheet";
