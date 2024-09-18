import { doc, getDoc } from 'firebase/firestore';
import { db } from './config'; // Ensure db is exported from config

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
        photoURL: userData.photoURL || null
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
