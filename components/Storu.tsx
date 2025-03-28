import Story from "@/components/Story";
import { STORIES } from "@/constants/mock-data";
import React from "react";
import { FlatList } from "react-native";

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

export default StoriesSection