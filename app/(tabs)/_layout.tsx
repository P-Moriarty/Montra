import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function TabLayout() {
  const primaryColor = '#5154F4'; // Brand blue
  const inactiveColor = 'rgba(255, 255, 255, 0.6)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#333333',
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: 74,
          borderRadius: 42,
          borderTopWidth: 0,
          paddingBottom: 0,
          // Add a uniform top margin to all tab icons
          paddingTop: 20,
          paddingLeft: 20,
          paddingRight: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center ${focused ? 'bg-[#E5E5F5] px-5 py-2 rounded-full' : ''}`}
              style={{ minWidth: 90 }}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={focused ? primaryColor : inactiveColor}
              />
              <Text
                style={{
                  color: focused ? primaryColor : inactiveColor,
                  fontSize: 12,
                  fontWeight: '700',
                  marginTop: 2,
                  padding: -1,
                }}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Swap',
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center ${focused ? 'bg-[#E5E5F5] px-5 py-2 rounded-full' : ''}`}
              style={{ minWidth: 90 }}
            >
              <Ionicons
                name={"repeat"}
                size={22}
                color={focused ? primaryColor : inactiveColor}
              />
              <Text
                style={{
                  color: focused ? primaryColor : inactiveColor,
                  fontSize: 12,
                  fontWeight: '700',
                  marginTop: 2
                }}
              >
                Swap
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="card"
        options={{
          title: 'Card',
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center ${focused ? 'bg-[#E5E5F5] px-5 py-2 rounded-full' : ''}`}
              style={{ minWidth: 90 }}
            >
              <Ionicons
                name={focused ? "card" : "card-outline"}
                size={22}
                color={focused ? primaryColor : inactiveColor}
              />
              <Text
                style={{
                  color: focused ? primaryColor : inactiveColor,
                  fontSize: 12,
                  fontWeight: '700',
                  marginTop: 2
                }}
              >
                Card
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center ${focused ? 'bg-[#E5E5F5] px-5 py-2 rounded-full' : ''}`}
              style={{ minWidth: 90 }}
            >
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={focused ? primaryColor : inactiveColor}
              />
              <Text
                style={{
                  color: focused ? primaryColor : inactiveColor,
                  fontSize: 12,
                  fontWeight: '700',
                  marginTop: 2
                }}
              >
                Account
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
