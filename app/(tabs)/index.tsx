import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import OwnerRegistrationScreen from "../../src/screens/OwnerRegistrationScreen";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <OwnerRegistrationScreen />
    </SafeAreaView>
  );
}
