import { Link } from "expo-router";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {/* Stories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.storiesContainer}
                >
                    {STORIES.map((story) => (
                        <Story key={story.id} story={story} />
                    ))}
                </ScrollView>

                {posts.map((post) => (
                    <Post key={post._id} post={{ ...post, caption: post.captions ?? "" }} />
                ))}
            </ScrollView>
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