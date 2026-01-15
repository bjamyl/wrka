import { BalanceCard } from "@/components/earnings/BalanceCard";
import { EarningsStats } from "@/components/earnings/EarningsStats";
import { TransactionList } from "@/components/earnings/TransactionList";
import { WithdrawSheet } from "@/components/earnings/WithdrawSheet";
import { CustomBottomSheetRef } from "@/components/ui/custom-bottom-sheet";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useEarnings } from "@/hooks/useEarnings";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useWithdrawal } from "@/hooks/useWithdrawal";
import { EarningsPeriod } from "@/types/earnings";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Earnings() {
  const router = useRouter();
  const [period, setPeriod] = useState<EarningsPeriod>("week");
  const withdrawSheetRef = useRef<CustomBottomSheetRef>(null);

  const { balance, stats, transactions, settings, loading, refetch } =
    useEarnings(period);
  const { withdraw, withdrawing } = useWithdrawal();
  const { paymentMethods } = usePaymentMethods();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleOpenWithdraw = useCallback(() => {
    withdrawSheetRef.current?.present();
  }, []);

  const handleWithdraw = async (request: {
    amount: number;
    momo_provider: "mtn" | "vodafone" | "airteltigo";
    momo_number: string;
  }) => {
    await withdraw(request);
  };

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
        <View className="px-6 py-4 bg-white mb-4">
          <Heading size="2xl" className="text-black font-dmsans-bold mb-1">
            Earnings
          </Heading>
          <Text className="text-gray-600 font-dmsans">
            Track your income and manage withdrawals
          </Text>
        </View>

        <View className="px-6">
          {/* Balance Card */}
          <BalanceCard
            balance={balance?.available_balance || 0}
            onWithdraw={handleOpenWithdraw}
            loading={loading}
          />

          {/* Stats with Period Tabs */}
          <EarningsStats
            stats={stats}
            period={period}
            onPeriodChange={setPeriod}
            loading={loading}
          />

          {/* Transaction History */}
          <TransactionList transactions={transactions} loading={loading} />
        </View>
      </ScrollView>

      {/* Withdrawal Bottom Sheet */}
      <WithdrawSheet
        ref={withdrawSheetRef}
        availableBalance={balance?.available_balance || 0}
        minWithdrawal={settings.min_withdrawal_amount}
        onWithdraw={handleWithdraw}
        withdrawing={withdrawing}
        savedPaymentMethods={paymentMethods}
        onAddPaymentMethod={() => {
          withdrawSheetRef.current?.dismiss();
          router.push("/payment-methods");
        }}
      />
    </SafeAreaView>
  );
}
