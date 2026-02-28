import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import AnimatedRN, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SplashScreen from "./Splashscreen";
const { width, height } = Dimensions.get("window");

const COLORS = {
  navy: "#1A237E",
  lightPurple: "#9575CD",
  bg: "#FFFFFF",
  gray: "#636E72",
  lightGray: "#F1F2F6",
};

const AUTO_SLIDE_INTERVAL = 3000;

const DATA = [
  {
    id: "1",
    title: "Stay Smart.",
    subtitle:
      "Digitize buildings, rooms, and payments — all in one powerful platform.",
    image: require("../assets/images/step16.png"),
  },
  {
    id: "2",
    title: "Stay in Control.",
    subtitle:
      "Manage floors, rent, and expenses with real-time digital oversight.",
    image: require("../assets/images/step2.png"),
  },
  {
    id: "3",
    title: "Stay Connected.",
    subtitle: "Direct communication between owners and tenants.",
    image: require("../assets/images/step34.png"),
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [showHome, setShowHome] = useState(false); // ✅ track if HomeScreen should show
  const pagerRef = useRef(null);
  const intervalRef = useRef(null);
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000); // 2s splash
    return () => clearTimeout(timer);
  }, []);
  // Onboarding animations
  const runAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => runAnimation(), [currentPage]);

  // Auto slide
  const startAutoSlide = () => {
    stopAutoSlide();
    intervalRef.current = setInterval(() => {
      setCurrentPage((prev) => {
        const nextPage = prev < DATA.length - 1 ? prev + 1 : 0;
        pagerRef.current?.setPage(nextPage);
        return nextPage;
      });
    }, AUTO_SLIDE_INTERVAL);
  };
  const stopAutoSlide = () =>
    intervalRef.current && clearInterval(intervalRef.current);
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const handleNext = () => {
    if (currentPage < DATA.length - 1) {
      const nextPage = currentPage + 1;
      pagerRef.current?.setPage(nextPage);
      setCurrentPage(nextPage);
    }
  };
  const handleSkip = () => {
    const lastPage = DATA.length - 1;
    pagerRef.current?.setPage(lastPage);
    setCurrentPage(lastPage);
  };
  const handleTouchStart = () => stopAutoSlide();
  const handleTouchEnd = () => startAutoSlide();

  const handleGetStarted = () => setShowHome(true); // ✅ show HomeScreen

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        {showSplash ? (
          <SplashScreen />
        ) : showHome ? (
          <HomeScreen router={router} />
        ) : (
          <View style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" />

            {/* ===== Onboarding Pager ===== */}
            <PagerView
              style={{ flex: 1 }}
              initialPage={0}
              ref={pagerRef}
              onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
            >
              {DATA.map((item) => (
                <View key={item.id} style={{ flex: 1, alignItems: "center" }}>
                  <View style={{ width, height: height * 0.65 }}>
                    <Animated.Image
                      source={item.image}
                      style={{
                        width: "100%",
                        height: "100%",
                        opacity: fadeAnim,
                      }}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={["rgba(0,0,0,0.4)", "transparent", COLORS.bg]}
                      locations={[0, 0.5, 0.9]}
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                      }}
                    />
                  </View>
                  <Animated.View
                    style={{
                      paddingHorizontal: 40,
                      alignItems: "center",
                      marginTop: -60,
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 36,
                        fontWeight: "900",
                        color: COLORS.navy,
                        textAlign: "center",
                        marginBottom: 12,
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        color: COLORS.gray,
                        textAlign: "center",
                        lineHeight: 26,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  </Animated.View>
                </View>
              ))}
            </PagerView>

            {/* ===== Footer navigation ===== */}
            <View style={{ paddingHorizontal: 25, paddingBottom: 40 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 25,
                }}
              >
                {DATA.map((_, i) => {
                  const scale = currentPage === i ? 1.4 : 1;
                  return (
                    <Animated.View
                      key={i}
                      style={{
                        height: 6,
                        width: 6,
                        borderRadius: 3,
                        backgroundColor:
                          currentPage === i ? COLORS.navy : "#E0E0E0",
                        marginHorizontal: 4,
                        transform: [{ scale }],
                      }}
                    />
                  );
                })}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 60,
                }}
              >
                {currentPage === DATA.length - 1 ? (
                  <TouchableOpacity
                    style={{
                      width: "100%",
                      height: 60,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                    onPress={handleGetStarted}
                  >
                    <LinearGradient
                      colors={[COLORS.navy, COLORS.lightPurple]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 18,
                          fontWeight: "bold",
                        }}
                      >
                        Get Started
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity onPress={handleSkip}>
                      <Text
                        style={{
                          color: COLORS.gray,
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                      >
                        Skip
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleNext}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            color: COLORS.navy,
                            fontSize: 13,
                            fontWeight: "600",
                            marginRight: 4,
                          }}
                        >
                          Next
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={20}
                          color={COLORS.navy}
                        />
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/* ===== HomeScreen Code (from your second code) ===== */
function HomeScreen({ router }) {
  const line1Opacity = useSharedValue(0);
  const line2Opacity = useSharedValue(0);
  const line1Translate = useSharedValue(30);
  const line2Translate = useSharedValue(30);
  const accentHeight = useSharedValue(0);
  const heroFloat = useSharedValue(0);
  const cardOpacity = useSharedValue(0);
  const cardTranslate = useSharedValue(80);

  useEffect(() => {
    line1Opacity.value = withTiming(1, { duration: 600 });
    line1Translate.value = withTiming(0, { duration: 700 });
    line2Opacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    line2Translate.value = withDelay(300, withTiming(0, { duration: 700 }));
    accentHeight.value = withDelay(200, withTiming(70, { duration: 800 }));
    heroFloat.value = withRepeat(
      withTiming(-6, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    cardOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    cardTranslate.value = withDelay(800, withSpring(0));
  }, []);

  const line1Style = useAnimatedStyle(() => ({
    opacity: line1Opacity.value,
    transform: [{ translateX: line1Translate.value }],
  }));
  const line2Style = useAnimatedStyle(() => ({
    opacity: line2Opacity.value,
    transform: [{ translateX: line2Translate.value }],
  }));
  const accentStyle = useAnimatedStyle(() => ({ height: accentHeight.value }));
  const heroFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: heroFloat.value }],
  }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslate.value }],
  }));

  const SelectCard = ({ title, onPress, primary }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    return (
      <Pressable
        onPressIn={() => {
          scale.value = withTiming(0.96, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
          onPress();
        }}
        style={{ width: "100%" }}
      >
        <AnimatedRN.View
          style={[
            styles.selectCard,
            primary ? styles.primaryCard : styles.secondaryCard,
            animatedStyle,
          ]}
        >
          <Text
            style={[styles.selectCardTitle, primary && { color: "#FFFFFF" }]}
          >
            {title}
          </Text>
        </AnimatedRN.View>
      </Pressable>
    );
  };

  return (
    <LinearGradient
      colors={["#0B1F3A", "#3A0CA3", "#7209B7", "#F72585", "#FFB3C6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <AnimatedRN.View
        style={[
          { flex: 1.2, justifyContent: "center", paddingHorizontal: 32 },
          heroFloatStyle,
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AnimatedRN.View
            style={[
              {
                width: 5,
                backgroundColor: "#FFFFFF",
                marginRight: 20,
                borderRadius: 6,
              },
              accentStyle,
            ]}
          />
          <View>
            <AnimatedRN.Text
              style={[
                {
                  fontSize: 34,
                  fontWeight: "600",
                  color: "#F8F9FA",
                  letterSpacing: 1.5,
                },
                line1Style,
              ]}
            >
              FIND YOUR
            </AnimatedRN.Text>
            <AnimatedRN.Text
              style={[
                {
                  fontSize: 44,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  marginTop: 6,
                  letterSpacing: 2,
                },
                line2Style,
              ]}
            >
              PERFECT STAY
            </AnimatedRN.Text>
          </View>
        </View>
        <Text
          style={{
            marginTop: 24,
            fontSize: 15,
            color: "#F3E8FF",
            lineHeight: 24,
            maxWidth: "85%",
          }}
        >
          Discover curated properties with seamless experience and premium
          comfort.
        </Text>
      </AnimatedRN.View>

      <AnimatedRN.View
        style={[
          {
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.92)",
            paddingHorizontal: 30,
            paddingTop: 60,
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
          },
          cardStyle,
        ]}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
            color: "#2B2D42",
            marginBottom: 12,
          }}
        >
          GET STARTED
        </Text>
        <Text
          style={{
            textAlign: "center",
            color: "#6C757D",
            marginBottom: 35,
            fontSize: 14,
            lineHeight: 22,
          }}
        >
          List your property or explore your next home — all in one smart
          platform.
        </Text>

        <SelectCard
          title="Continue as Property Lister"
          primary
          onPress={() => router.push("/OwnerLoginScreen")}
        />
        <SelectCard
          title="Continue as Home Seeker"
          onPress={() => router.push("/LoginScreen")}
        />

        <Text
          style={{
            marginTop: 20,
            textAlign: "center",
            fontSize: 12,
            color: "#9D4EDD",
          }}
        >
          Secure • Fast • Trusted Platform
        </Text>
      </AnimatedRN.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  selectCard: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  primaryCard: { backgroundColor: "#7209B7", elevation: 8 },
  secondaryCard: {
    borderWidth: 1.5,
    borderColor: "#7209B7",
    backgroundColor: "#FFFFFF",
  },
  selectCardTitle: { fontSize: 16, fontWeight: "600", color: "#2B2D42" },
});
