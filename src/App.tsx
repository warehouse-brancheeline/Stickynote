import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Bell, 
  CheckSquare, 
  Plus, 
  Search, 
  Grid, 
  List as ListIcon, 
  Filter, 
  Archive, 
  RotateCcw, 
  Trash2,
  SlidersHorizontal,
  Clock,
  Sparkles
} from 'lucide-react';
import { AlarmTone, AppSettings, Note, NoteCategory, ViewTab } from './types';
import { DEFAULT_SETTINGS, INITIAL_SAMPLE_NOTES, loadNotes, loadSettings, saveNotes, saveSettings } from './utils/storage';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { AlarmRingingModal } from './components/AlarmRingingModal';
import { ReminderView } from './components/ReminderView';
import { ChecklistView } from './components/ChecklistView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { Taskbar } from './components/Taskbar';
import { InstallGuideModal } from './components/InstallGuideModal';
import { DesktopWidgetView } from './components/DesktopWidgetView';
import { usePWAInstall } from './hooks/usePWAInstall';
import { isAlarmRinging, startAlarmLoop, stopAlarmLoop } from './utils/audioSynthesizer';
import { showDesktopNotification } from './utils/notification';
import { getCurrentTimeString, getTodayDateString } from './utils/dateUtils';

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [currentTab, setCurrentTab] = useState<ViewTab>('notes');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // PWA Install hook
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isWidgetMode, setIsWidgetMode] = useState(false);

  // Modal states
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [ringingNote, setRingingNote] = useState<Note | null>(null);

  // Window simulation states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);

  // Persist notes
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Keyboard shortcuts (Ctrl+N, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewNote();
      } else if (e.key === 'Escape') {
        if (isEditorOpen) setIsEditorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen]);

  // ALARM SCHEDULER ENGINE (Checks every 2 seconds)
  useEffect(() => {
    const checkAlarms = () => {
      if (isAlarmRinging() || ringingNote) {
        return; // Already ringing an alarm
      }

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();

      for (const note of notes) {
        if (note.isDeleted || note.isArchived || !note.hasAlarm) continue;
        if (note.alarmStatus !== 'active' && note.alarmStatus !== 'snoozed') continue;

        let isTargetDue = false;

        if (note.alarmStatus === 'snoozed' && note.snoozeUntil) {
          const snoozeDate = new Date(note.snoozeUntil);
          if (now.getTime() >= snoozeDate.getTime()) {
            isTargetDue = true;
          }
        } else if (note.alarmStatus === 'active' && note.alarmDate && note.alarmTime) {
          const [alarmY, alarmM, alarmD] = note.alarmDate.split('-').map(Number);
          const [alarmH, alarmMin] = note.alarmTime.split(':').map(Number);

          const alarmTimestamp = new Date(alarmY, alarmM - 1, alarmD, alarmH, alarmMin, 0).getTime();
          const currentTimestamp = now.getTime();

          // If within current minute window (within 60s) or slightly overdue
          const diffSeconds = (currentTimestamp - alarmTimestamp) / 1000;
          if (diffSeconds >= 0 && diffSeconds < 90) {
            isTargetDue = true;
          }
        }

        if (isTargetDue) {
          // Trigger Alarm!
          setRingingNote(note);
          if (settings.soundEnabled) {
            startAlarmLoop(note.alarmTone || settings.defaultAlarmTone, settings.alarmVolume);
          }
          if (settings.desktopNotificationsEnabled) {
            showDesktopNotification(
              `Alarm: ${note.title}`,
              note.content || 'Waktu alarm pengingat Anda telah tiba!',
              () => {
                setRingingNote(note);
                setIsWindowMinimized(false);
              }
            );
          }
          break;
        }
      }
    };

    const intervalId = setInterval(checkAlarms, 2000);
    return () => clearInterval(intervalId);
  }, [notes, settings, ringingNote]);

  // Dismiss Alarm
  const handleDismissAlarm = useCallback((noteId: string) => {
    stopAlarmLoop();
    setRingingNote(null);
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;

        // If recurring alarm
        if (n.alarmRepeat === 'daily') {
          const nextDay = new Date();
          nextDay.setDate(nextDay.getDate() + 1);
          const y = nextDay.getFullYear();
          const m = String(nextDay.getMonth() + 1).padStart(2, '0');
          const d = String(nextDay.getDate()).padStart(2, '0');
          return {
            ...n,
            alarmDate: `${y}-${m}-${d}`,
            alarmStatus: 'active',
            snoozeUntil: undefined,
          };
        }

        return {
          ...n,
          alarmStatus: 'dismissed',
          snoozeUntil: undefined,
        };
      })
    );
  }, []);

  // Snooze Alarm
  const handleSnoozeAlarm = useCallback((noteId: string, minutes: number) => {
    stopAlarmLoop();
    setRingingNote(null);
    const snoozeTarget = new Date(Date.now() + minutes * 60000).toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, alarmStatus: 'snoozed', snoozeUntil: snoozeTarget } : n))
    );
  }, []);

  // Open note from ringing modal
  const handleOpenNoteFromAlarm = (note: Note) => {
    stopAlarmLoop();
    setRingingNote(null);
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  // Note CRUD operations
  const handleOpenNewNote = () => {
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (editingNote) {
      // Update
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...n, ...noteData, updatedAt: new Date().toISOString() }
            : n
        )
      );
    } else {
      // Create new
      const newNote: Note = {
        id: 'note_' + Date.now() + Math.random().toString(36).substring(2, 6),
        title: noteData.title || 'Catatan Baru',
        content: noteData.content || '',
        category: noteData.category || 'Kerja',
        color: noteData.color || 'default',
        isPinned: noteData.isPinned || false,
        isArchived: false,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasChecklist: noteData.hasChecklist || false,
        checklist: noteData.checklist || [],
        hasAlarm: noteData.hasAlarm || false,
        alarmDate: noteData.alarmDate || '',
        alarmTime: noteData.alarmTime || '',
        alarmTone: noteData.alarmTone || settings.defaultAlarmTone,
        alarmRepeat: noteData.alarmRepeat || 'none',
        alarmStatus: noteData.alarmStatus || 'active',
        tags: noteData.tags || [],
      };
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleToggleChecklist = (noteId: string, itemId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        return {
          ...n,
          checklist: n.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleToggleAlarm = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const newStatus = n.alarmStatus === 'active' ? 'dismissed' : 'active';
        return {
          ...n,
          alarmStatus: newStatus,
          hasAlarm: true,
          alarmDate: n.alarmDate || getTodayDateString(),
          alarmTime: n.alarmTime || getCurrentTimeString(30),
        };
      })
    );
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleArchiveNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isArchived: !n.isArchived } : n))
    );
  };

  const handleDuplicateNote = (note: Note) => {
    const duplicated: Note = {
      ...note,
      id: 'note_' + Date.now(),
      title: `${note.title} (Salinan)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [duplicated, ...prev]);
  };

  const handleQuickAddAlarm = (
    title: string,
    date: string,
    time: string,
    tone: AlarmTone
  ) => {
    const newAlarmNote: Note = {
      id: 'alarm_' + Date.now(),
      title,
      content: `Alarm pengingat terjadwal pada ${date} pukul ${time}`,
      category: 'Penting',
      color: 'amber',
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasChecklist: false,
      checklist: [],
      hasAlarm: true,
      alarmDate: date,
      alarmTime: time,
      alarmTone: tone,
      alarmRepeat: 'none',
      alarmStatus: 'active',
      tags: ['Alarm', 'Pengingat'],
    };
    setNotes((prev) => [newAlarmNote, ...prev]);
  };

  const handleAddChecklistItemToNote = (noteId: string, text: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== noteId) return n;
        const newItem = {
          id: 'c_' + Date.now(),
          text,
          completed: false,
        };
        return {
          ...n,
          hasChecklist: true,
          checklist: [...(n.checklist || []), newItem],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Tab archive check
        if (currentTab === 'archive') {
          return note.isArchived && !note.isDeleted;
        }
        if (note.isArchived || note.isDeleted) return false;

        // Category filter
        if (selectedCategory !== 'Semua' && note.category !== selectedCategory) {
          return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = note.title.toLowerCase().includes(q);
          const matchesContent = note.content.toLowerCase().includes(q);
          const matchesTags = note.tags?.some((t) => t.toLowerCase().includes(q));
          const matchesChecklist = note.checklist?.some((c) =>
            c.text.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesContent && !matchesTags && !matchesChecklist) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned notes first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by updated date descending
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, currentTab, selectedCategory, searchQuery]);

  // Statistics
  const activeAlarmsCount = notes.filter(
    (n) => n.hasAlarm && n.alarmStatus === 'active' && !n.isDeleted && !n.isArchived
  ).length;

  let totalChecklistItems = 0;
  let incompleteTasksCount = 0;
  notes.forEach((n) => {
    if (!n.isDeleted && !n.isArchived && n.checklist) {
      n.checklist.forEach((item) => {
        totalChecklistItems++;
        if (!item.completed) incompleteTasksCount++;
      });
    }
  });

  const archivedCount = notes.filter((n) => n.isArchived && !n.isDeleted).length;

  return (
    <div className="w-screen h-screen flex flex-col bg-[#040e21] text-[#E3F2FD] overflow-hidden font-sans">
      {/* WINDOW FRAME CONTAINER */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isWindowMinimized
            ? 'opacity-0 scale-95 pointer-events-none'
            : isFullscreen
            ? 'w-full h-full'
            : 'm-0 sm:m-2 sm:rounded-2xl border border-[#0D47A1] shadow-2xl shadow-[#0D47A1]/25 bg-[#071938]'
        }`}
      >
        {/* Windows Titlebar */}
        <TitleBar
          settings={settings}
          onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
          onNewNote={handleOpenNewNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeAlarmsCount={activeAlarmsCount}
          onOpenReminders={() => setCurrentTab('reminders')}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          isMinimized={isWindowMinimized}
          onToggleMinimize={() => setIsWindowMinimized(!isWindowMinimized)}
          onOpenInstallGuide={() => setIsInstallModalOpen(true)}
          onToggleWidgetMode={() => setIsWidgetMode(!isWidgetMode)}
        />

        {/* Main Application Area (Sidebar + Content View) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Windows Fluent Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onNewNote={handleOpenNewNote}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalNotesCount={notes.filter((n) => !n.isArchived && !n.isDeleted).length}
            activeAlarmsCount={activeAlarmsCount}
            totalChecklistsCount={totalChecklistItems}
            incompleteTasksCount={incompleteTasksCount}
            archivedCount={archivedCount}
            onOpenInstallGuide={() => setIsInstallModalOpen(true)}
            onToggleWidgetMode={() => setIsWidgetMode(!isWidgetMode)}
          />

          {/* VIEW ROUTER */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#071a3a]/80 relative">
            <AnimatePresence mode="wait">
              {/* VIEW 1: All Notes */}
              {currentTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col overflow-hidden p-6 select-none"
                >
                  {/* Content Header & Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D47A1]/60 pb-4 mb-4 shrink-0">
                    <div>
                      <h1 className="text-xl font-bold text-[#E3F2FD] flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#2196F3]" />
                        <span>Semua Catatan & Memo</span>
                      </h1>
                      <p className="text-xs text-[#90CAF9] mt-0.5">
                        Menampilkan {filteredNotes.length} catatan{' '}
                        {selectedCategory !== 'Semua' ? `dalam kategori "${selectedCategory}"` : ''}
                      </p>
                    </div>

                    {/* Layout and Filter controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-[#061733] p-0.5 rounded-lg border border-[#0D47A1]">
                        <button
                          onClick={() => setLayoutMode('grid')}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            layoutMode === 'grid'
                              ? 'bg-[#2196F3] text-white shadow-xs'
                              : 'text-[#90CAF9] hover:text-[#E3F2FD]'
                          }`}
                          title="Tampilan Kisi (Grid)"
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setLayoutMode('list')}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            layoutMode === 'list'
                              ? 'bg-[#2196F3] text-white shadow-xs'
                              : 'text-[#90CAF9] hover:text-[#E3F2FD]'
                          }`}
                          title="Tampilan Daftar (List)"
                        >
                          <ListIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={handleOpenNewNote}
                        className="px-3.5 py-2 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg text-xs font-bold shadow-md shadow-[#2196F3]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Catatan Baru</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes Grid / List */}
                  <div className="flex-1 overflow-y-auto pr-1">
                    {filteredNotes.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                        <FileText className="w-10 h-10 mb-2 text-slate-600" />
                        <p className="font-semibold text-slate-300 text-sm">
                          {searchQuery ? 'Tidak ada catatan yang cocok dengan pencarian.' : 'Belum ada catatan.'}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-1 max-w-sm">
                          Buat catatan baru dengan tombol di atas, atur tanggal dan waktu alarm pengingat, serta sertakan ceklis to-do list.
                        </p>
                      </div>
                    ) : (
                      <div
                        className={
                          layoutMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6'
                            : 'space-y-3 pb-6 max-w-3xl'
                        }
                      >
                        {filteredNotes.map((note) => (
                          <NoteCard
                            key={note.id}
                            note={note}
                            onEdit={handleEditNote}
                            onTogglePin={handleTogglePin}
                            onToggleChecklist={handleToggleChecklist}
                            onToggleAlarm={handleToggleAlarm}
                            onDelete={handleDeleteNote}
                            onArchive={handleArchiveNote}
                            onDuplicate={handleDuplicateNote}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* VIEW: Archive Notes */}
              {currentTab === 'archive' && (
                <motion.div
                  key="archive"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col overflow-hidden p-6 select-none"
                >
                  <div className="border-b border-slate-800 pb-4 mb-4 shrink-0">
                    <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      <Archive className="w-5 h-5 text-slate-400" />
                      <span>Arsip Catatan</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Catatan yang diarsipkan tersimpan di sini dan dapat dipulihkan kapan saja.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1">
                    {filteredNotes.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                        <Archive className="w-10 h-10 mb-2 text-slate-600" />
                        <p className="font-semibold text-slate-300 text-sm">Arsip Kosong</p>
                        <p className="text-slate-500 text-[11px] mt-1">
                          Belum ada catatan yang diarsipkan.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-6">
                        {filteredNotes.map((note) => (
                          <NoteCard
                            key={note.id}
                            note={note}
                            onEdit={handleEditNote}
                            onTogglePin={handleTogglePin}
                            onToggleChecklist={handleToggleChecklist}
                            onToggleAlarm={handleToggleAlarm}
                            onDelete={handleDeleteNote}
                            onArchive={handleArchiveNote}
                            onDuplicate={handleDuplicateNote}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* VIEW 2: Reminders & Alarm View */}
              {currentTab === 'reminders' && (
                <motion.div
                  key="reminders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <ReminderView
                    notes={notes}
                    onEditNote={handleEditNote}
                    onToggleAlarm={handleToggleAlarm}
                    onDeleteNote={handleDeleteNote}
                    onQuickAddAlarm={handleQuickAddAlarm}
                    alarmVolume={settings.alarmVolume}
                  />
                </motion.div>
              )}

              {/* VIEW 3: Checklist View */}
              {currentTab === 'checklists' && (
                <motion.div
                  key="checklists"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <ChecklistView
                    notes={notes}
                    onToggleChecklist={handleToggleChecklist}
                    onEditNote={handleEditNote}
                    onNewChecklistNote={() => {
                      setEditingNote({
                        id: '',
                        title: 'Daftar Tugas Baru',
                        content: '',
                        category: 'Tugas',
                        color: 'emerald',
                        isPinned: false,
                        isArchived: false,
                        isDeleted: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        hasChecklist: true,
                        checklist: [
                          { id: 'c_' + Date.now(), text: 'Tugas pertama', completed: false },
                        ],
                        hasAlarm: false,
                        alarmDate: '',
                        alarmTime: '',
                        alarmTone: 'windows-chime',
                        alarmRepeat: 'none',
                        alarmStatus: 'dismissed',
                        tags: ['Tugas', 'Ceklis'],
                      });
                      setIsEditorOpen(true);
                    }}
                    onAddChecklistItem={handleAddChecklistItemToNote}
                  />
                </motion.div>
              )}

              {/* VIEW 4: Calendar View */}
              {currentTab === 'calendar' && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <CalendarView
                    notes={notes}
                    onSelectDateToCreate={(date) => {
                      setEditingNote({
                        id: '',
                        title: 'Jadwal Baru',
                        content: '',
                        category: 'Kerja',
                        color: 'purple',
                        isPinned: false,
                        isArchived: false,
                        isDeleted: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        hasChecklist: false,
                        checklist: [],
                        hasAlarm: true,
                        alarmDate: date,
                        alarmTime: '09:00',
                        alarmTone: 'windows-chime',
                        alarmRepeat: 'none',
                        alarmStatus: 'active',
                        tags: ['Jadwal'],
                      });
                      setIsEditorOpen(true);
                    }}
                    onEditNote={handleEditNote}
                  />
                </motion.div>
              )}

              {/* VIEW 5: Settings & Audio */}
              {currentTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <SettingsView
                    settings={settings}
                    onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
                    notes={notes}
                    onImportNotes={(imported) => setNotes(imported)}
                    onResetSampleNotes={() => setNotes(INITIAL_SAMPLE_NOTES)}
                    onClearAllNotes={() => setNotes([])}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* MINIMIZED WIDGET / RESTORE BUTTON (When window minimized) */}
      {isWindowMinimized && (
        <div className="fixed top-6 right-6 z-40 animate-in fade-in zoom-in-95">
          <button
            onClick={() => setIsWindowMinimized(false)}
            className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-700 hover:border-blue-500 rounded-xl shadow-2xl text-slate-100 cursor-pointer transition-all"
          >
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-100">WinMemo Diminimalkan</div>
              <div className="text-[11px] text-slate-400">
                {activeAlarmsCount > 0 ? `${activeAlarmsCount} alarm tetap aktif berdering` : 'Klik untuk membuka'}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Windows 11 Taskbar */}
      <Taskbar
        activeAlarmsCount={activeAlarmsCount}
        onOpenReminders={() => {
          setIsWindowMinimized(false);
          setCurrentTab('reminders');
        }}
        onNewNote={() => {
          setIsWindowMinimized(false);
          handleOpenNewNote();
        }}
        onOpenChecklists={() => {
          setIsWindowMinimized(false);
          setCurrentTab('checklists');
        }}
        onToggleWindow={() => setIsWindowMinimized(!isWindowMinimized)}
        isWindowMinimized={isWindowMinimized}
      />

      {/* MODAL 1: Note & Alarm Editor Dialog */}
      <NoteEditorModal
        note={editingNote}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        alarmVolume={settings.alarmVolume}
      />

      {/* MODAL 2: Full Ringing Alarm Alert Modal */}
      <AlarmRingingModal
        ringingNote={ringingNote}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
        onOpenNote={handleOpenNoteFromAlarm}
      />

      {/* MODAL 3: Windows App & Widget Installation Guide */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstall={install}
        onToggleWidgetMode={() => setIsWidgetMode(true)}
      />

      {/* FLOATING WINDOWS DESKTOP WIDGET (When widget mode is active) */}
      {isWidgetMode && (
        <DesktopWidgetView
          notes={notes}
          onToggleChecklist={handleToggleChecklist}
          onAddChecklistItem={handleAddChecklistItemToNote}
          onExitWidgetMode={() => setIsWidgetMode(false)}
          onOpenNewNote={handleOpenNewNote}
          onEditNote={handleEditNote}
          activeAlarmsCount={activeAlarmsCount}
        />
      )}
    </div>
  );
}
