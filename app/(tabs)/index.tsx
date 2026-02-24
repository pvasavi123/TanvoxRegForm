import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OwnerRegistrationScreen from "../../src/screens/OwnerRegistrationScreen";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <OwnerRegistrationScreen />
    </SafeAreaView>
  );
}
