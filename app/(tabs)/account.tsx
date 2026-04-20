import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Href } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/context/AuthContext';

export default function AccountScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleCopy = async () => {
    await Clipboard.setStringAsync('3749266383');
    alert('Account number copied to clipboard!');
  };

  const handleLogout = async () => {
    await signOut();
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
        { label: 'My Profile', icon: 'person-outline', route: '/my-profile' },
        { label: 'Transaction History', icon: 'time-outline', route: '/transaction-history' },
        { label: 'Verification Status', icon: 'shield-checkmark-outline', badge: 'Tier 1', route: '/verification-status' },
      ]
    },
    {
      title: 'Security',
      items: [
        { label: 'Security Hub', icon: 'lock-closed-outline', route: '/security' },
        { label: 'Privacy Policy', icon: 'document-text-outline' },
      ]
    },
    {
      title: 'Others',
      items: [
        { label: 'Refer & Earn', icon: 'gift-outline', color: '#5154F4', route: '/rewards/refer' },
        { label: 'Help & Support', icon: 'headset-outline' },
        { label: 'Log out', icon: 'log-out-outline', color: '#EF4444' },
      ]
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#E5E5F5]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Text className="text-[#1F2C37] text-2xl font-black">Account</Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
          <Ionicons name="settings-outline" size={20} color="#1F2C37" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Account Details Card (Engineering Cockpit Style) */}
        <View className="mt-6 mb-10">
          <View className="bg-[#1F2C37] p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
            
            <View className="flex-row justify-between items-center mb-8">
               <View>
                 <Text className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Bank Name</Text>
                 <Text className="text-white font-bold text-base">Young Money Mfb Ltd</Text>
               </View>
               <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center">
                 <MaterialCommunityIcons name="bank-outline" size={24} color="white" />
               </View>
            </View>

            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Account Number</Text>
                <Text className="text-white text-3xl font-black tracking-tight">3749266383</Text>
              </View>
              <TouchableOpacity 
                onPress={handleCopy}
                className="bg-white/10 p-3 rounded-xl border border-white/10"
              >
                 <Ionicons name="copy-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Grouped Menu */}
        {sections.map((section, idx) => (
          <View key={idx} className="mb-8">
            <Text className="text-[#9DA3B6] text-xs font-bold uppercase tracking-widest ml-4 mb-4">{section.title}</Text>
            <View className="bg-white/60 rounded-[40px] p-2 border border-white/40">
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
                    <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                      <Ionicons name={item.icon as any} size={20} color={item.color || '#1F2C37'} />
                    </View>
                    <Text className={`text-base font-bold ${item.color ? `text-[${item.color}]` : 'text-[#1F2C37]'}`}>{item.label}</Text>
                  </View>
                  <View className="flex-row items-center">
                    {item.badge && (
                      <View className="bg-[#5154F4]/10 px-3 py-1 rounded-full mr-2">
                         <Text className="text-[#5154F4] text-[10px] font-bold">{item.badge}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={18} color="#9DA3B6" />
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
