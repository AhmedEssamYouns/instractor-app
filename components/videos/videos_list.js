import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import VideoCard from './video_card';
import { useTheme } from '../elements/theme-provider';
import colors from '../../constants/colors';
import CustomText from '../elements/text';
import { useLanguage } from '../elements/language-provider';

const VideoList = ({ videos, header }) => {
    const { theme } = useTheme(); 
    const currentColors = colors[theme]; 
    const { language, translations } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: currentColors.background }]}>
            <FlatList
                ListHeaderComponent={header}
                data={videos}
                renderItem={({ item ,index}) => <VideoCard video={item} index={index} />}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <CustomText>
                        {translations.noData}
                      </CustomText>
                    </View>
                  }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
});

export default VideoList;
