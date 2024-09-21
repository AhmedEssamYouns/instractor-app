import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../elements/theme-provider';
import { useLanguage } from '../elements/language-provider';
import colors from '../../constants/colors';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../../firebase/config';
import CustomText from '../elements/text';

const GradeScreen = () => {
    const { theme } = useTheme();
    const { language, translations } = useLanguage();
    const currentColors = colors[theme];
    const [gradesData, setGradesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'grades'), (snapshot) => {
            const fetchedGrades = snapshot.docs
                .map(doc => doc.data())
                .filter(grade => grade.userId === FIREBASE_AUTH.currentUser.uid);

            setGradesData(fetchedGrades);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching grades: ', error);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // Calculate success percentages
    const quizSuccessPercentages = gradesData.map(quiz => {
        if (quiz.score && quiz.fullmark) {
            return (quiz.score / quiz.fullmark) * 100;
        }
        return 0; // Handle invalid values
    });

    // Prepare labels
    const labels = gradesData.map((quiz, index) => `quiz ${index + 1}`);

    return (
        <ScrollView style={[styles.scrollView, { backgroundColor: currentColors.background }]}>
            <View style={styles.container}>
                {loading ? (
                    <CustomText style={{ color: currentColors.text2 }}>Loading...</CustomText>
                ) : gradesData.length === 0 ? (
                    <CustomText style={{ color: currentColors.text2 }}>No grades available</CustomText>
                ) : (
                    <>
                        <LineChart
                            data={{
                                labels: labels,
                                datasets: [{
                                    data: quizSuccessPercentages,
                                }],
                            }}
                            width={320}
                            height={200}
                            yAxisSuffix="%"
                            chartConfig={{
                                backgroundColor: currentColors.cardBackground,
                                backgroundGradientFrom: currentColors.cardBackground,
                                backgroundGradientTo: currentColors.cardBackground,
                                color: (opacity = 1) => currentColors.text,
                                labelColor: (opacity = 1) => currentColors.text2,
                                style: {
                                    borderRadius: 16,
                                },
                                propsForDots: {
                                    r: "4",
                                    strokeWidth: "2",
                                    stroke: currentColors.text,
                                },
                                propsForBackgroundLines: {
                                    stroke: currentColors.borderColor,
                                },
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                            }}
                        />
                        <View style={{ width: '80%', alignSelf: "center" }}>
                            {gradesData.map((item, index) => (
                                <View key={index} style={[styles.gradeItem, { borderBottomColor: currentColors.borderColor }]}>
                                    <Text style={[styles.quiz, { color: currentColors.text }]}>{`Quiz ${index + 1}: ${item.quizName}`}</Text>
                                    <Text style={[styles.grade, { color: currentColors.text }]}>{`${item.score} / ${item.fullmark}`}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    scrollView: {
        width: '100%',
    },
    gradeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        paddingVertical: 10,
    },
    quiz: {
        fontSize: 18,
    },
    grade: {
        fontSize: 20,
    },
});

export default GradeScreen;
