import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Dimensions, Alert } from 'react-native';
import { Video } from 'expo-av';
import { useRoute } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db,FIREBASE_AUTH } from '../../firebase/config';
import CustomText from '../elements/text';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import colors from '../../constants/colors';
import { useTheme } from '../elements/theme-provider';
import { useLanguage } from '../elements/language-provider';
import BackButton from '../elements/back-button';

const initialLayout = { width: Dimensions.get('window').width };

const VideoDetail = () => {
    const route = useRoute();
    const userId = FIREBASE_AUTH.currentUser.uid; // Get the current user's ID
    const { videoId } = route.params;
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(true);
    const { language, translations } = useLanguage();

    useEffect(() => {
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

    const handleVideoPlaybackStatusUpdate = async (status) => {
        if (status.didJustFinish) {
            await updateUserViewed(videoId);
        }
    };

    const updateUserViewed = async (videoId) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                const viewedVideos = userDoc.data().viewed || [];
                // Add the new videoId if it's not already in the array
                if (!viewedVideos.includes(videoId)) {
                    viewedVideos.push(videoId);
                    await updateDoc(userDocRef, { viewedLectures: viewedVideos });
                    console.log('Video ID added to user viewed list:', videoId);
                }
            } else {
                console.error('User document does not exist.');
            }
        } catch (error) {
            console.error('Error updating user viewed list:', error);
        }
    };
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'description', title: translations.description },
        { key: 'summary', title: translations.summary },
    ]);

    const renderScene = SceneMap({
        description: () => (
            <ScrollView style={styles.tabContent}>
                <CustomText style={{ color: currentColors.text2, paddingBottom: 40 }}>{video?.description}</CustomText>
            </ScrollView>
        ),
        summary: () => (
            <ScrollView style={styles.tabContent}>
                <CustomText style={{ color: currentColors.text2, paddingBottom: 40 }}>{video?.summary || "No summary available."}</CustomText>
            </ScrollView>
        ),
    });

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: currentColors.indicator }]}
            style={[styles.tabBar, { backgroundColor: currentColors.background,borderBottomWidth: 1,borderBottomColor:currentColors.border  }]}
            labelStyle={[styles.label, { color: currentColors.text, fontFamily: language === 'ar' ? 'ar' : 'bold' }]}
            activeColor={currentColors.iconFocus}
            inactiveColor={currentColors.iconColor}
        />
    );

    if (loading) {
        return <ActivityIndicator size="large" color="white" />;
    }

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <BackButton/>
            {videoLoading && (
                <ActivityIndicator style={styles.loader} size={80} color="white" />
            )}
            {video && (
                <Video
                    source={{ uri: video.videoUrl }}
                    style={styles.video}
                    useNativeControls
                    onLoadStart={() => setVideoLoading(true)}
                    onReadyForDisplay={() => setVideoLoading(false)}
                    onPlaybackStatusUpdate={handleVideoPlaybackStatusUpdate} // Listen for playback status
                    resizeMode="contain"
                />
            )}
            <CustomText style={{
                paddingTop: 10,
                paddingHorizontal: 10,
                color: currentColors.text2
            }}>
                {video.title}
            </CustomText>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                renderTabBar={renderTabBar}
                swipeEnabled={language === 'ar' ? false : true}
                style={[styles.tabView, { backgroundColor: currentColors.background }]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    video: {
        width: '100%',
        height: 300,
        backgroundColor: 'black',
    },
    loader: {
        zIndex: 2,
        position: 'absolute',
        alignSelf: 'center',
        top: 100,
    },
    tabContent: {
        padding: 20,
    },
    tabView: {
        flex: 1,
    },
    tabBar: {
        backgroundColor: 'transparent',
    },
    label: {
        fontSize: 16,
    },
    indicator: {
        height: 3,
    },
});

export default VideoDetail;
