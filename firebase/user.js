import { doc, getDoc } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from './config'; 

/**
 * Get user details by user ID
 * @param {string} userId - The user ID for which to fetch details.
 * @returns {Promise<{displayName: string, photoURL: string} | {error: string}>}
 */


export const getUserDetailsById = async (userId) => {
  try {
    
    const userDocRef = doc(db, 'users', userId);

    
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      
      const userData = userDoc.data();
      return {
        displayName: userData.displayName || null,
        photoURL: userData.photoURL || null,
        admin: userData.admin || false,
        author: userData.author || false,
      };
    } else {
      
      return { error: 'User not found' };
    }
  } catch (error) {
    
    return { error: error.message };
  }
};


export const checkIfUserIsAdmin = async () => {
  try {
    const user = FIREBASE_AUTH.currentUser;

    if (!user) {
      throw new Error('No authenticated user found.');
    }

    
    const userDocRef = doc(db, 'users', user.uid);

    
    const userDoc = await getDoc(userDocRef);

    
    if (userDoc.exists()) {
      const userData = userDoc.data();

      
      return userData.admin === true;
    } else {
      return false
    }
  } catch (error) {
    return false;
  }
};

export default checkIfUserIsAdmin;
