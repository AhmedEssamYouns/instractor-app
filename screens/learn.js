import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import VideoList from '../components/videos/videos_list';
import FilterBar from '../components/elements/filter';
import { useTheme } from '../constants/theme-provider';
import colors from '../constants/colors';

const initialLayout = { width: Dimensions.get('window').width };

// Fake Data Arrays
const lecturesData = [
  { id: 1, name: 'Lecture 1', duration: '25 mins', points: 10, seen: true },
  { id: 2, name: 'Lecture 2', duration: '25 mins', seen: false, points: 60 },
  { id: 3, name: 'Lecture 3', duration: '25 mins', seen: true, points: 40 },
  { id: 4, name: 'Lecture 4', duration: '25 mins', seen: false, points: 30 },
  { id: 5, name: 'Lecture 5', duration: '25 mins', seen: true, points: 70 },
];

const sectionsData = [
  { id: 1, name: 'Section 1', duration: '10 mins', seen: true, points: 50 },
  { id: 2, name: 'Section 2', duration: '15 mins', seen: true, points: 40 },
  { id: 3, name: 'Section 3', duration: '20 mins', seen: true, points: 30 },
  { id: 4, name: 'Section 4', duration: '25 mins', seen: true, points: 200 },
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

// Main LearnScreen Component
const LearnScreen = () => {
  const { theme } = useTheme(); // Get the theme from context
  const currentColors = colors[theme]; // Get colors based on the theme
  
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'lectures', title: 'Lectures' },
    { key: 'sections', title: 'Sections' },
  ]);

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
      labelStyle={[styles.label, { color: currentColors.text }]}
      activeColor={currentColors.iconFocus} // Active tab text color
      inactiveColor={currentColors.iconColor} // Inactive tab text color
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={renderTabBar} // Use custom TabBar
      style={[styles.container, { backgroundColor: currentColors.background,borderBottomWidth:1,borderBottomColor:currentColors.borderColor }]}
    />
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
    fontFamily: 'bold',
  },
  indicator: {
    height: 3, // Thickness of the indicator
  },
});

export default LearnScreen;
