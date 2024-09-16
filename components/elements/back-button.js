import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ionicons is commonly used for arrow icons
import { useNavigation } from '@react-navigation/native';
import colors from '../../constants/colors'; // Assuming you have a colors file
import { useTheme } from '../elements/theme-provider'; // Assuming you're using a theme provider
import { useLanguage } from './language-provider'; // Import the language context

const BackButton = () => {
  const navigation = useNavigation();
  const { theme } = useTheme(); // Get the theme from the context
  const { language } = useLanguage(); // Get the language from context
  const currentColors = colors[theme]; // Get the current theme's colors

  // If language is Arabic ('ar'), position the button on the right, otherwise on the left
  const buttonPosition = language === 'ar' ? { right: 10 } : { left: 10 };

  return (
    <TouchableOpacity style={[styles.button, buttonPosition]} onPress={() => navigation.goBack()}>
      <Icon name="arrow-back" size={35} color={currentColors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 10,
    padding: 10,
  },
});

export default BackButton;
