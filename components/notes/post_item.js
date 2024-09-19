import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking, Animated, Easing, Alert } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import CustomText from '../elements/text';
import { downloadImage } from '../elements/manage-files';
import { getCommentAndReplyCounts, likePost, unlikePost, deletePost } from '../../firebase/posts';
import CommentModal from '../comment/commentsModel';
import { FIREBASE_AUTH } from '../../firebase/config';
import { useTheme } from '../elements/theme-provider';
import { useLanguage } from '../elements/language-provider';
import colors from '../../constants/colors';
import checkIfUserIsAdmin from '../../firebase/user';

const PostItem = ({ post, onEdit }) => {
    const currentUserId = FIREBASE_AUTH.currentUser?.uid;
    const [liked, setLiked] = useState(post.likes?.includes(currentUserId) || false);
    const [isCommentModalVisible, setCommentModalVisible] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // State to check if the user is an admin
    const scaleValue = useRef(new Animated.Value(1)).current;
    const { language, translations } = useLanguage(); // Get translations object
    const { theme } = useTheme(); // Get theme from context
    const currentColors = colors[theme];

    // Fetch admin status when the component mounts
    useEffect(() => {
        const fetchAdminStatus = async () => {
            const adminStatus = await checkIfUserIsAdmin(); // Check if user is admin
            setIsAdmin(adminStatus);
        };
        fetchAdminStatus();
    }, []);

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
        <View style={[styles.item, { backgroundColor: currentColors.background,borderColor:currentColors.text2 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10 }}>
                <Image source={{ uri: 'https://trinityblood.solutions/wp-content/uploads/2022/02/avatar-guy.png' }} style={{ width: 30, height: 30 }} />
                <CustomText>{translations.teacher}</CustomText>
            </View>
            <View style={styles.iconContainer}>
                <Text style={styles.timestamp}>{new Date(post.timestamp).toLocaleString()}</Text>
                {isAdmin && (
                    <>
                        <TouchableOpacity onPress={() => onEdit(post)}>
                            <MaterialIcons name="edit" size={24} color="#007BFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>deletePost(post.id)}>
                            <MaterialIcons name="delete" size={24} color="#FF3B30" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
            <View style={{ marginHorizontal: 15, borderLeftWidth: 1, paddingHorizontal: 10, borderLeftColor: currentColors.text2 }}>
                {post.title && <CustomText style={styles.title}>{post.title}</CustomText>}
                {post.content && <CustomText style={[styles.content, { color: currentColors.text2 }]}>{post.content}</CustomText>}
                {post.image ? (
                    <View>
                        <Image source={{ uri: post.image }} style={styles.image} />
                        <TouchableOpacity style={styles.downloadButton} onPress={() => downloadImage(post.image)}>
                            <MaterialIcons name="file-download" size={20} color="#007BFF" />
                            <CustomText style={styles.downloadText}>Download Image</CustomText>
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
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                        onPress={handleLike}
                    >
                        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                            <MaterialIcons name={liked ? "thumb-up" : "thumb-up-off-alt"} size={24} color={liked ? "#007BFF" : currentColors.text2} />
                        </Animated.View>
                        <CustomText> {post.likes.length > 0 ? post.likes.length : 0}</CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }} onPress={() => setCommentModalVisible(true)}>
                        <Feather name="message-circle" size={24} color={currentColors.text2} />
                        <CustomText> {getCommentAndReplyCounts(post.comments)}</CustomText>
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
        position: 'relative',
        borderBottomWidth:1
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
        fontSize: 20,
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
        justifyContent: 'center',
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 10,
        marginBottom: 12,
    },
    documentText: {
        width: 200,
        alignSelf: 'center',
        fontSize: 16,
        marginLeft: 8,
        color: '#444',
    },
    timestamp: {
        padding:15,
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
