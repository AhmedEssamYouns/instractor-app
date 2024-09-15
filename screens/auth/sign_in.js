import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signIn } from '../../firebase/auth';
import colors from '../../constants/colors';
import translations from '../../constants/translations'; // Import translations
import { useTheme } from '../../components/elements/theme-provider';
import { useLanguage } from '../../components/elements/language-provider'; // Import the language context
import { FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5 for eye icon
import CustomText from '../../components/elements/text';
import { CommonActions } from '@react-navigation/native'; // Import CommonActions

const SignInScreen = ({ navigation }) => {
  const { theme } = useTheme(); // Get the theme from context
  const { language } = useLanguage(); // Get language from context
  const currentColors = colors[theme]; // Get colors based on the theme
  const translation = translations[language] || translations.en; // Fallback to English if translation is not available

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // State to handle loading

  const handleSignIn = async () => {
    setLoading(true); // Start loading
    setError(null); // Clear any previous errors
    try {
      await signIn(email, password,language);
      setLoading(false); // Stop loading after sign-in

      // Use navigation.dispatch to reset the stack and navigate to the home screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'tabs' }], // The 'tabs' screen
        })
      );
    } catch (error) {
      setLoading(false); // Stop loading on error
      setError(error.message); // Set the error message
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <CustomText style={styles.title}>{translation.signIn}</CustomText>
      
      <TextInput
        placeholder={translation.email} // Use translations
        placeholderTextColor={currentColors.text}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, {
          color: currentColors.text,
          borderColor: currentColors.border,
          backgroundColor: currentColors.cardBackground,
        }]}
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={translation.password} // Use translations
          placeholderTextColor={currentColors.text}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.input, {
            color: currentColors.text,
            borderColor: currentColors.border,
            backgroundColor: currentColors.cardBackground,
            textAlign: language === 'ar' ? 'right' : 'left',
          }]}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <FontAwesome5
            name={showPassword ? 'eye' : 'eye-slash'}
            size={20}
            color={currentColors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Display error message if exists */}
      {error && <CustomText style={styles.errorText}>{error}</CustomText>}

      {/* Loading spinner */}
      {loading ? (
        <ActivityIndicator size="large" color={currentColors.text} />
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: currentColors.buttonColor }]} onPress={handleSignIn}>
          <CustomText style={[styles.buttonText, { color: currentColors.text }]}>{translation.signIn}</CustomText>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
        <CustomText style={[styles.forgotPasswordText, { color: currentColors.iconColor }]}>
          {translation.forgotPassword}
        </CustomText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.signUp} onPress={() => navigation.navigate('SignUp')}>
        <CustomText style={[styles.signUpText, { color: currentColors.iconColor }]}>
          {translation.signUp}
        </CustomText>
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
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
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
  forgotPassword: {
    marginTop: 10,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signUp: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
  },
});

export default SignInScreen;
