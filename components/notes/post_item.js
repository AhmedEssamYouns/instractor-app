import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking, Animated, Easing } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import CustomText from '../elements/text';
import { downloadImage } from '../elements/manage-files';
import { getCommentAndReplyCounts, likePost, unlikePost } from '../../firebase/posts';
import CommentModal from '../comment/commentsModel';
import { FIREBASE_AUTH } from '../../firebase/config';
import { deletePost } from '../../firebase/posts';

const PostItem = ({ post, onEdit }) => {
    const currentUserId = FIREBASE_AUTH.currentUser?.uid;
    const [liked, setLiked] = useState(post.likes?.includes(currentUserId) || false);
    const [isCommentModalVisible, setCommentModalVisible] = useState(false);
    const scaleValue = useRef(new Animated.Value(1)).current;

    const handleLike = async () => {
        try {
            const userId = FIREBASE_AUTH.currentUser?.uid;
            if (userId) {
                if (liked) {
                    await unlikePost(post.id, userId);
                    setLiked(false);
                } else {
                    await likePost(post.id, userId);
                    setLiked(true);
                }

                // Trigger animation
                Animated.sequence([
                    Animated.timing(scaleValue, {
                        toValue: 1.3,
                        duration: 110,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 1,
                        duration: 150,
                        easing: Easing.ease,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        } catch (error) {
            console.error('Error liking/unliking post: ', error);
        }
    };

    const openDocument = () => {
        if (post.document) {
            Linking.openURL(post.document);
        }
    };

    return (
        <View style={styles.item}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10 }}>
                <Image source={{ uri: 'https://trinityblood.solutions/wp-content/uploads/2022/02/avatar-guy.png' }} style={{ width: 30, height: 30 }} />
                <CustomText>Teacher</CustomText>
            </View>
            <View style={styles.iconContainer}>
                <Text style={styles.timestamp}>{new Date(post.timestamp).toLocaleString()}</Text>
                <TouchableOpacity onPress={() => onEdit(post)}>
                    <MaterialIcons name="edit" size={24} color="#007BFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deletePost(post.id)}>
                    <MaterialIcons name="delete" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>
            <View style={{ marginHorizontal: 15, borderLeftWidth: 1, paddingHorizontal: 10 }}>
                {post.title && <Text style={styles.title}>{post.title}</Text>}
                {post.content && <Text style={styles.content}>{post.content}</Text>}
                {post.image ? (
                    <View>
                        <Image source={{ uri: post.image }} style={styles.image} />
                        <TouchableOpacity style={styles.downloadButton} onPress={() => downloadImage(post.image)}>
                            <MaterialIcons name="file-download" size={20} color="#007BFF" />
                            <Text style={styles.downloadText}>Download Image</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
                {post.document ? (
                    <TouchableOpacity style={styles.documentContainer} onPress={openDocument}>
                        <MaterialIcons name="attach-file" size={24} color="grey" />
                        <CustomText style={styles.documentText}>
                            {post.documentName || 'View Document'}
                        </CustomText>
                    </TouchableOpacity>
                ) : null}

                {/* Like and Comment Section */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={handleLike}
                    >
                        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                            <MaterialIcons name={liked ? "thumb-up" : "thumb-up-off-alt"} size={24} color={liked ? "#007BFF" : "#888"} />
                        </Animated.View>
                        <Text> {post.likes.length > 0 ? post.likes.length : 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setCommentModalVisible(true)}>
                        <Feather name="message-circle" size={24} color="#888" />
                        <CustomText style={{color:'grey'}}> {getCommentAndReplyCounts(post.comments)}</CustomText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Comment Modal */}
            <CommentModal
                visible={isCommentModalVisible}
                onClose={() => setCommentModalVisible(false)}
                postId={post.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        position: 'relative',
    },
    iconContainer: {
        position: 'absolute',
        top: 8,
        gap: 10,
        right: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
    },
    content: {
        fontSize: 16,
        marginBottom: 12,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
    },
    documentText: {
        fontSize: 16,
        marginLeft: 8,
        color: '#444'
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 10,
        position: 'absolute',
        padding: 5,
        right: 10,
        bottom: 20,
    },
    downloadText: {
        fontSize: 12,
        color: 'white',
        marginLeft: 8,
    },
});

export default PostItem;
