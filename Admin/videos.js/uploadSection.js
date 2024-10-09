import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { storage, db } from '../../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import * as Progress from 'react-native-progress';
import { useTheme } from '../../components/elements/theme-provider';
import colors from '../../constants/colors';
import CustomText from '../../components/elements/text';

const UploadSectionVideo = () => {
    const [videoUri, setVideoUri] = useState(null);
    const [posterUri, setPosterUri] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [summary, setSummary] = useState('');
    const [questions, setQuestions] = useState(''); // State for questions
    const [mainPoints, setMainPoints] = useState(''); // State for main points
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { theme } = useTheme()
    const currentColors = colors[theme]
    const pickVideo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['video/mp4', 'video/x-m4v', 'video/quicktime'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setVideoUri(asset.uri);
            }
        } catch (error) {
            console.error('Error picking video:', error);
        }
    };

    const pickPoster = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                setPosterUri(null);
                return;
            }

            if (result.assets && result.assets.length > 0) {
                const posterUri = result.assets[0].uri;
                setPosterUri(posterUri);
            }
        } catch (error) {
            console.error('Error picking poster image:', error);
            setPosterUri(null);
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
            const storageRef = ref(storage, `sections/${title}.mp4`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            });

            await uploadTask;
            const downloadURL = await getDownloadURL(storageRef);

            let posterDownloadURL = '';
            if (posterUri) {
                const posterResponse = await fetch(posterUri);
                const posterBlob = await posterResponse.blob();
                const posterRef = ref(storage, `posters/${title}.jpg`);
                const posterUploadTask = await uploadBytesResumable(posterRef, posterBlob);
                posterDownloadURL = await getDownloadURL(posterRef);
            }

            // Save the metadata to Firestore, including questions and main points
            const docRef = await addDoc(collection(db, 'sections'), {
                title,
                questions: questions.split('\n'), // Split by line for multiple questions
                mainPoints: mainPoints.split('\n'), // Split by line for multiple main points
                poster: posterDownloadURL,
                videoUrl: downloadURL,
                createdAt: new Date(),
            });

            await updateDoc(docRef, { id: docRef.id });

            // Clear inputs
            setVideoUri(null);
            setPosterUri(null);
            setTitle('');
            setDescription('');
            setSummary('');
            setQuestions(''); // Clear questions
            setMainPoints(''); // Clear main points
            setProgress(0);
        } catch (error) {
            console.error('Upload Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container,{backgroundColor:currentColors.background}]}>
            <CustomText style={styles.title}>Upload Section Video</CustomText>
            <TextInput
                style={styles.input}
                placeholder="Video Title"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Questions (one per line)"
                value={questions}
                multiline
                onChangeText={setQuestions}
            />
            <TextInput
                style={styles.input}
                placeholder="Main Points (one per line)"
                value={mainPoints}
                multiline
                onChangeText={setMainPoints}
            />
            <TouchableOpacity style={styles.button} onPress={pickVideo}>
                <Text style={styles.buttonText}>Pick a Video</Text>
            </TouchableOpacity>
            {videoUri && <Text style={styles.videoUri}>Selected Video: {videoUri}</Text>}

            <TouchableOpacity style={styles.button} onPress={pickPoster}>
                <Text style={styles.buttonText}>Pick a Poster</Text>
            </TouchableOpacity>
            {posterUri && <Text style={styles.videoUri}>Selected Poster: {posterUri}</Text>}

            {loading ? (
                <>
                    <Progress.Bar progress={progress / 100} width={250} style={{alignSelf:"center",justifyContent:'center'}} />
                    <CustomText style={styles.progressText}>{Math.round(progress)}% Uploaded</CustomText>
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
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    input: {
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
        borderRadius: 10,
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

export default UploadSectionVideo;
