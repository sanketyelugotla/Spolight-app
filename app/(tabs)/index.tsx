import { Link } from "expo-router";
import { FlatList, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/feed.styles";
import { useAuth } from "@clerk/clerk-expo";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import { STORIES } from "@/constants/mock-data";
import Story from "@/components/Story";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import Post from "@/components/Post";


export default function Index() {
    const { signOut } = useAuth();
    const posts = useQuery(api.posts.getFeedPost);
    if (posts === undefined) return <Loader />
    if (posts?.length === 0 || posts === null) return <NoPostsFound />

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Spotlight</Text>
                <TouchableOpacity onPress={() => signOut()}>
                    <Ionicons name="log-in-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                renderItem={({ item }) => <Post post={{ ...item, caption: item.captions ?? "" }} />}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={<StoriesSection />}
                contentContainerStyle={{ paddingVertical: 10 }}
            />
        </View>
    );
}


const NoPostsFound = () => (
    <View
        style={{
            flex: 1,
            backgroundColor: COLORS.background,
            justifyContent: "center",
            alignItems: "center"
        }}
    >
        <Text style={{ fontSize: 20, color: COLORS.primary }}>No posts yet</Text>
    </View>
)


const StoriesSection = () => {
    return (
        <FlatList
            data={STORIES}
            renderItem={({ item }) => <Story story={item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
        />

    )
}