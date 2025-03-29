import { SplashScreen, Stack } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import InitialLayout from "@/components/initialLayout";

import ClerkAndConvexProvider from "@/providers/ClerkAndConvexProvider";
import React, { useCallback, useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { useFonts } from "expo-font"
import * as NavigationBar from "expo-navigation-bar"
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  })

  // console.log(fontsLoaded);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, [])

  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} onLayout={onLayoutRootView}>
          <StatusBar backgroundColor="black" barStyle="light-content" />
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
