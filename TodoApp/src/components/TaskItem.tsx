import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Trash2, Tag, Clock, AlertTriangle } from 'lucide-react-native';
import { Task } from '../types';
import PriorityBadge from './PriorityBadge';

interface Props {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPress: (task: Task) => void;
}

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isOverdue = (deadline: string, completed: boolean) =>
  !completed && new Date(deadline).getTime() < Date.now();

const TaskItem = ({ task, onToggle, onDelete, onPress }: Props) => {
  const overdue = isOverdue(task.deadline, task.completed);

  return (
    <TouchableOpacity
      style={[styles.card, task.completed && styles.cardCompleted]}
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <TouchableOpacity style={styles.checkbox} onPress={() => onToggle(task)}>
        <View style={[styles.checkboxInner, task.completed && styles.checkboxChecked]}>
          {task.completed && <Check size={14} color="#fff" strokeWidth={3} />}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, task.completed && styles.titleCompleted]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <PriorityBadge priority={task.priority} />
        </View>

        {!!task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <Tag size={12} color="#321E48" />
            <Text style={styles.category}>{task.category}</Text>
          </View>
          <View style={styles.footerItem}>
            {overdue ? (
              <AlertTriangle size={12} color="#DC2626" />
            ) : (
              <Clock size={12} color="#6B7280" />
            )}
            <Text style={[styles.deadline, overdue && styles.overdue]}>
              {overdue ? 'Overdue: ' : ''}
              {formatDate(task.deadline)}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(task)}>
        <Trash2 size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'flex-start',
  },
  cardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#321E48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#321E48',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: 12,
    color: '#321E48',
    fontWeight: '600',
  },
  deadline: {
    fontSize: 12,
    color: '#6B7280',
  },
  overdue: {
    color: '#DC2626',
    fontWeight: '700',
  },
  deleteBtn: {
    marginLeft: 8,
    padding: 4,
  },
});

export default TaskItem;
