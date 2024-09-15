import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ToastAndroid } from 'react-native';
import { signUp } from '../../firebase/auth';
import colors from '../../constants/colors';
import translations from '../../constants/translations';
import { useTheme } from '../../components/elements/theme-provider';
import { useLanguage } from '../../components/elements/language-provider';
import CustomText from '../../components/elements/text';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const currentColors = colors[theme];
  const translation = translations[language] || translations.en;
  const navigation = useNavigation();

  const [displayName, setDisplayName] = useState(''); // State for display name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, confirmPassword, displayName, language); // Pass display name
      setLoading(false);
      ToastAndroid.show(translation.signUpSuccess || 'Sign up successful', ToastAndroid.SHORT);
      navigation.navigate('SignIn');

    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <CustomText style={styles.title}>{translation.signUp}</CustomText>

      <TextInput
        placeholder={translation.displayName} // Display name field
        placeholderTextColor={currentColors.text}
        value={displayName}
        onChangeText={setDisplayName}
        style={[styles.input, {
          color: currentColors.text,
          borderColor: currentColors.border,
          backgroundColor: currentColors.cardBackground,
        }]}
      />

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

      <TextInput
        placeholder={translation.password}
        placeholderTextColor={currentColors.text}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, {
          color: currentColors.text,
          borderColor: currentColors.border,
          backgroundColor: currentColors.cardBackground,
        }]}
      />

      <TextInput
        placeholder={translation.confirmPassword}
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

      {error ? <CustomText style={[styles.errorText, { color: 'red' }]}>{error}</CustomText> : null}

      <TouchableOpacity style={[styles.button, { backgroundColor: currentColors.buttonColor }]} onPress={handleSignUp}>
        {loading ? <ActivityIndicator color={currentColors.text} /> : (
          <CustomText style={[styles.buttonText, { color: currentColors.text }]}>{translation.signUp}</CustomText>
        )}
      </TouchableOpacity>
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
    textAlign: 'center',
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

export default SignUpScreen;
