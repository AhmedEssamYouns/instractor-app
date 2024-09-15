import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import Tabs from './Routes/tabs';
import StackScreen from './Routes/stack';
import { ThemeProvider } from './constants/theme-provider';

SplashScreen.preventAutoHideAsync();

const fetchFonts = () => {
  return Font.loadAsync({
    'light': require('./assets/fonts/SUSE-Light.ttf'),
    'bold': require('./assets/fonts/SUSE-Bold.ttf'),

  });
};

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => {
    const prepare = async () => {
      try {
        await fetchFonts();
      } catch (e) {
      } finally {
        setFontsLoaded(true);
        SplashScreen.hideAsync();
      }
    };

    prepare();

    return () => {
    };
  }, []);

  if (!fontsLoaded) {
    return null; // Optionally, return a loading indicator or placeholder
  }

  return (
    <ThemeProvider>
      <StackScreen />
    </ThemeProvider>
  );
}


