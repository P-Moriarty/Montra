import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LeaderboardScreen() {
  const topThree = [
    { rank: 2, name: 'Sara Y.', points: '42.5k', color: '#B4B4B4', avatar: 'https://i.pravatar.cc/150?u=sara' },
    { rank: 1, name: 'Emeka O.', points: '58.2k', color: '#FFD700', avatar: 'https://i.pravatar.cc/150?u=emeka' },
    { rank: 3, name: 'John D.', points: '38.9k', color: '#CD7F32', avatar: 'https://i.pravatar.cc/150?u=john' },
  ];

  const others = [
    { rank: 4, name: 'Anita K.', points: '32.1k', avatar: 'https://i.pravatar.cc/150?u=anita' },
    { rank: 5, name: 'Tobi A.', points: '28.4k', avatar: 'https://i.pravatar.cc/150?u=tobi' },
    { rank: 6, name: 'Grace M.', points: '25.0k', avatar: 'https://i.pravatar.cc/150?u=grace' },
    { rank: 7, name: 'You', points: '24.5k', avatar: 'https://i.pravatar.cc/150?u=ifeanyi', isUser: true },
    { rank: 8, name: 'David L.', points: '22.8k', avatar: 'https://i.pravatar.cc/150?u=david' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#1F2C37]" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/10"
        >
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-white text-xl font-bold pr-10">Leaderboard</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Podium View */}
        <View className="flex-row justify-center items-end mt-12 mb-16 h-60">
           {topThree.map((user) => (
             <View key={user.rank} className="items-center mx-2">
                <View className={`rounded-full p-1 border-4 mb-2 ${user.rank === 1 ? 'w-24 h-24' : 'w-20 h-20'}`} style={{ borderColor: user.color }}>
                   <Image source={{ uri: user.avatar }} className="w-full h-full rounded-full" />
                   <View className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-[#1F2C37] items-center justify-center`} style={{ backgroundColor: user.color }}>
                      <Text className="text-[#1F2C37] font-black text-xs">{user.rank}</Text>
                   </View>
                </View>
                <Text className="text-white font-bold text-sm mb-1">{user.name}</Text>
                <Text className="text-white/50 text-[10px] uppercase font-bold tracking-widest">{user.points} pts</Text>
                
                {/* Podium pedestal */}
                <View 
                  className={`bg-white/5 w-24 rounded-t-3xl mt-4 border-t border-white/10`} 
                  style={{ height: user.rank === 1 ? 80 : user.rank === 2 ? 50 : 30 }} 
                />
             </View>
           ))}
        </View>

        {/* Rankings List */}
        <View className="bg-white/5 rounded-[48px] p-2 border border-white/10">
           {others.map((user, idx) => (
             <View 
               key={idx} 
               className={`flex-row items-center p-4 rounded-[32px] ${user.isUser ? 'bg-[#5154F4]' : ''} ${idx !== others.length - 1 ? 'mb-1' : ''}`}
             >
                <Text className={`w-8 font-black text-sm ${user.isUser ? 'text-white' : 'text-white/40'}`}>#{user.rank}</Text>
                <Image source={{ uri: user.avatar }} className="w-12 h-12 rounded-2xl mr-4" />
                <View className="flex-1">
                   <Text className={`font-bold text-base ${user.isUser ? 'text-white' : 'text-white'}`}>{user.name}</Text>
                   <Text className={`${user.isUser ? 'text-white/70' : 'text-white/40'} text-[10px] font-bold uppercase tracking-widest`}>{user.points} points</Text>
                </View>
                {user.isUser && (
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                     <Text className="text-white text-[10px] font-bold">You</Text>
                  </View>
                )}
             </View>
           ))}
        </View>
      </ScrollView>

      {/* Persistence Bar */}
      <View className="absolute bottom-10 left-6 right-6 bg-[#5154F4] p-5 rounded-[32px] shadow-2xl flex-row items-center justify-between border border-white/10">
         <View className="flex-row items-center">
            <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-4">
               <Text className="text-white font-black">7</Text>
            </View>
            <View>
               <Text className="text-white font-bold">Your Rank</Text>
               <Text className="text-white/70 text-[10px]">Top 10% of Montra Users</Text>
            </View>
         </View>
         <View className="items-end">
            <Text className="text-white font-black text-lg">24.5k</Text>
            <Text className="text-white/50 text-[10px]">POINTS</Text>
         </View>
      </View>
    </SafeAreaView>
  );
}
