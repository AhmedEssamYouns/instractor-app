import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signIn } from '../../firebase/auth';
import colors from '../../constants/colors';
import translations from '../../constants/translations'; 
import { useTheme } from '../../components/elements/theme-provider';
import { useLanguage } from '../../components/elements/language-provider'; 
import { FontAwesome5 } from '@expo/vector-icons'; 
import CustomText from '../../components/elements/text';
import { CommonActions } from '@react-navigation/native'; 

const SignInScreen = ({ navigation }) => {
  const { theme } = useTheme(); 
  const { language } = useLanguage(); 
  const currentColors = colors[theme]; 
  const translation = translations[language] || translations.en; 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); 

  const handleSignIn = async () => {
    setLoading(true); 
    setError(null); 
    try {
      await signIn(email, password, language);
      setLoading(false); 

      
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'tabs' }], 
        })
      );
    } catch (error) {
      setLoading(false); 
      setError(error.message); 
    }
  };

  const handleForgotPassword = () => {
    
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <CustomText style={styles.title}>{translation.signIn}</CustomText>

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

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={translation.password} 
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
          style={[
            styles.eyeIcon,
            {right: 10}
          ]}
        
          onPress={() => setShowPassword(!showPassword)}
        >
          <FontAwesome5
            name={showPassword ? 'eye' : 'eye-slash'}
            size={20}
            color={currentColors.text}
          />
        </TouchableOpacity>
      </View>

      {}
      {error && <CustomText style={styles.errorText}>{error}</CustomText>}

      {}
      {
        loading ? (
          <ActivityIndicator size="large" color={currentColors.text} />
        ) : (
          <TouchableOpacity style={[styles.button, { backgroundColor: currentColors.buttonColor }]} onPress={handleSignIn}>
            <CustomText style={[styles.buttonText, { color: currentColors.text }]}>{translation.signIn}</CustomText>
          </TouchableOpacity>
        )
      }

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
    </View >
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
    alignSelf:'center',
    alignItems:'center',
    position: 'absolute',
    top: 15,
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
