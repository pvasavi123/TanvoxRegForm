import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Step3 from "./Step3";

import {
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
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
  const [activeFloor, setActiveFloor] = useState(null); // which floor is expanded
  const [activeRoom, setActiveRoom] = useState(null); // which room is expanded

  // Validation functions
  const validateName = (name) => {
    if (!name || name.length === 0) {
      return "Name is required";
    }
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return "Name must contain only alphabets";
    }
    if (name.trim().length <= 3) {
      return "Name must be more than 3 characters";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email || email.length === 0) {
      return "Email is required";
    }
    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      return "Email must end with @gmail.com";
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
      form.password,
    );

    return (
      !nameError &&
      !emailError &&
      !phoneError &&
      !passwordError &&
      !confirmPasswordError
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

  const validateSqft = (sqft) => {
    if (!sqft || sqft.trim().length === 0) {
      return "Square feet is required";
    }
    if (!/^\d+$/.test(sqft)) {
      return "Square feet must be a number";
    }
    if (parseInt(sqft) <= 0) {
      return "Square feet must be greater than 0";
    }
    return "";
  };

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
    if (!form.documents.identityProof) {
      return "Identity proof is required";
    }
    if (!form.documents.homePics) {
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
      if (validateSqft(form.sqft)) isValid = false;
      if (validateRequired(form.usage, "Usage")) isValid = false;
    }

    // Validate bank details (common for all)
    if (validateBankName(form.bankName)) isValid = false;
    if (validateIFSC(form.ifsc)) isValid = false;
    if (validateAccountNo(form.accountNo)) isValid = false;

    // Validate documents
    if (validateDocuments()) isValid = false;

    return isValid;
  };

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
    hostelName: "",
    location: "",
    hostelType: "",
    wifi: false,
    parking: false,
    food: false,
    lift: false,

    apartmentName: "",
    bhk: "",
    tenantType: "",

    commercialName: "",
    sqft: "",
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
    documents: { property: null, identityProof: null, homePics: null },
    bankName: "",
    ifsc: "",
    accountNo: "",
    floorsData: [{ rooms: [] }],
  };

  const [form, setForm] = useState(initialForm);

  const pickDoc = async (key) => {
    const res = await DocumentPicker.getDocumentAsync({});
    if (!res.canceled) {
      setForm({
        ...form,
        documents: { ...form.documents, [key]: res.assets[0] },
      });
      // Clear document errors when a document is uploaded
      const newErrors = { ...errors };
      delete newErrors[`document_${key}`];
      delete newErrors.documents;
      setErrors(newErrors);
    }
  };

  const addFloor = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setForm({ ...form, floorsData: [...form.floorsData, { rooms: [] }] });
  };

  const addRoom = (fIndex) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updatedFloors = [...form.floorsData];
    const floorNumber = fIndex + 1;
    const roomNumber =
      floorNumber * 100 + (updatedFloors[fIndex].rooms.length + 1);
    updatedFloors[fIndex].rooms.push({ number: roomNumber, sharing: "" });
    setForm({ ...form, floorsData: updatedFloors });
  };

  const setSharing = (fIndex, rIndex, value) => {
    const updatedFloors = [...form.floorsData];
    updatedFloors[fIndex].rooms[rIndex].sharing = value;
    setForm({ ...form, floorsData: updatedFloors });
  };
  const toggleFacility = (key) => {
    setForm({ ...form, [key]: !form[key] });
  };
  const toggleFloor = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveFloor(activeFloor === index ? null : index);
    setActiveRoom(null);
  };

  const toggleRoom = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveRoom(activeRoom === index ? null : index);
  };

  const circleColor = (index) => {
    if (step > index) return "#28a745";
    if (step === index) return "#2b6cb0";
    return "#cbd5e0";
  };

  const lineColor = (index) => (step > index ? "#28a745" : "#cbd5e0");

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
          "Hostel type",
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
          "Tenant type",
        );
        if (apartmentNameError) newErrors.apartmentName = apartmentNameError;
        if (locationError) newErrors.location = locationError;
        if (bhkError) newErrors.bhk = bhkError;
        if (tenantTypeError) newErrors.tenantType = tenantTypeError;
      } else if (form.stayType === "commercial") {
        const commercialNameError = validatePropertyName(form.commercialName);
        const locationError = validateLocation(form.location);
        const sqftError = validateSqft(form.sqft);
        const usageError = validateRequired(form.usage, "Usage");
        if (commercialNameError) newErrors.commercialName = commercialNameError;
        if (locationError) newErrors.location = locationError;
        if (sqftError) newErrors.sqft = sqftError;
        if (usageError) newErrors.usage = usageError;
      }

      // Validate bank details
      if (form.stayType) {
        const bankNameError = validateBankName(form.bankName);
        const ifscError = validateIFSC(form.ifsc);
        const accountNoError = validateAccountNo(form.accountNo);
        if (bankNameError) newErrors.bankName = bankNameError;
        if (ifscError) newErrors.ifsc = ifscError;
        if (accountNoError) newErrors.accountNo = accountNoError;

        // Validate documents
        if (!form.documents.property)
          newErrors.document_property = "Property document is required";
        if (!form.documents.identityProof)
          newErrors.document_identityProof = "Identity proof is required";
        if (!form.documents.homePics)
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#97a0ac" }}>
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
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={20}
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
                          <Text style={styles.circleText}>{i}</Text>
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
                        <View
                          style={[
                            styles.line,
                            { backgroundColor: lineColor(i) },
                          ]}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>

                {/* ---------- STEP 1 ---------- */}
                {step === 1 && (
                  <>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                      style={[styles.input, errors.name && styles.inputError]}
                      placeholder="Enter Name"
                      value={form.name}
                      onChangeText={(v) => {
                        setForm({ ...form, name: v });
                        setErrors({ ...errors, name: validateName(v) });
                      }}
                    />
                    {errors.name ? (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    ) : null}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder="Enter Email"
                      value={form.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={(v) => {
                        setForm({ ...form, email: v });
                        setErrors({ ...errors, email: validateEmail(v) });
                      }}
                    />
                    {errors.email ? (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    ) : null}
                    <Text style={styles.label}>Phone</Text>
                    <TextInput
                      style={[styles.input, errors.phone && styles.inputError]}
                      placeholder="Enter Phone"
                      value={form.phone}
                      keyboardType="numeric"
                      maxLength={10}
                      onChangeText={(v) => {
                        setForm({ ...form, phone: v });
                        setErrors({ ...errors, phone: validatePhone(v) });
                      }}
                    />
                    {errors.phone ? (
                      <Text style={styles.errorText}>{errors.phone}</Text>
                    ) : null}

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.password && styles.inputError,
                      ]}
                      placeholder="Enter Password"
                      value={form.password}
                      secureTextEntry
                      onChangeText={(v) => {
                        setForm({ ...form, password: v });
                        setErrors({ ...errors, password: validatePassword(v) });
                      }}
                    />
                    {errors.password ? (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    ) : null}

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.confirmPassword && styles.inputError,
                      ]}
                      placeholder="Confirm Password"
                      value={form.confirmPassword}
                      secureTextEntry
                      onChangeText={(v) => {
                        setForm({ ...form, confirmPassword: v });
                        setErrors({
                          ...errors,
                          confirmPassword: validateConfirmPassword(
                            v,
                            form.password,
                          ),
                        });
                      }}
                    />
                    {errors.confirmPassword ? (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
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
                        <TextInput
                          style={[
                            styles.input,
                            errors.hostelName && styles.inputError,
                          ]}
                          value={form.hostelName}
                          onChangeText={(v) => {
                            setForm({ ...form, hostelName: v });
                            setErrors({
                              ...errors,
                              hostelName: validatePropertyName(v),
                            });
                          }}
                        />
                        {errors.hostelName ? (
                          <Text style={styles.errorText}>
                            {errors.hostelName}
                          </Text>
                        ) : null}

                        <Text style={styles.label}>Location</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.location && styles.inputError,
                          ]}
                          value={form.location}
                          onChangeText={(v) => {
                            setForm({ ...form, location: v });
                            setErrors({
                              ...errors,
                              location: validateLocation(v),
                            });
                          }}
                        />
                        {errors.location ? (
                          <Text style={styles.errorText}>
                            {errors.location}
                          </Text>
                        ) : null}

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
                          style={{ flexDirection: "row", flexWrap: "wrap" }}
                        >
                          {["wifi", "parking", "food", "lift"].map((k) => (
                            <TouchableOpacity
                              key={k}
                              style={[
                                styles.oval,
                                form[k] && { backgroundColor: "#28a745" },
                              ]}
                              onPress={() => toggleFacility(k)}
                            >
                              <Text style={{ color: "#fff" }}>
                                {k.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}

                    {/* APARTMENT */}
                    {form.stayType === "apartment" && (
                      <>
                        <Text style={styles.label}>Apartment Name</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.apartmentName && styles.inputError,
                          ]}
                          value={form.apartmentName}
                          onChangeText={(v) => {
                            setForm({ ...form, apartmentName: v });
                            setErrors({
                              ...errors,
                              apartmentName: validatePropertyName(v),
                            });
                          }}
                        />
                        {errors.apartmentName ? (
                          <Text style={styles.errorText}>
                            {errors.apartmentName}
                          </Text>
                        ) : null}

                        <Text style={styles.label}>Location</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.location && styles.inputError,
                          ]}
                          value={form.location}
                          onChangeText={(v) => {
                            setForm({ ...form, location: v });
                            setErrors({
                              ...errors,
                              location: validateLocation(v),
                            });
                          }}
                        />
                        {errors.location ? (
                          <Text style={styles.errorText}>
                            {errors.location}
                          </Text>
                        ) : null}

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
                          style={{ flexDirection: "row", flexWrap: "wrap" }}
                        >
                          {["wifi", "parking", "food", "lift"].map((k) => (
                            <TouchableOpacity
                              key={k}
                              style={[
                                styles.oval,
                                form[k] && { backgroundColor: "#28a745" },
                              ]}
                              onPress={() => toggleFacility(k)}
                            >
                              <Text style={{ color: "#fff" }}>
                                {k.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}

                    {/* COMMERCIAL */}
                    {form.stayType === "commercial" && (
                      <>
                        <Text style={styles.label}>Property Name</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.commercialName && styles.inputError,
                          ]}
                          value={form.commercialName}
                          onChangeText={(v) => {
                            setForm({ ...form, commercialName: v });
                            setErrors({
                              ...errors,
                              commercialName: validatePropertyName(v),
                            });
                          }}
                        />
                        {errors.commercialName ? (
                          <Text style={styles.errorText}>
                            {errors.commercialName}
                          </Text>
                        ) : null}

                        <Text style={styles.label}>Location</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.location && styles.inputError,
                          ]}
                          value={form.location}
                          onChangeText={(v) => {
                            setForm({ ...form, location: v });
                            setErrors({
                              ...errors,
                              location: validateLocation(v),
                            });
                          }}
                        />
                        {errors.location ? (
                          <Text style={styles.errorText}>
                            {errors.location}
                          </Text>
                        ) : null}

                        <Text style={styles.label}>Square Feet</Text>
                        <TextInput
                          style={[
                            styles.input,
                            errors.sqft && styles.inputError,
                          ]}
                          value={form.sqft}
                          keyboardType="numeric"
                          onChangeText={(v) => {
                            setForm({ ...form, sqft: v });
                            setErrors({ ...errors, sqft: validateSqft(v) });
                          }}
                        />
                        {errors.sqft ? (
                          <Text style={styles.errorText}>{errors.sqft}</Text>
                        ) : null}

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
                          <Picker.Item label="Office" value="office" />
                          <Picker.Item label="Rent" value="rent" />
                        </Picker>
                        {errors.usage ? (
                          <Text style={styles.errorText}>{errors.usage}</Text>
                        ) : null}

                        <Text style={styles.label}>Facilities</Text>
                        <View
                          style={{ flexDirection: "row", flexWrap: "wrap" }}
                        >
                          {["wifi", "parking", "food", "lift"].map((k) => (
                            <TouchableOpacity
                              key={k}
                              style={[
                                styles.oval,
                                form[k] && { backgroundColor: "#28a745" },
                              ]}
                              onPress={() => toggleFacility(k)}
                            >
                              <Text style={{ color: "#fff" }}>
                                {k.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
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
                        {["property", "identityProof", "homePics"].map(
                          (key) => (
                            <View key={key} style={{ marginVertical: 5 }}>
                              <Text style={styles.label}>
                                {key === "property"
                                  ? "Property Document"
                                  : key === "identityProof"
                                    ? "Identity Proof"
                                    : "Home Pictures"}
                              </Text>
                              <TouchableOpacity
                                style={[
                                  styles.btn,
                                  {
                                    backgroundColor: form.documents[key]
                                      ? "#28a745"
                                      : "#225a93",
                                  },
                                  errors[`document_${key}`] && {
                                    borderColor: "#dc2626",
                                    borderWidth: 2,
                                  },
                                ]}
                                onPress={() => pickDoc(key)}
                              >
                                <Text style={{ color: "#fff" }}>
                                  {form.documents[key]
                                    ? "Uploaded ✓"
                                    : "Upload"}
                                </Text>
                              </TouchableOpacity>
                              {errors[`document_${key}`] ? (
                                <Text style={styles.errorText}>
                                  {errors[`document_${key}`]}
                                </Text>
                              ) : null}
                            </View>
                          ),
                        )}
                      </>
                    )}
                  </>
                )}

                {/* ---------- STEP 3 ---------- */}
                {step === 3 && (
                  <Step3
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                    addFloor={addFloor}
                    addRoom={addRoom}
                    setSharing={setSharing}
                    toggleFloor={toggleFloor}
                    activeFloor={activeFloor}
                    toggleRoom={toggleRoom}
                    activeRoom={activeRoom}
                  />
                )}
              </ScrollView>

              {/* BUTTONS */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {step > 1 && (
                  <TouchableOpacity
                    style={[styles.btn, { flex: 1, marginRight: 5 }]}
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
    backgroundColor: "#f5e8d1",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  card: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1a3c5d",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e0",
    backgroundColor: "#f0f7ff",
    padding: 12,
    marginBottom: 5,
    borderRadius: 8,
    color: "#0f172a",
    fontSize: 16,
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
    marginTop: 10,
  },
  stepWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
    marginTop: 15,
    backgroundColor: "#cbd5e0",
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
});
