import { doc, getDoc } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from './config'; // Ensure db is exported from config

/**
 * Get user details by user ID
 * @param {string} userId - The user ID for which to fetch details.
 * @returns {Promise<{displayName: string, photoURL: string} | {error: string}>}
 */


export const getUserDetailsById = async (userId) => {
  try {
    // Reference to the user document in Firestore
    const userDocRef = doc(db, 'users', userId);

    // Fetch the document
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Extract user data
      const userData = userDoc.data();
      return {
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        admin: userData.admin || false,
        author: userData.author || false,
      };
    } else {
      // Document does not exist
      return { error: 'User not found' };
    }
  } catch (error) {
    // Handle errors (e.g., network issues)
    return { error: error.message };
  }
};

// Function to check if the current user is an admin
export const checkIfUserIsAdmin = async () => {
  try {
    const user = FIREBASE_AUTH.currentUser;

    if (!user) {
      throw new Error('No authenticated user found.');
    }

    // Reference to the user's document in Firestore (assumes users are stored in a "users" collection)
    const userDocRef = doc(db, 'users', user.uid);

    // Fetch the user's document
    const userDoc = await getDoc(userDocRef);

    // Check if the document exists
    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Check if the 'admin' property is true
      return userData.admin === true;
    } else {
      return false
    }
  } catch (error) {
    return false;
  }
};

export default checkIfUserIsAdmin;
