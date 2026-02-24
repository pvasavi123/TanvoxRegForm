import React from "react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function ExploreScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ThemedText type="title">Explore</ThemedText>
      <ThemedText>Try the tabs and modal routes.</ThemedText>
    </ThemedView>
  );
}
