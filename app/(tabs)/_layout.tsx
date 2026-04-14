import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const primaryColor = '#5154F4';
  const inactiveColor = 'rgba(255, 255, 255, 0.6)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        // ✅ Glass container
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: 74,
          borderRadius: 42,
          borderTopWidth: 0,
          overflow: 'hidden', // 🔥 required for blur clipping
          paddingTop:20,
          paddingLeft:20,
          paddingRight:20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 15,
        },

        // ✅ Glass effect (REAL blur)
        tabBarBackground: () => (
          <BlurView
            intensity={60} // tweak: 40–80
            tint="dark"
            style={{
              flex: 1,
              borderRadius: 42,
              backgroundColor: 'rgba(255,255,255,0.05)', // subtle glass tint
            }}
          />
        ),

        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? 'px-5 py-2 rounded-full ' : ''
              }`}
              style={{ minWidth: 90 }}
            >
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={focused ? primaryColor : inactiveColor}
              />
              <Text
                style={{
                  color: focused ? primaryColor : inactiveColor,
                  fontSize: 12,
                  fontWeight: '700',
                  marginTop: 2,
                }}
              >
                Home
              </Text>
            </View>
          ),
        }}
      />

      {/* SWAP */}
      <Tabs.Screen
        name="swap"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? 'px-5 py-2 rounded-full' : ''
              }`}
              style={{ minWidth: 90 }}
            >
              <Ionicons
                name="repeat"
                size={22}
                color={focused ? primaryColor : inactiveColor}
              />
              <Text
                style={{
                  color: focused ? primaryColor : inactiveColor,
                  fontSize: 12,
                  fontWeight: '700',
                  marginTop: 2,
                }}
              >
                Swap
              </Text>
            </View>
          ),
        }}
      />

      {/* CARD */}
      <Tabs.Screen
        name="card"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? 'px-5 py-2 rounded-full' : ''
              }`}
              style={{ minWidth: 90 }}
            >
              <Ionicons
                name={focused ? 'card' : 'card-outline'}
                size={22}
                color={focused ? primaryColor : inactiveColor}
              />
              <Text
                style={{
                  color: focused ? primaryColor : inactiveColor,
                  fontSize: 12,
                  fontWeight: '700',
                  marginTop: 2,
                }}
              >
                Card
              </Text>
            </View>
          ),
        }}
      />

      {/* ACCOUNT */}
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              className={`items-center justify-center ${
                focused ? 'px-5 py-2 rounded-full' : ''
              }`}
              style={{ minWidth: 90 }}
            >
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={22}
                color={focused ? primaryColor : inactiveColor}
              />
              <Text
                style={{
                  color: focused ? primaryColor : inactiveColor,
                  fontSize: 12,
                  fontWeight: '700',
                  marginTop: 2,
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