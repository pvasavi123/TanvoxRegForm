import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import React, { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Step3 from "./Step3";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import {
  Keyboard,
  KeyboardAvoidingView,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  UIManager,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OwnerRegistrationScreen() {
  const [screen, setScreen] = useState("register");
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customFacilities, setCustomFacilities] = useState([]);
  const [newFacilityText, setNewFacilityText] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [lineProgress] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  const initialForm = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    stayType: "",
    hostelType: "",
    hostelName: "",
    location: "",
    wifi: "",
    parking: "",
    lift: "",
    apartmentName: "",
    bhk: "",
    rent: "",
    tenantType: "",
    commercialName: "",
    usage: "",
    bankName: "",
    ifsc: "",
    accountNo: "",
    flatArea: "",
    bedrooms: "",
    bathrooms: "",
    cost: "",
    carParking: "",
    negotiable: "",
    documents: { property: null, identityProof: null, homePics: [] },
    floorsData: [{ rooms: [] }],
  };
  const [form, setForm] = useState(initialForm);

  const [mapRegion, setMapRegion] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const geocodeTimerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
    })();
  }, []);

  useEffect(() => {
    if (geocodeTimerRef.current) {
      clearTimeout(geocodeTimerRef.current);
      geocodeTimerRef.current = null;
    }
    const input = form.location.trim();
    if (!input) {
      setMapRegion(null);
      return;
    }
    geocodeTimerRef.current = setTimeout(async () => {
      try {
        const timeoutMs = 6000;
        if (Platform.OS === "android") {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`;
          const fetchPromise = fetch(url, { headers: { Accept: "application/json" } }).then(r => r.json());
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Geocode timeout")), timeoutMs));
          const items = await Promise.race([fetchPromise, timeoutPromise]);
          if (Array.isArray(items) && items.length > 0) {
            const { lat, lon } = items[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            if (isFinite(latitude) && isFinite(longitude)) {
              setMapRegion({
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            } else {
              setMapRegion(null);
            }
          } else {
            setMapRegion(null);
          }
        } else {
          if (locationPermission !== "granted") return;
          const geocodePromise = Location.geocodeAsync(input);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Geocode timeout")), timeoutMs));
          const result = await Promise.race([geocodePromise, timeoutPromise]);
          if (Array.isArray(result) && result.length > 0) {
            const { latitude, longitude } = result[0];
            setMapRegion({
              latitude,
              longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          } else {
            setMapRegion(null);
          }
        }
      } catch (_err) {
        setMapRegion(null);
      }
    }, 600);
    return () => {
      if (geocodeTimerRef.current) {
        clearTimeout(geocodeTimerRef.current);
        geocodeTimerRef.current = null;
      }
    };
  }, [form.location, locationPermission]);

  useEffect(() => {
    if (step === 2) {
      Animated.timing(lineProgress[0], {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else if (step === 3) {
      Animated.timing(lineProgress[1], {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, [step, lineProgress]);

  // Validation functions
  const validateName = (name) => {
    if (!name || name.length === 0) {
      return "Name is required";
    }
    // Check for numbers, emojis, and special characters
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return "Name must contain only alphabets and spaces";
    }
    if (name.trim().length <= 3) {
      return "Name must be more than 3 characters";
    }
    // Check for camel case (first letter capital, rest small, or all small)
    if (!/^[A-Z][a-z\s]*$|^[a-z\s]+$/.test(name)) {
      return "Name should start with a capital letter followed by small letters, or all small letters";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email || email.length === 0) {
      return "Email is required";
    }
    // Email must start with a letter, followed by alphanumeric, '.', '_', or '-'
    // and must end with @gmail.com, disallowing emojis and other special characters at the start
    if (!/^[a-zA-Z][a-zA-Z0-9._-]*@gmail\.com$/.test(email)) {
      return "Email must start with a letter, contain only letters, numbers, '.', '_', or '-' before '@', and end with @gmail.com";
    }
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone || phone.length === 0) {
      return "Phone number is required";
    }
    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must be exactly 10 digits";
    }
    // Phone number should not start with 1, 2, 3, 4, or 5
    if (!/^[6-9]/.test(phone)) {
      return "Phone number cannot start with 1, 2, 3, 4, or 5";
    }
    // Phone number should not be all zeros
    if (phone === "0000000000") {
      return "Phone number cannot be all zeros";
    }
    // Phone number should not accept all zeros after the first digit
    if (phone.length === 10 && phone.substring(1) === "000000000") {
      return "Phone number cannot have all zeros after the first digit";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password || password.length === 0) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/(?=.*[@$!%*?&#])/.test(password)) {
      return "Password must contain at least one special character (@$!%*?&#)";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword || confirmPassword.length === 0) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const validateStep1 = () => {
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const phoneError = validatePhone(form.phone);
    const passwordError = validatePassword(form.password);
    const confirmPasswordError = validateConfirmPassword(
      form.confirmPassword,
      form.password
    );

    return (
      !nameError &&
      !emailError &&
      !phoneError &&
      !passwordError &&
      !confirmPasswordError &&
      form.documents.identityProof
    );
  };

  // Step 2 Validation Functions
  const validatePropertyName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Property name is required";
    }
    if (name.trim().length < 3) {
      return "Property name must be at least 3 characters";
    }
    return "";
  };

  const validateLocation = (location) => {
    if (!location || location.trim().length === 0) {
      return "Location is required";
    }
    if (location.trim().length < 3) {
      return "Location must be at least 3 characters";
    }
    return "";
  };

  const validateRequired = (value, fieldName) => {
    if (!value || value === "") {
      return `${fieldName} is required`;
    }
    return "";
  };

  // const validateSqft = (sqft) => {
  //   // if (!sqft || sqft.trim().length === 0) {
  //   //   return "Square feet is required";
  //   // }
  //   if (!/^\d+$/.test(sqft)) {
  //     return "Square feet must be a number";
  //   }
  //   if (parseInt(sqft) <= 0) {
  //     return "Square feet must be greater than 0";
  //   }
  //   return "";
  // };

  const validateBankName = (bankName) => {
    if (!bankName || bankName.trim().length === 0) {
      return "Bank name is required";
    }
    if (!/^[A-Za-z\s]+$/.test(bankName)) {
      return "Bank name must contain only alphabets";
    }
    if (bankName.trim().length < 3) {
      return "Bank name must be at least 3 characters";
    }
    return "";
  };

  const validateIFSC = (ifsc) => {
    if (!ifsc || ifsc.trim().length === 0) {
      return "IFSC code is required";
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim())) {
      return "Invalid IFSC code format (e.g., SBIN0001234)";
    }
    return "";
  };

  const validateAccountNo = (accountNo) => {
    if (!accountNo || accountNo.trim().length === 0) {
      return "Account number is required";
    }
    if (!/^\d+$/.test(accountNo)) {
      return "Account number must contain only digits";
    }
    if (accountNo.length < 9 || accountNo.length > 18) {
      return "Account number must be between 9 to 18 digits";
    }
    return "";
  };

  const validateDocuments = () => {
    if (!form.documents.property) {
      return "Property document is required";
    }
    if (
      !form.documents.homePics ||
      !Array.isArray(form.documents.homePics) ||
      form.documents.homePics.length === 0
    ) {
      return "Home pictures are required";
    }
    return "";
  };

  const validateStep2 = () => {
    // Stay type must be selected
    if (!form.stayType) return false;

    let isValid = true;

    // Validate based on stay type
    if (form.stayType === "hostel") {
      if (validatePropertyName(form.hostelName)) isValid = false;
      if (validateLocation(form.location)) isValid = false;
      if (validateRequired(form.hostelType, "Hostel type")) isValid = false;
    } else if (form.stayType === "apartment") {
      if (validatePropertyName(form.apartmentName)) isValid = false;
      if (validateLocation(form.location)) isValid = false;
      if (validateRequired(form.bhk, "BHK")) isValid = false;
      if (validateRequired(form.tenantType, "Tenant type")) isValid = false;
    } else if (form.stayType === "commercial") {
      if (validatePropertyName(form.commercialName)) isValid = false;
      if (validateLocation(form.location)) isValid = false;
      if (validateRequired(form.usage, "Usage")) isValid = false;
    }

    // Validate bank details (common for all)
    // if (validateBankName(form.bankName)) isValid = false;
    // if (validateIFSC(form.ifsc)) isValid = false;
    // if (validateAccountNo(form.accountNo)) isValid = false;

    // Validate documents
    if (validateDocuments()) isValid = false;

    return isValid;
  };

  const pickDoc = async (key) => {
    const res = await DocumentPicker.getDocumentAsync({});
    if (!res.canceled) {
      const asset = res.assets && res.assets[0];
      if (asset && typeof asset.size === "number" && asset.size > 10240) {
        const newErrors = {
          ...errors,
          [`document_${key}`]: "Image must be 10KB or less",
        };
        setErrors(newErrors);
        return;
      }
      if (asset) {
        if (key === "homePics") {
          const current = Array.isArray(form.documents.homePics)
            ? form.documents.homePics
            : [];
          const updated = [...current, asset];
          setForm({
            ...form,
            documents: { ...form.documents, homePics: updated },
          });
        } else {
          setForm({
            ...form,
            documents: { ...form.documents, [key]: asset },
          });
        }
        const newErrors = { ...errors };
        delete newErrors[`document_${key}`];
        delete newErrors.documents;
        setErrors(newErrors);
      }
    }
  };

  const circleColor = (index) => {
    if (step > index) return "#28a745";
    if (step === index) return "#2b6cb0";
    return "#cbd5e0";
  };

  const validateAndShowErrors = () => {
    if (step === 2) {
      const newErrors = {};

      // Validate stay type
      const stayTypeError = validateRequired(form.stayType, "Stay type");
      if (stayTypeError) newErrors.stayType = stayTypeError;

      // Validate based on stay type
      if (form.stayType === "hostel") {
        const hostelNameError = validatePropertyName(form.hostelName);
        const locationError = validateLocation(form.location);
        const hostelTypeError = validateRequired(
          form.hostelType,
          "Hostel type"
        );
        if (hostelNameError) newErrors.hostelName = hostelNameError;
        if (locationError) newErrors.location = locationError;
        if (hostelTypeError) newErrors.hostelType = hostelTypeError;
      } else if (form.stayType === "apartment") {
        const apartmentNameError = validatePropertyName(form.apartmentName);
        const locationError = validateLocation(form.location);
        const bhkError = validateRequired(form.bhk, "BHK");
        const tenantTypeError = validateRequired(
          form.tenantType,
          "Tenant type"
        );
        if (apartmentNameError) newErrors.apartmentName = apartmentNameError;
        if (locationError) newErrors.location = locationError;
        if (bhkError) newErrors.bhk = bhkError;
        if (tenantTypeError) newErrors.tenantType = tenantTypeError;
      } else if (form.stayType === "commercial") {
        const commercialNameError = validatePropertyName(form.commercialName);
        const locationError = validateLocation(form.location);
        const usageError = validateRequired(form.usage, "Usage");
        if (commercialNameError) newErrors.commercialName = commercialNameError;
        if (locationError) newErrors.location = locationError;
        if (usageError) newErrors.usage = usageError;
      }

      // Validate bank details
      if (form.stayType) {
        // const bankNameError = validateBankName(form.bankName);
        // const ifscError = validateIFSC(form.ifsc);
        // const accountNoError = validateAccountNo(form.accountNo);
        // if (bankNameError) newErrors.bankName = bankNameError;
        // if (ifscError) newErrors.ifsc = ifscError;
        // if (accountNoError) newErrors.accountNo = accountNoError;

        // Validate documents
        if (!form.documents.property)
          newErrors.document_property = "Property document is required";
        if (
          !form.documents.homePics ||
          !Array.isArray(form.documents.homePics) ||
          form.documents.homePics.length === 0
        )
          newErrors.document_homePics = "Home pictures are required";
      }

      setErrors({ ...errors, ...newErrors });
    }
  };

  const next = () => {
    if (step === 2) {
      validateAndShowErrors();
      if (!validateStep2()) {
        return;
      }
    }
    setStep(step + 1);
  };
  const submit = () => setScreen("welcome");
  const logout = () => {
    setForm(initialForm);
    setStep(1);
    setScreen("register");
  };

  if (screen === "welcome") {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#97a0ac" }}
        edges={["left", "right", "bottom"]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: "white", fontSize: 24, marginBottom: 20 }}>
              Welcome!
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#225a93",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                width: "50%",
              }}
              onPress={logout}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["left", "right", "bottom"]}>
      <StatusBar hidden />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.page}>
            <View style={styles.card}>
              <Text style={styles.title}>
                {
                  ["Registration Form", "Stay & Documents", "Floor Details"][
                    step - 1
                  ]
                }
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 120 }}
              >
                {/* STEP INDICATOR */}
                <View style={styles.stepWrap}>
                  {[1, 2, 3].map((i) => (
                    <React.Fragment key={i}>
                      <View style={styles.stepItem}>
                        <View
                          style={[
                            styles.circle,
                            { backgroundColor: circleColor(i) },
                          ]}
                        >
                          {step > i ? (
                            <FontAwesome name="check" size={14} color="#fff" />
                          ) : i === 1 ? (
                            <FontAwesome name="user" size={14} color="#fff" />
                          ) : i === 2 ? (
                            <FontAwesome name="home" size={14} color="#fff" />
                          ) : (
                            <FontAwesome
                              name="building"
                              size={14}
                              color="#fff"
                            />
                          )}
                        </View>
                        <Text style={styles.stepLabel}>
                          {i === 1
                            ? "Registration"
                            : i === 2
                            ? "Stay"
                            : "Floor"}
                        </Text>
                      </View>
                      {i < 3 && (
                        <View style={styles.line}>
                          <Animated.View
                            style={[
                              styles.lineOverlay,
                              {
                                transform: [
                                  {
                                    scaleX:
                                      i === 1
                                        ? lineProgress[0]
                                        : lineProgress[1],
                                  },
                                ],
                              },
                            ]}
                          />
                        </View>
                      )}
                    </React.Fragment>
                  ))}
                </View>

                {/* ---------- STEP 1 ---------- */}
                {step === 1 && (
                  <>
                    <Text style={styles.label}>Name</Text>
                    <View style={styles.inputContainer}>
                      <FontAwesome
                        name="user"
                        size={20}
                        color="#007bff" // Vibrant blue color
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          errors.name && styles.inputError,
                          { flex: 1 },
                        ]}
                        placeholder="Enter Name"
                        placeholderTextColor="gray"
                        value={form.name}
                        onChangeText={(v) => {
                          const filtered = v.replace(/[^A-Za-z\s]/g, "");
                          setForm({ ...form, name: filtered });
                          setErrors({ ...errors, name: validateName(filtered) });
                        }}
                      />
                    </View>
                    {errors.name ? (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    ) : null}

                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                      <FontAwesome
                        name="envelope"
                        size={20}
                        color="#007bff" // Vibrant blue color
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          errors.email && styles.inputError,
                          { flex: 1 },
                        ]}
                        placeholder="Enter Email"
                        placeholderTextColor="gray"
                        value={form.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={(v) => {
                          setForm({ ...form, email: v });
                          setErrors({ ...errors, email: validateEmail(v) });
                        }}
                      />
                    </View>
                    {errors.email ? (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    ) : null}
                    <Text style={styles.label}>Phone</Text>
                    <View style={styles.inputContainer}>
                      <FontAwesome
                        name="phone"
                        size={20}
                        color="#007bff" // Vibrant blue color
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          errors.phone && styles.inputError,
                          { flex: 1 },
                        ]}
                        placeholder="Enter Phone"
                        placeholderTextColor="gray"
                        value={form.phone}
                        keyboardType="numeric"
                        maxLength={10}
                        onChangeText={(v) => {
                          setForm({ ...form, phone: v });
                          setErrors({ ...errors, phone: validatePhone(v) });
                        }}
                      />
                    </View>
                    {errors.phone ? (
                      <Text style={styles.errorText}>{errors.phone}</Text>
                    ) : null}

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                      <FontAwesome
                        name="lock"
                        size={20}
                        color="#007bff" // Vibrant blue color
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          errors.password && styles.inputError,
                          { flex: 1 },
                        ]}
                        placeholder="Enter Password"
                        placeholderTextColor="gray"
                        value={form.password}
                        secureTextEntry={!showPassword}
                        onChangeText={(v) => {
                          setForm({ ...form, password: v });
                          setErrors({
                            ...errors,
                            password: validatePassword(v),
                          });
                        }}
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesome
                          name={showPassword ? "eye" : "eye-slash"}
                          size={20}
                          color="#007bff" // Vibrant blue color
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password ? (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    ) : null}

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputContainer}>
                      <FontAwesome
                        name="lock"
                        size={20}
                        color="#007bff" // Vibrant blue color
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={[
                          styles.input,
                          errors.confirmPassword && styles.inputError,
                          { flex: 1 },
                        ]}
                        placeholder="Confirm Password"
                        placeholderTextColor="gray"
                        value={form.confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        onChangeText={(v) => {
                          setForm({ ...form, confirmPassword: v });
                          setErrors({
                            ...errors,
                            confirmPassword: validateConfirmPassword(
                              v,
                              form.password
                            ),
                          });
                        }}
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <FontAwesome
                          name={showConfirmPassword ? "eye" : "eye-slash"}
                          size={20}
                          color="#007bff" // Vibrant blue color
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword ? (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    ) : null}

                    <Text style={styles.label}>Identity Proof</Text>
                    <TouchableOpacity
                      style={[
                        styles.btn,
                        {
                          backgroundColor: form.documents.identityProof
                            ? "#28a745"
                            : "#225a93",
                        },
                        errors.document_identityProof && {
                          borderColor: "#dc2626",
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => pickDoc("identityProof")}
                    >
                      <Text style={{ color: "#fff" }}>
                        {form.documents.identityProof ? "Uploaded ✓" : "Upload Identity Proof"}
                      </Text>
                    </TouchableOpacity>
                    {errors.document_identityProof ? (
                      <Text style={styles.errorText}>
                        {errors.document_identityProof}
                      </Text>
                    ) : null}
                  </>
                )}

                {/* ---------- STEP 2 ---------- */}
                {step === 2 && (
                  <>
                    <Text style={styles.sectionTitle}>Stay & Documents</Text>

                    <Text style={styles.label}>Stay Type</Text>
                    <Picker
                      selectedValue={form.stayType}
                      onValueChange={(v) => {
                        setForm({ ...form, stayType: v });
                        setErrors({
                          ...errors,
                          stayType: validateRequired(v, "Stay type"),
                        });
                      }}
                      style={[
                        styles.picker,
                        errors.stayType && styles.inputError,
                      ]}
                    >
                      <Picker.Item label="Select Stay Type" value="" />
                      <Picker.Item label="Hostel" value="hostel" />
                      <Picker.Item label="Apartment" value="apartment" />
                      <Picker.Item label="Commercial" value="commercial" />
                    </Picker>
                    {errors.stayType ? (
                      <Text style={styles.errorText}>{errors.stayType}</Text>
                    ) : null}

                    {/* HOSTEL */}
                    {form.stayType === "hostel" && (
                      <>
                        <Text style={styles.label}>Hostel Name</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            styles.inputContainerStep2,
                          ]}
                        >
                          <TextInput
                            style={[
                              styles.input,
                              errors.hostelName && styles.inputError,
                              { flex: 1 },
                            ]}
                            placeholder="Enter Hostel Name"
                            placeholderTextColor="gray"
                            value={form.hostelName}
                            onChangeText={(v) => {
                              setForm({ ...form, hostelName: v });
                              setErrors({
                                ...errors,
                                hostelName: validatePropertyName(v),
                              });
                            }}
                          />
                        </View>
                        {errors.hostelName ? (
                          <Text style={styles.errorText}>
                            {errors.hostelName}
                          </Text>
                        ) : null}

                        <Text style={styles.label}>Location</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            styles.inputContainerStep2,
                          ]}
                        >
                          <TextInput
                            style={[
                              styles.input,
                              errors.location && styles.inputError,
                              { flex: 1 },
                            ]}
                            placeholder="Enter Location"
                            placeholderTextColor="gray"
                            value={form.location}
                            onChangeText={(v) => {
                              setForm({ ...form, location: v });
                              setErrors({
                                ...errors,
                                location: validateLocation(v),
                              });
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => {
                              if (form.location.trim()) {
                                Linking.openURL(
                                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    form.location.trim()
                                  )}`
                                );
                              }
                            }}
                            style={{ padding: 8 }}
                          >
                            <MaterialIcons name="map" size={24} color="gray" />
                          </TouchableOpacity>
                        </View>
                        {errors.location ? (
                          <Text style={styles.errorText}>
                            {errors.location}
                          </Text>
                        ) : null}

                        {mapRegion && (
                          <MapView style={styles.map} region={mapRegion}>
                            <Marker coordinate={mapRegion} />
                          </MapView>
                        )}

                        <Text style={styles.label}>Hostel Type</Text>
                        <Picker
                          selectedValue={form.hostelType}
                          onValueChange={(v) => {
                            setForm({ ...form, hostelType: v });
                            setErrors({
                              ...errors,
                              hostelType: validateRequired(v, "Hostel type"),
                            });
                          }}
                          style={[
                            styles.picker,
                            errors.hostelType && styles.inputError,
                          ]}
                        >
                          <Picker.Item label="Select Type" value="" />
                          <Picker.Item label="Boys" value="boys" />
                          <Picker.Item label="Girls" value="girls" />
                          <Picker.Item label="Co-Living" value="coliving" />
                        </Picker>
                        {errors.hostelType ? (
                          <Text style={styles.errorText}>
                            {errors.hostelType}
                          </Text>
                        ) : null}

                        <Text style={styles.label}>Facilities</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                        >
                          <View
                            style={[
                              styles.inputContainer,
                              { flex: 1, marginBottom: 0 },
                            ]}
                          >
                            <TextInput
                              style={[styles.input, { flex: 1 }]}
                              placeholder="Add new facility"
                              placeholderTextColor="gray"
                              value={newFacilityText}
                              onChangeText={setNewFacilityText}
                            />
                          </View>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                              if (newFacilityText.trim()) {
                                setCustomFacilities([
                                  ...customFacilities,
                                  newFacilityText.trim(),
                                ]);
                                setNewFacilityText("");
                              }
                            }}
                          >
                            <Text style={styles.addButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            marginBottom: 10,
                          }}
                        >
                          {customFacilities.map((facility, index) => (
                            <View key={index} style={styles.facilityTag}>
                              <Text style={styles.facilityText}>
                                {facility}
                              </Text>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => {
                                  setCustomFacilities(
                                    customFacilities.filter(
                                      (_, i) => i !== index
                                    )
                                  );
                                }}
                              >
                                <Text style={styles.removeButtonText}>-</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            marginBottom: 10,
                          }}
                        >
                          {["Water", "Parking", "Lift", "AC", "Non AC"].map(
                            (label) => {
                              const isSelected = selectedFacilities.includes(label);
                              return (
                                <TouchableOpacity
                                  key={label}
                                  style={[styles.facilityTag, isSelected && styles.presetSelected]}
                                  onPress={() => {
                                    const exists = selectedFacilities.includes(label);
                                    setSelectedFacilities(
                                      exists
                                        ? selectedFacilities.filter((f) => f !== label)
                                        : [...selectedFacilities, label]
                                    );
                                  }}
                                >
                                  <Text style={[styles.facilityText, isSelected && { color: "#22C55E" }]}>{label}</Text>
                                </TouchableOpacity>
                              );
                            }
                          )}
                        </View>
                      </>
                    )}

                    {/* APARTMENT */}
                    {form.stayType === "apartment" && (
                      <>
                        <Text style={styles.label}>Apartment Name</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            styles.inputContainerStep2,
                          ]}
                        >
                          <TextInput
                            style={[
                              styles.input,
                              errors.apartmentName && styles.inputError,
                              { flex: 1 },
                            ]}
                            placeholder="Enter Apartment Name"
                            placeholderTextColor="gray"
                            value={form.apartmentName}
                            onChangeText={(v) => {
                              setForm({ ...form, apartmentName: v });
                              setErrors({
                                ...errors,
                                apartmentName: validatePropertyName(v),
                              });
                            }}
                          />
                        </View>
                        {errors.apartmentName ? (
                          <Text style={styles.errorText}>
                            {errors.apartmentName}
                          </Text>
                        ) : null}

    
                        <Text style={styles.label}>Location</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            styles.inputContainerStep2,
                          ]}
                        >
                          <TextInput
                            style={[
                              styles.input,
                              errors.location && styles.inputError,
                              { flex: 1 },
                            ]}
                            placeholder="Enter Location"
                            placeholderTextColor="gray"
                            value={form.location}
                            onChangeText={(v) => {
                              setForm({ ...form, location: v });
                              setErrors({
                                ...errors,
                                location: validateLocation(v),
                              });
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => {
                              if (form.location.trim()) {
                                Linking.openURL(
                                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    form.location.trim()
                                  )}`
                                );
                              }
                            }}
                            style={{ padding: 8 }}
                          >
                            <MaterialIcons name="map" size={24} color="gray" />
                          </TouchableOpacity>
                        </View>
                        {errors.location ? (
                          <Text style={styles.errorText}>
                            {errors.location}
                          </Text>
                        ) : null}

                        {mapRegion && (
                          <MapView style={styles.map} region={mapRegion}>
                            <Marker coordinate={mapRegion} />
                          </MapView>
                        )}

                        <Text style={styles.label}>BHK</Text>
                        <Picker
                          selectedValue={form.bhk}
                          onValueChange={(v) => {
                            setForm({ ...form, bhk: v });
                            setErrors({
                              ...errors,
                              bhk: validateRequired(v, "BHK"),
                            });
                          }}
                          style={[
                            styles.picker,
                            errors.bhk && styles.inputError,
                          ]}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="1 BHK" value="1" />
                          <Picker.Item label="2 BHK" value="2" />
                          <Picker.Item label="3 BHK" value="3" />
                        </Picker>
                        {errors.bhk ? (
                          <Text style={styles.errorText}>{errors.bhk}</Text>
                        ) : null}

                        <Text style={styles.label}>Tenant Type</Text>
                        <Picker
                          selectedValue={form.tenantType}
                          onValueChange={(v) => {
                            setForm({ ...form, tenantType: v });
                            setErrors({
                              ...errors,
                              tenantType: validateRequired(v, "Tenant type"),
                            });
                          }}
                          style={[
                            styles.picker,
                            errors.tenantType && styles.inputError,
                          ]}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="Family" value="family" />
                          <Picker.Item label="Bachelors" value="bachelors" />
                        </Picker>
                        {errors.tenantType ? (
                          <Text style={styles.errorText}>
                            {errors.tenantType}
                          </Text>
                        ) : null}

                        <Text style={styles.label}>Facilities</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                        >
                          <View
                            style={[
                              styles.inputContainer,
                              { flex: 1, marginBottom: 0 },
                            ]}
                          >
                            <TextInput
                              style={[styles.input, { flex: 1 }]}
                              placeholder="Add new facility"
                              placeholderTextColor="gray"
                              value={newFacilityText}
                              onChangeText={setNewFacilityText}
                            />
                          </View>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                              if (newFacilityText.trim()) {
                                setCustomFacilities([
                                  ...customFacilities,
                                  newFacilityText.trim(),
                                ]);
                                setNewFacilityText("");
                              }
                            }}
                          >
                            <Text style={styles.addButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            marginBottom: 10,
                          }}
                        >
                          {customFacilities.map((facility, index) => (
                            <View key={index} style={styles.facilityTag}>
                              <Text style={styles.facilityText}>
                                {facility}
                              </Text>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => {
                                  setCustomFacilities(
                                    customFacilities.filter(
                                      (_, i) => i !== index
                                    )
                                  );
                                }}
                              >
                                <Text style={styles.removeButtonText}>-</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            marginBottom: 10,
                          }}
                        >
                          {["Water", "Parking", "Lift", "AC", "Non AC"].map(
                            (label) => {
                              const isSelected = selectedFacilities.includes(label);
                              return (
                                <TouchableOpacity
                                  key={label}
                                  style={[styles.facilityTag, isSelected && styles.presetSelected]}
                                  onPress={() => {
                                    const exists = selectedFacilities.includes(label);
                                    setSelectedFacilities(
                                      exists
                                        ? selectedFacilities.filter((f) => f !== label)
                                        : [...selectedFacilities, label]
                                    );
                                  }}
                                >
                                  <Text style={[styles.facilityText, isSelected && { color: "#22C55E" }]}>{label}</Text>
                                </TouchableOpacity>
                              );
                            }
                          )}
                        </View>
                      </>
                    )}

                    {/* COMMERCIAL */}
                    {form.stayType === "commercial" && (
                      <>
                        <Text style={styles.label}>Property Name</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            styles.inputContainerStep2,
                          ]}
                        >
                          <TextInput
                            style={[
                              styles.input,
                              errors.commercialName && styles.inputError,
                              { flex: 1 },
                            ]}
                            placeholder="Enter Property Name"
                            placeholderTextColor="gray"
                            value={form.commercialName}
                            onChangeText={(v) => {
                              setForm({ ...form, commercialName: v });
                              setErrors({
                                ...errors,
                                commercialName: validatePropertyName(v),
                              });
                            }}
                          />
                        </View>
                        {errors.commercialName ? (
                          <Text style={styles.errorText}>
                            {errors.commercialName}
                          </Text>
                        ) : null}

                        <Text style={styles.label}>Location</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            styles.inputContainerStep2,
                          ]}
                        >
                          <TextInput
                            style={[
                              styles.input,
                              errors.location && styles.inputError,
                              { flex: 1 },
                            ]}
                            placeholder="Enter Location"
                            placeholderTextColor="gray"
                            value={form.location}
                            onChangeText={(v) => {
                              setForm({ ...form, location: v });
                              setErrors({
                                ...errors,
                                location: validateLocation(v),
                              });
                            }}
                          />
                          <TouchableOpacity
                            onPress={() => {
                              if (form.location.trim()) {
                                Linking.openURL(
                                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    form.location.trim()
                                  )}`
                                );
                              }
                            }}
                            style={{ padding: 8 }}
                          >
                            <MaterialIcons name="map" size={24} color="gray" />
                          </TouchableOpacity>
                        </View>
                        {errors.location ? (
                          <Text style={styles.errorText}>
                            {errors.location}
                          </Text>
                        ) : null}

                        {mapRegion && (
                          <MapView style={styles.map} region={mapRegion}>
                            <Marker coordinate={mapRegion} />
                          </MapView>
                        )}

                        

                        <Text style={styles.label}>Usage</Text>
                        <Picker
                          selectedValue={form.usage}
                          onValueChange={(v) => {
                            setForm({ ...form, usage: v });
                            setErrors({
                              ...errors,
                              usage: validateRequired(v, "Usage"),
                            });
                          }}
                          style={[
                            styles.picker,
                            errors.usage && styles.inputError,
                          ]}
                        >
                          <Picker.Item label="Select" value="" />
                          <Picker.Item label="Lease" value="Lease" />
                          <Picker.Item label="Rent" value="rent" />
                        </Picker>
                        {errors.usage ? (
                          <Text style={styles.errorText}>{errors.usage}</Text>
                        ) : null}

                        <Text style={styles.label}>Facilities</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                        >
                          <View
                            style={[
                              styles.inputContainer,
                              { flex: 1, marginBottom: 0 },
                            ]}
                          >
                            <TextInput
                              style={[styles.input, { flex: 1 }]}
                              placeholder="Add new facility"
                              placeholderTextColor="gray"
                              value={newFacilityText}
                              onChangeText={setNewFacilityText}
                            />
                          </View>
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                              if (newFacilityText.trim()) {
                                setCustomFacilities([
                                  ...customFacilities,
                                  newFacilityText.trim(),
                                ]);
                                setNewFacilityText("");
                              }
                            }}
                          >
                            <Text style={styles.addButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            marginBottom: 10,
                          }}
                        >
                          {customFacilities.map((facility, index) => (
                            <View key={index} style={styles.facilityTag}>
                              <Text style={styles.facilityText}>
                                {facility}
                              </Text>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => {
                                  setCustomFacilities(
                                    customFacilities.filter(
                                      (_, i) => i !== index
                                    )
                                  );
                                }}
                              >
                                <Text style={styles.removeButtonText}>-</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            marginBottom: 10,
                          }}
                        >
                          {["Water", "Parking", "Lift", "AC", "Non AC"].map(
                            (label) => {
                              const isSelected = selectedFacilities.includes(label);
                              return (
                                <TouchableOpacity
                                  key={label}
                                  style={[styles.facilityTag, isSelected && styles.presetSelected]}
                                  onPress={() => {
                                    const exists = selectedFacilities.includes(label);
                                    setSelectedFacilities(
                                      exists
                                        ? selectedFacilities.filter((f) => f !== label)
                                        : [...selectedFacilities, label]
                                    );
                                  }}
                                >
                                  <Text style={[styles.facilityText, isSelected && { color: "#22C55E" }]}>{label}</Text>
                                </TouchableOpacity>
                              );
                            }
                          )}
                        </View>
                      </>
                    )}

                    {/* BANK DETAILS FOR ALL */}
                    {form.stayType !== "" && (
                      <>
                        <Text style={styles.sectionTitle}>Bank Details</Text>
                        <TextInput
                          placeholder="Bank Name"
                          style={[
                            styles.input,
                            errors.bankName && styles.inputError,
                          ]}
                          value={form.bankName}
                          onChangeText={(v) => {
                            setForm({ ...form, bankName: v });
                            setErrors({
                              ...errors,
                              bankName: validateBankName(v),
                            });
                          }}
                        />
                        {errors.bankName ? (
                          <Text style={styles.errorText}>
                            {errors.bankName}
                          </Text>
                        ) : null}

                        <TextInput
                          placeholder="IFSC"
                          style={[
                            styles.input,
                            errors.ifsc && styles.inputError,
                          ]}
                          value={form.ifsc}
                          autoCapitalize="characters"
                          maxLength={11}
                          onChangeText={(v) => {
                            setForm({ ...form, ifsc: v.toUpperCase() });
                            setErrors({ ...errors, ifsc: validateIFSC(v) });
                          }}
                        />
                        {errors.ifsc ? (
                          <Text style={styles.errorText}>{errors.ifsc}</Text>
                        ) : null}

                        <TextInput
                          placeholder="Account Number"
                          style={[
                            styles.input,
                            errors.accountNo && styles.inputError,
                          ]}
                          value={form.accountNo}
                          keyboardType="numeric"
                          maxLength={18}
                          onChangeText={(v) => {
                            setForm({ ...form, accountNo: v });
                            setErrors({
                              ...errors,
                              accountNo: validateAccountNo(v),
                            });
                          }}
                        />
                        {errors.accountNo ? (
                          <Text style={styles.errorText}>
                            {errors.accountNo}
                          </Text>
                        ) : null}
                      </>
                    )}

                    {/* DOCUMENTS */}
                    {form.stayType !== "" && (
                      <>
                        <Text style={styles.sectionTitle}>Documents</Text>
                        {/* Property document (single) */}
                        <View style={{ marginVertical: 5 }}>
                          <Text style={styles.label}>Property Document</Text>
                          <TouchableOpacity
                            style={[
                              styles.btn,
                              {
                                backgroundColor: form.documents.property
                                  ? "#28a745"
                                  : "#225a93",
                              },
                              errors.document_property && {
                                borderColor: "#dc2626",
                                borderWidth: 2,
                              },
                            ]}
                            onPress={() => pickDoc("property")}
                          >
                            <Text style={{ color: "#fff" }}>
                              {form.documents.property ? "Uploaded ✓" : "Upload"}
                            </Text>
                          </TouchableOpacity>
                          {errors.document_property ? (
                            <Text style={styles.errorText}>
                              {errors.document_property}
                            </Text>
                          ) : null}
                        </View>

                        {/* Home pictures (multiple) */}
                        <View style={{ marginVertical: 5 }}>
                          <Text style={styles.label}>
                            {form.stayType === "hostel"
                              ? "Hostel Images"
                              : form.stayType === "apartment"
                              ? "Apartment Images"
                              : "Commercial Images"}
                          </Text>
                          <TouchableOpacity
                            style={[
                              styles.btn,
                              {
                                backgroundColor:
                                  Array.isArray(form.documents.homePics) &&
                                  form.documents.homePics.length > 0
                                    ? "#28a745"
                                    : "#225a93",
                              },
                              errors.document_homePics && {
                                borderColor: "#dc2626",
                                borderWidth: 2,
                              },
                            ]}
                            onPress={() => pickDoc("homePics")}
                          >
                            <Text style={{ color: "#fff" }}>
                              {Array.isArray(form.documents.homePics) &&
                              form.documents.homePics.length > 0
                                ? `Uploaded ${form.documents.homePics.length} ✓`
                                : "Add Image"}
                            </Text>
                          </TouchableOpacity>
                          {errors.document_homePics ? (
                            <Text style={styles.errorText}>
                              {errors.document_homePics}
                            </Text>
                          ) : null}
                          {Array.isArray(form.documents.homePics) &&
                            form.documents.homePics.length > 0 && (
                              <View
                                style={{
                                  flexDirection: "row",
                                  flexWrap: "wrap",
                                  marginTop: 8,
                                }}
                              >
                                {form.documents.homePics.map((img, idx) => (
                                  <View
                                    key={idx}
                                    style={{
                                      marginRight: 8,
                                      marginBottom: 8,
                                      position: "relative",
                                    }}
                                  >
                                    <Image
                                      source={{ uri: img.uri }}
                                      style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 6,
                                        borderWidth: 1,
                                        borderColor: "#cbd5e0",
                                      }}
                                    />
                                    <TouchableOpacity
                                      onPress={() => {
                                        const current = Array.isArray(
                                          form.documents.homePics
                                        )
                                          ? form.documents.homePics
                                          : [];
                                        const updated = current.filter(
                                          (_, i) => i !== idx
                                        );
                                        const newErrors = { ...errors };
                                        if (updated.length === 0) {
                                          newErrors.document_homePics =
                                            "Home pictures are required";
                                        } else {
                                          delete newErrors.document_homePics;
                                        }
                                        setForm({
                                          ...form,
                                          documents: {
                                            ...form.documents,
                                            homePics: updated,
                                          },
                                        });
                                        setErrors(newErrors);
                                      }}
                                      style={{
                                        position: "absolute",
                                        top: -6,
                                        right: -6,
                                        backgroundColor: "#dc2626",
                                        borderRadius: 10,
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                      }}
                                    >
                                      <Text style={{ color: "#fff" }}>x</Text>
                                    </TouchableOpacity>
                                  </View>
                                ))}
                              </View>
                            )}
                        </View>
                        {/* <View style={{ marginTop: 8, marginBottom: 4 }}>
                          <TouchableOpacity
                            style={[styles.btn, { backgroundColor: "#2F80ED" }]}
                            onPress={() => {
                              const q = (form.location || "").trim();
                              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || "near me")}`;
                              Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
                            }}
                          >
                            <Text style={{ color: "#fff" }}>Open in Google Maps</Text>
                          </TouchableOpacity>
                        </View> */}
                      </>
                    )}
                  </>
                )}

                {/* ---------- STEP 3 ---------- */}
                {step === 3 && <Step3 form={form} />}
              </ScrollView>

              {/* BUTTONS */}
              <View style={styles.actionBar}>
                {step > 1 && (
                  <TouchableOpacity
                    style={[styles.btn, { flex: 1, marginRight: 8 }]}
                    onPress={() => setStep(step - 1)}
                  >
                    <Text style={{ color: "#fff" }}>Back</Text>
                  </TouchableOpacity>
                )}
                {step < 3 ? (
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      { flex: 1 },
                      ((step === 1 && !validateStep1()) ||
                        (step === 2 && !validateStep2())) &&
                        styles.btnDisabled,
                    ]}
                    onPress={next}
                    disabled={
                      (step === 1 && !validateStep1()) ||
                      (step === 2 && !validateStep2())
                    }
                  >
                    <Text style={{ color: "#fff" }}>Next</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.btn, { flex: 1 }]}
                    onPress={submit}
                  >
                    <Text style={{ color: "#fff" }}>Submit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-start", // Reverted to flex-start to allow paddingTop
    alignItems: "stretch",
    paddingVertical: 10,
    paddingTop: 50, // Set padding to push content down
  },
  card: {
    width: "100%",
    height: "100%",
    maxWidth: 720,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 12, // Added border radius
    paddingTop: 10,
    paddingHorizontal: 30, // Increased horizontal padding
    paddingBottom: 20,
    marginVertical: 20, // Added vertical margin
    marginHorizontal: 15, // Added horizontal margin
    elevation: 6, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1a3c5d",
  },
  input: {
    color: "black",
    fontSize: 16,
    paddingVertical: 12, // Increased vertical padding for taller text boxes
  },
  inputError: { borderColor: "#dc2626", borderWidth: 2 },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginBottom: 10,
    marginTop: -3,
  },
  btnDisabled: { backgroundColor: "#94a3b8", opacity: 0.6 },
  picker: {
    borderWidth: 1,
    borderColor: "#cbd5e0",
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    marginBottom: 10,
    color: "#0f172a",
  },
  btn: {
    backgroundColor: "#0c498a",
    padding: 14,
    alignItems: "center",
    borderRadius: 8,
    marginTop: 0,
  },
  //  walker: {
  //   position: "absolute",
  //   top: -2, // Adjust as needed
  //   left: 10, // Adjust as needed
  //   zIndex: 1,
  // },
  actionBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  stepWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  stepItem: { alignItems: "center" },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  stepLabel: { marginTop: 4, fontSize: 12, color: "#0f172a" },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: 5,
    marginTop: 6,
    backgroundColor: "#cbd5e0",
    position: "relative",
  },
  lineOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#28a745",
    transform: [{ scaleX: 0 }],
  },

  label: { fontWeight: "bold", marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  floorBtn: {
    backgroundColor: "#225a93",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 5,
  },
  roomBtn: {
    backgroundColor: "#444444",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 5,
  },
  sharingWrap: { marginTop: 5, flexDirection: "row", flexWrap: "wrap" },
  sharingBtn: {
    backgroundColor: "#555",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 3,
  },
  addFloorBtn: {
    marginTop: 20,
    backgroundColor: "#444",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addRoomBtn: {
    backgroundColor: "#2bb08c",
    padding: 10,
    borderRadius: 20,
    marginTop: 5,
    alignItems: "center",
  },
  oval: {
    backgroundColor: "#555",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    margin: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: "white", // Changed to black background
    borderColor: "black", // Changed to black border
    marginBottom: 10,
  },
  inputContainerStep2: {
    borderColor: "#a0aec0", // Light gray border for step 2 inputs
  },
  inputIcon: {
    marginRight: 10, // Add some space between icon and text input
  },
  passwordToggle: {
    padding: 5,
  },
  addButton: {
    backgroundColor: "#28a745", // Green color for add button
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  facilityTag: {
    flexDirection: "row",
    backgroundColor: "#f0f4f7ff", // Blue background for facility tags
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  facilityText: {
    color: "#0a0a0aff",
    marginRight: 5,
  },
  removeButton: {
    // backgroundColor: "#dc3545", // Red color for remove button - removed background
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#0f0e0eff", // Changed text color to red
    fontSize: 14,
    fontWeight: "bold",
  },
  presetSelected: {
    backgroundColor: "#22C55E22",
    borderWidth: 1,
    borderColor: "#22C55E"
  },
  map: {
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
  },
});
