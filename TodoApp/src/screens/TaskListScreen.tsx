import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { LogOut, Plus, ClipboardList } from 'lucide-react-native';
import { RootStackParamList, Task } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import TaskItem from '../components/TaskItem';
import { smartSortTasks, filterByCategory, getUniqueCategories } from '../utils/taskSort';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

type StatusFilter = 'all' | 'pending' | 'completed';

const TaskListScreen = ({ navigation }: Props) => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks', { params: { sort: 'smart' } });
      setTasks(response.data.tasks);
    } catch (err: any) {
      Alert.alert('Error', 'Could not load tasks. Pull down to retry.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleToggle = async (task: Task) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await api.patch(`/tasks/${task._id}/toggle`);
    } catch {
      fetchTasks(); // revert on failure
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Delete task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setTasks((prev) => prev.filter((t) => t._id !== task._id));
          try {
            await api.delete(`/tasks/${task._id}`);
          } catch {
            fetchTasks();
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  let visibleTasks = tasks;
  if (statusFilter === 'pending') visibleTasks = visibleTasks.filter((t) => !t.completed);
  if (statusFilter === 'completed') visibleTasks = visibleTasks.filter((t) => t.completed);
  visibleTasks = filterByCategory(visibleTasks, categoryFilter);
  visibleTasks = smartSortTasks(visibleTasks);

  const categories = getUniqueCategories(tasks);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.headerTitle}>My Tasks</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'pending', 'completed'] as StatusFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {categories.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRow}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.categoryChip, categoryFilter === c && styles.categoryChipActive]}
              onPress={() => setCategoryFilter(c)}
            >
              <Text
                style={[
                  styles.categoryText,
                  categoryFilter === c && styles.categoryTextActive,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onPress={(task) => navigation.navigate('EditTask', { task })}
          />
        )}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ClipboardList size={48} color="#C4B5FD" />
            <Text style={styles.emptyText}>No tasks here yet.</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first task.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask')}>
        <Plus size={28} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3FF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 12,
  },
  greeting: { fontSize: 13, color: '#321E48', fontWeight: '600' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1F2937' },
  logoutBtn: { padding: 8 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#321E48' },
  filterText: { fontSize: 13, color: '#321E48', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  categoryRow: { marginBottom: 8, maxHeight: 40 },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    height: 32,
  },
  categoryChipActive: { backgroundColor: '#321E48', borderColor: '#321E48' },
  categoryText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  categoryTextActive: { color: '#fff' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySubtext: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#321E48',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});

export default TaskListScreen;
