import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image, Keyboard, ActivityIndicator, Pressable, PanResponder } from 'react-native';
import { addComment, getComments, addReply, deleteComment, handleLikeComment, deleteReply, formatCreatedAt } from '../../firebase/posts';
import { FIREBASE_AUTH } from '../../firebase/config';
import colors from '../../constants/colors';
import { useLanguage } from '../elements/language-provider';
import { useTheme } from '../elements/theme-provider';
import { FontAwesome, FontAwesome5, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomText from '../elements/text';
import { Ionicons, MaterialCommunityIcon } from '@expo/vector-icons';

const CommentModal = ({ visible, onClose, postId }) => {
    const [commentText, setCommentText] = useState('');
    const { language, translations } = useLanguage();
    const { theme } = useTheme();
    const currentColors = colors[theme];
    const [comments, setComments] = useState([]);
    const [activeReply, setActiveReply] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const [userLikes, setUserLikes] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const inputRef = useRef(null);
    const [modalOffset, setModalOffset] = useState(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                const newOffset = Math.max(0, modalOffset + gestureState.dy);
                setModalOffset(newOffset);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dy > 100) {
                    onClose();
                    setModalOffset(0);

                } else {
                    setModalOffset(0);
                }
            },
        })
    ).current;

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
            setName(null);
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
            keyboardListener.remove();
        };
    }, [visible, postId]);

    const handleAddComment = async () => {
        if (commentText.trim()) {
            if (activeReply) {
                await addReply(postId, activeReply, FIREBASE_AUTH.currentUser.uid, commentText, setCommentText, setActiveReply, setShowReplies);
                setName(null);
            } else {
                await addComment(postId, FIREBASE_AUTH.currentUser.uid, commentText, setCommentText);
            }
        }
    };

    useEffect(() => {
        if (activeReply != null) {
            inputRef.current.focus();
        }
    }, [activeReply]);

    const [name, setName] = useState(null);
    const handleAddReply = (commentId, name) => {
        setActiveReply(commentId);
        setName(name);
        inputRef.current?.focus();
    };

    const handleToggleLike = (commentId) => {

        setUserLikes((prevLikes) => {
            const newUserLikes = new Set(prevLikes);
            if (newUserLikes.has(commentId)) {
                newUserLikes.delete(commentId);
            } else {
                newUserLikes.add(commentId);
            }

            handleLikeComment(postId, commentId, userLikes);
            return newUserLikes;
        });
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
            onRequestClose={() => {
                onClose();
                setActiveReply(null);
            }}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.out} onPress={onClose}>
                </Pressable>

                <View
                    style={[styles.modalContent, { backgroundColor: currentColors.background, transform: [{ translateY: modalOffset }] }]}>
                    <View style={styles.header}
                        {...panResponder.panHandlers}
                    >
                        <CustomText style={styles.headerText}>{translations.Comments}</CustomText>
                        <View style={{ height: 4, borderRadius: 50, position: 'absolute', left: '35%', top: 15, backgroundColor: currentColors.text2, width: 100, }} />

                    </View>
                    <Pressable style={{ padding: 5, zIndex: 22, position: 'absolute', right: 20, top: 22 }} onPress={onClose}>
                        <FontAwesome name="close" size={20} color={currentColors.text} />
                    </Pressable>
                    {loading ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
                        </View>
                    ) : (
                        <FlatList
                            data={comments}
                            ListEmptyComponent={
                                <CustomText style={{ alignSelf: 'center' }}>
                                    {translations.nocomments}
                                </CustomText>}
                            contentContainerStyle={styles.commentList}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                const hasReplies = item.replies && item.replies.length > 0;
                                const areRepliesVisible = showReplies[item.id];
                                const isLiked = userLikes.has(item.id)

                                return (
                                    <View style={styles.commentContainer}>
                                        <Pressable onLongPress={() => deleteComment(postId, item.id, comments)}>
                                            <View style={styles.commentHeader}>
                                                <Image source={{ uri: item.photoURL }} style={styles.commentAvatar} />
                                                <CustomText style={styles.commentName}>{item.displayName}</CustomText>
                                                {item.admin && (
                                                            <View style={{flexDirection:'row'}}> 
                                                                {item.author ? (
                                                                    <>
                                                                        <CustomText style={styles.badge}>@author </CustomText>
                                                                        <MaterialCommunityIcons name="crown" style={styles.badge} />

                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CustomText style={styles.badge2}>@admin </CustomText>
                                                                        <Ionicons name="shield" style={styles.badge2} /> 

                                                                    </>
                                                                )}
                                                            </View>
                                                        )}
                                                <Text style={{ fontSize: 10, position: 'absolute', right: 10, color: 'grey' }}>{formatCreatedAt(item.timestamp)}</Text>
                                            </View>
                                            <View style={styles.commentItem}>
                                                <CustomText style={styles.commentText}>{item.text}</CustomText>
                                            </View>

                                            <View style={styles.actions}>
                                                <TouchableOpacity onPress={() =>
                                                    handleToggleLike(item.id)
                                                }
                                                >
                                                    <AntDesign name={isLiked ? 'like1' : 'like2'} size={20} color={isLiked ? '#007BFF' : 'grey'} />
                                                </TouchableOpacity>
                                                <CustomText style={{ color: 'grey', marginHorizontal: 5 }}>
                                                    {item.likes ? item.likes.length : 0}
                                                </CustomText>
                                                <TouchableOpacity style={{ paddingLeft: 10, flexDirection: 'row', alignItems: 'center' }} onPress={() => handleAddReply(item.id, item.displayName)}>
                                                    <FontAwesome name={'reply-all'} size={12} color={'grey'} />
                                                    <CustomText style={[styles.replyText, { color: '#999' }]}>{translations.reply}</CustomText>
                                                </TouchableOpacity>
                                            </View>
                                        </Pressable>

                                        {hasReplies && (
                                            <TouchableOpacity style={styles.viewReplies} onPress={() => toggleReplies(item.id)}>
                                                <View style={styles.line}></View>
                                                <CustomText style={{ color: 'grey' }}>
                                                    {areRepliesVisible ? (
                                                        <>
                                                            {translations.hideRiplies} <FontAwesome5 name="angle-up" size={15} color="grey" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            {translations.show} {item.replies.length} {translations.replies} <FontAwesome5 name="angle-down" size={15} color="grey" />
                                                        </>
                                                    )}
                                                </CustomText>
                                            </TouchableOpacity>
                                        )}
                                        <View style={{ borderLeftWidth: 1, borderColor: '#aaa', marginLeft: 60 }}>
                                            {areRepliesVisible && item.replies && item.replies.map((reply, index) => (
                                                <Pressable onLongPress={() => deleteReply(postId, item.id, reply.createdAt)} key={reply.createdAt} style={styles.replyContainer}>
                                                    <View style={styles.commentHeader}>
                                                        <Image source={{ uri: reply.photoURL }} style={styles.replyAvatar} />
                                                        <CustomText style={[styles.commentName, { fontSize: 12 }]}>{reply.displayName}</CustomText>
                                                        {item.admin && (
                                                            <View style={{flexDirection:'row'}}> 
                                                                {item.author ? (
                                                                    <>
                                                                        <CustomText style={styles.badge}>@author </CustomText>
                                                                        <MaterialCommunityIcons name="crown" style={styles.badge} />

                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CustomText style={styles.badge2}>@admin </CustomText>
                                                                        <Ionicons name="shield" style={styles.badge2} /> 

                                                                    </>
                                                                )}
                                                            </View>
                                                        )}
                                                        <Text style={{ fontSize: 10, position: 'absolute', right: 0, color: 'grey', }}>{formatCreatedAt(reply.createdAt)}</Text>
                                                    </View>
                                                    <View style={styles.replyItem}>
                                                        <CustomText style={styles.commentText}>{reply.text}</CustomText>
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
                        {activeReply && (
                            <View style={{ padding: 10, flexDirection: "row", justifyContent: 'space-between', borderTopColor: currentColors.borderColor, borderTopWidth: 2 }}>
                                <CustomText>{translations.addreply} {name}</CustomText>
                                <FontAwesome onPress={() => setActiveReply(null)} name="close" size={24} color={currentColors.text} />
                            </View>
                        )}
                        <TextInput
                            ref={inputRef}
                            style={[styles.input, { backgroundColor: currentColors.cardBackground, color: currentColors.text2 }]}
                            placeholder={activeReply ? (translations.addreply + ' ' + name) : translations.addComment}
                            placeholderTextColor={currentColors.text2}
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
        zIndex: 1
    },
    out: {
        flex: 0.3,
    },
    modalContent: {
        flex: 0.7,
        zIndex: 2,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        paddingVertical: 25,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderColor: 'grey',
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
    badge: {
        color: 'green',
        fontSize: 10
    },
    badge2: {
        color: '#5F9EA0',
        fontSize: 10
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
        paddingRight: 10,
        fontSize: 16,
    },
    commentItem: {
        marginLeft: 20,
        paddingLeft: 10,
        borderColor: 'grey',
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
        borderBottomWidth: 1,
        padding: 10,
        borderRadius: 20,
        marginTop: 5,
        elevation: 2,
    },
    actions: {
        paddingLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    replyText: {
        marginLeft: 5,
        color: '#444',
    },
    replyContainer: {
        width: 220,
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
