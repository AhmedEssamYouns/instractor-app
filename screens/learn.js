import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import VideoList from '../components/videos/videos_list';
import FilterBar from '../components/elements/filter';
import { useTheme } from '../components/elements/theme-provider';
import colors from '../constants/colors';
import { useLanguage } from '../components/elements/language-provider';

const initialLayout = { width: Dimensions.get('window').width };

// Fake Data Arrays
const lecturesData = [
  { id: 1, name: 'Lecture 1', duration: '25 mins', points: 10, seen: true },
  // other data...
];

const sectionsData = [
  { id: 1, name: 'Section 1', duration: '10 mins', seen: true, points: 50 },
  // other data...
];

// Lectures tab content
const LecturesRoute = () => {
  const [data, setData] = useState(lecturesData);
  return (
    <VideoList
      header={<FilterBar data={lecturesData} setData={setData} />}
      videos={data}
    />
  );
};

// Sections tab content
const SectionsRoute = () => {
  const [data, setData] = useState(sectionsData);
  return (
    <VideoList
      header={<FilterBar data={sectionsData} setData={setData} />}
      videos={data}
    />
  );
};
const LearnScreen = () => {
  const { theme } = useTheme(); // Get the theme from context
  const currentColors = colors[theme]; // Get colors based on the theme
  const { language, translations } = useLanguage(); // Get translations object

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    { key: 'lectures', title: translations.lectures },
    { key: 'sections', title: translations.sections },
  ]);

  useEffect(() => {
    // Update routes when translations change
    setRoutes([
      { key: 'lectures', title: translations.lectures },
      { key: 'sections', title: translations.sections },
    ]);
  }, [translations]);

  const renderScene = SceneMap({
    lectures: LecturesRoute,
    sections: SectionsRoute,
  });

  // Custom TabBar styling
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={[styles.indicator, { backgroundColor: currentColors.iconColor }]}
      style={[styles.tabBar, { backgroundColor: currentColors.background }]}
      labelStyle={[styles.label, { color: currentColors.text, fontFamily: language === 'ar' ? 'ar' : 'bold' }]}
      activeColor={currentColors.iconFocus} // Active tab text color
      inactiveColor={currentColors.iconColor} // Inactive tab text color
    />
  );

  return (
    <View style={{ flex: 1, direction: 'rtl', }}> 
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        swipeEnabled={language == 'ar' ? false : true}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar} // Use custom TabBar
        style={[styles.container, { backgroundColor: currentColors.background, borderBottomWidth: 1, borderBottomColor: currentColors.borderColor }]}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  tabBar: {
  },
  label: {
    fontSize: 16,
  },
  indicator: {
    height: 3, // Thickness of the indicator
  },
});

export default LearnScreen;
