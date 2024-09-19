import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import CheckBox from '@react-native-community/checkbox'; // Import CheckBox from community package
import { collection, doc, getDoc, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const StudentQuizAttempt = ({ route }) => {
    const { quizId } = route.params;
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);

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
            } catch (error) {
                console.error('Error fetching quiz: ', error);
            }
        };

        fetchQuiz();
    }, [quizId]);

    const handleAnswerChange = (index, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[index] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        let score = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correctOption) {
                score += 1;
            }
        });
        alert(`Your score: ${score}/${questions.length}`);
    };

    if (!quiz || questions.length === 0) {
        return <Text>Loading...</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text>Quiz: {quiz.title}</Text>
            {questions.map((question, index) => (
                <View key={index} style={styles.questionContainer}>
                    <Text>{question.text}</Text>
                    {question.options.map((option, optionIndex) => (
                        <View key={optionIndex} style={styles.optionContainer}>
                            <Text>{option}</Text>
                            <CheckBox
                                value={answers[index] === optionIndex}
                                onValueChange={() => handleAnswerChange(index, optionIndex)}
                            />
                        </View>
                    ))}
                </View>
            ))}
            <Button title="Submit" onPress={handleSubmit} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    questionContainer: {
        marginBottom: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default StudentQuizAttempt;
