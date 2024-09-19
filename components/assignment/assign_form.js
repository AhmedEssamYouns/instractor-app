import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { collection, addDoc, serverTimestamp, updateDoc, doc ,Timestamp} from 'firebase/firestore';
import { db } from '../../firebase/config';

const AssignmentForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState(null);
    const [isDeadlinePickerVisible, setDeadlinePickerVisibility] = useState(false);
    const [pickedDeadline, setPickedDeadline] = useState(null);
    const [isLoading, setIsLoading] = useState(false);  // Loading state

    const addAssignmentToFirestore = async () => {
        if (!title || !description || !deadline) {
            Alert.alert('Validation Error', 'Title, Description, and Deadline are required');
            return;
        }
    
        setIsLoading(true);  // Start loading
    
        try {
            // Add the assignment to Firestore
            const docRef = await addDoc(collection(db, 'assignments'), {
                title,
                description,
                deadline: Timestamp.fromDate(deadline),  // Convert Date to Firestore Timestamp
                createdAt: serverTimestamp(), // Firebase server timestamp
            });
    
            // Update the document to include its ID after creation
            await updateDoc(doc(db, 'assignments', docRef.id), {
                id: docRef.id,
            });
    
            Alert.alert('Success', 'Assignment added successfully with ID: ' + docRef.id);
    
            // Reset form fields
            setTitle('');
            setDescription('');
            setDeadline(null);
            setPickedDeadline(null);
        } catch (error) {
            Alert.alert('Error', 'Could not add assignment: ' + error.message);
        } finally {
            setIsLoading(false);  // Stop loading
        }
    };
    

    // Functions to handle the deadline date picker
    const showDeadlinePicker = () => {
        setDeadlinePickerVisibility(true);
    };

    const hideDeadlinePicker = () => {
        setDeadlinePickerVisibility(false);
    };

    const handleConfirmDeadline = (date) => {
        setDeadline(date);
        setPickedDeadline(date.toLocaleString()); // Format and show picked deadline
        hideDeadlinePicker();
    };

    return (
        <View style={styles.container}>
            <Text>Title:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={title}
                onChangeText={setTitle}
            />

            <Text>Description:</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter description"
                multiline
                value={description}
                onChangeText={setDescription}
            />

            <Text>Deadline:</Text>
            <TouchableOpacity style={styles.button} onPress={showDeadlinePicker}>
                <Text style={styles.buttonText}>
                    {pickedDeadline ? 'Edit Deadline' : 'Pick Deadline'}
                </Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={isDeadlinePickerVisible}
                mode="datetime"
                onConfirm={handleConfirmDeadline}
                onCancel={hideDeadlinePicker}
            />

            {pickedDeadline && (
                <Text style={styles.pickedDateText}>Selected Deadline: {pickedDeadline}</Text>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={addAssignmentToFirestore}>
                {isLoading ? (
                    <ActivityIndicator color="#fff" /> // Show loading spinner
                ) : (
                    <Text style={styles.buttonText}>Submit Assignment</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 10,
        marginTop: 20,
        borderRadius: 5,
    },
    pickedDateText: {
        marginTop: 10,
        fontStyle: 'italic',
        color: '#333',
    },
});

export default AssignmentForm;
