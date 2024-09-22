import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { collection, addDoc, serverTimestamp, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AssignmentsList from './list';
import { useTheme } from '../../components/elements/theme-provider';
import colors from '../../constants/colors';

const AssignmentForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState(null);
    const [isDeadlinePickerVisible, setDeadlinePickerVisibility] = useState(false);
    const [pickedDeadline, setPickedDeadline] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false); // State for form visibility

    const addAssignmentToFirestore = async () => {
        if (!title || !description || !deadline) {
            Alert.alert('Validation Error', 'Title, Description, and Deadline are required');
            return;
        }

        setIsLoading(true);

        try {
            const assignmentData = {
                title,
                description,
                deadline: Timestamp.fromDate(deadline),
                createdAt: serverTimestamp(),
            };

            if (editingAssignment) {
                await updateDoc(doc(db, 'assignments', editingAssignment.id), assignmentData);
                Alert.alert('Success', 'Assignment updated successfully');
                setEditingAssignment(null);
            } else {
                const docRef = await addDoc(collection(db, 'assignments'), assignmentData);
                Alert.alert('Success', 'Assignment added successfully with ID: ' + docRef.id);
            }

            resetForm();
        } catch (error) {
            Alert.alert('Error', 'Could not add/update assignment: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDeadline(null);
        setPickedDeadline(null);
        setIsFormVisible(false)
    };

    const handleEditAssignment = (assignment) => {
        setEditingAssignment(assignment);
        setTitle(assignment.title);
        setDescription(assignment.description);
        setDeadline(assignment.deadline.toDate());
        setPickedDeadline(assignment.deadline.toDate().toLocaleString());
        setIsFormVisible(true)

    };

    const handleCancelEdit = () => {
        resetForm();
        setEditingAssignment(null); // Clear editing state
    };

    const showDeadlinePicker = () => {
        setDeadlinePickerVisibility(true);
    };

    const hideDeadlinePicker = () => {
        setDeadlinePickerVisibility(false);
    };

    const handleConfirmDeadline = (date) => {
        setDeadline(date);
        setPickedDeadline(date.toLocaleString());
        hideDeadlinePicker();
    };
    const { theme } = useTheme()
    const currentColors = colors[theme]
    return (
        <View style={[styles.container,{backgroundColor:currentColors.background}]}>
            <TouchableOpacity style={styles.toggleButton} onPress={() => setIsFormVisible(!isFormVisible)}>
                <Text style={styles.buttonText}>{isFormVisible ? 'Hide Form' : 'Show Form'}</Text>
            </TouchableOpacity>

            {isFormVisible && (
                <>
                <View style={{backgroundColor:'#eeee',padding:10,borderRadius:10,margin:10,elevation:1}}>
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
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{editingAssignment ? 'Update Assignment' : 'Submit Assignment'}</Text>
                        )}
                    </TouchableOpacity>

                    {editingAssignment && (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                            <Text style={styles.buttonText}>Cancel Edit</Text>
                        </TouchableOpacity>
                    )}
                    </View>
                </>
            )}

            <AssignmentsList onEdit={handleEditAssignment} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex:1,
        paddingHorizontal:20,
    },
    toggleButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    input: {
        padding: 10,
        backgroundColor:'#fff',
        marginBottom: 10,
        marginTop:5,
        borderRadius: 25,
        elevation:1
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
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
    },
    pickedDateText: {
        marginTop: 10,
        fontStyle: 'italic',
        color: '#333',
    },
});

export default AssignmentForm;
