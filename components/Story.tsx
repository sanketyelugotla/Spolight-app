import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'

import { styles } from '@/app/styles/feed.styles'

type Story = {
    id: String,
    username: string,
    avatar: string,
    hasStory: boolean
};

export default function Story({ story }: { story: Story }) {
    return (
        <TouchableOpacity style={styles.storyWrapper}>
            <View style={[styles.storyRing, !story.hasStory && styles.noStory]}>
                <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
            </View>
            <Text style={styles.storyUsername}>{story.username}</Text>
        </TouchableOpacity>
    )
}