import { collection, addDoc, deleteDoc, updateDoc, doc, getDoc, onSnapshot, query, where, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, FIREBASE_AUTH, storage } from './config'; 
import { Alert } from 'react-native';
import checkIfUserIsAdmin, { getUserDetailsById } from './user';


import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';


export const pickImage = async (setImageUri) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
        return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        console.log('Selected image URI:', result.assets[0].uri);
    } else {
        console.log('Image selection canceled or no image selected');
    }
};


export const pickDocument = async (setDocumentUri, setDocumentName) => {
    try {
        let result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/msword', 'application/vnd.ms-excel'],
        });

        if (result.canceled) {
            console.log('Document selection canceled');
            return; 
        }

        if (result.assets && result.assets.length > 0) {
            const { uri, name } = result.assets[0];
            setDocumentUri(uri);
            setDocumentName(name);
            console.log('Selected document URI:', uri);
            console.log('Selected document name:', name);
        } else {
            console.log('No document selected or document details are missing', result);
        }
    } catch (error) {
        console.error('Error picking document:', error);
    }
};


export const addComment = async (postId, userId, commentText, setCommentText) => {
    try {
        const postRef = doc(db, 'posts', postId);
        const comment = {
            id: new Date().toISOString(), 
            user: userId,
            text: commentText,
            timestamp: new Date().toISOString(),
            likes: [], 
            replies: [] 
        };
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            const comments = postData.comments || [];
            comments.push(comment);
            setCommentText('');
            await updateDoc(postRef, { comments });
        } else {
            console.error('No post document found.');
        }
    } catch (error) {
        console.error('Error adding comment: ', error);
    }
};





export const getComments = async (postId, callback) => {
    try {
        const postRef = doc(db, 'posts', postId);

        const unsubscribe = onSnapshot(postRef, async (docSnapshot) => {
            if (!docSnapshot.exists()) {
                callback([], new Set()); 
                return;
            }

            const postData = docSnapshot.data();
            const comments = postData?.comments || [];

            const updatedComments = await Promise.all(
                comments.map(async (comment) => {
                    const userDetails = await getUserDetailsById(comment.user);
                    return {
                        ...comment,
                        displayName: userDetails.displayName || 'user',
                        photoURL: userDetails.photoURL || 'https://redcoraluniverse.com/img/default_profile_image.png',
                        admin: userDetails.admin || false,
                        author: userDetails.author || false,
                        replies: await Promise.all(
                            (comment.replies || []).map(async (reply) => {
                                const replyUser = await getUserDetailsById(reply.user);
                                return {
                                    ...reply,
                                    displayName: replyUser.displayName || 'user',
                                    photoURL: replyUser.photoURL || 'https://redcoraluniverse.com/img/default_profile_image.png',
                                    admin: replyUser.admin || false,
                                    author: replyUser.author || false,

                                };
                            })
                        ),
                    };
                })
            );

            // Get the current user's ID
            const currentUserId = FIREBASE_AUTH.currentUser?.uid;

            // Handle likes for each comment
            const likes = new Set();
            updatedComments.forEach((comment) => {
                if (Array.isArray(comment.likes) && comment.likes.includes(currentUserId)) {
                    likes.add(comment.id);
                }
            });

            callback(updatedComments, likes);
        });

        return unsubscribe || (() => { }); 
    } catch (error) {
        console.error('Error fetching comments: ', error);
        return () => { }; 
    }
};


export const likePost = async (postId, userId) => {
    try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            likes: arrayUnion(userId)
        });
    } catch (error) {
        console.error('Error liking post: ', error);
    }
};

export const unlikePost = async (postId, userId) => {
    try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
            likes: arrayRemove(userId)
        });
    } catch (error) {
        console.error('Error unliking post: ', error);
    }
};

export const addPost = async (post) => {
    try {
        const postsCollection = collection(db, 'posts');

        const docRef = await addDoc(postsCollection, {
            ...post,
            timestamp: new Date().toISOString(),
            comments: [], 
            likes: [] 
        });

        await updateDoc(doc(db, 'posts', docRef.id), {
            postId: docRef.id
        });

        return docRef.id; 
    } catch (error) {
        console.error('Error adding post: ', error);
    }
};

export const deletePost = async (id) => {
    return new Promise((resolve, reject) => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => reject('Post deletion canceled'),
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const postDoc = doc(db, 'posts', id);
                            const postSnapshot = await getDoc(postDoc);
                            const postData = postSnapshot.data();

                            if (postData?.image) {
                                const imageRef = ref(storage, postData.image);
                                await deleteObject(imageRef);
                            }
                            if (postData?.document) {
                                const documentRef = ref(storage, postData.document);
                                await deleteObject(documentRef);
                            }

                            
                            await deleteDoc(postDoc);

                            resolve(); 
                        } catch (error) {
                            console.error('Error deleting post: ', error);
                            reject(error);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    });
};

export const updatePost = async (id, updatedPost) => {
    try {
        const postDoc = doc(db, 'posts', id);
        await updateDoc(postDoc, updatedPost);
    } catch (error) {
        console.error('Error updating post: ', error);
    }
};
export const getPosts = (callback) => {
    const postsCollection = collection(db, 'posts');

    return onSnapshot(postsCollection, snapshot => {
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const sortedPosts = posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        callback(sortedPosts);
    }, (error) => {
        console.error('Error getting posts: ', error);
    });
};

