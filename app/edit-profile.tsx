import { AuthInput } from '@/components/auth-input';
import { Toast } from '@/components/ui/toast';
import { Config } from '@/constants/Config';
import { useApiMutation, useApiQuery } from '@/hooks/api/use-api';
import { UpdateProfileSchema } from '@/services/api/validation';
import { ProfileService } from '@/services/modules/profile.service';
import { Feather, Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch current data to pre-fill the form
  const { data: user, isLoading: isInitialLoading } = useApiQuery(['profile'], ProfileService.getProfile);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [dob, setDob] = useState(user?.date_of_birth || '');
  const [date, setDate] = useState(user?.date_of_birth ? new Date(user.date_of_birth) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<any>(user?.gender || 'MALE');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  // Industrial-grade resilient image logic
  const imageUrl = useMemo(() => {
    const avatar = user?.profilePicture;

    if (!avatar) return 'https://i.pravatar.cc/150';

    if (avatar.startsWith('http')) return avatar;

    // 🔥 REMOVE /api/v1 completely
    const baseUrl = Config.api.baseUrl
      .replace('/api/v1', '') // <-- FIX
      .replace(/\/$/, '');    // remove trailing slash

    const cleanAvatar = avatar.startsWith('/') ? avatar : `/${avatar}`;

    return `${baseUrl}${cleanAvatar}?t=${Date.now()}`;
  }, [user?.profilePicture]);
  // console.log('FINAL IMAGE URL:', imageUrl);

  // Industrial-grade avatar upload mutation
  const uploadMutation = useApiMutation(ProfileService.uploadAvatar, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setToast({ visible: true, message: 'Profile picture updated!', type: 'success' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Upload failed';
      setToast({ visible: true, message: String(message), type: 'error' });
    }
  });

  const pickAndUploadImage = async () => {
    // Request industrial-grade permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setToast({ visible: true, message: 'Permission to access gallery is required', type: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];

      // Orchestrate high-fidelity FormData
      const formData = new FormData();
      const localUri = selectedImage.uri;
      const filename = localUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore - React Native FormData requires URI, type, and name
      formData.append('avatar', { uri: localUri, name: filename, type });

      uploadMutation.mutate(formData);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);

    // Format to YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    setDob(`${year}-${month}-${day}`);
  };

  const updateMutation = useApiMutation(ProfileService.updateProfile, {
    onSuccess: (data, variables) => {
      // Optimistically update the cache so the previous screen sees the changes immediately
      queryClient.setQueryData(['profile'], (oldData: any) => {
        return { ...oldData, ...variables };
      });
      // Force a background refetch to ensure it's synced with the server
      queryClient.refetchQueries({ queryKey: ['profile'] });
      
      setToast({ visible: true, message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update profile';
      setToast({ visible: true, message: String(message), type: 'error' });
    }
  });

  const handleUpdate = () => {
    const result = UpdateProfileSchema.safeParse({
      full_name: fullName,
      date_of_birth: dob,
      gender: gender
    });

    if (!result.success) {
      const firstError = result.error.issues[0].message;
      setToast({ visible: true, message: firstError, type: 'error' });
      return;
    }

    updateMutation.mutate({
      full_name: fullName,
      date_of_birth: dob,
      gender: gender
    });
  };

  const genders = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Other', value: 'OTHER' }
  ];

  if (isInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#E5E5F5] items-center justify-center">
        <ActivityIndicator size="large" color="#5E5CE6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
        >
          <Ionicons name="arrow-back" size={20} color="#1F2C37" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[#1F2C37] text-xl font-bold pr-10">Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Industrial-Grade Avatar Hub */}
          <View className="items-center my-8">
            <TouchableOpacity
              onPress={pickAndUploadImage}
              disabled={uploadMutation.isPending}
              className="w-32 h-32 rounded-full bg-white items-center justify-center shadow-md relative"
            >
              <View className="w-[124px] h-[124px] rounded-full overflow-hidden bg-gray-100">
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </View>

              {/* Edit Badge */}
              <View className="absolute bottom-1 right-1 w-10 h-10 bg-[#5154F4] rounded-full items-center justify-center border-4 border-white">
                <Feather name="camera" size={16} color="white" />
              </View>

              {/* Uploading Overlay */}
              {uploadMutation.isPending && (
                <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View className="space-y-6">
            {/* Full Name */}
            <View>
              <Text className="text-[#6C7278] text-sm font-bold uppercase mb-2 ml-1">Full Name</Text>
              <AuthInput
                icon="user"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Date of Birth */}
            <View className="mt-4">
              <Text className="text-[#6C7278] text-sm font-bold uppercase mb-2 ml-1">Date of Birth</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white h-16 rounded-[20px] flex-row items-center px-5 border border-gray-100 shadow-sm"
              >
                <Ionicons name="calendar-outline" size={20} color="#1F2C37" />
                <Text className="flex-1 text-[#1F2C37] text-base ml-4">
                  {dob || 'Select Date of Birth'}
                </Text>
                <Feather name="chevron-right" size={20} color="#9DA3B6" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Gender Selection */}
            <View className="mt-4">
              <Text className="text-[#6C7278] text-sm font-bold uppercase mb-2 ml-1">Gender</Text>
              <TouchableOpacity
                onPress={() => setShowGenderModal(true)}
                className="bg-white h-16 rounded-[20px] flex-row items-center px-5 border border-gray-100 shadow-sm"
              >
                <Ionicons name="transgender-outline" size={20} color="#1F2C37" />
                <Text className="flex-1 text-[#1F2C37] text-base ml-4">
                  {genders.find(g => g.value === gender)?.label || 'Select Gender'}
                </Text>
                <Feather name="chevron-down" size={20} color="#9DA3B6" />
              </TouchableOpacity>
            </View>

            {/* Update Button */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={updateMutation.isPending}
              className="mt-12 h-16 bg-[#5E5CE6] rounded-[22px] items-center justify-center shadow-lg shadow-[#5E5CE6]/40"
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px] px-8 py-10">
            <Text className="text-[#1F2C37] text-xl font-bold mb-6">Select Gender</Text>
            {genders.map((g) => (
              <TouchableOpacity
                key={g.value}
                onPress={() => {
                  setGender(g.value);
                  setShowGenderModal(false);
                }}
                className={`py-4 flex-row justify-between items-center ${gender === g.value ? 'bg-[#F0F1FF] -mx-4 px-4 rounded-2xl' : ''}`}
              >
                <Text className={`text-lg ${gender === g.value ? 'text-[#5E5CE6] font-bold' : 'text-[#1F2C37]'}`}>
                  {g.label}
                </Text>
                {gender === g.value && <Ionicons name="checkmark-circle" size={24} color="#5E5CE6" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowGenderModal(false)}
              className="mt-10 items-center"
            >
              <Text className="text-[#6C7278] font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
