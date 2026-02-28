import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StatusBar, StyleSheet, Text } from "react-native";

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowScale, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 0.9,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 },
      ),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeOut }}>
      <LinearGradient
        colors={[
          "#a645e7", // Purple
          "#42001b", // Reddish Purple
          "#ec5e5e", // White blend
          "#2e4bcc", // Green
        ]}
        locations={[0, 0.4, 0.7, 1]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />

        {/* Glow Circle */}
        <Animated.View
          style={[
            styles.glow,
            {
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <MaterialCommunityIcons
            name="office-building"
            size={110}
            color="#FFFFFF"
          />
        </Animated.View>

        {/* App Name */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: textOpacity,
            },
          ]}
        >
          StaySmart
        </Animated.Text>

        <Text style={styles.subtitle}>Smart Property Management</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  title: {
    marginTop: 25,
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1,
  },
});
