import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ToastAndroid } from 'react-native';
import { forgotPassword } from '../../firebase/auth';
import colors from '../../constants/colors';
import translations from '../../constants/translations'; 
import { useTheme } from '../../components/elements/theme-provider';
import { useLanguage } from '../../components/elements/language-provider'; 
import CustomText from '../../components/elements/text';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/elements/back-button';

const ForgotPasswordScreen = () => {
    const { theme } = useTheme(); 
    const { language } = useLanguage(); 
    const currentColors = colors[theme]; 
    const translation = translations[language] || translations.en; 
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); 

    const handleForgotPassword = async () => {
        setLoading(true); 
        setError(null); 
        try {
            await forgotPassword(email, language);
            setLoading(false); 
            
            ToastAndroid.show(translation.resetEmailSent, ToastAndroid.SHORT);
            navigation.navigate('SignIn'); 
        } catch (error) {
            setLoading(false); 
            setError(error.message); 
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <BackButton/>
            <CustomText style={styles.title}>{translation.forgotPassword}</CustomText>

            <TextInput
                placeholder={translation.email} 
                placeholderTextColor={currentColors.text}
                value={email}
                onChangeText={setEmail}
                style={[styles.input, {
                    color: currentColors.text,
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.cardBackground,
                }]}
            />

            {}
            {error && <CustomText style={styles.errorText}>{error}</CustomText>}

            {}
            {
                loading ? (
                    <ActivityIndicator size="large" color={currentColors.text} />
                ) : (
                    <TouchableOpacity style={[styles.button, { backgroundColor: currentColors.buttonColor }]} onPress={handleForgotPassword}>
                        <CustomText style={[styles.buttonText, { color: currentColors.text }]}>{translation.submit}</CustomText>
                    </TouchableOpacity>
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        alignSelf: 'center',
        fontSize: 25,
        padding: 10,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginBottom: 15,
        borderRadius: 15,
    },
    errorText: {
        marginBottom: 10,
        fontSize: 14,
        color: 'red',
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontSize: 16,
    },
});

export default ForgotPasswordScreen;
