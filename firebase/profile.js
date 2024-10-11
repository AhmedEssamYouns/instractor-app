import { updateProfile } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';
import { FIREBASE_AUTH, db } from "./config";

import { doc,updateDoc } from "firebase/firestore";

export const selectImageAndUpdateProfile = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    throw new Error("Permission to access camera roll is required!");
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true, 
    aspect: [1, 1], 
    quality: 0.7, 
  });

  if (!pickerResult.canceled) {
    const imageUri = pickerResult.assets.length > 0 ? pickerResult.assets[0].uri : null;

    if (!FIREBASE_AUTH.currentUser) {
      throw new Error("User is not authenticated!");
    }

    const userDocRef = doc(db, 'users', FIREBASE_AUTH.currentUser.uid);
    await updateDoc(userDocRef, { photoURL : imageUri });
    await updateProfile(FIREBASE_AUTH.currentUser, { photoURL: imageUri });
    return imageUri; 
  }

  throw new Error("Image picker was cancelled");
};
