import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import CustomCheckbox from '../elements/checkbox';

const StudentQuizAttempt = ({ route }) => {
    const { quizId } = route.params;
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
                const quizData = quizDoc.data();
                setQuiz(quizData);

                const questionsRef = collection(db, 'quizzes', quizId, 'questions');
                const questionsSnapshot = await getDocs(questionsRef);
                const questionsData = questionsSnapshot.docs.map(doc => doc.data());
                setQuestions(questionsData);

                setAnswers(new Array(questionsData.length).fill(null));
                
                // Set countdown timer
                if (quizData.timeLimit) {
                    setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
                }
            } catch (error) {
                console.error('Error fetching quiz: ', error);
            }
        };

        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        let timer;
        if (timeLeft > 0 && !isSubmitting) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeLeft, isSubmitting]);

    const handleAnswerChange = (index, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[index] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        let score = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correctOption) {
                score += 1;
            }
        });

        alert(`Your score: ${score}/${questions.length}`);
        // Optionally, navigate to another screen or perform additional actions
    };

    if (!quiz || questions.length === 0) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Quiz: {quiz.title}</Text>
            <Text style={styles.timer}>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
            {questions.map((question, index) => (
                <View key={index} style={styles.questionContainer}>
                    <Text style={styles.questionText}>{question.text}</Text>
                    {question.options.map((option, optionIndex) => (
                        <View key={optionIndex} style={styles.optionContainer}>
                            <CustomCheckbox
                                isChecked={answers[index] === optionIndex}
                                onPress={() => handleAnswerChange(index, optionIndex)}
                                label={option}
                            />
                        </View>
                    ))}
                </View>
            ))}
            <Button title="Submit" onPress={handleSubmit} disabled={isSubmitting} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    timer: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        color: '#FF0000',
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
});

export default StudentQuizAttempt;
