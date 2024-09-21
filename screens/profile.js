import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, Alert, Pressable, TextBase } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { selectImageAndUpdateProfile } from "../firebase/profile";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import GradeScreen from "../components/profile/grades";
import LecturesScreen from "../components/profile/lecture";
import SectionsScreen from "../components/profile/section";
import { FIREBASE_AUTH } from "../firebase/config";
import CustomText from "../components/elements/text";
import { useTheme } from '../components/elements/theme-provider';
import { useLanguage } from '../components/elements/language-provider';
import colors from '../constants/colors';
import { Dimensions } from "react-native";
import { EvilIcons, Feather } from "@expo/vector-icons";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme(); // Get the theme from context
  const { language, translations } = useLanguage(); // Get translations object

  const currentColors = colors[theme]; // Get colors based on the theme

  const [profileImage, setProfileImage] = useState(FIREBASE_AUTH.currentUser.photoURL || 'https://th.bing.com/th/id/OIP.IFXNgxYGgCrOJ8MwkPbX7wHaHa?w=740&h=740&rs=1&pid=ImgDetMain');


  const handleSelectImage = async () => {
    try {
      const newImageUri = await selectImageAndUpdateProfile();
      setProfileImage(newImageUri);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={[styles.tabIndicator, { backgroundColor: currentColors.indicator }]}
      style={[styles.tabBar, {
        backgroundColor: currentColors.background,
        borderBottomWidth: 1,borderBottomColor:currentColors.border 
      }]}
      labelStyle={[styles.tabLabel, { color: currentColors.text, fontFamily: language === 'ar' ? 'ar' : 'bold' }]}
      activeColor={currentColors.iconFocus} // Active tab text color
      inactiveColor={currentColors.iconColor} // Inactive tab text color

    />
  );

  const renderScene = SceneMap({
    grades: GradeScreen,
    lectures: LecturesScreen,
    sections: SectionsScreen,
  });

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([
    { key: 'grades', title: translations.grades },
    { key: 'lectures', title: translations.lectures },
    { key: 'sections', title: translations.sections },
  ]);

  useEffect(() => {
    // Update routes when translations change
    setRoutes([
      { key: 'grades', title: translations.grades },
      { key: 'lectures', title: translations.lectures },
      { key: 'sections', title: translations.sections },
    ]);
  }, [translations]);
  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={styles.profileContainer}>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <CustomText style={[styles.name, { color: currentColors.text }]}>
              {translations.name}:
            </CustomText>
            <View style={styles.rightAligned}>
              <CustomText style={[styles.email, {
                color: currentColors.text2,
                textAlign: 'left',

              }]}>{FIREBASE_AUTH.currentUser.displayName}
              </CustomText>
            </View>
          </View>
          <View style={styles.infoRow}>
            <CustomText style={[styles.name, {
              color: currentColors.text

            }]}>
              {translations.email}:
            </CustomText>
            <View style={styles.rightAligned}>
              <CustomText style={[styles.email, {
                color: currentColors.text2,
                textAlign: 'left',


              }]}>{FIREBASE_AUTH.currentUser.email}
              </CustomText>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.imageRow} onPress={handleSelectImage}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <CustomText style={[styles.editText, { color: currentColors.text }]}>
            {translations.editProfilePicture} <Feather name="edit-2" size={15} color={currentColors.text}  style={{textDecorationLine:'underline'}} />
          </CustomText>
        </TouchableOpacity>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
        swipeEnabled={language == 'ar' ? false : true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileContainer: {
    width: '100%',
    justifyContent: 'space-between',
    paddingRight: 10,
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center'
  },
  profileImage: {
    width: 85,
    height: 85,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 15,
  },
  imageRow: {
    alignItems:'center'
  }, rightAligned: {
  },
  email: {
    fontSize: 12,
  },
  infoContainer: {
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  infoRow: {
    paddingTop: 5,
  },
  tabBar: {
    backgroundColor: 'white',
    elevation: 0,
  },
  tabIndicator: {
    backgroundColor: 'black',
  },
  tabLabel: {
    fontSize: 16,
    color: 'black',
  },
  editText: {
    alignSelf: 'center',
    fontSize: 16,
  },
  arrow: {
    fontSize: 16,
    color: 'grey',
  },
});

export default ProfileScreen;



