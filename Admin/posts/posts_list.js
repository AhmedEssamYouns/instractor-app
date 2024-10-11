import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator } from 'react-native';
import PostItem from './post_item';
import CustomText from '../elements/text';
import { useLanguage } from '../elements/language-provider';
import { useTheme } from '../elements/theme-provider';
import colors from '../../constants/colors';

const PostList = ({ posts, onEdit, header }) => {
    const { language, translations } = useLanguage(); 
    const { theme } = useTheme(); 
    const currentColors = colors[theme];

    return (
        <View style={styles.list}>
            <FlatList
                ListHeaderComponent={header}
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostItem post={item} onEdit={onEdit} />
                )}
                ListFooterComponent={
                    <View style={{ backgroundColor: currentColors.background,padding:20,alignItems:'center' }}>
                        <CustomText>{translations.noMorePosts}</CustomText>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});

export default PostList;
