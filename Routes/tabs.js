import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'; // Import icons
import ProfileScreen from '../screens/profile';
import ArticleScreen from '../screens/article';
import PlanScreen from '../screens/plan';
import CartScreen from '../screens/cart';
import LearnScreen from '../screens/learn';
import { useTheme } from '../constants/theme-provider'; // Correct the path if needed
import colors from '../constants/colors';

const Tab = createBottomTabNavigator();

export default function Tabs() {
    const { theme } = useTheme(); // Get the theme from context
    const currentColors = colors[theme]; // Get colors based on the theme

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveBackgroundColor: currentColors.background,
                tabBarInactiveBackgroundColor: currentColors.background,
                headerShown: false,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    // Assign different icons based on the tab's route name
                    if (route.name === 'Home') {
                        iconName = focused ? 'videocam' : 'videocam-outline'; // Video camera icons
                    } else if (route.name === 'Plan') {
                        iconName = focused ? 'clipboard-multiple' : 'clipboard-multiple-outline'; // Clipboard icons for Plan
                    } else if (route.name === 'Cart') {
                        iconName = focused ? 'edit' : 'edit'; // Use the same icon; no direct outline
                        return <FontAwesome5 name={iconName} size={26} color={focused ? currentColors.iconFocus : currentColors.iconColor} />;
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'user-alt' : 'user'; // User icon for Profile
                        return <FontAwesome5 name={iconName} size={26} color={focused ? currentColors.iconFocus : currentColors.iconColor} />;
                    }

                    // Return the appropriate icon with theme colors
                    return route.name === 'Plan' ? (
                        <MaterialCommunityIcons name={iconName} size={30} color={focused ? currentColors.iconFocus : currentColors.iconColor} />
                    ) : (
                        <Ionicons name={iconName} size={35} color={focused ? currentColors.iconFocus : currentColors.iconColor} />
                    );
                },
                tabBarActiveTintColor: currentColors.iconFocus, // Active tab color
                tabBarInactiveTintColor: currentColors.iconColor, // Inactive tab color
                tabBarStyle: {
                    borderTopColor: currentColors.border, // Border color
                },
            })}
        >
            <Tab.Screen name="Home" component={LearnScreen} />
            <Tab.Screen name="Plan" component={PlanScreen} />
            <Tab.Screen name="Cart" component={CartScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
