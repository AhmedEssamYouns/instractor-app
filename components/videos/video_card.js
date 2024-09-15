import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import the Ionicons
import { useTheme } from '../../constants/theme-provider';
import colors from '../../constants/colors'; // Import colors

// Placeholder image
const placeholderImage = 'https://via.placeholder.com/100'; // URL to a placeholder image

const VideoCard = ({ video }) => {
  const { theme } = useTheme(); // Get the theme from context
  const currentColors = colors[theme]; // Get colors based on the theme

  return (
    <View style={[styles.card, { backgroundColor: currentColors.cardBackground, borderColor: currentColors.borderColor }]}>
      <Image
        source={{ uri: video.image || placeholderImage }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: currentColors.text }]}>{video.name}</Text>
        <Text style={[styles.points, { color: currentColors.text }]}>{video.points} points</Text>
      </View>
      <Text style={[styles.duration, { color: currentColors.text }]}>{video.duration}</Text>
      {video.seen && (
        <Ionicons
          name='checkmark-done-circle'
          style={styles.icon}
          size={25}
          color={'green'}
        />
      )}
    </View>
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    position: 'absolute',
    left: 0,
  },
  duration: {
    fontSize: 16,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  points: {
    fontSize: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  icon: {
    position: 'absolute',
    bottom: 15,
    right: 10,
    zIndex: 2,
  },
});

export default VideoCard;
