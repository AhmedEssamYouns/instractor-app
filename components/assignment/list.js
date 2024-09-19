import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { getAssignments, getStudentSubmission } from '../../firebase/assign';
import AssignmentItem from './itemm';
import { FIREBASE_AUTH } from '../../firebase/config';
import colors from '../../constants/colors';
import { useTheme } from '../elements/theme-provider';
import CustomText from '../elements/text';
import { useLanguage } from '../elements/language-provider';

const StudentAssignmentsPage2 = () => {
    const { language, translations } = useLanguage();
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [loading, setLoading] = useState(true); // Add loading state
    const studentId = FIREBASE_AUTH.currentUser.uid;
    const { theme } = useTheme(); // Get the theme from context
    const currentColors = colors[theme]; // Get colors based on the theme

    useEffect(() => {
        // Fetch assignments in real-time
        const unsubscribeAssignments = getAssignments((fetchedAssignments) => {
            setAssignments(fetchedAssignments);

            // Fetch submissions for each assignment
            fetchedAssignments.forEach(assignment => {
                const unsubscribeSubmission = getStudentSubmission(
                    assignment.id,
                    studentId,
                    (submission) => {
                        setSubmissions(prevSubmissions => ({
                            ...prevSubmissions,
                            [assignment.id]: submission,
                        }));
                    }
                );
            });

            // Set loading to false after fetching is complete
            setLoading(false);
        });

        // Cleanup listeners when component unmounts
        return () => {
            unsubscribeAssignments();
        };
    }, [studentId]);

    // Function to handle state updates for submissions
    const handleSubmissionChange = (assignmentId, updatedSubmission) => {
        setSubmissions(prevSubmissions => ({
            ...prevSubmissions,
            [assignmentId]: updatedSubmission,
        }));
    };

    // Render assignment item with submission data
    const renderItem = ({ item }) => {
        const studentSubmission = submissions[item.id] || null; // Get submission from state
        return (
            <AssignmentItem
                assignment={item}
                studentSubmission={studentSubmission}
                studentId={studentId}
                onSubmissionChange={(updatedSubmission) => handleSubmissionChange(item.id, updatedSubmission)}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            {loading ? (
                <ActivityIndicator size="large" color={currentColors.text} style={styles.loader} />
            ) : (
                <FlatList
                    data={assignments}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <CustomText style={{
                            marginTop: 100,
                            fontSize: 25, alignSelf: 'center', justifyContent: 'center'
                        }}>
                            {translations.noAssignments}
                        </CustomText>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default StudentAssignmentsPage2;
