import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { storage, db } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import * as Progress from 'react-native-progress';

const UploadLectureVideo = () => {
    const [videoUri, setVideoUri] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['video/mp4', 'video/x-m4v', 'video/quicktime'],
                copyToCacheDirectory: true,
            });

            console.log('Document Picker Result:', result);

            if (result.canceled) {
                console.log('Document selection was canceled.');
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setVideoUri(asset.uri);
                console.log('Selected video URI:', asset.uri);
            } else {
                console.log('No valid asset found in the document picker result:', result);
            }
        } catch (error) {
            console.error('Error picking video:', error);
        }
    };

    const uploadVideo = async () => {
        if (!videoUri || !title) {
            console.error('Error: Please select a video and enter a title.');
            return;
        }

        setLoading(true);
        setProgress(0);

        try {
            const response = await fetch(videoUri);
            if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);

            const blob = await response.blob();
            const storageRef = ref(storage, `lectures/${title}.mp4`);

            // Create a reference to the file to upload
            const uploadTask = uploadBytesResumable(storageRef, blob);

            // Monitor the upload progress
            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            });

            await uploadTask;

            const downloadURL = await getDownloadURL(storageRef);

            // Save the metadata to Firestore
            await addDoc(collection(db, 'lectures'), {
                title,
                description,
                videoUrl: downloadURL,
                createdAt: new Date(),
            });

            console.log('Video uploaded successfully!');
            setVideoUri(null);
            setTitle('');
            setDescription('');
            setProgress(0); // Reset progress
        } catch (error) {
            console.error('Upload Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Upload Lecture Video</Text>
            <TextInput
                style={styles.input}
                placeholder="Video Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Video Description"
                value={description}
                onChangeText={setDescription}
            />
            <TouchableOpacity style={styles.button} onPress={pickVideo}>
                <Text style={styles.buttonText}>Pick a Video</Text>
            </TouchableOpacity>
            {videoUri && <Text style={styles.videoUri}>Selected Video: {videoUri}</Text>}
            {loading ? (
                <>
                    <Progress.Bar progress={progress / 100} width={300} />
                    <Text style={styles.progressText}>{Math.round(progress)}% Uploaded</Text>
                </>
            ) : (
                <TouchableOpacity style={styles.button} onPress={uploadVideo}>
                    <Text style={styles.buttonText}>Upload Video</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    input: {
        height: 50,
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingLeft: 10,
        backgroundColor: '#fff',
    },
    videoUri: {
        marginVertical: 10,
        color: 'blue',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    progressText: {
        marginTop: 10,
        textAlign: 'center',
    },
});

export default UploadLectureVideo;
