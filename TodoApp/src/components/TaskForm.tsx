import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import { Priority } from '../types';

export interface TaskFormValues {
  title: string;
  description: string;
  dateTime: Date;
  deadline: Date;
  priority: Priority;
  category: string;
}

interface Props {
  initialValues?: Partial<TaskFormValues>;
  submitLabel: string;
  loading: boolean;
  onSubmit: (values: TaskFormValues) => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

const TaskForm = ({ initialValues, submitLabel, loading, onSubmit }: Props) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [dateTime, setDateTime] = useState(initialValues?.dateTime || new Date());
  const [deadline, setDeadline] = useState(
    initialValues?.deadline || new Date(Date.now() + 60 * 60 * 1000)
  );
  const [priority, setPriority] = useState<Priority>(initialValues?.priority || 'medium');
  const [category, setCategory] = useState(initialValues?.category || 'General');

  const [showDatePicker, setShowDatePicker] = useState<'dateTime' | 'deadline' | null>(null);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
const [currentField, setCurrentField] = useState<"dateTime" | "deadline" | null>(null);
const [showPicker, setShowPicker] = useState(false);


const openPicker = (field: 'dateTime' | 'deadline') => {
  setCurrentField(field);
  setPickerMode('date'); // always start with date, even on iOS
  setShowPicker(true);
};

const getCurrentValue = () =>
  currentField === 'dateTime' ? dateTime : deadline;

const setCurrentValue = (date: Date) => {
  if (currentField === 'dateTime') setDateTime(date);
  else if (currentField === 'deadline') setDeadline(date);
};

const handleChange = (event: any, selected?: Date) => {
  // Android dialog closes itself after each step; iOS spinner stays open
  if (Platform.OS === 'android') setShowPicker(false);

  if (event.type === 'dismissed' || !selected) {
    setShowPicker(false);
    setCurrentField(null);
    return;
  }

  if (Platform.OS === 'ios') {
    // iOS "datetime" mode returns a full date+time in one shot
    setCurrentValue(selected);
    return;
  }

  // Android: two-step — merge date pick + time pick
  if (pickerMode === 'date') {
    const prev = getCurrentValue();
    const merged = new Date(selected);
    merged.setHours(prev.getHours(), prev.getMinutes());
    setCurrentValue(merged);
    setPickerMode('time');
    setShowPicker(true); // immediately open time picker
  } else {
    const prev = getCurrentValue();
    const merged = new Date(prev);
    merged.setHours(selected.getHours(), selected.getMinutes());
    setCurrentValue(merged);
    setCurrentField(null);
  }
};

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), dateTime, deadline, priority, category: category.trim() || 'General' });
  };

  const formatDisplay = (date: Date) =>
    date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Finish project report"
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Add more detail (optional)"
        placeholderTextColor="#9CA3AF"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Scheduled Date & Time *</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => openPicker('dateTime')}>
  <Calendar size={16} color="#111827" />
  <Text style={styles.dateButtonText}>{formatDisplay(dateTime)}</Text>
</TouchableOpacity>

      <Text style={styles.label}>Deadline *</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => openPicker('deadline')}>
  <Clock size={16} color="#111827" />
  <Text style={styles.dateButtonText}>{formatDisplay(deadline)}</Text>
</TouchableOpacity>

      {showPicker && currentField && (
  <DateTimePicker
    value={getCurrentValue()}
    mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    onChange={handleChange}
  />
)}

      <Text style={styles.label}>Priority *</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.priorityChip,
              priority === p && {
                backgroundColor: priorityColor[p],
                borderColor: priorityColor[p],
              },
            ]}
            onPress={() => setPriority(p)}
          >
            <Text
              style={[styles.priorityText, priority === p && styles.priorityTextActive]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Work, Personal, Errands"
        placeholderTextColor="#9CA3AF"
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity
        style={[styles.submitButton, !title.trim() && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading || !title.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const priorityColor: Record<Priority, string> = {
  low: '#15803D',
  medium: '#1f66ff',
  high: '#B91C1C',
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
  },
  dateButtonText: { fontSize: 15, color: '#111827', fontWeight: '600' },
  priorityRow: { flexDirection: 'row', gap: 10 },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginRight: 8,
  },
  priorityText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  priorityTextActive: { color: '#fff' },
  submitButton: {
    backgroundColor: '#321E48',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 32,
  },
  submitDisabled: { backgroundColor: '#C4B5FD' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default TaskForm;
