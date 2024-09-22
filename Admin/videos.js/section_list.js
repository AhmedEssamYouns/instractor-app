import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import CustomText from '../../components/elements/text';
import UploadSectionVideo from './uploadSection';

const SectionList = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isHeaderVisible, setHeaderVisible] = useState(false); // State to toggle header visibility
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'sections'), (snapshot) => {
            const sectionList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setSections(sectionList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Function to handle deleting a section
    const handleDelete = async (id) => {
        Alert.alert(
            'Delete Section',
            'Are you sure you want to delete this section?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'sections', id));
                            Alert.alert('Deleted', 'The section has been deleted.');
                        } catch (error) {
                            console.error('Error deleting section:', error);
                            Alert.alert('Error', 'Failed to delete the section.');
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.cardContent}
                onPress={() => navigation.navigate('SectionDetail', { sectionId: item.id })} // Adjust to your detail screen
            >
                <MaterialIcons name="video-library" size={24} color="black" style={styles.icon} />
                <CustomText style={styles.title}>{item.title}</CustomText>
            </TouchableOpacity>
            {/* Delete button */}
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    const toggleHeader = () => {
        setHeaderVisible(!isHeaderVisible); // Toggle header visibility
    };

    return (
        <View style={styles.container}>
            {/* Button to show/hide Upload Section */}
            <TouchableOpacity onPress={toggleHeader} style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>
                    {isHeaderVisible ? 'Hide Upload Section' : 'Upload Section'}
                </Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <FlatList
                    ListHeaderComponent={isHeaderVisible && <UploadSectionVideo />}
                    data={sections}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
    },
    title: {
        width:160,
        fontSize: 18,
    },
    list: {
        paddingBottom: 20,
    },
    toggleButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 5,
    },
});

export default SectionList;
