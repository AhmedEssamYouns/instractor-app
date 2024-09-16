import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { useTheme } from '../elements/theme-provider'; // Adjust the path according to your project structure
import { useLanguage } from '../elements/language-provider'; // Adjust the path according to your project structure
import colors from '../../constants/colors'; // Adjust the path according to your project structure

// Fake data for sections
const sectionsData = [
  { id: 1, name: 'Section 1', attended: true },
  { id: 2, name: 'Section 2', attended: false },
  { id: 3, name: 'Section 3', attended: true },
  { id: 4, name: 'Section 4', attended: true },
  { id: 5, name: 'Section 5', attended: false },
];

const SectionScreen = () => {
  const { theme } = useTheme(); // Get current theme
  const { language, translations } = useLanguage(); // Get current language and translations
  const currentColors = colors[theme]; // Get the colors based on theme

  const renderSectionItem = ({ item }) => (
    <View style={[styles.sectionItem, { borderBottomColor: currentColors.borderColor }]}>
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
        data={sectionsData}
        renderItem={renderSectionItem}
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
  sectionItem: {
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

export default SectionScreen;
