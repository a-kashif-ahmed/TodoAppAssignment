import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import api from '../api/api';
import TaskForm, { TaskFormValues } from '../components/TaskForm';

type Props = NativeStackScreenProps<RootStackParamList, 'EditTask'>;

const EditTaskScreen = ({ route, navigation }: Props) => {
  const { task } = route.params;
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: TaskFormValues) => {
    if (values.deadline.getTime() < values.dateTime.getTime()) {
      Alert.alert('Invalid deadline', 'Deadline should not be before the scheduled date-time.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/tasks/${task._id}`, {
        title: values.title,
        description: values.description,
        dateTime: values.dateTime.toISOString(),
        deadline: values.deadline.toISOString(),
        priority: values.priority,
        category: values.category,
      });
      navigation.goBack();
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Could not update task.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TaskForm
        submitLabel="Save Changes"
        loading={loading}
        onSubmit={handleSubmit}
        initialValues={{
          title: task.title,
          description: task.description,
          dateTime: new Date(task.dateTime),
          deadline: new Date(task.deadline),
          priority: task.priority,
          category: task.category,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});

export default EditTaskScreen;
