import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useLanguage } from './language-provider';
import { useTheme } from './theme-provider';
import colors from '../../constants/colors';

const CustomText = ({ style, children, ...props }) => {
    const { language } = useLanguage(); 
    const { theme } = useTheme(); 
    const currentColors = colors[theme]; 



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
