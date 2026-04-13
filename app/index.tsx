import React, { useRef, useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  FlatList, 
  NativeSyntheticEvent, 
  NativeScrollEvent, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Manage Your Money \nAcross Currencies.',
    image: require('../assets/images/onboarding_background.png'),
    description: 'Effortlessly handle multi-currency accounts with real-time exchange rates and deep liquidity.',
  },
  {
    id: '2',
    title: 'Security & Encryption \nFor Your Assets.',
    image: require('../assets/images/onboarding_security.png'),
    description: 'Bank-grade security protocols and end-to-end encryption to keep your financial data protected 24/7.',
  },
  {
    id: '3',
    title: 'Real-Time Insights & \nGrowth Tracking.',
    image: require('../assets/images/onboarding_growth.png'),
    description: 'Advanced analytics and holographic trend visualizations to monitor your global portfolio growth.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayTimer.current = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % SLIDES.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4000); // Change slide every 4 seconds
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const onMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    if (index !== activeIndex) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveIndex(index);
    }
  }, [activeIndex]);

  const onScrollBeginDrag = useCallback(() => {
    stopAutoPlay();
  }, [stopAutoPlay]);

  const onScrollEndDrag = useCallback(() => {
    // Optionally restart after a delay
    setTimeout(startAutoPlay, 5000);
  }, [startAutoPlay]);

  const handleNext = () => {
    stopAutoPlay();
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.replace('/signup');
    }
  };

  const handleSkip = () => {
    router.replace('/signup');
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={{ width, height }} className="bg-black">
        {/* Background Image Container */}
        <View className="absolute top-0 w-full h-[65%]">
          <Image
            source={item.image}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
        </View>

        {/* High-Resolution SVG Gradient Overlay */}
        <View className="absolute bottom-0 w-full h-[55%]">
          <Svg height="100%" width="100%">
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="black" stopOpacity="0" />
                <Stop offset="0.3" stopColor="black" stopOpacity="0.7" />
                <Stop offset="0.5" stopColor="black" stopOpacity="1" />
                <Stop offset="1" stopColor="black" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grad)" />
          </Svg>
        </View>

        {/* Text Content Container (VStack pattern) */}
        <View className="flex-1 justify-end px-12 pb-[200px]">
          <View className="items-center space-y-4">
            <Text className="text-white text-3xl font-extrabold text-center leading-[42px] tracking-tight">
              {item.title}
            </Text>
            <Text className="text-typography-400 text-lg text-center leading-6 mt-4 opacity-70">
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      
      {/* Top Header Section (Skip Button) */}
      <SafeAreaView edges={['top']} className="absolute top-0 z-50 w-full px-8 pt-4">
        <View className="flex-row justify-end">
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text className="text-[#5E5CE6] text-lg font-bold">Skip</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Main Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        snapToAlignment="start"
        snapToInterval={width}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        keyExtractor={(item) => item.id}
        bounces={false}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      />

      {/* Persistent Bottom UI (Pagination & Button) */}
      <SafeAreaView edges={['bottom']} className="absolute bottom-0 w-full px-12 pb-12">
        <View className="items-center w-full">
          {/* Pagination Indicators (HStack pattern) */}
          <View className="flex-row items-center space-x-3 mb-10">
            {SLIDES.map((_, index) => (
              <View 
                key={index}
                className={`${
                  index === activeIndex 
                    ? 'w-16 bg-[#5E5CE6]' 
                    : 'w-10 bg-white opacity-40'
                } h-[4px] rounded-full`}
              />
            ))}
          </View>

          {/* Primary Action Button */}
          <View className="w-full">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleNext}
              className="bg-[#5E5CE6] h-[68px] rounded-[24px] items-center justify-center shadow-2xl shadow-[#5E5CE6]/80"
            >
              <Text className="text-white text-xl font-extrabold tracking-tight">
                {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
