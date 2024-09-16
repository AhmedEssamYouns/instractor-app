import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../elements/theme-provider';
import { useLanguage } from '../elements/language-provider';
import colors from '../../constants/colors';

// Fake data for grades
const gradesData = [
    { id: 1, quiz: ' 1', grade: 85, fullMark: 90 },
    { id: 2, quiz: ' 2', grade: 90, fullMark: 100 },
    { id: 3, quiz: ' 3', grade: 10, fullMark: 15 },
    { id: 4, quiz: ' 4', grade: 95, fullMark: 100 },
    { id: 5, quiz: ' 5', grade: 80, fullMark: 90 },
    { id: 6, quiz: ' 6', grade: 85, fullMark: 90 },

    
];

const GradeScreen = () => {
    const { theme } = useTheme(); // Get current theme
    const { language, translations } = useLanguage(); // Get current language and translations
    const currentColors = colors[theme]; // Get the colors based on theme

    // Calculate success percentage for each quiz
    const quizSuccessPercentages = gradesData.map(quiz => (quiz.grade / quiz.fullMark) * 100);

    return (
        <ScrollView style={[styles.scrollView, { backgroundColor: currentColors.background }]}>
            <View style={styles.container}>
                <LineChart
                    data={{
                        labels: gradesData.map(quiz => quiz.quiz),
                        datasets: [
                            {
                                data: quizSuccessPercentages,
                            },
                        ],
                    }}
                    width={320}
                    height={200}
                    yAxisSuffix="%"
                    chartConfig={{
                        backgroundColor: currentColors.cardBackground,
                        backgroundGradientFrom: currentColors.cardBackground,
                        backgroundGradientTo: currentColors.cardBackground,
                        color: (opacity = 1) => currentColors.text,  // Line color
                        labelColor: (opacity = 1) => currentColors.text2,  // Label color
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: "4",
                            strokeWidth: "2",
                            stroke: currentColors.text, // Dot stroke color
                        },
                        propsForBackgroundLines: {
                            stroke: currentColors.borderColor, // Background grid lines
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
                            <Text style={[styles.quiz, { color: currentColors.text }]}>{`${translations.quiz} ${item.id}`}</Text>
                            <Text style={[styles.grade, { color: currentColors.text }]}>{`${item.grade} / ${item.fullMark}`}</Text>
                        </View>
                    ))}
                </View>
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
