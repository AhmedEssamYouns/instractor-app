import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { pickDocument } from '../../firebase/posts';
import { submitHomework, deleteHomework } from '../../firebase/assign';
import { AntDesign, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import CustomText from '../elements/text';
import { format } from 'date-fns';
import { useTheme } from '../elements/theme-provider';
import colors from '../../constants/colors';
import { useLanguage } from '../elements/language-provider';

const formatDate = (date) => {
    return format(date, 'MMM d, yyyy h:mm a');
};

const formatCreatedAt = (date) => {
    return format(date, 'MMM d, h:mm a');
};
const AssignmentItem = ({ assignment, studentSubmission, studentId, onSubmissionChange }) => {
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const { language, translations } = useLanguage();
    const [documentUri, setDocumentUri] = useState(studentSubmission?.documentUri || null);
    const [documentName, setDocumentName] = useState(studentSubmission?.documentName || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasDeadlinePassed, setHasDeadlinePassed] = useState(false);
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (assignment && assignment.deadline) {
            const now = new Date();
            const deadlineDate = new Date(assignment.deadline.seconds * 1000);
            setHasDeadlinePassed(now > deadlineDate);

            if (!hasDeadlinePassed) {
                const timer = setInterval(() => {
                    const remainingTime = deadlineDate - new Date();
                    if (remainingTime > 0) {
                        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
                    } else {
                        setCountdown(translations.expired);
                        clearInterval(timer);
                    }
                }, 1000);

                return () => clearInterval(timer);
            }
        }
    }, [assignment, hasDeadlinePassed, language, translations]);

    const handlePickDocument = async () => {
        await pickDocument(setDocumentUri, setDocumentName);
    };

    const handleSubmitHomework = async () => {
        setIsSubmitting(true);
        await submitHomework(studentSubmission, documentUri, documentName, assignment, studentId, onSubmissionChange, setDocumentName, setDocumentUri);
        setIsSubmitting(false);
    };

    const handleDeleteSubmission = async () => {
        await deleteHomework(studentSubmission.id, onSubmissionChange);
    };

    const isAssignmentValid = assignment && assignment.deadline && assignment.createdAt;

    return (
        <View style={[styles.assignmentCard, { backgroundColor: currentColors.cardBackground, borderWidth: 1, borderColor: currentColors.borderColor }]}>
            <View style={styles.header}>
                <CustomText style={styles.title}>{assignment?.title || translations.noTitle}</CustomText>
            </View>
            {isAssignmentValid && (
                <View style={styles.createdAt}>
                    <CustomText>
                        {formatCreatedAt(new Date(assignment.createdAt.seconds * 1000))}
                    </CustomText>
                    <FontAwesome name="book" size={24} color={currentColors.iconColor} />
                </View>
            )}
            <CustomText style={[styles.description, { color: currentColors.text2, textAlign: 'left' }]}>
                {assignment?.description || translations.noDescription}
            </CustomText>

            {isAssignmentValid && (
                <>
                    <View style={styles.deadline}>
                        <MaterialIcons name="timer" size={16} color={currentColors.iconColor} />
                        <CustomText>
                            Deadline: {formatDate(new Date(assignment.deadline.seconds * 1000))}
                        </CustomText>
                    </View>
                    {countdown && <CustomText style={styles.countdown}>{countdown}</CustomText>}
                </>
            )}

            {documentUri && (
                <View style={styles.selectedDocument}>
                    <CustomText style={{ color: 'black' }}>
                        <AntDesign name="filetext1" size={16} color={'black'} /> {translations.selectedDocument} {documentName}
                    </CustomText>
                    <CustomText style={styles.cancelText} onPress={() => setDocumentUri(null)}>
                        {translations.cancel}
                    </CustomText>
                </View>
            )}

            {hasDeadlinePassed ? (
                studentSubmission ? (
                    <Text style={styles.submittedText}>
                        <AntDesign name="checkcircle" size={16} color={'green'} /> {translations.submittedOnTime}
                    </Text>
                ) : (
                    <Text style={styles.missedText}>
                        <AntDesign name="closecircle" size={16} color={'red'} /> {translations.missedDeadline}
                    </Text>
                )
            ) : (
                <>
                    {studentSubmission ? (
                        <>
                            <View style={styles.selectedDocument}>
                                <CustomText style={{ color: 'black' }}>
                                    <AntDesign name="filetext1" size={16} color={'black'} /> {translations.selectedDocument} {studentSubmission.documentName}
                                </CustomText>
                            </View>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSubmission}>
                                <AntDesign name="delete" size={16} color={'white'} />
                                <Text style={styles.buttonText}> {translations.deleteSubmission}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={handlePickDocument}>
                            <AntDesign name="upload" size={16} color={'#fff'} />
                            <Text style={styles.buttonText}>{documentUri ? translations.changeDocument : translations.pickHomework}</Text>
                        </TouchableOpacity>
                    )}
                    {documentUri && (
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitHomework} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <AntDesign name="upload" size={16} color="#fff" />
                                    <Text style={styles.buttonText}> {translations.submitHomework}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};



const styles = StyleSheet.create({
    assignmentCard: {
        margin: 20,
        padding: 20,
        marginVertical: 10,
        borderRadius: 10,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        width: 150,
        textAlign: 'left',
        fontSize: 20,
    },
    description: {
        fontSize: 16,
    },
    createdAt: {
        position: 'absolute',
        right: 10,
        top:10,
        gap:5,
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 14,
    },
    deadline: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        fontSize: 14,
        color: '#888',
    },
    countdown: {
        color: '#dc3545',
        fontWeight: 'bold',
    },
    submittedText: {
        marginTop: 10,
        color: '#28a745',
        fontWeight: 'bold',
    },
    missedText: {
        marginTop: 10,
        color: '#dc3545',
        fontWeight: 'bold',
    },
    selectedDocument: {
        backgroundColor: "#ddd",
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
        fontSize: 14,
    },
    button: {
        backgroundColor: 'grey',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        width: 150,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        width: 150,
        justifyContent: 'center',
    },
    deleteButton: {
        width: 150,
        backgroundColor: '#dc3545',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        marginLeft: 5,
    },
    cancelText: {
        marginTop: 10,
        fontSize: 14,
        color: 'red',
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default AssignmentItem;
