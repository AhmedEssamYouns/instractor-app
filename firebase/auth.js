import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
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
    case 'auth/missing-password':
      return translation.missingPassword || 'Password is required.';
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

    // Trim the inputs to remove any extra whitespace
    const trimmedDisplayName = displayName.trim();
    const trimmedPassword = password.trim();

    // Check if the displayName or password are just spaces
    if (trimmedDisplayName.length === 0 || trimmedPassword.length === 0) {
      throw new Error(translation.allFieldsRequired || 'All fields are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(translation.invalidEmail || 'Invalid email address.');
    }

    if (trimmedPassword.length < 6) {
      throw new Error(translation.weakPassword || 'Password should be at least 6 characters long.');
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      throw new Error(translation.passwordsDoNotMatch || 'Passwords do not match.');
    }

    // Proceed with Firebase sign-up
    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, trimmedPassword);
    const user = userCredential.user;

    // Update the user's profile with the display name
    await updateProfile(user, { displayName: trimmedDisplayName });

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
export const signIn = async (email, password, language) => {
  try {
    if (!email || !password) {
      const translation = translations[language] || translations.en; // Fallback to English if translation is not available
      throw new Error(translation.allFieldsRequired || 'All fields are required.');
    }

    const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    const user = userCredential.user;
    return user;
  } catch (error) {
    if (error.code) {
      // Map Firebase auth error codes to friendly messages
      throw new Error(getFriendlyErrorMessage(error.code, language));
    }
    throw error; // Rethrow non-Firebase errors
  }
};

// Forgot Password function
export const forgotPassword = async (email, language = 'en') => {
  const translation = translations[language] || translations.en; // Fallback to English if translation is not available

  try {
    if (!email) {
      throw new Error(translation.email || 'Email is required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(translation.invalidEmail || 'Invalid email address.');
    }

    await sendPasswordResetEmail(FIREBASE_AUTH, email);
  } catch (error) {
    if (error.code) {
      // Map Firebase auth error codes to friendly messages
      throw new Error(getFriendlyErrorMessage(error.code, language));
    }
    throw error; // Rethrow non-Firebase errors
  }
};

// Change Password function
export const changePassword = async (currentPassword, newPassword, confirmPassword, language = 'en') => {
  const translation = translations[language] || translations.en; // Fallback to English if translation is not available

  try {
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new Error(translation.allFieldsRequired || 'All fields are required.');
    }

    if (newPassword.length < 6) {
      throw new Error(translation.weakPassword || 'Password should be at least 6 characters long.');
    }

    if (newPassword !== confirmPassword) {
      throw new Error(translation.passwordsDoNotMatch || 'Passwords do not match.');
    }

    const credential = EmailAuthProvider.credential(FIREBASE_AUTH.currentUser.email, currentPassword);
    await reauthenticateWithCredential(FIREBASE_AUTH.currentUser, credential);
    await updatePassword(FIREBASE_AUTH.currentUser, newPassword);
  } catch (error) {
    if (error.code) {
      // Map Firebase auth error codes to friendly messages
      throw new Error(getFriendlyErrorMessage(error.code, language));
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
