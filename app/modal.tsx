import React from "react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function ModalScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ThemedText type="title">Modal</ThemedText>
      <ThemedText>Present this screen via the modal route.</ThemedText>
    </ThemedView>
  );
}
