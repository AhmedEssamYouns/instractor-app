import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { pickDocument } from '../firebase/posts';  // This is the document picker


const AssignmentItem = ({ assignment, studentSubmission }) => {
    const [documentUri, setDocumentUri] = useState(studentSubmission?.documentUri || null);
    const [documentName, setDocumentName] = useState(studentSubmission?.documentName || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasDeadlinePassed, setHasDeadlinePassed] = useState(false);

    useEffect(() => {
        const now = new Date();
        const deadlineDate = new Date(assignment.deadline?.seconds * 1000); // Convert Firestore timestamp to JS date
        setHasDeadlinePassed(now > deadlineDate);
    }, [assignment.deadline]);

    const handlePickDocument = async () => {
        await pickDocument(setDocumentUri, setDocumentName);
    };

    const handleSubmitHomework = async () => {
        if (!documentUri) {
            Alert.alert('Error', 'No document selected');
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionRef = doc(db, 'submissions', studentSubmission?.id || '');
            await updateDoc(submissionRef, {
                documentUri,
                documentName,
            });
            Alert.alert('Success', 'Homework submitted successfully');
        } catch (error) {
            Alert.alert('Error', 'Could not submit homework: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSubmission = async () => {
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
                            await deleteDoc(doc(db, 'submissions', studentSubmission.id));
                            setDocumentUri(null);
                            setDocumentName(null);
                            Alert.alert('Deleted', 'Homework deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Could not delete homework: ' + error.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.assignmentCard}>
            <Text style={styles.title}>{assignment.title}</Text>
            <Text>{assignment.description}</Text>
            <Text>Created at: {new Date(assignment.createdAt?.seconds * 1000).toLocaleString()}</Text>
            <Text>Deadline: {new Date(assignment.deadline?.seconds * 1000).toLocaleString()}</Text>

            {hasDeadlinePassed ? (
                studentSubmission ? (
                    <Text style={styles.submittedText}>Homework was submitted on time.</Text>
                ) : (
                    <Text style={styles.missedText}>Missed the deadline.</Text>
                )
            ) : (
                <>
                    <TouchableOpacity style={styles.button} onPress={handlePickDocument}>
                        <Text style={styles.buttonText}>
                            {documentUri ? 'Change Document' : 'Pick Homework'}
                        </Text>
                    </TouchableOpacity>

                    {documentUri && (
                        <>
                            <Text>Selected Document: {documentName}</Text>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmitHomework}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Submit Homework</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDeleteSubmission}
                            >
                                <Text style={styles.buttonText}>Delete Submission</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    assignmentCard: {
        padding: 20,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    submittedText: {
        color: '#28a745',
        fontWeight: 'bold',
    },
    missedText: {
        color: '#dc3545',
        fontWeight: 'bold',
    },
});

export default AssignmentItem;
