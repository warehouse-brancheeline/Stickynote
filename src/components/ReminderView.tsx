import React, { useState } from 'react';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  Play, 
  RotateCcw, 
  Edit3, 
  Trash2, 
} from 'lucide-react';
import { AlarmTone, Note } from '../types';
import { playToneMotif } from '../utils/audioSynthesizer';
import { formatIndonesianDate, formatShortDate, getAlarmStatus, getCurrentTimeString, getTodayDateString } from '../utils/dateUtils';

interface ReminderViewProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onToggleAlarm: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onQuickAddAlarm: (title: string, date: string, time: string, tone: AlarmTone) => void;
  alarmVolume: number;
}

export const ReminderView: React.FC<ReminderViewProps> = ({
  notes,
  onEditNote,
  onToggleAlarm,
  onDeleteNote,
  onQuickAddAlarm,
  alarmVolume,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDate, setQuickDate] = useState(getTodayDateString());
  const [quickTime, setQuickTime] = useState(getCurrentTimeString(15));
  const [quickTone, setQuickTone] = useState<AlarmTone>('windows-chime');

  // Filter notes that have alarms
  const alarmNotes = notes.filter((n) => n.hasAlarm && !n.isDeleted && !n.isArchived);

  // Active alarms sorted chronologically
  const activeAlarms = alarmNotes
    .filter((n) => n.alarmStatus === 'active')
    .sort((a, b) => {
      const dateTimeA = `${a.alarmDate}T${a.alarmTime}`;
      const dateTimeB = `${b.alarmDate}T${b.alarmTime}`;
      return dateTimeA.localeCompare(dateTimeB);
    });

  // Snoozed alarms
  const snoozedAlarms = alarmNotes.filter((n) => n.alarmStatus === 'snoozed');

  // Past / dismissed alarms
  const pastAlarms = alarmNotes.filter((n) => n.alarmStatus === 'dismissed');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddAlarm(quickTitle.trim(), quickDate, quickTime, quickTone);
    setQuickTitle('');
    setQuickTime(getCurrentTimeString(15));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none text-[#E3F2FD]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D47A1]/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#E3F2FD] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#2196F3]" />
            <span>Pengingat & Alarm Terjadwal</span>
          </h1>
          <p className="text-xs text-[#90CAF9] mt-0.5">
            Kelola waktu alarm dan pengingat tanggal dengan bunyi audio presisi.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#2196F3]/20 border border-[#2196F3]/50 text-[#E3F2FD] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2196F3] animate-pulse" />
            <span className="font-mono tabular-nums">{activeAlarms.length}</span> Alarm Aktif
          </div>
        </div>
      </div>

      {/* Quick Add Alarm Panel */}
      <div className="p-4 rounded-xl bg-[#061838] border border-[#0D47A1] shadow-xs">
        <div className="text-xs font-bold text-[#90CAF9] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
          <Plus className="w-3.5 h-3.5 text-[#2196F3]" />
          <span>Pasang Alarm Pengingat Cepat:</span>
        </div>
        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
          <input
            type="text"
            placeholder="Nama pengingat (contoh: Telepon vendor jam 3 sore)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="sm:col-span-5 bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg px-3 py-2 text-[#E3F2FD] placeholder-[#90CAF9]/60 outline-none"
          />
          <input
            type="date"
            value={quickDate}
            onChange={(e) => setQuickDate(e.target.value)}
            className="sm:col-span-2 bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg px-2.5 py-2 text-[#E3F2FD] font-mono outline-none"
          />
          <input
            type="time"
            value={quickTime}
            onChange={(e) => setQuickTime(e.target.value)}
            className="sm:col-span-2 bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg px-2.5 py-2 text-[#E3F2FD] font-mono outline-none"
          />
          <select
            value={quickTone}
            onChange={(e) => setQuickTone(e.target.value as AlarmTone)}
            className="sm:col-span-2 bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg px-2 py-2 text-[#E3F2FD] outline-none"
          >
            <option value="windows-chime">Windows Chime</option>
            <option value="digital-beep">Digital Beep</option>
            <option value="radar">Radar Alert</option>
            <option value="gentle-bell">Gentle Bell</option>
            <option value="marimba">Marimba</option>
          </select>
          <button
            type="submit"
            className="sm:col-span-1 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg font-bold flex items-center justify-center gap-1 transition-colors py-2 cursor-pointer shadow-md shadow-[#2196F3]/30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* SECTION 1: Active Alarms */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#90CAF9] uppercase tracking-wider flex items-center gap-2">
          <span>Alarm Mendatang ({activeAlarms.length})</span>
        </h2>

        {activeAlarms.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#0D47A1] text-[#90CAF9] text-xs">
            <BellOff className="w-8 h-8 mx-auto mb-2 text-[#90CAF9]/60" />
            <p className="font-semibold text-[#E3F2FD]">Tidak ada alarm aktif saat ini.</p>
            <p className="text-[11px] text-[#90CAF9] mt-1">
              Gunakan form di atas atau edit catatan untuk mengatur alarm pengingat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeAlarms.map((note) => {
              const status = getAlarmStatus(note.alarmDate, note.alarmTime, note.snoozeUntil);
              return (
                <div
                  key={note.id}
                  className="p-4 rounded-xl bg-[#081e3f] border border-[#0D47A1] hover:border-[#2196F3] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Date, Time & Countdown */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-1.5 font-mono text-[#E3F2FD]">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#90CAF9]" />
                        <span>{formatIndonesianDate(note.alarmDate)}</span>
                        <span className="text-[#90CAF9]/50">·</span>
                        <Clock className="w-3.5 h-3.5 text-[#2196F3]" />
                        <span className="font-bold text-[#E3F2FD]">{note.alarmTime}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          status.isOverdue
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-[#2196F3]/20 text-[#E3F2FD] border border-[#2196F3]/40'
                        }`}
                      >
                        {status.statusText}
                      </span>
                    </div>

                    {/* Note title */}
                    <h3
                      onClick={() => onEditNote(note)}
                      className="text-sm font-bold text-[#E3F2FD] hover:text-[#90CAF9] cursor-pointer mb-1"
                    >
                      {note.title}
                    </h3>
                    {note.content && (
                      <p className="text-xs text-[#E3F2FD]/70 line-clamp-2 mb-3">
                        {note.content}
                      </p>
                    )}
                  </div>

                  {/* Footer Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#0D47A1]/60 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => playToneMotif(note.alarmTone, alarmVolume)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-[#0D47A1]/60 hover:bg-[#0D47A1] text-[#E3F2FD] text-[11px] cursor-pointer"
                        title="Dengarkan Nada Alarm"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="capitalize">{note.alarmTone.replace('-', ' ')}</span>
                      </button>
                      {note.alarmRepeat !== 'none' && (
                        <span className="text-[10px] text-[#90CAF9] bg-[#0D47A1]/60 px-1.5 py-0.5 rounded">
                          {note.alarmRepeat === 'daily' ? 'Setiap Hari' : 'Mingguan'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleAlarm(note.id)}
                        className="px-2.5 py-1 bg-[#2196F3]/20 hover:bg-[#2196F3]/30 text-[#E3F2FD] rounded font-semibold text-[11px] border border-[#2196F3]/40 cursor-pointer"
                      >
                        Matikan
                      </button>
                      <button
                        onClick={() => onEditNote(note)}
                        className="p-1 rounded text-[#90CAF9] hover:text-[#E3F2FD]"
                        title="Edit Catatan"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 rounded text-[#90CAF9] hover:text-rose-400"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Snoozed Alarms */}
      {snoozedAlarms.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#90CAF9] uppercase tracking-wider flex items-center gap-2">
            <span>Alarm yang Ditunda (Snoozed)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {snoozedAlarms.map((note) => (
              <div
                key={note.id}
                className="p-3.5 rounded-xl bg-[#081e3f] border border-[#2196F3]/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[#E3F2FD]">{note.title}</div>
                  <div className="text-[11px] text-[#90CAF9] mt-0.5">
                    Ditunda hingga: {note.snoozeUntil ? new Date(note.snoozeUntil).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'segera'}
                  </div>
                </div>
                <button
                  onClick={() => onToggleAlarm(note.id)}
                  className="px-3 py-1 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded font-bold"
                >
                  Matikan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Past / Dismissed Alarms */}
      {pastAlarms.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold text-[#90CAF9] uppercase tracking-wider">
            Riwayat Alarm / Dinonaktifkan ({pastAlarms.length})
          </h2>
          <div className="space-y-2">
            {pastAlarms.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg bg-[#061838] border border-[#0D47A1]/60 flex items-center justify-between text-xs opacity-75 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <BellOff className="w-4 h-4 text-[#90CAF9]" />
                  <div>
                    <div className="font-semibold text-[#E3F2FD]">{note.title}</div>
                    <div className="text-[11px] text-[#90CAF9] font-mono">
                      {formatShortDate(note.alarmDate)} pukul {note.alarmTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleAlarm(note.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#0D47A1] hover:bg-[#2196F3] text-white rounded text-[11px] font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Aktifkan Kembali</span>
                  </button>
                  <button
                    onClick={() => onEditNote(note)}
                    className="p-1 rounded text-[#90CAF9] hover:text-[#E3F2FD]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
