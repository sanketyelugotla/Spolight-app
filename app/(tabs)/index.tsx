import { Link } from "expo-router";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";


export default function Index() {
    const { signOut } = useAuth();
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Spotlight</Text>
                <TouchableOpacity onPress={() => signOut()}>
                    <Ionicons name="log-in-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
