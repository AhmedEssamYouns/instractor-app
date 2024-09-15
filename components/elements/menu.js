import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './theme-provider';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from './language-provider';
import { signOut } from '../../firebase/auth';
import { FIREBASE_AUTH } from '../../firebase/config';
const ThemeSwitcherModal = ({ visible, onClose, onChangeTheme, currentTheme }) => {
  const { theme } = useTheme(); // Access the current theme
  const { translations, changeLanguage, language } = useLanguage(); // Access language context

  const handleOptionPress = async (option) => {
    switch (option) {
      case 'profile':
        // Handle profile navigation or action
        break;
      case 'mode':
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        try {
          await AsyncStorage.setItem('appTheme', newTheme); // Save the theme in AsyncStorage
          onChangeTheme(newTheme);
        } catch (error) {
          console.error('Failed to save theme:', error);
        }
        break;
      case 'logout':
        signOut()
        break;
      case 'language':
        const newLanguage = language === 'en' ? 'ar' : 'en';
        changeLanguage(newLanguage);
        break;
      default:
        break;
    }
  };

  const getChangeModeOptions = () => {
    if (currentTheme === 'light') {
      return { icon: 'moon', text: translations.switchToDark };
    } else {
      return { icon: 'sunny', text: translations.switchToLight };
    }
  };

  const { icon, text } = getChangeModeOptions();

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: colors[theme].background }]}>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors[theme].button }]}
            onPress={() => handleOptionPress('profile')}
          >
            <Ionicons name="person" size={20} color={colors[theme].text} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors[theme].text }]}>{translations.profile}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors[theme].button }]}
            onPress={() => handleOptionPress('mode')}
          >
            <Ionicons name={icon} size={20} color={colors[theme].text} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors[theme].text }]}>{text}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, {
              backgroundColor: colors[theme].button,
              borderBottomWidth: 1, borderColor: colors[theme].borderColor
            }]}
            onPress={() => handleOptionPress('language')}
          >
            <Ionicons name="globe" size={20} color={colors[theme].text} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors[theme].text }]}>
              {language === 'en' ? translations.switchToArabic : translations.switchToEnglish}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors[theme].button }]}
            onPress={() => handleOptionPress('logout')}
          >
            <Ionicons name="log-out" size={20} color={colors[theme].text} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors[theme].text }]}>{translations.logout}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    paddingTop: 20,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  option: {
    paddingBottom: 10,
    borderRadius: 5,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
});

export default ThemeSwitcherModal;