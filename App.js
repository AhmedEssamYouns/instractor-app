import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import StackScreen from './Routes/stack';
import { ThemeProvider } from './components/elements/theme-provider';
import { LanguageProvider } from './components/elements/language-provider';

SplashScreen.preventAutoHideAsync();

const fetchFonts = () => {
  return Font.loadAsync({
    'light': require('./assets/fonts/SUSE-Light.ttf'),
    'bold': require('./assets/fonts/SUSE-Bold.ttf'),
    'ar': require('./assets/fonts/Marhey-Medium.ttf'),

  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await fetchFonts();
      } catch (e) {
        // Handle error
      } finally {
        setFontsLoaded(true);
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!fontsLoaded) {
    return null; // Optionally, return a loading indicator
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <StackScreen />
      </ThemeProvider>
    </LanguageProvider>
  );
}
