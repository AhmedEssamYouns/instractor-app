// PostList.js
import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator } from 'react-native';
import PostItem from './post_item';

const PostList = ({ posts, onEdit, header }) => {


    return (
        <View style={styles.list}>
            <FlatList
                ListHeaderComponent={header}
                data={posts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostItem post={item} onEdit={onEdit} />
                )}
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
