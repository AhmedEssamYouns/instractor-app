import { collection, onSnapshot, query, where ,addDoc,doc,deleteDoc, orderBy} from 'firebase/firestore';
import { db } from './config';
import { Alert } from 'react-native';

// Add or update a student's submission
export const submitHomework = async (studentSubmission, documentUri, documentName, assignment, studentId, onSubmissionChange,setDocumentName,setDocumentUri) => {
    if (!documentUri) {
        Alert.alert('Error', 'No document selected');
        return;
    }

    if (!studentId) {
        Alert.alert('Error', 'Invalid student ID');
        return;
    }

    try {
        let submissionData;
        if (studentSubmission?.id) {
            // If the submission exists, update it
            const submissionRef = doc(db, 'submissions', studentSubmission.id);
            await updateDoc(submissionRef, {
                documentUri,
                documentName,
            });
            submissionData = { ...studentSubmission, documentUri, documentName };
            Alert.alert('Success', 'Homework updated successfully');
        } else {
            // If the submission doesn't exist, create a new one
            const submissionsCollection = collection(db, 'submissions');
            const submissionRef = await addDoc(submissionsCollection, {
                studentId,
                assignmentId: assignment.id,
                documentUri,
                documentName,
                submittedAt: new Date(),
            });
            submissionData = {
                id: submissionRef.id,
                studentId,
                assignmentId: assignment.id,
                documentUri,
                documentName,
                submittedAt: new Date(),
            };

            Alert.alert('Success', 'Homework submitted successfully');
        }
        setDocumentName(null)
        setDocumentUri(null)
        onSubmissionChange(submissionData);
    } catch (error) {
        Alert.alert('Error', 'Could not submit homework: ' + error.message);
    }
};

// Delete a student's submission
export const deleteHomework = async (studentSubmissionId, onSubmissionChange) => {
    Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this submission?',
        [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const submissionRef = doc(db, 'submissions', studentSubmissionId);
                        await deleteDoc(submissionRef);
                        onSubmissionChange(null);  // Update the submission state locally
                        Alert.alert('Deleted', 'Homework deleted successfully');
                    } catch (error) {
                        Alert.alert('Error', 'Could not delete homework: ' + error.message);
                    }
                },
            },
        ]
    );
};



export const getAssignments = (callback) => {
    try {
        const assignmentsCollection = collection(db, 'assignments');

        // Query Firestore collection and order by 'createdAt' field in descending order
        const q = query(assignmentsCollection, orderBy('createdAt', 'desc'));

        // Listen for real-time updates using onSnapshot
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const assignments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            callback(assignments); // Pass the sorted assignments to the callback
        });

        // Return the unsubscribe function to stop listening when needed
        return unsubscribe;
    } catch (error) {
        console.error('Error fetching assignments:', error);
        throw new Error('Failed to fetch assignments');
    }
};

// Function to listen for a student's submission for a particular assignment
export const getStudentSubmission = (assignmentId, studentId, callback) => {
    if (!assignmentId || !studentId) {
        console.error('Invalid assignmentId or studentId');
        return;
    }

    try {
        const submissionsCollection = collection(db, 'submissions');

        // Create a query to find the submission of the specific student for the assignment
        const q = query(
            submissionsCollection,
            where('assignmentId', '==', assignmentId),
            where('studentId', '==', studentId)
        );

        // Listen for real-time updates using onSnapshot
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const submissionDoc = snapshot.docs[0];
                const submissionData = {
                    id: submissionDoc.id,
                    ...submissionDoc.data(),
                };
                callback(submissionData);  // Call the callback with submission data
            } else {
                callback(null);  // No submission found
            }
        });

        // Return the unsubscribe function to stop listening when needed
        return unsubscribe;
    } catch (error) {
        console.error('Error fetching student submission:', error);
        throw new Error('Failed to fetch student submission');
    }
};
