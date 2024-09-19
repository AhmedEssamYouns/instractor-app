// screens/HomeScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TeacherQuizCreation from '../components/quiz/create_quiz';
import StudentQuizList from '../components/quiz/quiz_list';

export default function ArticleScreen() {
  return (
    <View style={styles.container}>
      <StudentQuizList/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
