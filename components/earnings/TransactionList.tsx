import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useCountry } from "@/contexts/CountryContext";
import { getTimeAgo } from "@/lib/transformers";
import { TransactionWithDetails } from "@/types/earnings";
import { ArrowDownLeft, ArrowUpRight, Inbox } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

interface TransactionListProps {
  transactions: TransactionWithDetails[];
  loading?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  loading,
}) => {
  const { formatAmount } = useCountry();

  if (loading) {
    return (
      <View>
        <Heading size="md" className="text-black mb-4">
          Recent Transactions
        </Heading>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              <View className="flex-1">
                <View className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <View className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
              </View>
              <View className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View>
        <Heading size="md" className="text-black mb-4">
          Recent Transactions
        </Heading>
        <View className="bg-white rounded-2xl px-8 py-12 items-center justify-center border border-gray-100">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Inbox size={28} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-dmsans-bold text-lg mb-2">
            No Transactions Yet
          </Text>
          <Text className="text-gray-500 font-dmsans text-center">
            Your earnings and withdrawals will appear here once you complete jobs.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Heading size="md" className="text-black mb-4">
        Recent Transactions
      </Heading>

      {transactions.map((transaction) => {
        const isEarning = transaction.type === "earning";
        const Icon = isEarning ? ArrowDownLeft : ArrowUpRight;
        const iconColor = isEarning ? "#10B981" : "#EF4444";
        const iconBgColor = isEarning ? "#ECFDF5" : "#FEF2F2";
        const amountColor = isEarning ? "text-green-600" : "text-red-600";
        const amountPrefix = isEarning ? "+" : "-";

        return (
          <View
            key={transaction.id}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
          >
            <View className="flex-row items-center gap-3">
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: iconBgColor }}
              >
                <Icon size={22} color={iconColor} />
              </View>

              <View className="flex-1">
                <Text className="text-gray-900 font-dmsans-bold">
                  {isEarning
                    ? transaction.service_request?.title || "Job Payment"
                    : "Withdrawal"}
                </Text>
                <Text className="text-gray-500 font-dmsans text-sm">
                  {getTimeAgo(transaction.created_at)}
                </Text>
                {isEarning && transaction.platform_fee > 0 && (
                  <Text className="text-gray-400 font-dmsans text-xs">
                    Platform fee: {formatAmount(transaction.platform_fee)}
                  </Text>
                )}
              </View>

              <View className="items-end">
                <Text className={`font-dmsans-bold text-lg ${amountColor}`}>
                  {amountPrefix}{formatAmount(transaction.net_amount)}
                </Text>
                {isEarning && (
                  <Text className="text-gray-400 font-dmsans text-xs">
                    Gross: {formatAmount(transaction.amount)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
