import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import ArticleScreen from './quiz'; 
import StudentAssignmentsPage2 from '../components/assignment/list';
import { useTheme } from '../components/elements/theme-provider';
import colors from '../constants/colors';
import { useLanguage } from '../components/elements/language-provider';

const initialLayout = { width: Dimensions.get('window').width };


const ArticlesRoute = () => (
    <ArticleScreen />
);


const AssignmentsRoute = () => (
    <StudentAssignmentsPage2 />
);

const Practic = () => {
    const { theme } = useTheme(); 
    const currentColors = colors[theme]; 
    const { language, translations } = useLanguage(); 

    const [index, setIndex] = useState(0);
    const [routes, setRoutes] = useState([
        { key: 'assignments', title: translations.assignments },
        { key: 'quizzes', title: translations.quizzes },
    ]);

    useEffect(() => {
        
        setRoutes([
            { key: 'assignments', title: translations.assignments },
            { key: 'quizzes', title: translations.quizzes },
        ]);
    }, [translations]);

    const renderScene = SceneMap({
        quizzes: ArticlesRoute,
        assignments: AssignmentsRoute,
    });

    

const renderTabBar = (props) => (
    <TabBar
        {...props}
        indicatorStyle={[styles.indicator, { backgroundColor: currentColors.indicator,borderBottomWidth: 1,borderBottomColor:currentColors.border  }]}
        style={[styles.tabBar, { backgroundColor: currentColors.background }]}
        labelStyle={[styles.label, { color: currentColors.text, fontFamily: language === 'ar' ? 'ar' : 'bold', textTransform: 'none' }]} 
        activeColor={currentColors.iconFocus} 
        inactiveColor={currentColors.iconColor} 
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
                renderTabBar={renderTabBar} 
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
        height: 3, 
    },
});

export default Practic;
