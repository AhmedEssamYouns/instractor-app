import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const StudentQuizList = ({ navigation }) => {
    const [quizzes, setQuizzes] = useState([]);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const quizCollection = collection(db, 'quizzes');
                const quizSnapshot = await getDocs(quizCollection);
                const quizList = quizSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setQuizzes(quizList);
            } catch (error) {
                console.error('Error fetching quizzes: ', error);
            }
        };

        fetchQuizzes();
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={quizzes}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.quizCard}
                        onPress={() => navigation.navigate('QuizAttempt', { quizId: item.id })}
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        <Text>Time Limit: {item.timeLimit} minutes</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    quizCard: {
        padding: 20,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#f4f4f4',
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default StudentQuizList;
