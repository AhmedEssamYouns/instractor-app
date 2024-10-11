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

const SectionDetail = () => {
    const route = useRoute();
    const userId = FIREBASE_AUTH.currentUser.uid; 
    const { sectionId } = route.params;
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inFullscreen, setInFullscreen] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);
    const refVideo = useRef(null);
    const { language, translations } = useLanguage();
    const [width, setWidth] = useState(Dimensions.get('window').width);
    const [height, setHeight] = useState(Dimensions.get('window').height);

    useEffect(() => {
        const fetchSection = async () => {
            const sectionDoc = await getDoc(doc(db, 'sections', sectionId));
            if (sectionDoc.exists()) {
                setSection(sectionDoc.data());
                await updateUserViewed(sectionId);
            } else {
                Alert.alert('Error', 'Section not found.');
            }
            setLoading(false);
        };

        fetchSection();
    }, [sectionId]);
    const handleFullscreenUpdate = async (isFullscreen) => {
        if (isFullscreen) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
            StatusBar.setHidden(true); 
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            StatusBar.setHidden(false); 
        }
    };

    
    useEffect(() => {
        const updateDimensions = () => {
            setWidth(Dimensions.get('window').width);
            setHeight(Dimensions.get('window').height);
        };

        const subscription = Dimensions.addEventListener('change', updateDimensions);

        return () => {
            subscription?.remove();
        };
    }, []);


    
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                if (inFullscreen) {
                    setInFullscreen(false);
                    handleFullscreenUpdate(false);
                }
            };
        }, [inFullscreen])
    );

    
    useFocusEffect(
        React.useCallback(() => {
            const backAction = () => {
                if (inFullscreen) {
                    
                    setInFullscreen(false);
                    handleFullscreenUpdate(false);
                    return true; 
                }
                return false; 
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

            return () => backHandler.remove();
        }, [inFullscreen])
    );


    const updateUserViewed = async (sectionId) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const viewedSections = userDoc.data().viewedSections || [];
                if (!viewedSections.includes(sectionId)) {
                    viewedSections.push(sectionId);
                    await updateDoc(userDocRef, { viewedSections });
                    console.log('Section ID added to user viewed list:', sectionId);
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
        { key: 'questions', title: translations.questions },
        { key: 'mainPoints', title: translations.mainPoints },
    ]);

    const renderScene = SceneMap({
        questions: () => (
            <ScrollView style={styles.tabContent}>
                {section?.questions.map((question, idx) => (
                    <CustomText key={idx} style={{ color: currentColors.text2 }}>
                        {question}
                    </CustomText>
                ))}
            </ScrollView>
        ),
        mainPoints: () => (
            <ScrollView style={styles.tabContent}>
                {section?.mainPoints.map((point, idx) => (
                    <CustomText key={idx} style={{ color: currentColors.text2 }}>
                        {point}
                    </CustomText>
                ))}
            </ScrollView>
        ),
    });

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: currentColors.indicator }]}
            style={[styles.tabBar, { backgroundColor: currentColors.background, borderBottomWidth: 1, borderBottomColor: currentColors.border }]}
            labelStyle={[styles.label, { color: currentColors.text }]}
            activeColor={currentColors.iconFocus}
            inactiveColor={currentColors.iconColor}
        />
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={currentColors.text1} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
           {!inFullscreen && <BackButton />}
            {section && section.videoUrl && (
                <>
                    {videoLoading && (
                        <ActivityIndicator style={styles.loader} size={80} color="white" />
                    )}
                    <VideoPlayer
                        videoProps={{
                            shouldPlay:true,
                            resizeMode: 'contain',
                            source: { uri: section.videoUrl }, 
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
                        style={{ height: inFullscreen ? height : 260, width: inFullscreen ? width : 10000 }}
                        slider={{ visible: true }}
                    />
                </>
            )}
            {section && (
                <CustomText style={{ paddingTop: 10, paddingHorizontal: 20, color: currentColors.text2, fontSize: 18 }}>
                    {section.title}
                </CustomText>
            )}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                renderTabBar={renderTabBar}
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
        paddingBottom: 40,
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

export default SectionDetail;
