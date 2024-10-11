import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PostForm from '../components/notes/post_form';
import PostList from '../components/notes/posts_list';
import { getPosts } from '../firebase/posts';
import colors from '../constants/colors';
import { useTheme } from '../components/elements/theme-provider';
import checkIfUserIsAdmin from '../firebase/user';

const PostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isAdmin, setIsAdmin] = useState(false); 
  const { theme } = useTheme(); 
  const currentColors = colors[theme];

  
  useEffect(() => {
    const fetchPostsAndAdminStatus = async () => {
      setLoading(true);
      const unsubscribe = getPosts((fetchedPosts) => {
        setPosts(fetchedPosts);
        setLoading(false); 
      });
      const adminStatus = await checkIfUserIsAdmin(); 
      setIsAdmin(adminStatus);

      return () => unsubscribe();
    };

    fetchPostsAndAdminStatus();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading posts...</Text>
        </View>
      ) : (
        <PostList
          posts={posts}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  addButton: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostsScreen;
