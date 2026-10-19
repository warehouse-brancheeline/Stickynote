export type NoteCategory = 'Kerja' | 'Pribadi' | 'Penting' | 'Ide' | 'Harian' | 'Tugas';

export type NoteColor = 'default' | 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'cyan';

export type AlarmTone = 'windows-chime' | 'digital-beep' | 'radar' | 'gentle-bell' | 'marimba';

export type AlarmRepeat = 'none' | 'daily' | 'weekdays' | 'weekly';

export type AlarmStatus = 'active' | 'dismissed' | 'snoozed';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Checklist
  hasChecklist: boolean;
  checklist: ChecklistItem[];
  // Alarm & Reminder
  hasAlarm: boolean;
  alarmDate: string; // YYYY-MM-DD
  alarmTime: string; // HH:mm
  alarmTone: AlarmTone;
  alarmRepeat: AlarmRepeat;
  alarmStatus: AlarmStatus;
  snoozeUntil?: string; // ISO string
  tags: string[];
}

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultAlarmTone: AlarmTone;
  alarmVolume: number; // 0 to 1
  desktopNotificationsEnabled: boolean;
  showWindowsWindowFrame: boolean;
  soundEnabled: boolean;
}

export type ViewTab = 'notes' | 'reminders' | 'checklists' | 'calendar' | 'archive' | 'settings';
