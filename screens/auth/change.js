import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ToastAndroid } from 'react-native';
import { changePassword } from '../../firebase/auth';
import colors from '../../constants/colors';
import translations from '../../constants/translations'; // Import translations
import { useTheme } from '../../components/elements/theme-provider';
import { useLanguage } from '../../components/elements/language-provider'; // Import the language context
import CustomText from '../../components/elements/text';
import { FIREBASE_AUTH } from '../../firebase/config';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/elements/back-button';

const ChangePasswordScreen = ({ }) => {
    const { theme } = useTheme(); // Get the theme from context
    const { language } = useLanguage(); // Get language from context
    const currentColors = colors[theme]; // Get colors based on the theme
    const translation = translations[language] || translations.en; // Fallback to English if translation is not available
    const navigation = useNavigation()
    const { user } = FIREBASE_AUTH.currentUser
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // State to handle loading

    const handleChangePassword = async () => {
        setLoading(true); // Start loading
        setError(null); // Clear any previous errors
        try {
            await changePassword(currentPassword, newPassword, confirmPassword, language);
            setLoading(false); // Stop loading
            // Show a success message or navigate to another screen
            ToastAndroid.show(translation.passwordChanged, ToastAndroid.SHORT);
            navigation.goBack()
        } catch (error) {
            setLoading(false); // Stop loading on error
            setError(error.message); // Set the error message
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <BackButton/>
            <CustomText style={styles.title}>{translation.changePassword}</CustomText>

            <TextInput
                placeholder={translation.currentPassword} // Use translations
                placeholderTextColor={currentColors.text}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={[styles.input, {
                    color: currentColors.text,
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.cardBackground,
                }]}
            />

            <TextInput
                placeholder={translation.newPassword} // Use translations
                placeholderTextColor={currentColors.text}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={[styles.input, {
                    color: currentColors.text,
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.cardBackground,
                }]}
            />

            <TextInput
                placeholder={translation.confirmPassword} // Use translations
                placeholderTextColor={currentColors.text}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={[styles.input, {
                    color: currentColors.text,
                    borderColor: currentColors.border,
                    backgroundColor: currentColors.cardBackground,
                }]}
            />

            {/* Display error message if exists */}
            {error && <CustomText style={styles.errorText}>{error}</CustomText>}

            {/* Loading spinner */}
            {
                loading ? (
                    <ActivityIndicator size="large" color={currentColors.text} />
                ) : (
                    <TouchableOpacity style={[styles.button, { backgroundColor: currentColors.buttonColor }]} onPress={handleChangePassword}>
                        <CustomText style={[styles.buttonText, { color: currentColors.text }]}>{translation.changePassword}</CustomText>
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

export default ChangePasswordScreen;
