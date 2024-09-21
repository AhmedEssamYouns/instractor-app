import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../elements/theme-provider';
import { useLanguage } from '../elements/language-provider';
import colors from '../../constants/colors';
import { db, FIREBASE_AUTH } from '../../firebase/config';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import CustomText from '../elements/text';

const LectureScreen = () => {
  const { theme } = useTheme();
  const { language, translations } = useLanguage();
  const currentColors = colors[theme];

  const [lecturesData, setLecturesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = FIREBASE_AUTH.currentUser.uid

  useEffect(() => {
    const unsubscribeUser = onSnapshot(doc(db, 'users', userId), async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const viewedLectures = userData.viewedLectures || [];

        // Fetch lectures data in real-time
        const lecturesPromises = viewedLectures.map(async (lectureId) => {
          const lectureRef = doc(db, 'lectures', lectureId);
          const lectureDoc = await getDoc(lectureRef); // Fetch the lecture document

          return lectureDoc.exists() ? { id: lectureDoc.id, ...lectureDoc.data() } : null;
        });

        const lectures = await Promise.all(lecturesPromises);
        setLecturesData(lectures.filter(lecture => lecture !== null)); // Filter out nulls
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribeUser();
  }, [userId]);

  const renderLectureItem = ({ item }) => (
    <View style={[styles.lectureItem, { borderBottomColor: currentColors.borderColor }]}>
      <CustomText style={[styles.name, { color: currentColors.text }]}>{item.title}</CustomText>
      <CustomText style={[styles.attended, { color: currentColors.text2 }]}>
        {translations.attended} <Feather color={'green'} name='check-circle' />
      </CustomText>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="white" style={styles.loader} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <FlatList
        data={lecturesData}
        renderItem={renderLectureItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <CustomText>
              {translations.noData}
            </CustomText>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  lectureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    paddingVertical: 10,
  },
  name: {
    fontSize: 18,
  },
  attended: {
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LectureScreen;
