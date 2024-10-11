import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import moment from 'moment';
import { ToastAndroid } from 'react-native';

export const downloadImage = async (imageUrl) => {
    let date = moment().format('YYYYMMDDhhmmss');
    let fileUri = FileSystem.documentDirectory + `${date}.jpg`;

    try {
        const res = await FileSystem.downloadAsync(imageUrl, fileUri);
        await saveFile(res.uri);
    } catch (err) {
        console.error("File System Error: ", err);
    }
};

const saveFile = async (fileUri) => {
    try {
        const { status } = await MediaLibrary.getPermissionsAsync(); 
        if (status === "granted") {
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            const album = await MediaLibrary.getAlbumAsync('Download');
            if (album == null) {
                await MediaLibrary.createAlbumAsync('Download', asset, false);
            } else {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            }
            ToastAndroid.show('Image saved to gallery.', ToastAndroid.SHORT);
        } else {
            console.log('test');
            
        }
    } catch (err) {
    }
};
