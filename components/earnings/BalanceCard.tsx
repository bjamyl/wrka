import { Text } from "@/components/ui/text";
import { useCountry } from "@/contexts/CountryContext";
import { Wallet } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface BalanceCardProps {
  balance: number;
  onWithdraw: () => void;
  loading?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  onWithdraw,
  loading,
}) => {
  const { formatAmount } = useCountry();

  return (
    <View className="bg-black rounded-3xl p-6 mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Wallet size={20} color="#FFFFFF" />
          </View>
          <Text className="text-white/80 font-dmsans-medium">
            Available Balance
          </Text>
        </View>
      </View>

      <Text className="text-white text-4xl font-dmsans-bold mb-6">
        {loading ? "---" : formatAmount(balance)}
      </Text>

      <TouchableOpacity
        onPress={onWithdraw}
        disabled={loading || balance <= 0}
        className={`py-4 rounded-full items-center ${
          balance > 0 ? "bg-white" : "bg-white/30"
        }`}
      >
        <Text
          className={`font-dmsans-bold ${
            balance > 0 ? "text-black" : "text-white/50"
          }`}
        >
          Withdraw Funds
        </Text>
      </TouchableOpacity>
    </View>
  );
};
