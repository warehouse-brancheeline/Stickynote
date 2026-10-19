import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Bell, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Pin, 
  Tag, 
  Play, 
  Bold,
  Italic,
  List,
  Heading2,
} from 'lucide-react';
import { AlarmRepeat, AlarmTone, ChecklistItem, Note, NoteCategory, NoteColor } from '../types';
import { playToneMotif } from '../utils/audioSynthesizer';
import { getCurrentTimeString, getTodayDateString, getTomorrowDateString } from '../utils/dateUtils';

interface NoteEditorModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Partial<Note>) => void;
  onDelete?: (id: string) => void;
  alarmVolume: number;
}

const CATEGORIES: NoteCategory[] = ['Kerja', 'Pribadi', 'Penting', 'Ide', 'Harian', 'Tugas'];

const COLORS: { name: NoteColor; label: string; bgClass: string; borderClass: string }[] = [
  { name: 'default', label: 'Biru Tua', bgClass: 'bg-[#0D47A1]', borderClass: 'border-[#2196F3]' },
  { name: 'blue', label: 'Biru Utama', bgClass: 'bg-[#2196F3]', borderClass: 'border-[#90CAF9]' },
  { name: 'cyan', label: 'Biru Muda', bgClass: 'bg-[#90CAF9]', borderClass: 'border-white' },
  { name: 'emerald', label: 'Hijau', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-400' },
  { name: 'amber', label: 'Kuning', bgClass: 'bg-amber-600', borderClass: 'border-amber-400' },
  { name: 'rose', label: 'Merah', bgClass: 'bg-rose-600', borderClass: 'border-rose-400' },
  { name: 'purple', label: 'Ungu', bgClass: 'bg-purple-600', borderClass: 'border-purple-400' },
];

const ALARM_TONES: { id: AlarmTone; name: string; desc: string }[] = [
  { id: 'windows-chime', name: 'Windows Chime', desc: 'Harmonik bel 4 nada khas Windows 11' },
  { id: 'digital-beep', name: 'Digital Beep', desc: 'Bunyi bip digital tegas ganda' },
  { id: 'radar', name: 'Radar Alert', desc: 'Sapuan frekuensi ping radar modern' },
  { id: 'gentle-bell', name: 'Gentle Bell', desc: 'Lonceng rileks hangat menenangkan' },
  { id: 'marimba', name: 'Marimba Melody', desc: 'Akord marimba kayu ceria' },
];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  note,
  isOpen,
  onClose,
  onSave,
  onDelete,
  alarmVolume,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'checklist' | 'alarm'>('content');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Kerja');
  const [color, setColor] = useState<NoteColor>('default');
  const [isPinned, setIsPinned] = useState(false);

  // Checklist state
  const [hasChecklist, setHasChecklist] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Alarm & Date settings
  const [hasAlarm, setHasAlarm] = useState(false);
  const [alarmDate, setAlarmDate] = useState(getTodayDateString());
  const [alarmTime, setAlarmTime] = useState(getCurrentTimeString(30));
  const [alarmTone, setAlarmTone] = useState<AlarmTone>('windows-chime');
  const [alarmRepeat, setAlarmRepeat] = useState<AlarmRepeat>('none');

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Synchronize when opening or changing note
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setCategory(note.category || 'Kerja');
      setColor(note.color || 'default');
      setIsPinned(note.isPinned || false);
      setHasChecklist(note.hasChecklist || false);
      setChecklist(note.checklist || []);
      setHasAlarm(note.hasAlarm || false);
      setAlarmDate(note.alarmDate || getTodayDateString());
      setAlarmTime(note.alarmTime || getCurrentTimeString(30));
      setAlarmTone(note.alarmTone || 'windows-chime');
      setAlarmRepeat(note.alarmRepeat || 'none');
      setTags(note.tags || []);
    } else {
      // Reset for new note
      setTitle('');
      setContent('');
      setCategory('Kerja');
      setColor('default');
      setIsPinned(false);
      setHasChecklist(false);
      setChecklist([]);
      setHasAlarm(false);
      setAlarmDate(getTodayDateString());
      setAlarmTime(getCurrentTimeString(30));
      setAlarmTone('windows-chime');
      setAlarmRepeat('none');
      setTags([]);
    }
    setActiveTab('content');
  }, [note, isOpen]);

  if (!isOpen) return null;

  // Add checklist item
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'c_' + Date.now() + Math.random().toString(36).substring(2, 5),
      text: newChecklistText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistText('');
    setHasChecklist(true);
  };

  const handleToggleCheckItem = (id: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleDeleteCheckItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  // Preset time buttons
  const applyTimePreset = (minutesToAdd: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesToAdd);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');

    setAlarmDate(`${y}-${m}-${day}`);
    setAlarmTime(`${h}:${min}`);
    setHasAlarm(true);
  };

  const applyTomorrowPreset = (hour: number) => {
    setAlarmDate(getTomorrowDateString());
    setAlarmTime(`${String(hour).padStart(2, '0')}:00`);
    setHasAlarm(true);
  };

  // Add tag
  const handleAddTag = () => {
    const clean = newTagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Markdown quick formatter
  const applyTextFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('note-main-content') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'teks'}${suffix}`;
    const nextContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextContent);
  };

  // Save changes
  const handleSave = () => {
    onSave({
      title: title.trim() || 'Catatan Baru',
      content: content.trim(),
      category,
      color,
      isPinned,
      hasChecklist,
      checklist,
      hasAlarm,
      alarmDate: hasAlarm ? alarmDate : '',
      alarmTime: hasAlarm ? alarmTime : '',
      alarmTone,
      alarmRepeat,
      alarmStatus: hasAlarm ? 'active' : 'dismissed',
      tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-[#071a38] border border-[#0D47A1] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Windows Fluent Dialog Titlebar */}
        <div className="h-11 bg-[#05142b] border-b border-[#0D47A1] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-[#2196F3]" />
            <span className="text-xs font-bold text-[#E3F2FD]">
              {note ? 'Edit Catatan & Alarm' : 'Buat Catatan Baru'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-[#90CAF9] hover:text-white hover:bg-[#0D47A1]/60 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Judul catatan atau pengingat..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#E3F2FD] placeholder-[#90CAF9]/60 outline-none transition-colors shadow-inner"
            />
          </div>

          {/* Properties Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-[#061733] border border-[#0D47A1]/80 text-xs">
            {/* Category Select */}
            <div className="flex items-center gap-2">
              <span className="text-[#90CAF9] font-medium">Kategori:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="bg-[#092247] border border-[#0D47A1] text-[#E3F2FD] rounded px-2 py-1 text-xs outline-none focus:border-[#2196F3] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#90CAF9] font-medium">Warna:</span>
              <div className="flex items-center gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={`w-4 h-4 rounded-full ${c.bgClass} transition-transform ${
                      color === c.name
                        ? 'ring-2 ring-[#E3F2FD] ring-offset-2 ring-offset-[#071a38] scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                isPinned
                  ? 'bg-[#2196F3]/30 text-[#E3F2FD] border border-[#2196F3]'
                  : 'bg-[#092247] text-[#90CAF9] hover:text-[#E3F2FD]'
              }`}
            >
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-[#2196F3] text-[#2196F3]' : ''}`} />
              <span>{isPinned ? 'Tersemat' : 'Sematkan'}</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-[#0D47A1]/80 pb-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t transition-colors cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-[#092247] text-[#E3F2FD] border-b-2 border-[#2196F3]'
                  : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#092247]/50'
              }`}
            >
              <span>Isi Teks</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t transition-colors cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-[#092247] text-[#E3F2FD] border-b-2 border-[#2196F3]'
                  : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#092247]/50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#2196F3]" />
              <span>Daftar Ceklis</span>
              {checklist.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#2196F3]/30 rounded text-[#E3F2FD]">
                  {checklist.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('alarm')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t transition-colors cursor-pointer ${
                activeTab === 'alarm'
                  ? 'bg-[#092247] text-[#E3F2FD] border-b-2 border-[#2196F3]'
                  : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#092247]/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[#90CAF9]" />
              <span>Alarm & Waktu</span>
              {hasAlarm && (
                <span className="w-2 h-2 rounded-full bg-[#2196F3] animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: Main Content Text */}
          {activeTab === 'content' && (
            <div className="space-y-2">
              {/* Quick formatting toolbar */}
              <div className="flex items-center gap-1 text-[#90CAF9] bg-[#061733] p-1 rounded-lg border border-[#0D47A1]/70 text-xs">
                <button
                  type="button"
                  onClick={() => applyTextFormat('**', '**')}
                  className="p-1 hover:text-white hover:bg-[#0D47A1]/60 rounded"
                  title="Tebal (Bold)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextFormat('*', '*')}
                  className="p-1 hover:text-white hover:bg-[#0D47A1]/60 rounded"
                  title="Miring (Italic)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextFormat('## ')}
                  className="p-1 hover:text-white hover:bg-[#0D47A1]/60 rounded"
                  title="Heading"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => applyTextFormat('- ')}
                  className="p-1 hover:text-white hover:bg-[#0D47A1]/60 rounded"
                  title="Poin Daftar"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <div className="h-4 w-px bg-[#0D47A1] mx-1" />
                <span className="text-[11px] text-[#90CAF9]/70">
                  Tulis catatan bebas atau deskripsi pengingat
                </span>
              </div>

              <textarea
                id="note-main-content"
                rows={7}
                placeholder="Tuliskan catatan, rincian pekerjaan, atau pesan pengingat di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg p-3 text-xs leading-relaxed text-[#E3F2FD] placeholder-[#90CAF9]/60 outline-none resize-none font-sans shadow-inner"
              />
            </div>
          )}

          {/* TAB 2: Interactive Checklist */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-[#E3F2FD] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasChecklist}
                    onChange={(e) => setHasChecklist(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2196F3] focus:ring-0 accent-[#2196F3]"
                  />
                  <span className="font-semibold">Aktifkan Fitur Ceklis pada Catatan Ini</span>
                </label>
                {checklist.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setChecklist(checklist.filter((c) => !c.completed))}
                    className="text-[11px] text-rose-400 hover:text-rose-300"
                  >
                    Bersihkan yang Selesai
                  </button>
                )}
              </div>

              {/* Add new checklist item input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tambahkan tugas ceklis baru... (Tekan Enter)"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  className="flex-1 bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg px-3 py-1.5 text-xs text-[#E3F2FD] placeholder-[#90CAF9]/60 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-3 py-1.5 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Checklist items */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {checklist.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#90CAF9] border border-dashed border-[#0D47A1] rounded-lg">
                    Belum ada butir ceklis. Ketik tugas di atas lalu klik Tambah.
                  </div>
                ) : (
                  checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-2 rounded bg-[#092247] border border-[#0D47A1]/80 text-xs group"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleCheckItem(item.id)}
                          className="w-4 h-4 rounded text-[#2196F3] focus:ring-0 cursor-pointer accent-[#2196F3]"
                        />
                        <span
                          className={`truncate text-xs ${
                            item.completed ? 'line-through text-[#90CAF9]/50' : 'text-[#E3F2FD]'
                          }`}
                        >
                          {item.text}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCheckItem(item.id)}
                        className="text-[#90CAF9] hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Alarm & Date Time Settings */}
          {activeTab === 'alarm' && (
            <div className="space-y-4">
              {/* Main Alarm Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#061733] border border-[#0D47A1]">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      hasAlarm ? 'bg-[#2196F3]/20 text-[#2196F3]' : 'bg-[#092247] text-[#90CAF9]'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#E3F2FD]">
                      Aktifkan Alarm Pengingat
                    </div>
                    <div className="text-[11px] text-[#90CAF9]">
                      Putar bunyi suara alarm & tampilkan notifikasi pop-up saat waktu tiba
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAlarm}
                    onChange={(e) => setHasAlarm(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-[#092247] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2196F3]"></div>
                </label>
              </div>

              {hasAlarm && (
                <div className="space-y-4 p-3.5 rounded-lg bg-[#061a38] border border-[#0D47A1]">
                  {/* Quick Preset Buttons */}
                  <div>
                    <div className="text-[11px] font-bold text-[#90CAF9] mb-2 uppercase tracking-wide">
                      Pilihan Cepat Waktu:
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => applyTimePreset(15)}
                        className="px-2.5 py-1 rounded bg-[#092247] hover:bg-[#0D47A1] text-[#E3F2FD] border border-[#0D47A1] text-[11px] cursor-pointer"
                      >
                        +15 Menit
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimePreset(30)}
                        className="px-2.5 py-1 rounded bg-[#092247] hover:bg-[#0D47A1] text-[#E3F2FD] border border-[#0D47A1] text-[11px] cursor-pointer"
                      >
                        +30 Menit
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTimePreset(60)}
                        className="px-2.5 py-1 rounded bg-[#092247] hover:bg-[#0D47A1] text-[#E3F2FD] border border-[#0D47A1] text-[11px] cursor-pointer"
                      >
                        +1 Jam
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTomorrowPreset(8)}
                        className="px-2.5 py-1 rounded bg-[#092247] hover:bg-[#0D47A1] text-[#E3F2FD] border border-[#0D47A1] text-[11px] cursor-pointer"
                      >
                        Besok Pagi (08:00)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTomorrowPreset(14)}
                        className="px-2.5 py-1 rounded bg-[#092247] hover:bg-[#0D47A1] text-[#E3F2FD] border border-[#0D47A1] text-[11px] cursor-pointer"
                      >
                        Besok Siang (14:00)
                      </button>
                    </div>
                  </div>

                  {/* Date and Time Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#90CAF9] mb-1">
                        Tanggal Alarm
                      </label>
                      <div className="relative">
                        <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#90CAF9] pointer-events-none" />
                        <input
                          type="date"
                          value={alarmDate}
                          onChange={(e) => setAlarmDate(e.target.value)}
                          className="w-full bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#E3F2FD] outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#90CAF9] mb-1">
                        Jam & Menit Alarm
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#90CAF9] pointer-events-none" />
                        <input
                          type="time"
                          value={alarmTime}
                          onChange={(e) => setAlarmTime(e.target.value)}
                          className="w-full bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#E3F2FD] outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ringtone Selection & Sound Preview */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#90CAF9] mb-1.5">
                      Pilihan Nada Dering Suara Alarm
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ALARM_TONES.map((tone) => (
                        <div
                          key={tone.id}
                          onClick={() => setAlarmTone(tone.id)}
                          className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            alarmTone === tone.id
                              ? 'bg-[#0D47A1]/60 border-[#2196F3] text-[#E3F2FD]'
                              : 'bg-[#092247] border-[#0D47A1] text-[#90CAF9] hover:border-[#2196F3]/50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-xs">{tone.name}</div>
                            <div className="text-[10px] text-[#90CAF9]/80">{tone.desc}</div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playToneMotif(tone.id, alarmVolume);
                            }}
                            className="p-1 rounded bg-[#0D47A1] hover:bg-[#2196F3] text-white"
                            title="Tes Bunyi"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Repeat Schedule */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#90CAF9] mb-1">
                      Ulangi Alarm
                    </label>
                    <select
                      value={alarmRepeat}
                      onChange={(e) => setAlarmRepeat(e.target.value as AlarmRepeat)}
                      className="w-full bg-[#0a234a] border border-[#0D47A1] text-[#E3F2FD] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#2196F3] cursor-pointer"
                    >
                      <option value="none">Sekali Saja (Tidak Berulang)</option>
                      <option value="daily">Setiap Hari</option>
                      <option value="weekdays">Hari Kerja (Senin - Jumat)</option>
                      <option value="weekly">Setiap Minggu pada Hari yang Sama</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tags Manager */}
          <div className="pt-2 border-t border-[#0D47A1]/60">
            <div className="flex items-center gap-2 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-[#90CAF9]" />
              <span className="text-[11px] font-bold text-[#90CAF9]">
                Label / Tag:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded bg-[#0D47A1]/50 border border-[#0D47A1] text-[#E3F2FD] text-xs flex items-center gap-1"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400 text-[#90CAF9]"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Tambah tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="bg-[#0a234a] border border-[#0D47A1] rounded px-2 py-0.5 text-xs text-[#E3F2FD] outline-none w-24 focus:w-32 transition-all placeholder-[#90CAF9]/60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Save Actions */}
        <div className="h-12 bg-[#05142b] border-t border-[#0D47A1] px-4 flex items-center justify-between shrink-0">
          <div>
            {note && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Yakin ingin menghapus catatan ini?')) {
                    onDelete(note.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-[#092247] hover:bg-[#0D47A1] text-[#90CAF9] hover:text-[#E3F2FD] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-[#2196F3]/30 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
