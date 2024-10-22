import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import translations from '../../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); 

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      const isRTL = await AsyncStorage.getItem('isRTL');

      if (savedLanguage) {
        setLanguage(savedLanguage);
        I18nManager.forceRTL(isRTL === 'true');
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem('appLanguage', lang);

    const isRTL = lang === 'ar';
    I18nManager.forceRTL(isRTL);
    await AsyncStorage.setItem('isRTL', isRTL.toString());

    await Updates.reloadAsync();
  };

  return (
    <LanguageContext.Provider value={{ language, translations: translations[language], changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => React.useContext(LanguageContext);
