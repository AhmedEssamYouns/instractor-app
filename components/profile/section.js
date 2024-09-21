import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../elements/theme-provider';
import { useLanguage } from '../elements/language-provider';
import colors from '../../constants/colors';
import { db, FIREBASE_AUTH } from '../../firebase/config'; // Adjust import path
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import CustomText from '../elements/text';

const SectionScreen = () => {
  const { theme } = useTheme();
  const { language, translations } = useLanguage();
  const currentColors = colors[theme];

  const [sectionsData, setSectionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = FIREBASE_AUTH.currentUser.uid;

  useEffect(() => {
    const unsubscribeUser = onSnapshot(doc(db, 'users', userId), async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const viewedSections = userData.viewedSections || [];

        // Fetch sections data in real-time
        const sectionsPromises = viewedSections.map(async (sectionId) => {
          const sectionRef = doc(db, 'sections', sectionId);
          const sectionDoc = await getDoc(sectionRef); // Fetch the section document

          return sectionDoc.exists() ? { id: sectionDoc.id, ...sectionDoc.data() } : null;
        });

        const sections = await Promise.all(sectionsPromises);
        setSectionsData(sections.filter(section => section !== null)); // Filter out nulls
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribeUser();
  }, [userId]);

  const renderSectionItem = ({ item }) => (
    <View style={[styles.sectionItem, { borderBottomColor: currentColors.borderColor }]}>
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
        data={sectionsData}
        renderItem={renderSectionItem}
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
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    paddingVertical: 10,
  },
  name: {
    width:200,
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

export default SectionScreen;
