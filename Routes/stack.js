import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome6 } from '@expo/vector-icons'; // Import FontAwesome6 for the "bars" icon
import { TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, View } from 'react-native';
import Tabs from './tabs'; // Import your Tabs component
import SignInScreen from '../screens/auth/sign_in';
import SignUpScreen from '../screens/auth/sign_up';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import colors from '../constants/colors';
import { useTheme } from '../components/elements/theme-provider';
import ForgotPasswordScreen from '../screens/auth/forget';
import ChangePasswordScreen from '../screens/auth/change';
import StudentQuizAttempt from '../components/quiz/student_quiz_attemt';
import VideoList from '../Admin/videos.js/videos_list';
import UploadLectureVideo from '../Admin/videos.js/uploadingVideos';
import VideoDetail from '../components/videos/VideoLecture';
import SectionList from '../Admin/videos.js/section_list';
import SectionDetail from '../components/videos/VideoSection';
import TeacherTabs from './admin';
import checkIfUserIsAdmin from '../firebase/user';


const Stack = createStackNavigator();

export default function StackScreen() {
    const [user, setUser] = useState(null); // State to store the authenticated user
    const [isAdmin, setIsAdmin] = useState(false); // State to store if the user is an admin
    const [loading, setLoading] = useState(true); // Loading state for authentication check
    const { theme } = useTheme(); // Get the theme from context
    const currentColors = colors[theme]; // Get colors based on the theme

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser); // Update user state based on authentication status

            if (currentUser) {
                const adminStatus = await checkIfUserIsAdmin(currentUser.uid);
                setIsAdmin(adminStatus); // Check if the user is an admin
            }

            setLoading(false); // Authentication check is complete
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, []);

    // Show loading indicator while checking authentication state
    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: currentColors.background }]}>
                <ActivityIndicator size="large" color={currentColors.text} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            <Stack.Navigator
                screenOptions={{
                    cardStyle: { backgroundColor: currentColors.background }, // Apply black background to all screens
                    headerStyle: { backgroundColor: currentColors.background }, // Black background for headers
                    headerTintColor: currentColors.text, // Ensure text is visible
                }}>
                {user ? (
                    <>
                        {isAdmin ? (
                            <>
                            <Stack.Screen
                                name="TeacherTabs"
                                component={TeacherTabs}
                                options={{ headerShown: false }}
                                
                            />
                            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                      </>
                        ) : (
                            <Stack.Screen
                                name="tabs"
                                component={Tabs}
                                options={{
                                    headerShown: false,
                                    headerRight: () => (
                                        <TouchableOpacity style={styles.headerButton}>
                                            <FontAwesome6 name="bars" size={24} color="black" />
                                        </TouchableOpacity>
                                    ),
                                }}
                            />
                        )}
                        {/* Other stack screens can go here */}
                        <Stack.Screen name="SectionList" component={SectionList} options={{ title: 'Sections' }} />
                        <Stack.Screen name="UploadLectureVideo" component={UploadLectureVideo} />
                        <Stack.Screen name="SectionDetail" component={SectionDetail} options={{ headerShown: false }} />
                        <Stack.Screen name="VideoList" component={VideoList} />
                        <Stack.Screen name="VideoDetail" component={VideoDetail} options={{ headerShown: false }} />
                        <Stack.Screen name="QuizAttempt" component={StudentQuizAttempt} options={{ headerShown: false }} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    headerButton: {
        marginRight: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
