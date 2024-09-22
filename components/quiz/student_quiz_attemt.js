import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, Pressable, Alert, StyleSheet, BackHandler } from 'react-native';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../../firebase/config';
import CustomCheckbox from '../elements/checkbox';
import { useTheme } from '../elements/theme-provider';
import colors from '../../constants/colors';
import { useLanguage } from '../elements/language-provider';
import CustomText from '../elements/text';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const StudentQuizAttempt = ({ route }) => {
    const { quizId } = route.params;
    const [quiz, setQuiz] = useState(null);
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const { language, translations } = useLanguage();
    const [questions, setQuestions] = useState([]);
    const [fullmark, setFull] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
                const quizData = quizDoc.data();
                setQuiz(quizData);

                const questionsRef = collection(db, 'quizzes', quizId, 'questions');
                const questionsSnapshot = await getDocs(questionsRef);
                const numberOfQuestions = questionsSnapshot.size;
                setFull(numberOfQuestions);
                const questionsData = questionsSnapshot.docs.map(doc => doc.data());
                setQuestions(questionsData);
                setAnswers(new Array(questionsData.length).fill(null));

                if (quizData.timeLimit) {
                    setTimeLeft(quizData.timeLimit * 60); // Set time in seconds
                }
            } catch (error) {
                console.error('Error fetching quiz: ', error);
            }
        };

        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (timeLeft > 0 && !isSubmitting) {
                setTimeLeft(prevTime => prevTime - 1);
            } else if (timeLeft === 0) {
                handleSubmit(true); // Submit quiz when time is up
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isSubmitting]);

    // Handle back button press
    useEffect(() => {
        const handleBackPress = () => {
            if (fullmark !== null) {
                Alert.alert(
                    translations.closeAlertTitle,
                    translations.closeAlertMessage,
                    [
                        { text: translations.closeAlertCancel, onPress: () => { }, style: 'cancel' },
                        { text: translations.closeAlertConfirm, onPress: () => handleSubmit(true) },
                    ]
                );
            }
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => backHandler.remove();
    }, [isSubmitting, fullmark]);

    const handleAnswerChange = (index, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[index] = optionIndex;
        setAnswers(newAnswers);
    }

    const handleSubmit = async (forceSubmit = false) => {
        if (isSubmitting || fullmark === null) return;

        if (!forceSubmit) {
            const unanswered = answers.some(answer => answer === null);
            if (unanswered) {
                Alert.alert(translations.answerAllBeforeSubmit);
                return;
            }
        }

        setIsSubmitting(true);
        let score = 0;
        questions.forEach((question, index) => {
            if (answers[index] === question.correctOption) {
                score += 1;
            }
        });

        Alert.alert(
            translations.timeUp,
            translations.scoreMessage.replace("{score}", score).replace("{total}", fullmark)
        );

        try {
            await setDoc(doc(db, 'grades', quizId + '_' + FIREBASE_AUTH.currentUser.uid), {
                quizId: quizId,
                userId: FIREBASE_AUTH.currentUser.uid,
                score: score,
                quizName: quiz.title,
                fullmark: fullmark,
                timestamp: new Date(),
            });
            navigation.navigate('tabs', { screen: 'Profile' });
        } catch (error) {
            console.error('Error saving grade: ', error);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    if (!quiz || questions.length === 0) {
        return (
            <View style={{ backgroundColor: currentColors.background, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={currentColors.text} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'grey', marginBottom: 17 }}>
                <CustomText style={styles.title}>{quiz.title}</CustomText>
                <CustomText style={styles.timer}>{translations.timeLeft} {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</CustomText>
            </View>

            <CustomText style={styles.order}>
                {`${translations.question} ${currentQuestionIndex + 1} ${translations.of} ${questions.length}`}
            </CustomText>

            <FlatList
                data={[questions[currentQuestionIndex]]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item: question }) => (
                    <View style={styles.questionContainer}>
                        <CustomText style={styles.questionText}>{question.text}</CustomText>
                        {question.options.map((option, optionIndex) => (
                            <Pressable key={optionIndex} style={[styles.optionContainer, {
                                backgroundColor: currentColors.cardBackground,
                                borderRadius: 10,
                                padding: 5,
                                elevation: 1,
                                borderWidth: 1,
                                borderColor: answers[currentQuestionIndex] === optionIndex ? 'green' : currentColors.border

                            }]}
                                onPress={() => handleAnswerChange(currentQuestionIndex, optionIndex)}

                            >
                                <CustomCheckbox
                                    onPress={() => handleAnswerChange(currentQuestionIndex, optionIndex)}
                                    isChecked={answers[currentQuestionIndex] === optionIndex}
                                    label={option}
                                />
                            </Pressable>
                        ))}
                    </View>
                )}
            />

            <View style={styles.navigationContainer}>
                {currentQuestionIndex > 0 && (
                    <TouchableOpacity style={[styles.button, { alignSelf: 'flex-start', backgroundColor: 'grey' }]} onPress={handlePreviousQuestion}>
                        <CustomText style={{ color: 'white' }}>{translations.previous}</CustomText>
                    </TouchableOpacity>
                )}

                    {currentQuestionIndex < questions.length - 1 && answers[currentQuestionIndex] !== null && (
                        <TouchableOpacity style={ { backgroundColor: '#67726B', position: 'absolute', right: 0, bottom: 0,
                            padding: 10,
                            borderRadius: 5,
                            marginHorizontal: 5, // Add some space between buttons
                         }} onPress={handleNextQuestion}>
                            <CustomText style={{ color: 'white' }}>{translations.next}</CustomText>
                        </TouchableOpacity>
                    )}

                    {currentQuestionIndex === questions.length - 1 && answers[currentQuestionIndex] !== null && (
                        <TouchableOpacity style={[styles.button, { backgroundColor: currentColors.buttonColor }]} onPress={() => handleSubmit()}>
                            <CustomText style={{ color: 'white' }}>{translations.submitAns}</CustomText>
                        </TouchableOpacity>
                    )}
                </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 50,
        justifyContent: 'center',
        flex: 1,
    },
    title: {
        fontSize: 20,
        marginBottom: 20,
    },
    timer: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 20,
        color: '#FF0000',
    },
    questionContainer: {
        marginBottom: 10,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    order: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Space between previous button and the button container
        alignItems: 'center', // Center vertically
        padding: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align next and submit buttons to the right
        alignItems: 'center',
    },
    button: {
        padding: 10,
        borderRadius: 5,
        marginBottom:50
    },
});

export default StudentQuizAttempt;
