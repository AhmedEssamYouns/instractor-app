import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet,Text } from 'react-native';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../../firebase/config';
import { useNavigation } from '@react-navigation/native';
import CustomText from '../elements/text';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { useTheme } from '../elements/theme-provider';
import { useLanguage } from '../elements/language-provider';

const StudentQuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [grades, setGrades] = useState({});
    const { language, translations } = useLanguage();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const currentColors = colors[theme];

    useEffect(() => {
        const unsubscribeQuizzes = onSnapshot(collection(db, 'quizzes'), async (quizSnapshot) => {
            const quizList = await Promise.all(quizSnapshot.docs.map(async (doc) => {
                const quizData = doc.data();
                const questionsRef = collection(db, 'quizzes', doc.id, 'questions');
                const questionsSnapshot = await getDocs(questionsRef);
                const numberOfQuestions = questionsSnapshot.size;

                return {
                    id: doc.id,
                    ...quizData,
                    numberOfQuestions,
                };
            }));
            setQuizzes(quizList);
        });

        return () => unsubscribeQuizzes();
    }, []);

    useEffect(() => {
        const unsubscribeGrades = onSnapshot(collection(db, 'grades'), (gradeSnapshot) => {
            const gradesObj = {};
            gradeSnapshot.docs.forEach(gradeDoc => {
                const gradeData = gradeDoc.data();
                if (gradeData.userId === FIREBASE_AUTH.currentUser.uid) {
                    gradesObj[gradeDoc.id.split('_')[0]] = gradeData; // Extract quiz ID from document ID
                }
            });
            setGrades(gradesObj);
        });

        return () => unsubscribeGrades();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <FlatList
                data={quizzes}
                contentContainerStyle={{ padding: 20 }}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                    const studentGrade = grades[item.id];
                    const hasAttempted = !!studentGrade;
                    return (
                        <TouchableOpacity
                            style={[styles.quizCard, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]}
                            disabled={hasAttempted} // Disable if the student has already attempted
                            onPress={() => navigation.navigate('QuizAttempt', { quizId: item.id })}
                        >
                            <MaterialIcons name='library-books' size={24} color={currentColors.text2} style={{ position: 'absolute', right: 15, top: 15 }} />
                            <View style={styles.cardContent}>
                                <MaterialIcons name="book" size={24} color={currentColors.iconColor} style={styles.icon} />
                                <CustomText style={[styles.title]}>{item.title}</CustomText>
                            </View>
                            <View style={styles.cardContent}>
                                <MaterialIcons name="timer" size={24} color={currentColors.iconColor} style={styles.icon} />
                                <CustomText style={{ color: currentColors.text }}>
                                    <Text style={{ color: "red" }}>{item.timeLimit}</Text> {translations.minutes}
                                </CustomText>
                            </View>
                            <View style={styles.cardContent}>
                                <MaterialIcons name="list" size={24} color={currentColors.iconColor} style={styles.icon} />
                                <CustomText style={{ color: currentColors.text2 }}>
                                    {translations.questions}: {item.numberOfQuestions}
                                </CustomText>
                            </View>
                            {hasAttempted && (
                                <View style={styles.cardContent}>
                                    <MaterialIcons name="check-circle" size={24} color="green" style={styles.icon} />
                                    <CustomText style={{ color: 'green' }}>
                                        {translations.grade}: {studentGrade.score}/{item.numberOfQuestions}
                                    </CustomText>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    quizCard: {
        padding: 20,
        marginBottom: 15,
        borderRadius: 8,
        borderWidth: 1,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    icon: {
        marginRight: 10,
    },
});

export default StudentQuizList;
