import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useApiQuery, useApiMutation } from "@/hooks/api/use-api";
import { SavingsService } from "@/services/modules/savings.service";
import { Toast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/context/ThemeContext";

export default function GoalDetailsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const { data: historyData, isLoading: isLoadingHistory } = useApiQuery(
    ["savingsHistory", id],
    () => SavingsService.getGoalHistory(id as string),
  );

  const history = useMemo(() => {
    const raw =
      historyData?.history ||
      historyData?.data?.history ||
      historyData?.data ||
      historyData;
    return Array.isArray(raw) ? raw : [];
  }, [historyData]);

  const { data: goalsData } = useApiQuery(["savingsGoals"], () =>
    SavingsService.getGoals(),
  );

  const goal = useMemo(() => {
    const raw =
      goalsData?.goals ||
      goalsData?.data?.goals ||
      goalsData?.data ||
      goalsData;
    const goalsArray = Array.isArray(raw) ? raw : [];
    return goalsArray.find((g: any) => g.id === id);
  }, [goalsData, id]);

  const withdrawMutation = useApiMutation(
    (payload: any) => SavingsService.withdrawFromGoal(id as string, payload),
    {
      onSuccess: () => {
        setToast({
          visible: true,
          message: "Outward successful!",
          type: "success",
        });
        setIsWithdrawModalVisible(false);
        setWithdrawAmount("");
        queryClient.invalidateQueries({ queryKey: ["savingsHistory", id] });
        queryClient.invalidateQueries({ queryKey: ["savingsGoals"] });
      },
      onError: (error: any) => {
        setToast({
          visible: true,
          message: error.response?.data?.message || "Failed to withdraw funds",
          type: "error",
        });
      },
    },
  );

  const breakMutation = useApiMutation(
    () => SavingsService.breakGoal(id as string),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["savingsGoals"] });
        setToast({
          visible: true,
          message: "Savings goal liquidated successfully!",
          type: "success",
        });
        setTimeout(() => router.replace("/savings"), 2000);
      },
      onError: (error: any) => {
        setToast({
          visible: true,
          message: error.response?.data?.message || "Failed to break goal",
          type: "error",
        });
      },
    },
  );

  if (!goal) return null;

  const progress = (goal.saved_amount / goal.target_amount) * 100;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold pr-10" style={{ color: colors.text }}>
          Goal Details
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Main Goal Card */}
        <View className="p-8 rounded-[40px] mt-6 shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}>
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-indigo-50 rounded-3xl items-center justify-center mb-4">
              <Ionicons name="sparkles" size={40} color={colors.primary} />
            </View>
            <Text className="text-2xl font-extrabold mb-1" style={{ color: colors.text }}>
              {goal.name}
            </Text>
            <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>
              {goal.description}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="font-bold text-xs uppercase tracking-widest" style={{ color: colors.textSecondary }}>
              Progress
            </Text>
            <Text className="font-bold text-xs" style={{ color: colors.primary }}>
              {progress.toFixed(1)}%
            </Text>
          </View>

          <View className="w-full h-4 rounded-full overflow-hidden mb-8" style={{ backgroundColor: colors.chevronBg, borderColor: colors.cardBorder, borderWidth: 1 }}>
            <View
              className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: colors.primary }}
            />
          </View>

          <View className="flex-row justify-between items-center p-6 rounded-3xl" style={{ backgroundColor: colors.surfaceSecondary }}>
            <View>
              <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.textSecondary }}>
                Saved
              </Text>
              <Text className="text-xl font-black" style={{ color: colors.text }}>
                ₦{Number(goal.saved_amount).toLocaleString()}
              </Text>
            </View>
            <View className="w-px h-10" style={{ backgroundColor: colors.cardBorder }} />
            <View className="items-end">
              <Text className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: colors.textSecondary }}>
                Target
              </Text>
              <Text className="text-xl font-black" style={{ color: colors.text }}>
                ₦{Number(goal.target_amount).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mt-6">
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/savings/fund",
                params: {
                  id: goal.id,
                  name: goal.name,
                  saved: goal.saved_amount,
                  target: goal.target_amount,
                },
              })
            }
            className="flex-1 p-5 rounded-[28px] items-center" style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold">Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsWithdrawModalVisible(true)}
            className="flex-1 p-5 rounded-[28px] items-center shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.primary + '40', borderWidth: 1 }}
          >
            <Text className="font-bold" style={{ color: colors.primary }}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => breakMutation.mutate(undefined)}
          className="mt-4 p-5 rounded-[28px] items-center shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.errorLight, borderWidth: 1 }}
        >
          <Text className="font-bold" style={{ color: colors.error }}>Break Goal (Liquidate)</Text>
        </TouchableOpacity>

        {/* History */}
        <View className="mt-10 mb-10">
          <Text className="text-lg font-bold mb-6" style={{ color: colors.text }}>
            Recent Activities
          </Text>

          {isLoadingHistory ? (
            <ActivityIndicator color={colors.primary} />
          ) : history?.length === 0 ? (
            <View className="items-center py-10">
              <Text className="italic" style={{ color: colors.textSecondary }}>No activities yet</Text>
            </View>
          ) : (
            history?.map((item: any) => (
              <View
                key={item.id}
                className="p-5 rounded-3xl flex-row items-center mb-3 shadow-sm" style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 }}
              >
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: item.type === "FUND" ? colors.successLight : colors.errorLight }}
                >
                  <Feather
                    name={
                      item.type === "FUND"
                        ? "arrow-down-left"
                        : "arrow-up-right"
                    }
                    size={18}
                    color={item.type === "FUND" ? colors.success : colors.error}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-sm mb-0.5" style={{ color: colors.text }}>
                    {item.type === "FUND" ? "Goal Funded" : "Outward"}
                  </Text>
                  <Text className="text-[10px]" style={{ color: colors.textSecondary }}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  className="font-bold text-sm"
                  style={{ color: item.type === "FUND" ? colors.success : colors.error }}
                >
                  {item.type === "FUND" ? "+" : "-"}₦
                  {Number(item.amount).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />

      {/* Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWithdrawModalVisible}
        onRequestClose={() => setIsWithdrawModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsWithdrawModalVisible(false)}
            className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="rounded-t-[40px] p-8 pb-12" style={{ backgroundColor: colors.surface }}
            >
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-xl font-black" style={{ color: colors.text }}>
                  Withdraw Funds
                </Text>
                <TouchableOpacity
                  onPress={() => setIsWithdrawModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text className="text-sm mb-6 leading-6" style={{ color: colors.textSecondary }}>
                How much would you like to withdraw from{" "}
                <Text className="font-bold" style={{ color: colors.text }}>
                  {goal?.name || "this goal"}
                </Text>
                ?
              </Text>

              <View className="rounded-3xl p-6 mb-10" style={{ backgroundColor: colors.primary + '15', borderColor: colors.primary + '30', borderWidth: 1 }}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>
                    Available to withdraw
                  </Text>
                  <Text className="text-sm font-black" style={{ color: colors.primary }}>
                    ₦{Number(goal?.saved_amount || 0).toLocaleString()}
                  </Text>
                </View>
                <View className="h-[72px] rounded-2xl px-5 flex-row items-center" style={{ backgroundColor: colors.surface, borderColor: colors.primary + '40', borderWidth: 1 }}>
                  <Text className="text-2xl font-black mr-2" style={{ color: colors.text }}>
                    ₦
                  </Text>
                  <TextInput
                    className="flex-1 text-2xl font-black"
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    autoFocus
                    style={{ color: colors.text }}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  const amount = parseFloat(withdrawAmount.replace(/,/g, ""));
                  if (isNaN(amount) || amount <= 0) {
                    setToast({
                      visible: true,
                      message: "Please enter a valid amount",
                      type: "error",
                    });
                    return;
                  }
                  if (amount > Number(goal?.saved_amount || 0)) {
                    setToast({
                      visible: true,
                      message: "Insufficient funds in vault",
                      type: "error",
                    });
                    return;
                  }
                  withdrawMutation.mutate({ amount });
                }}
                disabled={withdrawMutation.isPending || !withdrawAmount}
                className="py-5 rounded-[28px]"
                style={{ backgroundColor: withdrawMutation.isPending ? colors.primary + 'B3' : colors.primary }}
              >
                <Text className="text-white text-center text-lg font-bold">
                  {withdrawMutation.isPending
                    ? "Processing..."
                    : "Confirm Outward"}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
