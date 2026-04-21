import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApiQuery } from '@/hooks/api/use-api';
import { ProfileService } from '@/services/modules/profile.service';
import { Config } from '@/constants/Config';

export default function MyProfileScreen() {
  const router = useRouter();

  // Industrial-grade profile feed integration
  const { data: user, isLoading: isProfileLoading } = useApiQuery(['profile'], ProfileService.getProfile);

  const profileData = [
    { label: 'Payment ID', value: user?.pay_id || '...', hasChevron: true },
    { label: 'KYC Levels', value: user?.is_verified ? 'Verified' : 'Unverified', hasChevron: true },
    { label: 'Email', value: user?.email || '...', hasChevron: true },
    { label: 'Phone number', value: user?.phone_number || '...', hasChevron: true },
    { label: 'Gender', value: user?.gender || 'Not specified', hasChevron: true },
    { label: 'Date of birth', value: user?.date_of_birth || 'Not specified', hasChevron: true },
    { label: 'Country', value: user?.country || 'Nigeria', hasChevron: true },
    { label: 'Address', value: user?.address || 'Not specified', hasChevron: true },
  ];

  const imageUrl = useMemo(() => {
    const avatar = user?.profilePicture;

    if (!avatar) return 'https://i.pravatar.cc/150';

    if (avatar.startsWith('http')) return avatar;

    const baseUrl = Config.api.baseUrl
      .replace('/api/v1', '')
      .replace(/\/$/, '');

    const cleanAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;

    return `${baseUrl}${cleanAvatar}?t=${Date.now()}`;
  }, [user?.profilePicture]);

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold">My Profile</Text>
        <TouchableOpacity
          onPress={() => router.push('/edit-profile')}
          className="w-10 h-10 rounded-full bg-[#F0F1FF] items-center justify-center shadow-sm"
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
          <View className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </View>
          <Text className="text-[#1F2C37] text-2xl font-bold mt-4">
            {isProfileLoading ? 'Loading...' : (user?.full_name || 'User')}
          </Text>
        </View>

        {/* Data Cards */}
        <View className="space-y-3">
          {profileData.map((item, index) => (
            <TouchableOpacity
              key={index}
              disabled={!item.hasChevron}
              className="bg-white p-5 rounded-3xl flex-row items-center justify-between shadow-sm border border-gray-50 mb-3"
            >
              <Text className="text-[#6C7278] text-base font-medium">{item.label}</Text>
              <View className="flex-row items-center">
                {item.value && (
                  <Text className="text-[#1F2C37] text-base font-bold mr-2">
                    {item.value}
                  </Text>
                )}
                {item.hasChevron && (
                  <Feather name="chevron-right" size={20} color="#9DA3B6" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
