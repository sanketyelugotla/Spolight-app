import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Loader from '@/components/Loader';
import { styles } from '../styles/profile.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { Image } from 'expo-image';

export default function profile() {

    const { signOut, userId } = useAuth();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const currentUser = useQuery(api.users.getUserByClerkId, userId ? { clerkId: userId } : "skip");

    const [editedProfile, setEditedProfile] = useState({
        fullname: currentUser?.fullName || "",
        bio: currentUser?.bio || ""
    });

    const [selectedPost, setSelectedPost] = useState(null);
    const posts = useQuery(api.posts.getPostByUser, {});

    const updateProfile = useMutation(api.users.updateProfile);

    const handleSavedProfile = async () => {
        await updateProfile(editedProfile);
        setIsEditModalVisible(false);
    }

    if (!currentUser || posts === undefined) return <Loader />;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.username}>
                        {currentUser.username}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
                        <Ionicons name='log-out-outline' size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileInfo}>
                    {/* Avatar styles */}
                    <View style={styles.avatarAndStats}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={currentUser.image}
                                style={styles.avatar}
                                contentFit='cover'
                                transition={200}
                            />
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}> {currentUser.posts} </Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{currentUser.followers}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{currentUser.following}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.name}>{currentUser.fullName}</Text>
                    {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.editButton} onPress={() => setIsEditModalVisible(true)}>
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton}>
                            <Ionicons name='share-outline' size={28} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
                {posts.length === 0 && <NoPostsFound />}

                <FlatList
                    data={posts}
                    numColumns={3}
                    scrollEnabled={false}
                    renderItem={({ item }) => <Post setSelectedPost={setSelectedPost} item={item} />}
                />
            </ScrollView>

            {/* Edit profile modal */}
            <EditProfileModal {...{ isEditModalVisible, setIsEditModalVisible, editedProfile, setEditedProfile, handleSavedProfile }} />

            {/* Selected Image modal */}
            <SelectedImageModal selectedPost={selectedPost} setSelectedPost={setSelectedPost} />
        </View >
    )
}

const EditProfileModal = ({ isEditModalVisible, setIsEditModalVisible, editedProfile, setEditedProfile, handleSavedProfile }: any) => {
    return (
        <Modal
            visible={isEditModalVisible}
            animationType='slide'
            transparent
            onRequestClose={() => setIsEditModalVisible(false)}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} >
                                <Ionicons name='close' size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.fullname}
                                onChangeText={(text) => setEditedProfile(({ prev }: any) => ({ ...prev, fullname: text }))}
                                placeholderTextColor={COLORS.grey}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={editedProfile.bio}
                                onChangeText={(text) => setEditedProfile(({ prev }: any) => ({ ...prev, bio: text }))}
                                multiline
                                numberOfLines={4}
                                placeholderTextColor={COLORS.grey}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSavedProfile}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    )
};

const SelectedImageModal = ({ selectedPost, setSelectedPost }: any) => {
    return (
        <Modal
            visible={!!selectedPost}
            animationType='fade'
            transparent={true}
            onRequestClose={() => setSelectedPost(null)}
        >
            <View style={styles.modalBackdrop}>
                {selectedPost && (
                    <View style={styles.postDetailContainer} >
                        <View style={styles.postDetailHeader}>
                            <TouchableOpacity onPress={() => setSelectedPost(null)}>
                                <Ionicons name='close' size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>

                        <Image
                            source={selectedPost.imageUrl}
                            cachePolicy="memory-disk"
                            style={styles.postDetailImage}
                        />
                    </View>
                )}
            </View>
        </Modal>
    )
};

const Post = ({ setSelectedPost, item }: any) => {
    return (
        <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.gridImage}
                contentFit="cover"
                transition={200}
            />
        </TouchableOpacity>
    );
};

function NoPostsFound() {
    return (
        <View
            style={{
                height: "100%",
                backgroundColor: COLORS.background,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Ionicons name='images-outline' size={48} color={COLORS.primary} />
            <Text style={{ paddingTop: 10, fontSize: 20, color: COLORS.white }}>No Posts yet</Text>
        </View>
    )
};