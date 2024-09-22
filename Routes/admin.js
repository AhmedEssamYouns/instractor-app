import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import PostsScreen from '../Admin/posts/posts_screen';
import { useTheme } from '../components/elements/theme-provider';
import colors from '../constants/colors';
import { TouchableOpacity, StyleSheet } from 'react-native';
import ThemeSwitcherModal from '../components/elements/menu';
import TabAdminView from '../Admin/videos.js/Tabs';
import QuizAdminList from '../Admin/manageQuiz.js/quiz_list';
import ProfileWithStudents from '../Admin/account/profile';
import AssignmentsList from '../Admin/assignment/list';
import AssignmentForm from '../Admin/assignment/assign_form';

const Tab = createBottomTabNavigator();

export default function TeacherTabs() {
    const { theme, setTheme } = useTheme();
    const currentColors = colors[theme];
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarActiveBackgroundColor: currentColors.background,
                    tabBarInactiveBackgroundColor: currentColors.background,
                    tabBarShowLabel: false,
                    headerTitleStyle: { fontFamily: 'bold' },
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;

                        if (route.name === 'Students') {
                            iconName = focused ? 'people' : 'people-outline';
                            return <Ionicons name={iconName} size={30} color={color} />;
                        } else if (route.name === 'Quizzes') {
                            iconName = focused ? 'document-text' : 'document-text-outline';
                            return <Ionicons name={iconName} size={30} color={color} />;
                        } else if (route.name === 'UploadLecture') {
                            iconName = 'upload';
                            return <FontAwesome5 name={iconName} size={26} color={color} />;
                        } else if (route.name === 'Posts') {
                            iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
                            return <MaterialCommunityIcons name={iconName} size={30} color={color} />;
                        }
                        else if (route.name === 'Assinments') {
                            iconName = focused ? 'book' : 'book-edit';
                            return <MaterialCommunityIcons name={iconName} size={30} color={color} />;
                        }

                        return <Ionicons name={iconName} size={30} color={color} />;
                    },
                    tabBarActiveTintColor: currentColors.iconFocus,
                    tabBarInactiveTintColor: currentColors.iconColor,
                    tabBarStyle: {
                        borderRadius: 1,
                        borderWidth: 0,
                        borderTopColor: currentColors.border,
                    },
                    headerStyle: {
                        backgroundColor: currentColors.background,
                        elevation: 0,
                    },
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleModal}>
                            <Ionicons
                                name="settings"
                                size={25}
                                color={currentColors.text}
                                style={styles.headerRight}
                            />
                        </TouchableOpacity>
                    ),
                })}
            >
                <Tab.Screen
                    name="Students"
                    component={ProfileWithStudents}
                    options={{ title: 'Accounts' }}
                />
                <Tab.Screen
                    name="Posts"
                    component={PostsScreen}
                    options={{ title: 'Posts' }}
                />
                <Tab.Screen
                    name="UploadLecture"
                    component={TabAdminView}
                    options={{ title: 'Upload Lecture' }}
                />
                <Tab.Screen
                    name="Assinments"
                    component={AssignmentForm}
                />
                <Tab.Screen
                    name="Quizzes"
                    component={QuizAdminList}
                    options={{ title: 'Quizzes' }}
                />
            </Tab.Navigator>

            <ThemeSwitcherModal
                visible={isModalVisible}
                onClose={toggleModal}
                onChangeTheme={handleThemeChange}
                currentTheme={theme}
            />
        </>
    );
}

const styles = StyleSheet.create({
    headerRight: {
        paddingLeft: 10,
        marginRight: 15,
    },
});
