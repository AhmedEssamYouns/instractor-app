import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../constants/theme-provider';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const ThemeSwitcherModal = ({ visible, onClose, onChangeTheme, currentTheme }) => {
  const { theme } = useTheme(); // Access the current theme

  const handleOptionPress = async (option) => {
    switch (option) {
      case 'profile':
        // Handle profile navigation or action
        break;
      case 'mode':
        // Toggle theme mode
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        try {
          await AsyncStorage.setItem('appTheme', newTheme); // Save the theme in AsyncStorage
          onChangeTheme(newTheme);
        } catch (error) {
          console.error('Failed to save theme:', error);
        }
        break;
      case 'logout':
        // Handle logout action
        break;
      default:
        break;
    }
  };

  // Determine icon and text for the theme change option
  const getChangeModeOptions = () => {
    if (currentTheme === 'light') {
      return { icon: 'moon', text: 'Change to Dark' };
    } else {
      return { icon: 'sunny', text: 'Change to Light' };
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
            <Text style={[styles.optionText, { color: colors[theme].text }]}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors[theme].button }]}
            onPress={() => handleOptionPress('mode')}
          >
            <Ionicons name={icon} size={20} color={colors[theme].text} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors[theme].text }]}>{text}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors[theme].button }]}
            onPress={() => handleOptionPress('logout')}
          >
            <Ionicons name="log-out" size={20} color={colors[theme].text} style={styles.icon} />
            <Text style={[styles.optionText, { color: colors[theme].text }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start', // Align the modal to the top
    alignItems: 'flex-end', // Align to the right
    paddingTop:50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20, // Add some padding to ensure the content doesn't touch the edges
  },
  modalContent: {
    paddingTop:20,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'flex-start', // Align items to the start (left)
  },
  modalTitle: {
    padding: 20, 
    fontSize: 18,
  },
  option: {
    paddingBottom:10,
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
