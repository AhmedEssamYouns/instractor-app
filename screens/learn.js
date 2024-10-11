import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, LogBox } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import VideoList from '../components/videos/videos_list';
import FilterBar from '../components/elements/filter';
import { useTheme } from '../components/elements/theme-provider';
import colors from '../constants/colors';
import { useLanguage } from '../components/elements/language-provider';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';


LogBox.ignoreAllLogs()
const initialLayout = { width: Dimensions.get('window').width };


const LecturesRoute = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'lectures'), orderBy('createdAt')); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(videoList);
      setOriginalData(videoList); 
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
  }

  return (
    <VideoList
      header={<FilterBar data={data} setData={setData} originalData={originalData}  />} 
      videos={data}
    />
  );
};


const SectionsRoute = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'sections'), orderBy('createdAt')); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sectionList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(sectionList);
      setOriginalData(sectionList); 
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
  }

  return (
    <VideoList
      header={<FilterBar data={data} setData={setData} originalData={originalData} />}
      videos={data}
    />

  );
};

const LearnScreen = () => {
  const { theme } = useTheme();
  const currentColors = colors[theme];
  const { language, translations } = useLanguage();

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState(() => {
    return language === 'ar' ? [
      { key: 'sections', title: translations.sections },
      { key: 'lectures', title: translations.lectures },
    ] : [
      { key: 'lectures', title: translations.lectures },
      { key: 'sections', title: translations.sections },
    ];
  });

  useEffect(() => {
    setRoutes([
      { key: 'lectures', title: translations.lectures },
      { key: 'sections', title: translations.sections },
    ]);
  }, [translations]);

  const renderScene = SceneMap({
    lectures: LecturesRoute,
    sections: SectionsRoute,
  });

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={[styles.indicator, { backgroundColor: currentColors.indicator }]}
      style={[styles.tabBar, { backgroundColor: currentColors.background ,borderBottomWidth: 1,borderBottomColor:currentColors.border }]}
      labelStyle={[styles.label, { color: currentColors.text, fontFamily: language === 'ar' ? 'ar' : 'bold' }]}
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
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {},
  label: {
    fontSize: 16,
  },
  indicator: {
    height: 3,
  },
});

export default LearnScreen;
