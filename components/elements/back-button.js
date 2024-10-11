import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { useNavigation } from '@react-navigation/native';
import colors from '../../constants/colors';
import { useTheme } from '../elements/theme-provider'; 
import { useLanguage } from './language-provider'; 

const BackButton = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { language } = useLanguage(); 
  const currentColors = colors[theme];

  const buttonPosition = language === 'ar' ? { right: 20 } : { left: 20 };

  return (
    <TouchableOpacity style={[styles.button, buttonPosition,{backgroundColor:currentColors.background,borderRadius:60}]} onPress={() => navigation.goBack()}>
      <Icon name="arrow-back" size={35} color={currentColors.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    zIndex:2,
    position: 'absolute',
    top: 30,
    padding: 5,
  },
});

export default BackButton;
