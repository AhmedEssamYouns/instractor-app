import { updateProfile } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';
import { FIREBASE_AUTH, db } from "./config";

import { doc,updateDoc } from "firebase/firestore";

export const selectImageAndUpdateProfile = async () => {
  // Request permission to access camera roll
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permissionResult.granted === false) {
    throw new Error("Permission to access camera roll is required!");
  }

  // Launch image picker with editing enabled
  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true, // Enable editing (cropping, etc.)
    aspect: [1, 1], // Optional: Force square aspect ratio (1:1)
    quality: 0.7, // Optional: Adjust image quality (0 to 1)
  });

  if (!pickerResult.canceled) {
    const imageUri = pickerResult.assets.length > 0 ? pickerResult.assets[0].uri : null;

    if (!FIREBASE_AUTH.currentUser) {
      throw new Error("User is not authenticated!");
    }

    const userDocRef = doc(db, 'users', FIREBASE_AUTH.currentUser.uid);
    await updateDoc(userDocRef, { photoURL : imageUri });
    // Update the profile with the new photoURL
    await updateProfile(FIREBASE_AUTH.currentUser, { photoURL: imageUri });
    return imageUri; // Return the image URI to be used in the component
  }

  throw new Error("Image picker was cancelled");
};
