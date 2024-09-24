import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Dimensions, Alert, BackHandler } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../../firebase/config';
import CustomText from '../elements/text';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import colors from '../../constants/colors';
import { useTheme } from '../elements/theme-provider';
import { useLanguage } from '../elements/language-provider';
import BackButton from '../elements/back-button';
import * as ScreenOrientation from 'expo-screen-orientation';
import VideoPlayer from 'expo-video-player';
import { StatusBar } from 'react-native';

const initialLayout = { width: Dimensions.get('window').width };
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const VideoDetail = () => {
    const route = useRoute();
    const userId = FIREBASE_AUTH.currentUser.uid; // Get the current user's ID
    const { videoId } = route.params;
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inFullscreen, setInFullscreen] = useState(false);
    const refVideo = useRef(null);
    const { language, translations } = useLanguage();

    useEffect(() => {
        const fetchVideo = async () => {
            const videoDoc = await getDoc(doc(db, 'lectures', videoId));
            if (videoDoc.exists()) {
                setVideo(videoDoc.data());
                await updateUserViewed(videoId);
            } else {
                Alert.alert('Error', 'Video not found.');
            }
            setLoading(false);
        };

        fetchVideo();
    }, [videoId]);

    const handleFullscreenUpdate = async (isFullscreen) => {
        if (isFullscreen) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
            StatusBar.setHidden(true); // Hide the status bar
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            StatusBar.setHidden(false); // Show the status bar again
        }
    };


    // Add useFocusEffect to handle exiting fullscreen when navigating away
    useFocusEffect(
        React.useCallback(() => {
            // Function to reset fullscreen and orientation when leaving the screen
            return () => {
                if (inFullscreen) {
                    setInFullscreen(false);
                    handleFullscreenUpdate(false);
                }
            };
        }, [inFullscreen])
    );


    const updateUserViewed = async (videoId) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const viewedVideos = userDoc.data().viewedLectures || [];
                if (!viewedVideos.includes(videoId)) {
                    viewedVideos.push(videoId);
                    await updateDoc(userDocRef, { viewedLectures: viewedVideos });
                }
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
    
    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                if (inFullscreen) {
                    // If in fullscreen, exit fullscreen mode
                    setInFullscreen(false);
                    handleFullscreenUpdate(false);
                    return true; // Prevent default back action
                }
                return false; // Allow default back action if not in fullscreen
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [inFullscreen])
    );

    const renderScene = SceneMap({
        description: () => (
            <ScrollView style={styles.tabContent}>
                <CustomText style={{ color: currentColors.text2, paddingBottom: 40 }}>{video?.description}</CustomText>
            </ScrollView>
        ),
        summary: () => (
            <ScrollView style={styles.tabContent}>
                <CustomText style={{ color: currentColors.text2, paddingBottom: 40 }}>{video?.summary || 'No summary available.'}</CustomText>
            </ScrollView>
        ),
    });
    const [videoLoading, setVideoLoading] = useState(true);

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: currentColors.indicator }]}
            style={[styles.tabBar, { backgroundColor: currentColors.background, borderBottomWidth: 1, borderBottomColor: currentColors.border }]}
            labelStyle={[styles.label, { color: currentColors.text, fontFamily: language === 'ar' ? 'ar' : 'bold' }]}
            activeColor={currentColors.iconFocus}
            inactiveColor={currentColors.iconColor}
        />
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={currentColors.text1} />
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            {!inFullscreen && <BackButton />}
            {videoLoading && (
                <ActivityIndicator style={styles.loader} size={80} color="white" />
            )}
            {video && (
                <VideoPlayer
                    videoProps={{
                        shouldPlay: true,
                        resizeMode: 'contain',
                        source: { uri: video.videoUrl },
                        ref: refVideo,
                        onLoadStart: () => setVideoLoading(true),
                        onReadyForDisplay: () => setVideoLoading(false),
                    }}
                    fullscreen={{
                        enterFullscreen: async () => {
                            setInFullscreen(true);
                            await handleFullscreenUpdate(true);
                        },
                        exitFullscreen: async () => {
                            setInFullscreen(false);
                            await handleFullscreenUpdate(false);
                        },
                        inFullscreen: inFullscreen,
                    }}
                    style={{ height: inFullscreen ? height : 260, width: inFullscreen ? width : 400 }}
                    slider={{ visible: true }}
                />
            )}

            <CustomText style={{ paddingTop: 10, paddingHorizontal: 10, color: currentColors.text2 }}>
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
    loader: {
        zIndex: 2,
        position: 'absolute',
        alignSelf: 'center',
        top: 90,
    },
    indicator: {
        height: 3,
    },
});

export default VideoDetail;
