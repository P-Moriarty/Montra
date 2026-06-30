import { useApiQuery } from '@/hooks/api/use-api';
import { Config } from "@/constants/Config";
import { ProfileService } from '@/services/modules/profile.service';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

export default function MyProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const { data: user, isLoading: isProfileLoading } = useApiQuery(['profile'], ProfileService.getProfile);

  console.log("user", JSON.stringify(user, null, 2))

  const displayTier = user?.tier
    ? `Tier ${user.tier.replace('tier', '')}`
    : '...';

  const profileData = [
    { label: 'Payment ID', value: user?.pay_id || '...', hasChevron: true },
    { label: 'Tier', value: displayTier, hasChevron: true },
    { label: 'Email', value: user?.email || '...', hasChevron: true },
    { label: 'Phone number', value: user?.phone_number || '...', hasChevron: true },
    { label: 'Gender', value: user?.gender || 'Not specified', hasChevron: true },
    // { label: 'Date of birth', value: user?.date_of_birth || 'Not specified', hasChevron: true },
    { label: 'Country', value: user?.country || 'Nigeria', hasChevron: true },
  ];

  const imageUrl = useMemo(() => {
    const avatar = user?.profilePicture;

    if (!avatar) return "https://i.pravatar.cc/150";
    if (avatar.startsWith("http")) return avatar;

    const baseUrl = Config.api.baseUrl
      .replace("/api/v1", "")
      .replace(/\/$/, "");

    const cleanAvatar = avatar.startsWith("/") ? avatar : `/${avatar}`;

    return `${baseUrl}${cleanAvatar}?t=${Date.now()}`;
  }, [user?.profilePicture]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
          style={{ backgroundColor: colors.surface }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold" style={{ color: colors.text }}>My Profile</Text>
        <TouchableOpacity
          onPress={() => router.push('/account/edit-profile')}
          className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
          style={{ backgroundColor: colors.iconBg }}
        >
          <Feather name="edit-3" size={18} color="#5E5CE6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Summary */}
        <View className="items-center mt-6 mb-10">
          <View className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-gray-100 items-center justify-center">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%", borderRadius: 50 }}
              contentFit="cover"
            />
          </View>
          <Text className="text-2xl font-bold mt-4" style={{ color: colors.text }}>
            {isProfileLoading ? 'Loading...' : (user?.full_name || 'User')}
          </Text>
        </View>

        {/* Data Cards */}
        <View className="space-y-3">
          {profileData.map((item, index) => (
            <TouchableOpacity
              key={index}
              disabled={!item.hasChevron}
              className="p-5 rounded-3xl flex-row items-center justify-between shadow-sm border mb-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.cardBorder }}
            >
              <Text className="text-base font-medium" style={{ color: colors.textTertiary }}>{item.label}</Text>
              <View className="flex-row items-center">
                {item.value && (
                  <Text className="text-base font-bold mr-2" style={{ color: colors.text }}>
                    {item.value}
                  </Text>
                )}
                {item.hasChevron && (
                  <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
