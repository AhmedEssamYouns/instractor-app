import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { doc, collection, onSnapshot, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { db, FIREBASE_AUTH } from '../../firebase/config';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import CustomText from '../../components/elements/text';
import colors from '../../constants/colors';
import { useTheme } from '../../components/elements/theme-provider';
import Students from './students';
import Quizzes from './quizes';
const ProfileWithStudents = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [grades, setGrades] = useState([]);
    const [photoURL, setPhotoURL] = useState('');
    const userId = FIREBASE_AUTH.currentUser.uid;
    const { theme } = useTheme(); // Get theme from context
    const currentColors = colors[theme];


    useEffect(() => {
        // Fetch the logged-in user's document
        const userDocRef = doc(db, 'users', userId);
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setUserData(userData);
                setPhotoURL(userData.photoURL || '');
            }
            setLoading(false);
        });
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
            await updateProfileImage(result.assets[0].uri); // Save the new image to Firestore
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




    // Define the Quizzes tab content
    const QuizzesRoute = () => (
        <Quizzes />
    );

    // Define the Students tab content
    const StudentsRoute = () => (
        <Students />
    );

    // Setup tab navigation
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'students', title: 'Students' },
        { key: 'quizzes', title: 'Quizzes' },
    ]);

    const renderScene = SceneMap({
        quizzes: QuizzesRoute,
        students: StudentsRoute,
    });

    if (loading) {
        return (
            <View style={{flex:1,alignItems:'center',justifyContent:"center"}}>
                <ActivityIndicator size="large" color={currentColors.text} />
            </View>)
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
                <View style={styles.profileContainer}>
                    <View>
                        <Text style={styles.profileName}>{userData.displayName}</Text>
                        <Text style={styles.profileEmail}>{userData.email}</Text>
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
                initialLayout={{ width: '100%' }}
                renderTabBar={renderTabBar}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
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
    quizCard: {
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    attendeeCard: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    attendeeText: {
        fontSize: 16,
    },
    flatList: {
        paddingBottom: 20,
    },
    studentCard: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
});

export default ProfileWithStudents;
