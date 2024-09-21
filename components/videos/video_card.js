import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Pressable, Touchable, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../elements/theme-provider';
import colors from '../../constants/colors';
import CustomText from '../elements/text';
import { FIREBASE_AUTH } from '../../firebase/config';
import { collection, doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Adjust based on your setup
import { useNavigation } from '@react-navigation/native';

const placeholderImage = 'https://via.placeholder.com/100'; // URL to a placeholder image

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
  const userId = FIREBASE_AUTH.currentUser.uid; // Get the current user's ID
  useEffect(() => {
    const userDocRef = doc(collection(db, 'users'), userId);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // console.log('User data:', data); // Log the data to see its structure
        const viewedLectures = data.viewedLectures || [];
        const viewedSections = data.viewedSections || [];

        // Log the arrays for verification
        console.log('Viewed Sections:', viewedSections);
        console.log('Current Video id:', video.id); // Log current video URL

        // Check if the videoUrl is in either viewed or viewedSections
        if (viewedLectures.includes(video.id) || viewedSections.includes(video.id)) {
          setSeen(true);
          console.log('Video has been seen');
        } else {
          setSeen(false);
          // console.log('Video has not been seen');
        }
      } else {
        console.log('User document does not exist');
      }
    });

    return () => unsubscribe();
  }, [video.videoUrl, userId]);
  const navigation = useNavigation()


  // Call this function when the video is watched (you might need a button or some trigger)

  return (
    <TouchableOpacity
      onPress={() =>
        video.vd ?
          navigation.navigate('VideoDetail', { videoId: video.id })
          :
          navigation.navigate('SectionDetail', { sectionId: video.id })

      }
      style={[styles.card, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]}>
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
    width: 180,
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
