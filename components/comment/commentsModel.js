import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image, Keyboard, Alert, ActivityIndicator, Pressable } from 'react-native';
import { addComment, getComments, addReply, likeComment, unlikeComment, deleteComment, handleLikeComment, deleteReply, formatCreatedAt } from '../../firebase/posts';
import { FIREBASE_AUTH } from '../../firebase/config';
import { getUserDetailsById } from '../../firebase/user';
import { FontAwesome, FontAwesome5, AntDesign } from '@expo/vector-icons';
import CustomText from '../elements/text';

const CommentModal = ({ visible, onClose, postId }) => {
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [activeReply, setActiveReply] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [userLikes, setUserLikes] = useState(new Set());
    const [loading, setLoading] = useState(true); // Add loading state
    const inputRef = useRef(null);
useEffect(() => {
    let unsubscribe;

    if (visible) {
        setLoading(true);

        getComments(postId, (updatedComments, likes) => {
            setComments(updatedComments);  
            setUserLikes(likes);  
            setLoading(false);
        }).then(unsub => {
            unsubscribe = unsub;  
        }).catch(error => {
            console.error('Error fetching comments:', error);
        });
    }

    const keyboardListener = Keyboard.addListener('keyboardDidHide', () => {
        setActiveReply(null);
    });

    return () => {
        if (unsubscribe) {
            unsubscribe(); // Unsubscribe properly when component unmounts
        }
        keyboardListener.remove();  // Remove the keyboard listener on cleanup
    };
}, [visible, postId]);


    const handleAddComment = async () => {
        if (commentText.trim()) {
            if (activeReply) {
                await addReply(postId, activeReply, FIREBASE_AUTH.currentUser.uid, commentText,setCommentText,setActiveReply,setShowReplies);
            } else {
                await addComment(postId, FIREBASE_AUTH.currentUser.uid, commentText,setCommentText);
            }
        }
    };

    useEffect(() => {
        if (activeReply != null) {
            inputRef.current.focus();
        }
    }, [activeReply]);

    const handleAddReply = (commentId) => {
        setActiveReply(commentId);
        inputRef.current?.focus();
    };

    const toggleReplies = (commentId) => {
        setShowReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    };
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <CustomText style={styles.headerText}>Comments</CustomText>
                        <FontAwesome onPress={onClose} name="close" size={24} color="#000" />
                    </View>

                    {loading ? ( // Show loading indicator if loading is true
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
                        </View>
                    ) : (
                        <FlatList
                            data={comments}
                            contentContainerStyle={styles.commentList}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                const hasReplies = item.replies && item.replies.length > 0;
                                const areRepliesVisible = showReplies[item.id];
                                const isLiked = userLikes.has(item.id);

                                return (
                                    <View style={styles.commentContainer}>
                                        <Pressable onLongPress={() => deleteComment(postId,item.id,comments)}>
                                            <View style={styles.commentHeader}>
                                                <Image
                                                    source={{ uri: item.photoURL }}
                                                    style={styles.commentAvatar}
                                                />
                                                <CustomText style={styles.commentName}>{item.displayName}</CustomText>
                                                <Text style={{fontSize:10,position:'absolute',right:10}}>{formatCreatedAt(item.timestamp)}</Text>

                                            </View>
                                            <View style={styles.commentItem}>
                                                <Text style={styles.commentText}>{item.text}</Text>
                                            </View>

                                            <View style={styles.actions}>
                                                <TouchableOpacity onPress={() => handleLikeComment(postId,item.id,userLikes,setUserLikes)}>
                                                    <AntDesign
                                                        name={isLiked ? 'like1' : 'like2'}
                                                        size={20}
                                                        color={isLiked ? '#007BFF' : 'grey'}
                                                    />
                                                </TouchableOpacity>
                                                <CustomText style={{ color: 'grey', marginHorizontal: 5 }}>
                                                    {item.likes ? item.likes.length : 0}
                                                </CustomText>

                                                <TouchableOpacity>
                                                    <FontAwesome
                                                        name={'reply-all'}
                                                        size={12}
                                                        color={'grey'}
                                                    />
                                                </TouchableOpacity>

                                                <TouchableOpacity onPress={() => handleAddReply(item.id)}>
                                                    <CustomText style={[styles.replyText, { color: '#999' }]}>
                                                        Reply
                                                    </CustomText>
                                                </TouchableOpacity>
                                            </View>
                                        </Pressable>

                                        {hasReplies && (
                                            <TouchableOpacity style={styles.viewReplies} onPress={() => toggleReplies(item.id)}>
                                                <View style={styles.line}></View>
                                                <CustomText style={{ color: 'grey' }}>
                                                    {areRepliesVisible ? (
                                                        <>
                                                            Hide Replies <FontAwesome5 name="angle-up" size={15} color="grey" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            View {item.replies.length} Replies <FontAwesome5 name="angle-down" size={15} color="grey" />
                                                        </>
                                                    )}
                                                </CustomText>
                                            </TouchableOpacity>
                                        )}
                                        <View style={{
                                            borderLeftWidth: 1,
                                            borderColor: '#aaa',
                                            marginLeft: 60,
                                        }}>
                                            {areRepliesVisible && item.replies && item.replies.map((reply,index) => (
                                                <Pressable onLongPress={()=>deleteReply(postId,item.id,reply.createdAt)} key={reply.createdAt} style={styles.replyContainer}>
                                                    <View style={styles.commentHeader}>
                                                        <Image
                                                            source={{ uri: reply.photoURL }}
                                                            style={styles.replyAvatar}
                                                        />
                                                        <CustomText style={styles.commentName}>{reply.displayName}</CustomText>
                                                        <Text style={{fontSize:10,position:'absolute',right:10}}>{formatCreatedAt(reply.createdAt)}</Text>
                                                    </View>
                                                    <View style={styles.replyItem}>
                                                        <Text style={styles.commentText}>{reply.text}</Text>
                                                    </View>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={inputRef}
                            style={styles.input}
                            placeholder={activeReply ? 'Reply to comment...' : 'Add a comment...'}
                            value={commentText}
                            returnKeyType='send'
                            onChangeText={setCommentText}
                            onSubmitEditing={handleAddComment}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};



const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        height: '75%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        marginVertical: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerText: {
        fontSize: 20,
    },
    commentList: {
        paddingVertical: 10,
    },
    commentContainer: {
        marginBottom: 10,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    replyAvatar: {
        width: 30,
        height: 30,
        borderRadius: 20,
    },
    commentName: {
        paddingLeft: 10,
        fontSize: 16,
    },
    commentItem: {
        marginLeft: 50,
        paddingLeft: 10,
        borderColor: '#aaa',
        borderLeftWidth: 1,
        paddingVertical: 5,
    },
    replyItem: {
        borderColor: '#aaa',
        paddingVertical: 5,
    },
    commentText: {
        width: '85%',
    },
    input: {
        backgroundColor: '#eee',
        borderBottomWidth: 1,
        padding: 10,
        borderRadius: 20,
        marginTop: 5,
        elevation: 2,
    },
    actions: {
        paddingLeft: 40,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    replyText: {
        marginLeft: 5,
        color: '#444',
    },
    replyContainer: {
        width: 200,
        paddingLeft: 10,
        paddingBottom: 5,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#aaa',
    },
    viewReplies: {
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 60,
        color: 'grey',
        marginTop: 5,
    },
    line: {
        top: 2,
        marginRight: 5,
        width: 20,
        height: 1,
        backgroundColor: "grey",
    },
});

export default CommentModal;
