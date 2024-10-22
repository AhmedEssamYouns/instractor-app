import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import CustomText from './text';

const CustomCheckbox = ({ isChecked, onPress, label }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <View style={[styles.checkbox, isChecked && styles.checked]}>
                {isChecked ? (
                    <MaterialIcons name="check-box" size={24} color="green" />
                ) : (
                    <MaterialIcons name="check-box-outline-blank" size={24} color="gray" />
                )}
            </View>
            {label && <CustomText style={[styles.label]}>{label}</CustomText>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        width:'90%',
        marginLeft: 8,
        fontSize: 16,
    },
    checked: {
        backgroundColor: 'transparent', 
    },
});

export default CustomCheckbox;
