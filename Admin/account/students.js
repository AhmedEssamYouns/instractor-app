import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../components/elements/theme-provider';
import colors from '../../constants/colors';
import CustomText from '../../components/elements/text'

const Students = () => {
    const [students, setStudents] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [sections, setSections] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [loadingLectures, setLoadingLectures] = useState(true);
    const [loadingSections, setLoadingSections] = useState(true);
    const [searchQuery, setSearchQuery] = useState(''); 
    const { theme } = useTheme(); 
    const currentColors = colors[theme];

    useEffect(() => {
        const studentsRef = collection(db, 'users');
        const unsubscribeStudents = onSnapshot(studentsRef, (snapshot) => {
            const studentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStudents(studentList);
            setLoadingStudents(false);
        });

        const lecturesRef = collection(db, 'lectures');
        const unsubscribeLectures = onSnapshot(lecturesRef, (snapshot) => {
            const lectureList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setLectures(lectureList);
            setLoadingLectures(false);
        });

        const sectionsRef = collection(db, 'sections');
        const unsubscribeSections = onSnapshot(sectionsRef, (snapshot) => {
            const sectionList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSections(sectionList);
            setLoadingSections(false); 
        });

        return () => {
            unsubscribeStudents();
            unsubscribeLectures();
            unsubscribeSections();
        };
    }, []);

    const renderStudent = ({ item }) => (
        <View style={[styles.studentCard,{backgroundColor:currentColors.cardBackground}]}>
            <CustomText style={styles.studentName}>{item.displayName}</CustomText>
            <CustomText>{item.email}</CustomText>

            <CustomText style={{ width: 300 }}>Viewed Lectures:
                {item.viewedLectures && item.viewedLectures.map((lectureId) => {
                    const lecture = lectures.find(lec => lec.id === lectureId);
                    return lecture ? <CustomText key={lectureId}> {lecture.title} ,</CustomText> : null;
                })}
            </CustomText>

            <CustomText style={{ width: 300 }}>Viewed Sections:
                {item.viewedSections && item.viewedSections.map((sectionId) => {
                    const section = sections.find(sec => sec.id === sectionId);
                    return section ? <CustomText key={sectionId}> {section.title} ,</CustomText> : null;
                })}
            </CustomText>
        </View>
    );

    const filteredStudents = students.filter(student =>
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isLoading = loadingStudents || loadingLectures || loadingSections;

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: currentColors.background }}>

            <FlatList
                ListHeaderComponent={
                    <TextInput
                        style={[styles.searchBar, { backgroundColor: currentColors.cardBackground, color: currentColors.text }]}
                        placeholder="Search by email"
                        placeholderTextColor={currentColors.text2}
                        value={searchQuery}
                        onChangeText={setSearchQuery} 
                    />
                }
                data={filteredStudents}
                keyExtractor={item => item.id}
                renderItem={renderStudent}
                contentContainerStyle={styles.flatList}
            />
        </View>
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
    searchBar: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 10,
        margin: 20,
    },
});

export default Students;
