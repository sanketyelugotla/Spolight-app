import Loader from '@/components/Loader';
import { COLORS } from '@/constants/theme';
import { api } from '@/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { styles } from '../styles/notifications.styles';

import Notification from '@/components/Notification';

export default function notifications() {

    const notifications = useQuery(api.notifications.getNotifications);

    if (notifications === undefined) return <Loader />
    if (notifications.length === 0 || notifications === null) return <NoNotificationsFound />

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                renderItem={({ item }) => <Notification notifications={item} />}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    )
}

function NoNotificationsFound() {
    return (
        <View style={[styles.container, styles.centered]} >
            <Ionicons name='notifications-outline' size={48} color={COLORS.primary} />
            <Text style={{ fontSize: 20, color: COLORS.white }}>
                No notifications yet
            </Text>
        </View>
    )
}