export const uploadFile = async (fileUri, fileName) => {
    try {
        const fileRef = ref(storage, `files/${fileName}`);
        const response = await fetch(fileUri);
        const blob = await response.blob();
        await uploadBytes(fileRef, blob);
        const url = await getDownloadURL(fileRef);
        return url;
    } catch (error) {
        console.error('Error uploading file: ', error);
    }
};

export const likeComment = async (postId, commentId, userId) => {
    try {
        const postRef = doc(db, 'posts', postId);
        const postSnapshot = await getDoc(postRef);

        if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            const updatedComments = postData.comments.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        likes: [...(comment.likes || []), userId] 
                    };
                }
                return comment;
            });

            await updateDoc(postRef, { comments: updatedComments });
        } else {
            console.error('No post document found.');
        }
    } catch (error) {
        console.error('Error liking comment: ', error);
    }
};


export const unlikeComment = async (postId, commentId, userId) => {
    try {
        const postRef = doc(db, 'posts', postId);
        const postSnapshot = await getDoc(postRef);

        if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            const updatedComments = postData.comments.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        likes: (comment.likes || []).filter(id => id !== userId) 
                    };
                }
                return comment;
            });

            await updateDoc(postRef, { comments: updatedComments });
        } else {
            console.error('No post document found.');
        }
    } catch (error) {
        console.error('Error unliking comment: ', error);
    }
};


export const addReply = async (postId, commentId, userId, replyText, setCommentText, setActiveReply, setShowReplies) => {
    try {
        const postRef = doc(db, 'posts', postId);
        const postSnapshot = await getDoc(postRef);

        if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            const updatedComments = (postData.comments || []).map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: [
                            ...(comment.replies || []), 
                            {
                                user: userId,
                                text: replyText,
                                createdAt: new Date().toISOString(),
                            }
                        ],
                    };
                }
                return comment;
            });
            setCommentText('');
            setActiveReply(null);
            setShowReplies((prev) => ({
                ...prev,
                [commentId]: true
            }));
            await updateDoc(postRef, { comments: updatedComments });
        } else {
            console.error('No post document found.');
        }
    } catch (error) {
        console.error('Error adding reply: ', error);
    }
};



export const deleteComment = async (postId, commentId, comments) => {
    const currentUserId = FIREBASE_AUTH.currentUser.uid;
    const comment = comments.find(c => c.id === commentId);
    const isAdmin = await checkIfUserIsAdmin();

    if (comment && (comment.user === currentUserId || isAdmin)) {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const postRef = doc(db, 'posts', postId);
                            const postSnapshot = await getDoc(postRef);

                            if (postSnapshot.exists()) {
                                const postData = postSnapshot.data();
                                const updatedComments = (postData.comments || []).filter(c => c.id !== commentId);

                                await updateDoc(postRef, {
                                    comments: updatedComments
                                });
                                console.log('Comment deleted successfully.');
                            } else {
                                console.error('No post document found.');
                            }
                        } catch (error) {
                            console.error('Error deleting comment: ', error);
                        }
                    }
                }
            ]
        );
    } else {
        console.error('Comment not found or user is not authorized.');
    }
};
export const deleteReply = async (postId, commentId, createdAt, comments) => {
    const currentUserId = FIREBASE_AUTH.currentUser.uid;
    const isAdmin = await checkIfUserIsAdmin(); 

    try {
        const postRef = doc(db, 'posts', postId);
        const postSnapshot = await getDoc(postRef);

        if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            const updatedComments = (postData.comments || []).map(comment => {
                if (comment.id === commentId) {
                    const updatedReplies = (comment.replies || []).filter(reply => {
                        return reply.createdAt !== createdAt || (reply.user !== currentUserId && !isAdmin);
                    });

                    if (comment.replies.some(reply => reply.createdAt === createdAt && (reply.user === currentUserId || isAdmin))) {
                        Alert.alert(
                            'Delete Reply',
                            'Are you sure you want to delete this reply?',
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel'
                                },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        try {
                                            await updateDoc(postRef, { comments: updatedComments });
                                            console.log('Reply deleted successfully.');
                                        } catch (error) {
                                            console.error('Error deleting reply: ', error);
                                        }
                                    }
                                }
                            ]
                        );
                    }

                    return {
                        ...comment,
                        replies: updatedReplies
                    };
                }
                return comment;
            });
        } else {
            console.error('No post document found.');
        }
    } catch (error) {
        console.error('Error deleting reply: ', error);
    }
};

export const handleLikeComment = async (postId, commentId, userLikes) => {
    try {
        const currentUserId = FIREBASE_AUTH.currentUser.uid;
        if (userLikes.has(commentId)) {
            await unlikeComment(postId, commentId, currentUserId);
            userLikes.delete(commentId);
        } else {
            await likeComment(postId, commentId, currentUserId);
            userLikes.add(commentId);
        }
    } catch (error) {
        console.error('Error liking/unliking comment: ', error);
    }
};


export const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);

    const day = date.getDate(); 
    const month = date.getMonth() + 1; 
    let hours = date.getHours(); 
    const minutes = date.getMinutes(); 

    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; 

    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${day}/${month} ${hours}:${formattedMinutes} ${period}`;
};

export const getCommentAndReplyCounts = (comments) => {
    let commentCount = 0;
    let replyCount = 0;

    comments.forEach(comment => {
        commentCount++; 
        if (Array.isArray(comment.replies)) {
            replyCount += comment.replies.length; 
        }
    });
    return (commentCount + replyCount)

};