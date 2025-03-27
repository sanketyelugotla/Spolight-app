import { Link } from "expo-router";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/auth.styles";
import { useAuth } from "@clerk/clerk-expo";
import React from "react";

export default function Index() {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => signOut()}>
        <Text style={{ color: "white" }}>Signout</Text>
      </TouchableOpacity>
    </View>
  );
}
