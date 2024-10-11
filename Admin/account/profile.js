import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import * as ImagePicker from 'expo-image-picker';
import { db, FIREBASE_AUTH } from '../../firebase/config';
import CustomText from '../../components/elements/text';
import colors from '../../constants/colors';
import { useTheme } from '../../components/elements/theme-provider';
import Students from './students';
import Quizzes from './quizes';
import AdminUsers from './conrtollAdmin';

const ProfileWithStudents = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photoURL, setPhotoURL] = useState('');
    const userId = FIREBASE_AUTH.currentUser.uid;
    const { theme } = useTheme();
    const currentColors = colors[theme];

    useEffect(() => {
        const userDocRef = doc(db, 'users', userId);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setUserData(userData);
                setPhotoURL(userData.photoURL || '');
            }
            setLoading(false);
        });

        return unsubscribeUser;
    }, []);

    const handleImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setPhotoURL(result.assets[0].uri);
            await updateProfileImage(result.assets[0].uri); 
        }
    };

    const updateProfileImage = async (uri) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, { photoURL: uri });
            Alert.alert('Success', 'Profile image updated successfully!');
        } catch (error) {
            console.error('Error updating profile image: ', error);
            Alert.alert('Error', 'Failed to update profile image.');
        }
    };

    const StudentsRoute = () => <Students />;

    const QuizzesRoute = () => <Quizzes />;

    const routes = [
        { key: 'students', title: 'Students' },
        { key: 'quizzes', title: 'Grades' },
        ...(userData?.author ? [{ key: 'admins', title: 'Admins' }] : []),
    ];

    const renderScene = SceneMap({
        students: StudentsRoute,
        quizzes: QuizzesRoute,
        admins: () => <AdminUsers />, 
    });

    const [index, setIndex] = useState(0);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={currentColors.text} />
            </View>
        );
    }

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: currentColors.indicator }]}
            style={[styles.tabBar, { backgroundColor: currentColors.background, borderBottomWidth: 1, borderBottomColor: currentColors.border }]}
            labelStyle={[styles.label, { color: currentColors.text, fontFamily: 'bold' }]}
            activeColor={currentColors.iconFocus}
            inactiveColor={currentColors.iconColor}
        />
    );

    return (
        <View style={styles.container}>
            {userData && (
                <View style={[styles.profileContainer, { backgroundColor: currentColors.background }]}>
                    <View>
                        <CustomText style={styles.profileName}>{userData.displayName}</CustomText>
                        <CustomText style={styles.profileEmail}>{userData.email}</CustomText>
                    </View>
                    <TouchableOpacity onPress={handleImagePicker}>
                        {photoURL ? (
                            <Image source={{ uri: photoURL }} style={styles.profileImage} />
                        ) : (
                            <Text>Upload Image</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                style={{ backgroundColor: currentColors.background }}
                initialLayout={{ width: '100%' }}
                renderTabBar={renderTabBar}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    profileContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 50,
        marginBottom: 15,
    },
});

export default ProfileWithStudents;
