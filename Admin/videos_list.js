import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomText from '../components/elements/text';
import UploadLectureVideo from './uploadingVideos';

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'lectures'), (snapshot) => {
            const videoList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setVideos(videoList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('VideoDetail', { videoId: item.id })}
        >
            <MaterialIcons name="video-library" size={24} color="black" style={styles.icon} />
            <View style={styles.cardContent}>
                <CustomText style={styles.title}>{item.title}</CustomText>
                <CustomText>{item.description}</CustomText>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    cardContent: {
        marginLeft: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    list: {
        paddingBottom: 20,
    },
});

export default VideoList;
