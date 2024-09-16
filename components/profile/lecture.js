import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useTheme } from '../elements/theme-provider'; // Adjust the path according to your project structure
import { useLanguage } from '../elements/language-provider';
import colors from '../../constants/colors';

// Fake data for lectures
const lecturesData = [
  { id: 1, name: 'Lecture 1', attended: true },
  { id: 2, name: 'Lecture 2', attended: false },
  { id: 3, name: 'Lecture 3', attended: true },
  { id: 4, name: 'Lecture 4', attended: true },
  { id: 5, name: 'Lecture 5', attended: false },
];

const LectureScreen = () => {
  const { theme } = useTheme(); // Get current theme
  const { language, translations } = useLanguage(); // Get current language and translations
  const currentColors = colors[theme]; // Get the colors based on theme

  const renderLectureItem = ({ item }) => (
    <View style={[styles.lectureItem, { borderBottomColor: currentColors.borderColor }]}>
      <Text style={[styles.name, { color: currentColors.text }]}>{item.name}</Text>
      <Text style={[styles.attended, { color: currentColors.text2 }]}>
        {item.attended ? translations.attended : translations.missed} 
        {item.attended && <Feather color={currentColors.iconColor} name='check-circle' />}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <FlatList
        data={lecturesData}
        renderItem={renderLectureItem}
        keyExtractor={item => item.id.toString()}
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
});

export default LectureScreen;
