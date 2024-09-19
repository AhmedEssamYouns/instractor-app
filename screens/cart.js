import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import ArticleScreen from './article'; // Import ArticleScreen
import StudentAssignmentsPage2 from '../components/assignment/list';
import { useTheme } from '../components/elements/theme-provider';
import colors from '../constants/colors';
import { useLanguage } from '../components/elements/language-provider';

const initialLayout = { width: Dimensions.get('window').width };

// Articles tab content
const ArticlesRoute = () => (
    <ArticleScreen />
);

// Assignments tab content
const AssignmentsRoute = () => (
    <StudentAssignmentsPage2 />
);

const LearnScreen = () => {
    const { theme } = useTheme(); // Get the theme from context
    const currentColors = colors[theme]; // Get colors based on the theme
    const { language, translations } = useLanguage(); // Get translations object

    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState([
        { key: 'assignments', title: translations.assignments },
        { key: 'quizzes', title: translations.quizzes },
    ]);

    useEffect(() => {
        // Update routes when translations change
        setRoutes([
            { key: 'assignments', title: translations.assignments },
            { key: 'quizzes', title: translations.quizzes },
        ]);
    }, [translations]);

    const renderScene = SceneMap({
        quizzes: ArticlesRoute,
        assignments: AssignmentsRoute,
    });

    // Custom TabBar styling
// Custom TabBar styling
const renderTabBar = (props) => (
    <TabBar
        {...props}
        indicatorStyle={[styles.indicator, { backgroundColor: currentColors.indicator }]}
        style={[styles.tabBar, { backgroundColor: currentColors.background }]}
        labelStyle={[styles.label, { color: currentColors.text, fontFamily: language === 'ar' ? 'ar' : 'bold', textTransform: 'none' }]} // Add textTransform: 'none'
        activeColor={currentColors.iconFocus} // Active tab text color
        inactiveColor={currentColors.iconColor} // Inactive tab text color
    />
);


    return (
        <View style={{ flex: 1, backgroundColor: currentColors.background }}>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                swipeEnabled={language === 'ar' ? false : true}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                renderTabBar={renderTabBar} // Use custom TabBar
                style={[styles.container, { backgroundColor: currentColors.background, borderBottomColor: currentColors.borderColor }]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {},
    label: {
        fontSize: 16,
    },
    indicator: {
        height: 3, // Thickness of the indicator
    },
});

export default LearnScreen;
