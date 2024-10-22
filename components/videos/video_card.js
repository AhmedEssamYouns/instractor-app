import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Pressable, Touchable, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../elements/theme-provider';
import colors from '../../constants/colors';
import CustomText from '../elements/text';
import { FIREBASE_AUTH } from '../../firebase/config';
import { collection, doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; 
import { useNavigation } from '@react-navigation/native';

const placeholderImage = 'https://via.placeholder.com/100'; 

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

const VideoCard = ({ video }) => {
  const { theme } = useTheme();
  const currentColors = colors[theme];
  const [seen, setSeen] = useState(false);
  const userId = FIREBASE_AUTH.currentUser.uid; 
  useEffect(() => {
    const userDocRef = doc(collection(db, 'users'), userId);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const viewedLectures = data.viewedLectures || [];
        const viewedSections = data.viewedSections || [];

        console.log('Viewed Sections:', viewedSections);
        console.log('Current Video id:', video.id); 

        if (viewedLectures.includes(video.id) || viewedSections.includes(video.id)) {
          setSeen(true);
          console.log('Video has been seen');
        } else {
          setSeen(false);
        }
      } else {
        console.log('User document does not exist');
      }
    });

    return () => unsubscribe();
  }, [video.videoUrl, userId]);
  const navigation = useNavigation()



  return (
    <TouchableOpacity
      onPress={() =>
        video.vd ?
          navigation.navigate('VideoDetail', { videoId: video.id })
          :
          navigation.navigate('SectionDetail', { sectionId: video.id })

      }
      style={[styles.card, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]}>
      <MaterialIcons name='video-library' size={24} color={currentColors.text2} style={{ position: 'absolute', right: 15, top: 15 }} />

      <Image
        source={{ uri: video.poster || placeholderImage }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <CustomText style={[styles.title, { color: currentColors.text2 }]}>{video.title}</CustomText>
        <CustomText style={[styles.timestamp, { color: currentColors.text }]}>
          {formatDate(Date(video.createdAt))}
        </CustomText>
      </View>
      {seen && (
        <Ionicons
          name='checkmark-done-circle'
          style={styles.icon}
          size={25}
          color={'green'}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 14,
    marginHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
    position: 'relative',
    borderWidth: 1,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 15,
    marginRight: 10,
  },
  infoContainer: {
    height: '100%',
  },
  title: {
    fontSize: 14,
    width: 150,
    textAlign: 'left',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
    color: 'gray',
    position: 'absolute',
    bottom: 10,
  },
  icon: {
    position: 'absolute',
    bottom: 15,
    right: 10,
    zIndex: 2,
  },
});

export default VideoCard;
