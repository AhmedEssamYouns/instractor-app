import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Video } from 'expo-av'; // Make sure to install expo-av
import { useRoute } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const VideoDetail = () => {
    const route = useRoute();
    const { videoId } = route.params;
    const [video, setVideo] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchVideo = async () => {
            const videoDoc = await getDoc(doc(db, 'lectures', videoId));
            if (videoDoc.exists()) {
                setVideo(videoDoc.data());
            } else {
                Alert.alert('Error', 'Video not found.');
            }
            setLoading(false);
        };

        fetchVideo();
    }, [videoId]);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            {video && (
                <Video
                    source={{ uri: video.videoUrl }}
                    style={styles.video}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                />
            )}
            <Text style={styles.title}>{video.title}</Text>
            <Text>{video.description}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    video: {
        width: '100%',
        height: 300,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
    },
});

export default VideoDetail;
