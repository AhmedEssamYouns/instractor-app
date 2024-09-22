import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import TeacherQuizCreation from './quiz_form';

const QuizAdminList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);  // State to control form visibility
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'quizzes'), (snapshot) => {
            const quizList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setQuizzes(quizList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDeleteQuiz = (quizId) => {
        Alert.alert(
            'Delete Quiz',
            'Are you sure you want to delete this quiz?',
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
                            await deleteDoc(doc(db, 'quizzes', quizId));
                            Alert.alert('Success', 'Quiz deleted successfully!');
                        } catch (error) {
                            console.error('Error deleting quiz:', error);
                        }
                    },
                },
            ]
        );
    };

    const renderQuiz = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.quizTitle}>{item.title}</Text>
                <Text style={styles.quizTime}>Time Limit: {item.timeLimit} mins</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteQuiz(item.id)} style={styles.deleteButton}>
                <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Button to toggle form visibility */}


            {/* Show or hide the quiz creation form based on the showForm state */}

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <FlatList
                    ListHeaderComponent={
                        <>
                            <TouchableOpacity
                                style={styles.toggleButton}
                                onPress={() => setShowForm(!showForm)}
                            >
                                <Text style={styles.toggleButtonText}>
                                    {showForm ? 'Close Quiz Form' : 'Create New Quiz'}
                                </Text>
                            </TouchableOpacity>
                            {showForm && <TeacherQuizCreation />}
                        </>
                    }
                    data={quizzes}
                    keyExtractor={item => item.id}
                    renderItem={renderQuiz}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    cardContent: {
        flex: 1,
    },
    quizTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    quizTime: {
        fontSize: 16,
        color: '#555',
    },
    deleteButton: {
        marginLeft: 10,
    },
    list: {
        paddingBottom: 20,
    },
    toggleButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default QuizAdminList;
