import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [sections, setSections] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingLectures, setLoadingLectures] = useState(true);
    const [loadingSections, setLoadingSections] = useState(true);

    useEffect(() => {
        // Fetch all student documents
        const studentsRef = collection(db, 'users');
        const unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
            const studentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStudents(studentList);
            setLoadingStudents(false); // Mark students loading complete
        });

        // Fetch all lecture documents
        const lecturesRef = collection(db, 'lectures');
        const unsubscribeLectures = onSnapshot(lecturesRef, (snapshot) => {
            const lectureList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setLectures(lectureList);
            setLoadingLectures(false); // Mark lectures loading complete
        });

        // Fetch all section documents
        const sectionsRef = collection(db, 'sections');
        const unsubscribeSections = onSnapshot(sectionsRef, (snapshot) => {
            const sectionList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSections(sectionList);
            setLoadingSections(false); // Mark sections loading complete
        });

        return () => {
            unsubscribeStudents();
            unsubscribeLectures();
            unsubscribeSections();
        };
    }, []);

    const renderStudent = ({ item }) => (
        <View style={styles.studentCard}>
            <Text style={styles.studentName}>{item.displayName}</Text>
            <Text>{item.email}</Text>
            
            {/* Viewed Lectures */}
            <Text style={{ width: 300 }}>Viewed Lectures:
                {item.viewedLectures && item.viewedLectures.map((lectureId) => {
                    const lecture = lectures.find(lec => lec.id === lectureId);
                    return lecture ? <Text key={lectureId}> {lecture.title} ,</Text> : null;
                })}
            </Text>

            {/* Viewed Sections */}
            <Text style={{ width: 300 }}>Viewed Sections:
                {item.viewedSections && item.viewedSections.map((sectionId) => {
                    const section = sections.find(sec => sec.id === sectionId);
                    return section ? <Text key={sectionId}> {section.title} ,</Text> : null;
                })}
            </Text>
        </View>
    );

    // Check if any data is still loading
    const isLoading = loadingStudents || loadingLectures || loadingSections;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <FlatList
            data={students}
            keyExtractor={item => item.id}
            renderItem={renderStudent}
            contentContainerStyle={styles.flatList}
        />
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    studentCard: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        margin: 20,
        marginBottom: 5,
        backgroundColor: '#f9f9f9',
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    flatList: {
        paddingBottom: 20,
    },
});

export default Students;
