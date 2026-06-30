import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from '@/components/ui/toast';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApiQuery } from '@/hooks/api/use-api';
import { ProfileService } from '@/services/modules/profile.service';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function AccountScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { signOut } = useAuth();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const { data: user, isLoading: isProfileLoading } = useApiQuery(['profile'], ProfileService.getProfile);

  const handleLogout = async () => {
    setToast({ visible: true, message: 'Log out successful!', type: 'success' });
    setTimeout(async () => {
      await signOut();
    }, 1500);
  };

  interface MenuItem {
    label: string;
    icon: string;
    route?: string;
    color?: string;
    badge?: string;
  }

  interface Section {
    title: string;
    items: MenuItem[];
  }

  const sections: Section[] = [
    {
      title: 'Account Settings',
      items: [
        { label: 'My Profile', icon: 'person-outline', route: '/account/my-profile' },
        { label: 'Transaction History', icon: 'time-outline', route: '/transaction/transaction-history' },
        { 
          label: 'Verification Status', 
          icon: 'shield-checkmark-outline', 
          badge: isProfileLoading ? '...' : (user?.is_verified ? 'Verified' : 'Unverified'), 
          route: '/account/verification-status' 
        },
      ]
    },
    {
      title: 'Security',
      items: [
        { label: 'Security Hub', icon: 'lock-closed-outline', route: '/account/security' },
        { label: 'Privacy Policy', icon: 'document-text-outline' },
      ]
    },
    {
      title: 'Appearance',
      items: [
        { label: 'Dark Mode', icon: isDark ? 'moon' : 'sunny-outline', color: colors.text },
      ]
    },
    {
      title: 'Others',
      items: [
        { label: 'Refer & Earn', icon: 'gift-outline', color: colors.primary, route: '/rewards/refer' },
        { label: 'Help & Support', icon: 'headset-outline' },
        { label: 'Log out', icon: 'log-out-outline', color: colors.error },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-2xl font-black" style={{ color: colors.text }}>Account</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: colors.surface }}>
          <Ionicons name="settings-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >

        {/* Grouped Menu */}
        {sections.map((section, idx) => (
          <View key={idx} className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-widest ml-4 mb-4" style={{ color: colors.textSecondary }}>{section.title}</Text>
            <View className="rounded-[40px] p-2" style={{ backgroundColor: colors.surfaceSecondary, borderColor: colors.border }}>
              {section.items.map((item, iIdx) => (
                <TouchableOpacity 
                  key={iIdx} 
                  onPress={() => {
                    if (item.label === 'Log out') {
                      handleLogout();
                    } else if (item.route) {
                      router.push(item.route as any);
                    }
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-[32px] ${iIdx !== section.items.length - 1 ? 'mb-1' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-2xl items-center justify-center mr-4 shadow-sm" style={{ backgroundColor: colors.surface }}>
                      <Ionicons name={item.icon as any} size={20} color={item.color || colors.text} />
                    </View>
                    <Text className="text-base font-bold" style={{ color: item.color || colors.text }}>{item.label}</Text>
                  </View>
                    <View className="flex-row items-center">
                      {item.badge && (
                        <View className="px-3 py-1 rounded-full mr-2" style={{ backgroundColor: colors.primary + '1A' }}>
                           <Text className="text-[10px] font-bold" style={{ color: colors.primary }}>{item.badge}</Text>
                        </View>
                      )}
                      {item.label === 'Dark Mode' ? (
                        <Switch
                          value={isDark}
                          onValueChange={toggleTheme}
                          trackColor={{ true: colors.primary, false: colors.switchTrackOff }}
                          thumbColor="white"
                        />
                      ) : (
                        <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                      )}
                    </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
