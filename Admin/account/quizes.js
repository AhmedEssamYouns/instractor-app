import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import CustomText from '../../components/elements/text';
import { db } from '../../firebase/config';

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingGrades, setLoadingGrades] = useState(true);

    useEffect(() => {
        // Fetch quizzes
        const quizzesRef = collection(db, 'quizzes');
        const unsubscribeQuizzes = onSnapshot(quizzesRef, (snapshot) => {
            const quizList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setQuizzes(quizList);
            setLoadingQuizzes(false); // Data is loaded
        });

        // Fetch students
        const studentsRef = collection(db, 'users');
        const unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
            const studentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStudents(studentList);
            setLoadingStudents(false); // Data is loaded
        });

        // Fetch grades
        const gradesRef = collection(db, 'grades');
        const unsubscribeGrades = onSnapshot(gradesRef, (snapshot) => {
            const gradeList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setGrades(gradeList);
            setLoadingGrades(false); // Data is loaded
        });

        return () => {
            unsubscribeQuizzes();
            unsubscribeStudents();
            unsubscribeGrades();
        };
    }, []);

    const renderQuizAttendees = ({ item }) => {
        const student = students.find(student => student.id === item.userId);
        return (
            <View style={styles.attendeeCard}>
                <CustomText style={styles.attendeeText}>
                    {student ? student.displayName : 'Unknown'}: {item.score}/{item.fullmark}
                </CustomText>
            </View>
        );
    };

    const renderQuiz = ({ item }) => (
        <View style={styles.quizCard}>
            <CustomText>{item.title}</CustomText>
            <FlatList
                data={grades.filter(grade => grade.quizId === item.id)}
                keyExtractor={item => item.id}
                renderItem={renderQuizAttendees}
                contentContainerStyle={styles.flatList}
            />
        </View>
    );

    // Check if data is still loading
    const isLoading = loadingQuizzes || loadingStudents || loadingGrades;

    return (
        isLoading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        ) : (
            <FlatList
                data={quizzes}
                keyExtractor={item => item.id}
                renderItem={renderQuiz}
                contentContainerStyle={styles.flatList}
            />
        )
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quizCard: {
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 0,
        margin: 20,
        elevation: 1,
        backgroundColor: '#f9f9f9',
    },
    attendeeCard: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    attendeeText: {
        fontSize: 16,
    },
    flatList: {
        paddingBottom: 20,
    },
});

export default Quizzes;