import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';


import { FontAwesome, Entypo, MaterialIcons } from '@expo/vector-icons';
import { addPost, pickDocument, pickImage, updatePost, uploadFile } from '../../firebase/posts';
import CustomText from '../elements/text';

const PostForm = ({ post, onSave, onClose }) => {
    const [title, setTitle] = useState(post ? post.title : '');
    const [content, setContent] = useState(post ? post.content : '');
    const [imageUri, setImageUri] = useState(post ? post.image : '');
    const [documentUri, setDocumentUri] = useState(post ? post.document : '');
    const [documentName, setDocumentName] = useState(post ? post.documentName : '');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            setImageUri(post.image || '');
            setDocumentUri(post.document || '');
            setDocumentName(post.documentName || '');
        }
    }, [post]);

    const handleSave = async () => {
        setLoading(true);
        try {
            let imageUrl = imageUri;
            let documentUrl = documentUri;

            if (imageUri) {
                const imageName = imageUri.split('/').pop();
                imageUrl = await uploadFile(imageUri, imageName);
            }

            if (documentUri) {
                const documentName = documentUri.split('/').pop();
                documentUrl = await uploadFile(documentUri, documentName);
            }

            if (post) {
                await updatePost(post.id, { title, content, image: imageUrl, document: documentUrl, documentName });
            } else {
                await addPost({ title, content, image: imageUrl, document: documentUrl, documentName });
            }
            onSave();
        } catch (error) {
            console.error('Error saving post: ', error);
        } finally {
            setLoading(false);
        }
    };


    const cancelSelection = (type) => {
        if (type === 'image') {
            setImageUri('');
        } else if (type === 'document') {
            setDocumentUri('');
            setDocumentName(''); // Clear document name when document is canceled
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <FontAwesome name="close" size={24} color="#000" />
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Content"
                value={content}
                onChangeText={setContent}
                multiline
            />
            <View style={styles.selectionContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(setImageUri)}>
                    <Entypo name="image" size={24} color="#007bff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={()=>pickDocument(setDocumentUri,setDocumentName)}>
                    <MaterialIcons name="attach-file" size={24} color="#007bff" />
                </TouchableOpacity>
            </View>
            {(imageUri || documentUri) &&
                <View style={styles.selectedItemsContainer}>
                    {imageUri ? (
                        <View style={styles.selectedItem}>
                            <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                            <TouchableOpacity style={styles.cancelButton} onPress={() => cancelSelection('image')}>
                                <CustomText style={{ fontSize: 10 }}>cancel</CustomText>
                                <FontAwesome name="close" size={15} color="black" />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    {documentUri ? (
                        <View style={styles.selectedItem}>
                            <Text style={styles.selectedDocumentText}>
                                {documentName || 'Document Selected'}
                            </Text>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => cancelSelection('document')}>
                                <CustomText style={{ fontSize: 10 }}>cancel</CustomText>
                                <FontAwesome name="close" size={15} color="black" />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            }
            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="black" />
                ) : (
                    <Text style={styles.buttonText}>{post ? 'Update Post' : 'Add Post'}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 16,
        padding: 10,
        backgroundColor: '#eee',
        borderRadius: 8,
        elevation: 4,
    },
    closeButton: {
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    input: {
        height: 40,
        elevation: 1,
        backgroundColor: 'white',
        marginBottom: 16,
        paddingHorizontal: 8,
        borderRadius: 14,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectionContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    iconButton: {
        padding: 10
    },
    selectedItemsContainer: {
        flexDirection: 'row',
        gap: 15,
        marginVertical: 8,
    },
    selectedItem: {
        position: 'relative',
    },
    selectedImage: {
        width: 70,
        height: 50,
        borderRadius: 8,
    },
    selectedDocumentText: {
        backgroundColor: '#ddd',
        padding: 5,
        borderRadius: 10,
        height: 50,
        width: 70,
        fontSize: 10,
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
    },
    cancelButton: {
        alignItems: 'center',
        alignSelf: 'center',
        gap: 5,
        paddingHorizontal: 10,
        marginVertical: 10,
        backgroundColor: '#ddd',
        flexDirection: 'row',
        borderRadius: 50,
    },
});

export default PostForm;
