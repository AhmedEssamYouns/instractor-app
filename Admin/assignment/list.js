import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SubmissionsList from './submitiion_list';
import CustomText from '../../components/elements/text';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

const AssignmentsList = ({ onEdit }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const assignmentsRef = collection(db, 'assignments');
        const unsubscribe = onSnapshot(assignmentsRef, (snapshot) => {
            const assignmentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                showSubmissions: false, // Initialize submission visibility
            }));
            setAssignments(assignmentList);
            setLoading(false); // Set loading to false when data is fetched
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'assignments', id));
            Alert.alert('Success', 'Assignment deleted successfully');
        } catch (error) {
            Alert.alert('Error', 'Could not delete assignment: ' + error.message);
        }
    };

    const toggleSubmissions = (id) => {
        setAssignments((prevAssignments) =>
            prevAssignments.map((assignment) =>
                assignment.id === id
                    ? { ...assignment, showSubmissions: !assignment.showSubmissions }
                    : assignment
            )
        );
    };

    const renderAssignment = ({ item }) => {
        return (
            <View style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
                <Text>{item.description}</Text>
                <Text style={styles.deadline}>Deadline: {item.deadline.toDate().toLocaleString()}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.editButton} onPress={() => onEdit(item)}>
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.submissionsButton}
                        onPress={() => toggleSubmissions(item.id)}
                    >
                        <CustomText>
                            {item.showSubmissions ? 'Hide Submissions' : `See Submissions`}
                        </CustomText>
                        <Entypo name={item.showSubmissions ? 'chevron-up' : 'chevron-down'} size={16} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                        <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                </View>
                {item.showSubmissions && <SubmissionsList assignmentId={item.id} />}
            </View>
        );
    };

    if (loading) {
        // Show loading spinner in the center of the screen
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <FlatList
            data={assignments}
            keyExtractor={item => item.id}
            renderItem={renderAssignment}
            contentContainerStyle={styles.flatList}
        />
    );
};

const styles = StyleSheet.create({
    flatList: {
        paddingBottom: 50,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
        elevation: 1
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    deadline: {
        fontStyle: 'italic',
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingBottom: 10,
    },
    editButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
    },
    submissionsButton: {
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 5,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center'
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default AssignmentsList;
