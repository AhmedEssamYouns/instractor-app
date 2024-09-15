import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from './theme-provider';
import colors from '../../constants/colors';

const FilterBar = ({ data, setData }) => {
    const { theme } = useTheme(); // Get the theme from context
    const currentColors = colors[theme]; // Get colors based on the theme
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [showPointsFilter, setShowPointsFilter] = useState(false);
    const [minPoint, setMinPoint] = useState('');
    const [maxPoint, setMaxPoint] = useState('');
    const [showSort, setShowSort] = useState(false);
    const [sortOrder, setSortOrder] = useState('Newest to Oldest');
    const [originalData, setOriginalData] = useState(data);

    const filterData = () => {
        let filteredData = [...originalData];

        if (searchQuery) {
            filteredData = filteredData.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (minPoint || maxPoint) {
            const min = parseFloat(minPoint) || 0;
            const max = parseFloat(maxPoint) || Infinity;
            filteredData = filteredData.filter(item =>
                item.points >= min && item.points <= max
            );
        }

        if (sortOrder === 'Newest to Oldest') {
            filteredData.sort((a, b) => b.id - a.id);
        } else if (sortOrder === 'Oldest to Newest') {
            filteredData.sort((a, b) => a.id - b.id);
        }

        setData(filteredData);
    };

    useEffect(() => {
        setOriginalData(data); // Update the original data when the data prop changes
    }, [data]);

    useEffect(() => {
        filterData();
    }, [searchQuery, minPoint, maxPoint, sortOrder]);

    return (
        <View style={{ paddingBottom: 10 }}>
            <View style={[styles.optionsContainer, { backgroundColor: currentColors.background }]}>
                <TouchableOpacity style={[styles.optionIcon, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor, borderWidth: 1 }]} onPress={() => setShowSort(!showSort)}>
                    <FontAwesome name="sort" size={24} color={currentColors.iconFocus} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionIcon, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor, borderWidth: 1 }]} onPress={() => setShowPointsFilter(!showPointsFilter)}>
                    <FontAwesome name="filter" size={24} color={currentColors.iconFocus} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.optionIcon, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor, borderWidth: 1 }]} onPress={() => setShowSearchInput(!showSearchInput)}>
                    <FontAwesome name="search" size={24} color={currentColors.iconFocus} />
                </TouchableOpacity>
            </View>

            {showSearchInput && (
                <TextInput
                    style={[styles.searchInput, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]}
                    placeholder="Search..."
                    placeholderTextColor={currentColors.text}
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                />
            )}

            {showSort && (
                <View style={styles.sortContainer}>
                    <TouchableOpacity style={[styles.SortButton, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]} onPress={() => setSortOrder('Newest to Oldest')}>
                        <Text style={[styles.sortText, { color: currentColors.text }]}>Newest to Oldest</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.SortButton, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]} onPress={() => setSortOrder('Oldest to Newest')}>
                        <Text style={[styles.sortText, { color: currentColors.text }]}>Oldest to Newest</Text>
                    </TouchableOpacity>
                </View>
            )}

            {showPointsFilter && (
                <View style={styles.pointsFilter}>
                    <TextInput
                        style={[styles.pointsInput, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor, marginRight: 10 }]}
                        placeholder="Min Points"
                        placeholderTextColor={currentColors.text}
                        onChangeText={setMinPoint}
                        value={minPoint}
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={[styles.pointsInput, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]}
                        placeholder="Max Points"
                        placeholderTextColor={currentColors.text}
                        onChangeText={setMaxPoint}
                        value={maxPoint}
                        keyboardType="numeric"
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    optionsContainer: {
        paddingTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 50,
        marginBottom: 10,
    },
    optionIcon: {
        padding: 10,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent:'center',
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
    pointsFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    pointsInput: {
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        elevation: 3,
        flex: 1,
        justifyContent: 'center',
    },
    SortButton: {
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 20,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        elevation: 3,
        justifyContent: 'center',
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 10,
    },
    sortText: {
        textAlign: 'center',
        fontSize: 14,
    },
});

export default FilterBar;
