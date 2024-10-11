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
import { FIREBASE_AUTH,db } from './config';
import translations from '../constants/translations';

import { setDoc, doc } from 'firebase/firestore';



const getFriendlyErrorMessage = (errorCode, language = 'en') => {
  const translation = translations[language] || translations.en; 

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
  const translation = translations[language] || translations.en;

  try {
    if (!email || !password || !confirmPassword || !displayName) {
      throw new Error(translation.allFieldsRequired || 'All fields are required.');
    }

    const trimmedDisplayName = displayName.trim();
    const trimmedPassword = password.trim();

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

    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, trimmedPassword);
    const user = userCredential.user;

    await updateProfile(user, { displayName: trimmedDisplayName });

    await setDoc(doc(db, 'users', user.uid), {
      displayName: trimmedDisplayName,
      email: user.email,
      photoURL: 'https://ganj.org/wp-content/uploads/elementor/thumbs/Vacant-qp5zvwg3uhphdhj4q8m7r7o6kwvwddnvqui5tk0vig.png'
    });

    return user;
  } catch (error) {
    if (error.code) {
      throw new Error(getFriendlyErrorMessage(error.code, language));
    }
    throw error;
  }
};





export const signIn = async (email, password, language) => {
  try {
    if (!email || !password) {
      const translation = translations[language] || translations.en;
      throw new Error(translation.allFieldsRequired || 'All fields are required.');
    }

    const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    const user = userCredential.user;
    return user;
  } catch (error) {
    if (error.code) {
      throw new Error(getFriendlyErrorMessage(error.code, language));
    }
    throw error; 
  }
};



export const forgotPassword = async (email, language = 'en') => {
  const translation = translations[language] || translations.en; 

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
      throw new Error(getFriendlyErrorMessage(error.code, language));
    }
    throw error; 
  }
};





export const changePassword = async (currentPassword, newPassword, confirmPassword, language = 'en') => {
  const translation = translations[language] || translations.en;

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
      throw new Error(getFriendlyErrorMessage(error.code, language));
    }
    throw error; 
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(FIREBASE_AUTH);
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error.code) || 'Error signing out.');
  }
};
