import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen({ navigation }) {
  const router = useRouter();

  /* ---------------- ANIMATION VALUES ---------------- */
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* ---------------- STATE ---------------- */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [identityType, setIdentityType] = useState("");
  const [identityImage, setIdentityImage] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});

  /* ---------------- PERMISSION + ENTRY ANIMATION ---------------- */
  useEffect(() => {
    ImagePicker.requestMediaLibraryPermissionsAsync();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ---------------- VALIDATION ---------------- */
  const validateEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const validateName = (v) => /^[A-Za-z ]+$/.test(v);
  const validatePassword = (v) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(v);

  /* ---------------- IMAGE PICKER ---------------- */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setIdentityImage(result.assets[0].uri);
    }
  };

  /* ---------------- BUTTON ANIMATION ---------------- */
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ---------------- REGISTER ---------------- */
  const handleRegister = async () => {
    animateButton();

    let e = {};

    if (!validateName(name)) e.name = "Only letters allowed";
    if (!validateEmail(email)) e.email = "Invalid email";
    if (phone.length !== 10) e.phone = "Phone must be 10 digits";
    if (!gender) e.gender = "Select gender";
    if (!validatePassword(password))
      e.password = "Min 8 chars, uppercase, lowercase, number & special char";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!identityType) e.identityType = "Select identity proof";
    if (!identityImage) e.identityImage = "Upload identity proof";

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    const newUser = {
      name,
      email,
      phone,
      gender,
      identityType,
      password,
      identityImage,
    };

    try {
      const stored = await AsyncStorage.getItem("users");
      const users = stored ? JSON.parse(stored) : [];

      if (users.find((u) => u.email === email)) {
        Alert.alert("Error", "Email already registered");
        return;
      }

      users.push(newUser);
      await AsyncStorage.setItem("users", JSON.stringify(users));

      Alert.alert("Success", "Registration Successful!", [
        {
          text: "OK",
          onPress: () =>
            navigation?.navigate
              ? navigation.navigate("TenantDashboard")
              : router.push("/TenantDashboard"),
        },
      ]);
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#1e3a8a", "#2563eb", "#3b82f6"]}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.outerContainer}>
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.title}>Create Account</Text>

            {/* Name */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={(t) =>
                  setName((t || "").replace(/[^A-Za-z ]/g, ""))
                }
              />
            </View>
            {errors.name && <Text style={styles.error}>{errors.name}</Text>}

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            {/* Phone */}
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={(t) => setPhone((t || "").replace(/[^0-9]/g, ""))}
              />
            </View>
            {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

            <View style={styles.dropdown}>
              <Picker selectedValue={gender} onValueChange={setGender}>
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            <View style={styles.dropdown}>
              <Picker
                selectedValue={identityType}
                onValueChange={setIdentityType}
              >
                <Picker.Item label="Select Identity Proof" value="" />
                <Picker.Item label="Aadhar Card" value="Aadhar" />
                <Picker.Item label="PAN Card" value="PAN" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="cloud-upload-outline" size={18} color="#1e293b" />
              <Text style={styles.uploadText}>
                {identityImage ? " Change Proof" : " Upload Identity Proof"}
              </Text>
            </TouchableOpacity>

            {identityImage && (
              <Image
                source={{ uri: identityImage }}
                style={styles.previewImage}
              />
            )}

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            {errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#2563eb" />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            {errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            )}

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity onPress={handleRegister}>
                <LinearGradient
                  colors={["#2563eb", "#1d4ed8"]}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Register</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 25,
    elevation: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
    color: "#1e3a8a",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    paddingHorizontal: 15,
    marginVertical: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 15,
  },
  dropdown: {
    backgroundColor: "#f1f5f9",
    borderRadius: 18,
    marginVertical: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
    padding: 14,
    borderRadius: 18,
    marginTop: 10,
  },
  uploadText: {
    fontWeight: "600",
    color: "#1e293b",
  },
  previewImage: {
    width: "100%",
    height: 170,
    borderRadius: 20,
    marginTop: 15,
  },
  button: {
    padding: 18,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  error: {
    color: "#dc2626",
    fontSize: 12,
    marginLeft: 5,
  },
});
