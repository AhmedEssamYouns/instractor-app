import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { FIREBASE_AUTH } from './config';
import translations from '../constants/translations';

const getFriendlyErrorMessage = (errorCode, language = 'en') => {
  const translation = translations[language] || translations.en; // Fallback to English if translation is not available

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return translation.emailAlreadyInUse || 'This email address is already in use.';
    case 'auth/invalid-email':
      return translation.invalidEmail || 'Invalid email address.';
    case 'auth/weak-password':
      return translation.weakPassword || 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
      return translation.userNotFound || 'No user found with this email.';
    case 'auth/wrong-password':
      return translation.wrongPassword || 'Incorrect password.';
    case 'auth/network-request-failed':
      return translation.networkRequestFailed || 'Network error. Please check your connection and try again.';
    case 'auth/invalid-credential':
      return translation.invalidCredential || 'Invalid credential.';
    default:
      return translation.somethingWentWrong || 'Something went wrong. Please try again later.';
  }
};

export default getFriendlyErrorMessage;
export const signUp = async (email, password, confirmPassword, displayName, language = 'en') => {
  const translation = translations[language] || translations.en; // Fallback to English if translation is not available
  
  try {
    // Basic validation with translations
    if (!email || !password || !confirmPassword || !displayName) {
      throw new Error(translation.allFieldsRequired || 'All fields are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(translation.invalidEmail || 'Invalid email address.');
    }

    if (password.length < 6) {
      throw new Error(translation.weakPassword || 'Password should be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      throw new Error(translation.passwordsDoNotMatch || 'Passwords do not match.');
    }

    // Proceed with Firebase sign-up
    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    const user = userCredential.user;

    // Update the user's profile with the display name
    await updateProfile(user, { displayName });

    return user;
  } catch (error) {
    if (error.code) {
      // Map Firebase auth error codes to friendly messages
      throw new Error(getFriendlyErrorMessage(error.code, language));
    }
    throw error; // Rethrow non-Firebase errors
  }
};

// Sign-In function
export const signIn = async (email, password,language) => {
  try {
    if (!email || !password || !password) {
  const translation = translations[language] || translations.en; // Fallback to English if translation is not available
      throw new Error(translation.allFieldsRequired || 'All fields are required.');
    }

    const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    const user = userCredential.user;
    return user;
  } catch (error) {
    if (error.code) {
      // Map Firebase auth error codes to friendly messages
      throw new Error(getFriendlyErrorMessage(error.code,language));
    }
    throw error; // Rethrow non-Firebase errors
  }
};

// Sign-Out function (optional)
export const signOut = async () => {
  try {
    await firebaseSignOut(FIREBASE_AUTH);
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error.code) || 'Error signing out.');
  }
};
