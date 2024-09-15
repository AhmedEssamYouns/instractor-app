import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import VideoCard from './video_card';
import { useTheme } from '../../constants/theme-provider';
import colors from '../../constants/colors';

const VideoList = ({ videos, header }) => {
    const { theme } = useTheme(); // Get the theme from context
    const currentColors = colors[theme]; // Get colors based on the theme

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <FlatList
                ListHeaderComponent={header}
                data={videos}
                renderItem={({ item }) => <VideoCard video={item} />}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
});

export default VideoList;
