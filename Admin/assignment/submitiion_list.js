import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import * as Sharing from 'expo-sharing';

const SubmissionsList = ({ assignmentId }) => {
    const [submissions, setSubmissions] = useState([]);
    const [studentDetailsMap, setStudentDetailsMap] = useState({});
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const submissionsRef = collection(db, 'submissions');
        const unsubscribe = onSnapshot(submissionsRef, (snapshot) => {
            const submissionList = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(submission => submission.assignmentId === assignmentId);
            setSubmissions(submissionList);
        });

        return () => unsubscribe();
    }, [assignmentId]);

    const fetchStudentDetails = async (studentId) => {
        const userRef = doc(db, 'users', studentId);
        const userSnapshot = await getDoc(userRef);
        return userSnapshot.exists() ? userSnapshot.data() : null;
    };

    const loadStudentDetails = async () => {
        const detailsMap = {};
        const fetchPromises = submissions.map(async (submission) => {
            if (!detailsMap[submission.studentId]) {
                const details = await fetchStudentDetails(submission.studentId);
                if (details) {
                    detailsMap[submission.studentId] = details;
                }
            }
        });
        await Promise.all(fetchPromises);
        setStudentDetailsMap(detailsMap);
        setLoading(false); 
    };

    useEffect(() => {
        if (submissions.length > 0) {
            setLoading(true); 
            loadStudentDetails();
        } else {
            setLoading(false);
        }
    }, [submissions]);

    const openDocument = async (uri) => {
        try {
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert('Error', 'Could not open the document: ' + error.message);
        }
    };

    const renderSubmission = ({ item }) => {
        const studentDetails = studentDetailsMap[item.studentId];

        return (
            <View style={styles.card}>
                {studentDetails ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Image source={{ uri: studentDetails.photoURL }} style={styles.image} />
                        <Text style={styles.studentName}>{studentDetails.displayName}</Text>
                    </View>
                ) : (
                    <Text>Loading details...</Text>
                )}
                <Text style={styles.documentName}>{item.documentName}</Text>
                <Text style={styles.submittedAt}>Submitted at: {item.submittedAt.toDate().toLocaleString()}</Text>
                <TouchableOpacity onPress={() => openDocument(item.documentUri)}>
                    <Text style={styles.documentUri}>{item.documentUri}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" style={styles.loading} />
            ) : (
                <FlatList
                    data={submissions}
                    keyExtractor={item => item.id}
                    renderItem={renderSubmission}
                    contentContainerStyle={styles.flatList}
                    ListEmptyComponent={<Text style={{color:'grey',alignSelf:'center'}}>No submissions for this assignment.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    loading: {
        marginTop: 20,
    },
    flatList: {
        paddingBottom: 20,
    },
    card: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: 'white',
        elevation: 1,
    },
    studentName: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    documentName: {
        fontSize: 16,
        marginBottom: 5,
    },
    submittedAt: {
        fontStyle: 'italic',
        marginBottom: 5,
    },
    documentUri: {
        color: '#007BFF',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 5,
    },
});

export default SubmissionsList;
