import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome6 } from '@expo/vector-icons'; // Import FontAwesome6 for the "bars" icon
import { TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import Tabs from './tabs'; // Import your Tabs component
import ThemeSwitcherModal from '../components/elements/menu';
import { useTheme } from '../constants/theme-provider';
import colors from '../constants/colors';

const Stack = createStackNavigator();

export default function StackScreen() {
    const { theme, setTheme } = useTheme(); // Access theme and setTheme from context
    const [modalVisible, setModalVisible] = React.useState(false); // State to control modal visibility

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    const handleChangeTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="#121212" />
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: colors[theme].background,
                        elevation: 0
                    },
                    headerTitleStyle: {
                        fontFamily: 'bold',
                        color: colors[theme].text,
                    },
                    headerRight: () => (
                        <TouchableOpacity onPress={toggleModal}>
                            <FontAwesome6
                                name="bars-staggered"
                                size={25}
                                color={colors[theme].text}
                                style={styles.headerRight}
                            />
                        </TouchableOpacity>
                    ),
                }}
            >
                <Stack.Screen name="videos" component={Tabs} />
            </Stack.Navigator>

            <ThemeSwitcherModal
                visible={modalVisible}
                onClose={toggleModal}
                onChangeTheme={handleChangeTheme}
                currentTheme={theme}
            />
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    headerRight: {
        marginRight: 15,
    },
});
