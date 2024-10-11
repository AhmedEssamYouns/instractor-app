import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import CustomCheckbox from '../elements/checkbox';

const TeacherQuizCreation = () => {
    const [title, setTitle] = useState('');
    const [timeLimit, setTimeLimit] = useState('');
    const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctOption: 0 }]);
    const [loading, setLoading] = useState(false); 

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOption: 0 }]);
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = questions.filter((_, questionIndex) => questionIndex !== index);
        setQuestions(newQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, text) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex] = text;
        setQuestions(newQuestions);
    };

    const handleCorrectOptionChange = (questionIndex, optionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].correctOption = optionIndex;
        setQuestions(newQuestions);
    };

    const validateQuiz = () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Quiz title is required.');
            return false;
        }
        if (!timeLimit || isNaN(timeLimit)) {
            Alert.alert('Validation Error', 'Time limit must be a valid number.');
            return false;
        }
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (!question.text.trim()) {
                Alert.alert('Validation Error', `Question ${i + 1} text is required.`);
                return false;
            }
            for (let j = 0; j < question.options.length; j++) {
                if (!question.options[j].trim()) {
                    Alert.alert('Validation Error', `Option ${j + 1} for question ${i + 1} is required.`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSaveQuiz = async () => {
        if (!validateQuiz()) return;

        setLoading(true); 
        try {
            const quizRef = await addDoc(collection(db, 'quizzes'), {
                title,
                timeLimit: parseInt(timeLimit),
                createdAt: Timestamp.now(),
            });

            const questionsRef = collection(db, 'quizzes', quizRef.id, 'questions');
            for (const question of questions) {
                await addDoc(questionsRef, {
                    text: question.text,
                    options: question.options,
                    correctOption: question.correctOption,
                });
            }

            setTitle('');
            setTimeLimit('');
            setQuestions([{ text: '', options: ['', '', '', ''], correctOption: 0 }]);

            Alert.alert('Success', 'Quiz created successfully!');
        } catch (error) {
            console.error('Error creating quiz: ', error);
        } finally {
            setLoading(false); 
        }
    };

    const renderQuestion = ({ item, index }) => (
        <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionTitle}>Question {index + 1}</Text>
            <TextInput
                value={item.text}
                onChangeText={(text) => {
                    const newQuestions = [...questions];
                    newQuestions[index].text = text;
                    setQuestions(newQuestions);
                }}
                placeholder="Enter question text"
                style={styles.input}
                multiline 
            />
            {item.options.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionContainer}>
                    <TextInput
                        value={option}
                        onChangeText={(text) => handleOptionChange(index, optionIndex, text)}
                        placeholder={`Option ${optionIndex + 1}`}
                        style={styles.input}
                        multiline
                    />
                    <CustomCheckbox
                        isChecked={item.correctOption === optionIndex}
                        onPress={() => handleCorrectOptionChange(index, optionIndex)}
                    />
                </View>
            ))}
            {questions.length > 1 &&
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveQuestion(index)}>
                    <Text style={styles.removeButtonText}>Remove Question</Text>
                </TouchableOpacity>
            }
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>Create Quiz</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Quiz Title"
                            style={styles.input}
                            multiline 
                        />

                        <TextInput
                            value={timeLimit}
                            onChangeText={setTimeLimit}
                            keyboardType="numeric"
                            placeholder="Time Limit (in minutes)"
                            style={styles.input}
                        />
                    </>
                }
                data={questions}
                renderItem={renderQuestion}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.flatlistContainer}
                ListFooterComponent={
                    <>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddQuestion}>
                            <Text style={styles.addButtonText}>Add Question</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveQuiz} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Quiz</Text>}
                        </TouchableOpacity>
                    </>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
        width: '100%',
    },
    questionContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    questionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    optionContainer: {
        width: 200,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    removeButton: {
        backgroundColor: '#FF5252',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    flatlistContainer: {
        paddingBottom: 20,
    },
});

export default TeacherQuizCreation;
