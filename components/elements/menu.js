import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './theme-provider';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from './language-provider';
import { signOut } from '../../firebase/auth';
import CustomText from './text';
import checkIfUserIsAdmin from '../../firebase/user';
import { useNavigation } from '@react-navigation/native';

const ThemeSwitcherModal = ({ visible, onClose, onChangeTheme, currentTheme }) => {
  const { theme, setTheme } = useTheme();
  const { translations, changeLanguage, language, setLanguage } = useLanguage(); 
  const [isAdmin, setIsAdmin] = useState(false); 
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await checkIfUserIsAdmin();
      setIsAdmin(adminStatus);

      if (adminStatus) {
        setLanguage('en');
      }
    };

    checkAdminStatus();
  }, []);

  const handleOptionPress = async (option) => {
    switch (option) {
      case 'profile':
        isAdmin ?
          navigation.navigate('TeacherTabs', { screen: 'Students' })
          :
          navigation.navigate('tabs', { screen: 'Profile' });

        onClose();
        break;
      case 'mode':
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          try {
            await AsyncStorage.setItem('appTheme', newTheme); 
            onChangeTheme(newTheme);
            onClose();
          } catch (error) {
            console.error('Failed to save theme:', error);
          }
        break;
      case 'logout':
        signOut();
        break;
      case 'password':
        onClose();
        openPasswordModal();
        break;
      case 'language':
        if (!isAdmin) {
          const newLanguage = language === 'en' ? 'ar' : 'en';
          changeLanguage(newLanguage);
          onClose();
        }
        break;
      default:
        break;
    }
  };

  const openPasswordModal = () => {
    setModalVisible(true);
  };

  const closePasswordModal = () => {
    setModalVisible(false);
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
    <>
      <Modal visible={visible} transparent={true} onRequestClose={onClose} animationType="slide">
        <Pressable style={styles.modalContainer} onPress={onClose}>
          <View style={[styles.modalContent, { backgroundColor: colors[theme].background }]}>
            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors[theme].button, paddingTop: 10 }]}
              onPress={() => handleOptionPress('profile')}
            >
              <Ionicons name="person" size={20} color={colors[theme].text} style={styles.icon} />
              <Text style={[styles.optionText, { color: colors[theme].text }]}>{translations.profile}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors[theme].button }]}
              onPress={() => handleOptionPress('password')}
            >
              <Ionicons name="lock-closed" size={20} color={colors[theme].text} style={styles.icon} />
              <Text style={[styles.optionText, { color: colors[theme].text }]}>{translations.password}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors[theme].button }]}
              onPress={() => handleOptionPress('mode')}
            >
              <Ionicons name={icon} size={20} color={colors[theme].text} style={styles.icon} />
              <Text style={[styles.optionText, { color: colors[theme].text }]}>{text}</Text>
            </TouchableOpacity>

            {}
            {!isAdmin && (
              <>


                <TouchableOpacity
                  style={[styles.option, { backgroundColor: colors[theme].button, borderBottomWidth: 1, borderColor: colors[theme].borderColor }]}
                  onPress={() => handleOptionPress('language')}
                >
                  <Ionicons name="globe" size={20} color={colors[theme].text} style={styles.icon} />
                  <Text style={[styles.optionText, { color: colors[theme].text }]}>
                    {language === 'en' ? translations.switchToArabic : translations.switchToEnglish}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors[theme].button,paddingTop:14 }]}
              onPress={() => handleOptionPress('logout')}
            >
              <Ionicons name="log-out" size={20} color={colors[theme].text} style={styles.icon} />
              <Text style={[styles.optionText, { color: colors[theme].text }]}>{translations.logout}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closePasswordModal}
      >
        <Pressable style={styles.modalContainer2} onPress={closePasswordModal}>
          <View style={[styles.modalContent2, { backgroundColor: colors[theme].background }]}>
            <CustomText onPress={closePasswordModal} style={[styles.closeButton, { color: colors[theme].text, backgroundColor: colors[theme].cardBackground }]}>
              {translations.close}
            </CustomText>
            <TouchableOpacity onPress={() => {
              navigation.navigate("ChangePassword");
              setModalVisible(false);
            }}>
              <CustomText style={[styles.modalOption, { color: colors[theme].text }]}>
                {translations.changePassword}
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setModalVisible(false);
              navigation.navigate("ForgotPassword");
            }}>
              <CustomText style={[styles.modalOption, { color: colors[theme].text }]}>
                {translations.forgotPassword}
              </CustomText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
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
    borderRadius: 10,
  },
  option: {
    paddingBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    paddingVertical: 5,
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

  modalContainer2: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent2: {
    bottom: 10,
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    fontSize: 20,
    backgroundColor: '#F7F7F7',
    padding: 10,
    borderRadius: 10,
    color: 'black',
  },
  modalOption: {
    fontSize: 18,
    marginVertical: 10,
    color: 'black',
  },
});

export default ThemeSwitcherModal;