import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { Keyboard, TouchableOpacity, StyleSheet } from 'react-native';
import ProfileScreen from '../screens/profile';
import PostsScreen from '../screens/notes';
import LearnScreen from '../screens/learn';
import Practic from '../screens/practic';
import { useTheme } from '../components/elements/theme-provider';
import ThemeSwitcherModal from '../components/elements/menu';
import colors from '../constants/colors';
import { useLanguage } from '../components/elements/language-provider';
import translations from '../constants/translations';

const Tab = createBottomTabNavigator();

export default function Tabs() {
    const { theme, setTheme } = useTheme(); // Get the theme from context and setter
    const currentColors = colors[theme]; // Get colors based on the theme
    const [isModalVisible, setModalVisible] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false); // Track keyboard visibility
    const { language } = useLanguage(); // Access the current language

    useEffect(() => {
        // Add keyboard listeners
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            // Cleanup keyboard listeners
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Toggle modal visibility
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    // Handle theme change
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
                    tabBarStyle: isKeyboardVisible ? { display: 'none' } : { // Hide tab bar when keyboard is visible
                        borderRadius: 1,
                        borderWidth: 0,
                        borderTopColor: currentColors.border,
                    },
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;

                        // Assign different icons based on the tab's route name
                        if (route.name === 'Home') {
                            iconName = focused ? 'videocam' : 'videocam-outline';
                            return <Ionicons name={iconName} size={30} color={color} />;
                        } else if (route.name === 'Plan') {
                            iconName = focused ? 'clipboard-multiple' : 'clipboard-multiple-outline';
                            return <MaterialCommunityIcons name={iconName} size={30} color={color} />;
                        } else if (route.name === 'Practic') {
                            iconName = focused ? 'edit' : 'edit';
                            return <FontAwesome5 name={iconName} size={26} color={focused ? currentColors.iconFocus : currentColors.iconColor} />;
                        } else if (route.name === 'Profile') {
                            iconName = focused ? 'user-alt' : 'user';
                            return <FontAwesome5 name={iconName} size={26} color={focused ? currentColors.iconFocus : currentColors.iconColor} />;
                        }

                        return <Ionicons name={iconName} size={30} color={color} />;
                    },
                    tabBarActiveTintColor: currentColors.iconFocus,
                    tabBarInactiveTintColor: currentColors.iconColor,
                    headerStyle: {
                        backgroundColor: currentColors.background,
                        elevation: 0,
                    },
                    headerTitleStyle: {
                        fontFamily: language === 'en' ? 'bold' : 'ar',
                        color: currentColors.text,
                    },
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleModal}>
                            <FontAwesome6
                                name="bars-staggered"
                                size={25}
                                color={currentColors.text}
                                style={styles.headerRight}
                            />
                        </TouchableOpacity>
                    ),
                })}
            >
                <Tab.Screen
                    name="Home"
                    component={LearnScreen}
                    options={{ title: translations[language].videos }} // Use translations based on language
                />
                <Tab.Screen
                    name="Plan"
                    component={PostsScreen}
                    options={{ title: translations[language].notes }} // Use translations based on language
                />
                <Tab.Screen
                    name="Practic"
                    component={Practic}
                    options={{ title: translations[language].train }} // Use translations based on language
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{ title: translations[language].profile }} // Use translations based on language
                />
            </Tab.Navigator>

            {/* Theme Switcher Modal */}
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
