import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from './theme-provider';
import colors from '../../constants/colors';

const FilterBar = ({ data, setData, originalData }) => {
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [sortOrder, setSortOrder] = useState('Newest to Oldest');

    useEffect(() => {
        filterData();
    }, [searchQuery, sortOrder]);

    const filterData = () => {
        let filteredData = [...originalData];

        // Filter by search query
        if (searchQuery) {
            filteredData = filteredData.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort the data
        filteredData.sort((a, b) => {
            if (sortOrder === 'Newest to Oldest') {
                return b.createdAt - a.createdAt; // Assuming createdAt is a timestamp
            } else {
                return a.createdAt - b.createdAt;
            }
        });

        // Create indexed data
        const indexedData = filteredData.map((item, index) => ({
            ...item,
            index: sortOrder === 'Newest to Oldest' ? index + 1 : filteredData.length - index
        }));

        // Update displayed data only after filtering and sorting
        setData(indexedData);
    };

    const handleSearchChange = (text) => {
        setSearchQuery(text);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setData(originalData); // Reset to original data
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'Newest to Oldest' ? 'Oldest to Newest' : 'Newest to Oldest'));
    };

    const handleSearchToggle = () => {
        setShowSearchInput(prev => {
            const newShowSearchInput = !prev;
            if (!newShowSearchInput) {
                // When closing the search, reset data
                setSearchQuery('');
                setData(originalData);
            }
            return newShowSearchInput;
        });
    };

    return (
        <View style={{ paddingBottom: 10 }}>
            <View style={[styles.optionsContainer, { backgroundColor: currentColors.background }]}>
                <TouchableOpacity style={[styles.optionIcon, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor, borderWidth: 1 }]} onPress={toggleSortOrder}>
                    <FontAwesome name="sort" size={24} color={currentColors.iconFocus} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionIcon, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor, borderWidth: 1 }]} onPress={handleSearchToggle}>
                    <FontAwesome name="search" size={24} color={currentColors.iconFocus} />
                </TouchableOpacity>
            </View>

            {showSearchInput && (
                <TextInput
                    style={[styles.searchInput, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]}
                    placeholder="Search..."
                    placeholderTextColor={currentColors.text}
                    onChangeText={handleSearchChange}
                    value={searchQuery}
                />
            )}

            <View style={styles.sortContainer}>
   
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    optionsContainer: {
        paddingTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 10,
    },
    optionIcon: {
        padding: 10,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    searchInput: {
        height: 40,
        borderRadius: 20,
        margin: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        elevation: 3,
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    sortText: {
        textAlign: 'center',
        fontSize: 14,
    },
});

export default FilterBar;
