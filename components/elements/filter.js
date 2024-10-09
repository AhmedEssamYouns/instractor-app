import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, TextInput, StyleSheet, Animated, I18nManager, Pressable, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from './theme-provider';
import colors from '../../constants/colors';
import { useLanguage } from './language-provider';


const screenWidth = Dimensions.get('window').width // Get the screen width

const FilterBar = ({ data, setData, originalData }) => {
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const { language, translations } = useLanguage();
    const [open, setopen] = useState(true)
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('Newest to Oldest');
    const [animation] = useState(new Animated.Value(0)); // Animation for expanding the search bar width
    const [showSearchInput, setShowSearchInput] = useState(false);



    const [rotate] = useState(new Animated.Value(0));
    const [expanded, setexpanded] = useState(false)
    useEffect(() => {
        Animated.timing(rotate, {
            toValue: expanded ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [expanded]);

    const rotation2 = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });


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
                return b.createdAt - a.createdAt;
            } else {
                return a.createdAt - b.createdAt;
            }
        });

        const indexedData = filteredData.map((item, index) => ({
            ...item,
            index: sortOrder === 'Newest to Oldest' ? index + 1 : filteredData.length - index
        }));

        setData(indexedData);
    };

    const handleSearchChange = (text) => {
        setSearchQuery(text);
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => (prevOrder === 'Newest to Oldest' ? 'Oldest to Newest' : 'Newest to Oldest'));
    };

    const handleSearchToggle = () => {
        setexpanded(!expanded)
        setopen(!open)
        setShowSearchInput(prev => {
            const newShowSearchInput = !prev;

            Animated.timing(animation, {
                toValue: newShowSearchInput ? 1 : 0,
                duration: 400,
                useNativeDriver: false, // Width animation
            }).start();

            if (!newShowSearchInput) {
                // When closing the search, reset data
                setSearchQuery('');
                setData(originalData);
            }

            return newShowSearchInput;
        });
    };

    // Animate width from 0 to full width
    const animatedWidth = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, screenWidth * 0.8], // Adjust this value to control how much it expands
    });

    return (
        <View style={{ paddingBottom: 10 }}>
            <View style={[styles.optionsContainer, { backgroundColor: currentColors.background }]}>
                {open &&
                    <TouchableOpacity
                        style={[styles.optionIcon, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor, borderWidth: 1 }]}
                        onPress={toggleSortOrder}
                    >
                        <FontAwesome name="sort" size={24} color={currentColors.iconFocus} />
                    </TouchableOpacity>
                }
                {/* Search icon and expanding search bar */}
                <View style={styles.searchContainer}>
                    {/* Animated search bar */}
                    <Animated.View style={[styles.animatedSearch, { width: animatedWidth, backgroundColor: currentColors.cardBackground, borderColor: currentColors.text }]}>
                        <TextInput
                            style={[styles.searchInput, { backgroundColor: currentColors.cardBackground, }]}
                            placeholder={translations.search}
                            placeholderTextColor={currentColors.text}
                            onChangeText={handleSearchChange}
                            value={searchQuery}
                        />
                    </Animated.View>

                    <Pressable
                        style={[styles.optionIcon, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor, borderWidth: 1 }]}
                        onPress={handleSearchToggle}

                    >
                        <Animated.View style={{ transform: [{ rotate: rotation2 }] }}>
                            <FontAwesome name="search" size={24} color={currentColors.iconFocus} />
                        </Animated.View>

                    </Pressable>

                </View>
            </View>
        </View >
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end', // Align content to the right
        flex: 1,
        zIndex: 2
    },
    animatedSearch: {
        position: 'absolute', // Absolutely positioned to expand from the right
        right: 0, // Expand from the right side
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        paddingHorizontal: 10,
        marginBottom: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    searchInput: {
        height: '100%',
        width: '100%',
    },
});

export default FilterBar;
