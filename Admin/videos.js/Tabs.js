import React, { useState } from 'react';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Dimensions, StyleSheet, View } from 'react-native';
import VideoList from './videos_list';
import SectionList from './section_list';
import colors from '../../constants/colors';
import { useTheme } from '../../components/elements/theme-provider';
const initialLayout = { width: Dimensions.get('window').width };

const TabAdminView = () => {
    const { theme } = useTheme()
    const currentColors = colors[theme]
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'lectures', title: 'Lectures' },
        { key: 'sections', title: 'Sections' },
    ]);

    const renderScene = SceneMap({
        lectures: VideoList,
        sections: SectionList,
    });

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
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            style={{ backgroundColor: currentColors.background }}
            initialLayout={initialLayout}
            renderTabBar={renderTabBar}
        />
    );
};

const styles = StyleSheet.create({
    tabBar: {
    },
    indicator: {
        backgroundColor: '#6200ee',
    },
    label: {
        color: '#6200ee',
    },
});

export default TabAdminView;
