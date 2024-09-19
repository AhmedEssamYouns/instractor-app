import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AssignmentForm from '../components/assignment/assign_form';
import StudentAssignmentsPage2 from '../components/assignment/list';

const StudentAssignmentsPage = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);

    const toggleForm = () => {
        setIsFormVisible(!isFormVisible);
    };

    return (
        <View style={styles.container}>
            <View style={{padding:10,borderRadius:10,backgroundColor:'white',elevation:2}}>
            <TouchableOpacity
                style={styles.button}
                onPress={toggleForm}
            >
                <Text style={styles.buttonText}>
                    {isFormVisible ? 'Close' : 'Add Assignment'}
                </Text>
            </TouchableOpacity>
            {/* {isFormVisible && <AssignmentForm />} */}
            </View>
            <StudentAssignmentsPage2/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default StudentAssignmentsPage;
