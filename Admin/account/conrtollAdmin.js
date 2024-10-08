import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useTheme } from '../../components/elements/theme-provider';
import colors from '../../constants/colors';

const AdminUsers = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true); // State to track loading status
    const { theme } = useTheme();
    const currentColors = colors[theme];

    useEffect(() => {
        const usersCollectionRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            // Filter admins and users
            const admins = usersData.filter((user) => user.admin);
            const regularUsers = usersData.filter((user) => !user.admin);

            // Prepare sectioned data for SectionList
            const sectionData = [];

            if (admins.length > 0) {
                sectionData.push({ title: 'Admins', data: admins });
            }
            if (regularUsers.length > 0) {
                sectionData.push({ title: 'Users', data: regularUsers });
            }

            setSections(sectionData);
            setLoading(false); // Set loading to false after data is loaded
        });

        return unsubscribe;
    }, []);

    const toggleAdmin = async (userId, isAdmin) => {
        try {
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, { admin: !isAdmin });
        } catch (error) {
            console.error('Error toggling admin status: ', error);
        }
    };

    const renderUser = ({ item }) => {
        // Ensure the 'author' field check is inside the return block
        if (!item.author) {
            return (
                <View style={[styles.userCard, item.admin]}>
                    <Image source={{ uri: item.photoURL ? item.photoURL : 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png' }} height={50} width={50} borderRadius={50} />
                    <View>
                        <Text style={[styles.userName, { color: currentColors.text }]}>{item.displayName}</Text>
                        <Text style={{ color: currentColors.text2 }}>{item.email}</Text>
                        <TouchableOpacity onPress={() => toggleAdmin(item.id, item.admin)}>
                            <Text style={[styles.toggleButton, { color: currentColors.buttonColor }]}>
                                {item.admin ? 'Remove Admin' : 'Make Admin'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {item.admin && <Text style={styles.adminBadge}>Admin</Text>}

                </View>
            );
        }
        return null;
    };

    const renderSectionHeader = ({ section }) => {
        // Render section header only if it has data
        return section.data.length > 0 ? (
            <Text style={[styles.sectionHeader, { color: currentColors.text }]}>{section.title}</Text>
        ) : null;
    };

    return (
        <View style={{ flex: 1, backgroundColor: currentColors.backgroundColor }}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={currentColors.buttonColor} />
                    <Text style={{ color: currentColors.text }}>Loading users...</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    renderItem={renderUser}
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatList}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    userCard: {
        padding: 15,
        gap: 15,
        alignItems: "center",
        borderBottomWidth: 1,
        flexDirection: "row",
        borderBottomColor: '#ddd',
    },
    adminCard: {
        backgroundColor: '#e0f7fa',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    adminBadge: {
        backgroundColor: '#4caf50',
        color: 'white',
        position: 'absolute',
        right: 10,
        top: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
        alignSelf: 'flex-start',
    },
    toggleButton: {
        marginTop: 5,
    },
    flatList: {
        paddingBottom: 20,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10,
        textAlign: 'center',
        marginVertical: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AdminUsers;
