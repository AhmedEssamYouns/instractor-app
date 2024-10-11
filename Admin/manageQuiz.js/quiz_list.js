import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MaterialIcons } from '@expo/vector-icons';
import TeacherQuizCreation from './quiz_form';
import { useTheme } from '../../components/elements/theme-provider';
import colors from '../../constants/colors';
import CustomText from '../../components/elements/text';

const QuizAdminList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false); 
    const { theme } = useTheme()
    const currentColors = colors[theme]
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
        <View style={[styles.card,{backgroundColor:currentColors.cardBackground}]}>
            <View style={styles.cardContent}>
                <CustomText style={styles.quizTitle}>{item.title}</CustomText>
                <CustomText style={styles.quizTime}>Time Limit: {item.timeLimit} mins</CustomText>
            </View>
            <TouchableOpacity onPress={() => handleDeleteQuiz(item.id)} style={styles.deleteButton}>
                <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container,{backgroundColor:currentColors.background}]}>
            {}


            {}

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
        paddingHorizontal:20,
        flex: 1,
        paddingTop:10,
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
