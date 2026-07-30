import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import api from '../api/api';
import TaskForm, { TaskFormValues } from '../components/TaskForm';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;

const AddTaskScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: TaskFormValues) => {
    if (values.deadline.getTime() < values.dateTime.getTime()) {
      Alert.alert('Invalid deadline', 'Deadline should not be before the scheduled date-time.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/tasks', {
        title: values.title,
        description: values.description,
        dateTime: values.dateTime.toISOString(),
        deadline: values.deadline.toISOString(),
        priority: values.priority,
        category: values.category,
      });
      navigation.goBack();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Could not create task.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TaskForm submitLabel="Add Task" loading={loading} onSubmit={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});

export default AddTaskScreen;
