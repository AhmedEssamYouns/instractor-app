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
import VideoList from '../Admin/videos_list';
import UploadLectureVideo from '../Admin/uploadingVideos';
import VideoDetail from '../Admin/VideoLecture'
import SectionList from '../Admin/section_list';
import SectionDetail from '../Admin/VideoSection';
const Stack = createStackNavigator();

export default function StackScreen() {
    const [user, setUser] = useState(null); // State to store the authenticated user
    const [loading, setLoading] = useState(true); // Add a loading state for authentication check
    const [modalVisible, setModalVisible] = useState(false); // State to control modal visibility
    const { theme } = useTheme(); // Get the theme from context
    const currentColors = colors[theme]; // Get colors based on the theme
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Update user state based on authentication status
            setLoading(false); // Authentication check is complete, stop loading
        });

        // Clean up subscription on unmount
        return () => unsubscribe();
    }, []);

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

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
            <Stack.Navigator>
                {user ? (
                    <>

                        <Stack.Screen
                            name="tabs"
                            component={Tabs}
                            options={{
                                headerShown: false,
                                headerRight: () => (
                                    <TouchableOpacity
                                        style={styles.headerButton}
                                        onPress={toggleModal}
                                    >
                                        <FontAwesome6 name="bars" size={24} color="black" />
                                    </TouchableOpacity>
                                ),
                            }}
                        />
                        <Stack.Screen name="SectionList" component={SectionList} options={{ title: 'Sections' }} />
                        
                        <Stack.Screen name="UploadLectureVideo" component={UploadLectureVideo} />

                        <Stack.Screen name="SectionDetail" component={SectionDetail} options={{ headerShown: false }}

                        />
                        <Stack.Screen name="VideoList" component={VideoList} />

                        <Stack.Screen name="VideoDetail" component={VideoDetail}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="SignUp"
                            component={SignUpScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="SignIn"
                            component={SignInScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ChangePassword"
                            component={ChangePasswordScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen name="QuizAttempt" component={StudentQuizAttempt}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="SignIn"
                            component={SignInScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="SignUp"
                            component={SignUpScreen}
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="ChangePassword"
                            component={ChangePasswordScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                            options={{ headerShown: false }}
                        />
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
