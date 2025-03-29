import React from 'react'
import { Text, View } from 'react-native'

import { styles } from '@/app/styles/notifications.styles'
import { COLORS } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { formatDistanceToNow } from 'date-fns'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { TouchableOpacity } from 'react-native'

export default function Notification({ notifications }: any) {
    return (
        <View style={styles.notificationItem}>
            <View style={styles.notificationContent}>
                <Link
                    href={{
                        pathname: '/user/[id]',
                        params: { id: notifications.sender._id }
                    }}
                    asChild
                >
                    <TouchableOpacity style={styles.avatarContainer}>
                        <Image
                            source={notifications.sender.image}
                            style={styles.avatar}
                            contentFit='cover'
                            transition={200}
                        />
                        <View style={styles.iconBadge}>
                            {notifications.type === "like" ? (
                                <Ionicons name='heart' size={14} color={COLORS.primary} />
                            ) : notifications.type === "follow" ? (
                                <Ionicons name='person-add' size={14} color='#8B5CF6' />
                            ) : (
                                <Ionicons name='chatbubble' size={14} color='#3B82F6' />
                            )}
                        </View>
                    </TouchableOpacity>
                </Link>

                <View style={styles.notificationInfo}>
                    <Link href="/notifications" asChild >
                        <TouchableOpacity>
                            <Text style={styles.username}>
                                {notifications.sender.username}
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    <Text style={styles.action}>
                        {notifications.type === "follow"
                            ? "Started following you"
                            : notifications.type === "like"
                                ? "Liked you post"
                                : `Commented: ${notifications.comment}`
                        }
                    </Text>
                    <Text style={styles.timeAgo}>
                        {formatDistanceToNow(notifications._creationTime, { addSuffix: true })}
                    </Text>
                </View>
            </View>

            {notifications.post && (
                <Image
                    source={notifications.post.imageUrl}
                    style={styles.postImage}
                    contentFit='cover'
                    transition={200}
                />
            )}
        </View>
    )

}