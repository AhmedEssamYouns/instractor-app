import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Dimensions, Alert } from 'react-native';
import { Video } from 'expo-av'; // Import Video component
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

const SectionDetail = () => {
    const route = useRoute();
    const { sectionId } = route.params;
    const userId = FIREBASE_AUTH.currentUser.uid; // Get the current user's ID
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const [section, setSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(true);
    const { language, translations } = useLanguage();

    useEffect(() => {
        const fetchSection = async () => {
            const sectionDoc = await getDoc(doc(db, 'sections', sectionId));
            if (sectionDoc.exists()) {
                setSection(sectionDoc.data());
            } else {
                Alert.alert('Error', 'Section not found.');
            }
            setLoading(false);
        };

        fetchSection();
    }, [sectionId]);

    const handleVideoPlaybackStatusUpdate = async (status) => {
        if (status.didJustFinish) {
            await updateUserViewed(sectionId);
        }
    };

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
                    <CustomText key={idx} style={{ color: currentColors.text2, }}>
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
            indicatorStyle={[styles.indicator, { backgroundColor: currentColors.indicator, }]}
            style={[styles.tabBar, { backgroundColor: currentColors.background, borderBottomWidth: 1,borderBottomColor:currentColors.border }]}
            labelStyle={[styles.label, { color: currentColors.text, borderColor: 'red' }]}
            activeColor={currentColors.iconFocus}
            inactiveColor={currentColors.iconColor}
        />
    );

    if (loading) {
        return <ActivityIndicator size="large" color="white" />;
    }

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <BackButton />
            {section && section.videoUrl && (
                <>
                    {videoLoading && (
                        <ActivityIndicator style={styles.loader} size={80} color="white" />
                    )}
                    <Video
                        source={{ uri: section.videoUrl }} // Use the video's URL from section data
                        style={styles.video}
                        useNativeControls
                        onLoadStart={() => setVideoLoading(true)}
                        onReadyForDisplay={() => setVideoLoading(false)}
                        resizeMode="contain"
                        onPlaybackStatusUpdate={handleVideoPlaybackStatusUpdate} // Listen for playback status
                        isLooping={false}
                    />
                </>
            )}
            {section && (
                <CustomText style={{
                    paddingTop: 10,
                    paddingHorizontal: 20,
                    color: currentColors.text2,
                    fontSize: 18,
                }}>
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
            {/* Uncomment the following line to trigger section finish handling */}
            {/* <Button title="Finish Section" onPress={handleSectionFinish} /> */}
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
