import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useLanguage } from './language-provider';
import { useTheme } from './theme-provider';
import colors from '../../constants/colors';

const CustomText = ({ style, children, ...props }) => {
    const { language } = useLanguage(); // Get language from context
    const { theme } = useTheme(); // Get theme from context
    const currentColors = colors[theme]; // Get colors based on the theme

    // Determine font family based on language


    return (
        <RNText style={[styles.text, { color: currentColors.text, fontFamily: language === 'ar' ? 'ar' : 'bold'}, style]} {...props}>
            {children}
        </RNText>
    );
};

const styles = StyleSheet.create({
    text: {
    },
});

export default CustomText;
