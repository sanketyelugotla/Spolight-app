import Loader from "@/components/Loader";
import Post from "@/components/Post";
import StoriesSection from "@/components/Storu";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import React, { useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { styles } from "../styles/feed.styles";


export default function Index() {
    const { signOut } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000)
    }

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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                    />
                }
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
