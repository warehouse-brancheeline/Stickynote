import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  Plus, 
  Bell, 
  CheckSquare, 
  Clock, 
  FileText, 
  X, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Note } from '../types';
import { getAlarmStatus, getTodayDateString } from '../utils/dateUtils';

interface DesktopWidgetViewProps {
  notes: Note[];
  onToggleChecklist: (noteId: string, itemId: string) => void;
  onAddChecklistItem: (noteId: string, text: string) => void;
  onExitWidgetMode: () => void;
  onOpenNewNote: () => void;
  onEditNote: (note: Note) => void;
  activeAlarmsCount: number;
}

export const DesktopWidgetView: React.FC<DesktopWidgetViewProps> = ({
  notes,
  onToggleChecklist,
  onAddChecklistItem,
  onExitWidgetMode,
  onOpenNewNote,
  onEditNote,
  activeAlarmsCount,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [quickTaskText, setQuickTaskText] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Find nearest active upcoming alarm
  const activeAlarms = notes
    .filter((n) => n.hasAlarm && n.alarmStatus === 'active' && !n.isDeleted && !n.isArchived)
    .sort((a, b) => `${a.alarmDate}T${a.alarmTime}`.localeCompare(`${b.alarmDate}T${b.alarmTime}`));

  const nearestAlarm = activeAlarms[0] || null;
  const alarmStatus = nearestAlarm
    ? getAlarmStatus(nearestAlarm.alarmDate, nearestAlarm.alarmTime, nearestAlarm.snoozeUntil)
    : null;

  // Find note with checklist to show in widget
  const checklistNote = notes.find(
    (n) => n.hasChecklist && n.checklist && n.checklist.length > 0 && !n.isDeleted && !n.isArchived
  );

  // Find pinned or most recent note
  const pinnedNote = notes.find((n) => n.isPinned && !n.isDeleted && !n.isArchived) || notes[0];

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskText.trim()) return;
    if (checklistNote) {
      onAddChecklistItem(checklistNote.id, quickTaskText.trim());
      setQuickTaskText('');
    }
  };

  return (
    <div className="fixed bottom-14 right-6 z-40 w-88 rounded-2xl bg-[#061838]/98 border-2 border-[#2196F3] shadow-2xl shadow-[#0D47A1]/40 overflow-hidden text-[#E3F2FD] select-none backdrop-blur-xl animate-in zoom-in-95 duration-200">
      {/* Widget Mini Titlebar */}
      <div className="h-9 bg-[#05142b] border-b border-[#0D47A1] px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2196F3] animate-pulse" />
          <span className="text-[11px] font-bold text-[#E3F2FD] tracking-wide">
            WinMemo Desktop Widget
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onExitWidgetMode}
            className="p-1 rounded text-[#90CAF9] hover:text-white hover:bg-[#0D47A1] transition-colors cursor-pointer"
            title="Kembali ke Mode Penuh"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onExitWidgetMode}
            className="p-1 rounded text-[#90CAF9] hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
            title="Tutup Widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Body */}
      <div className="p-3.5 space-y-3 max-h-[75vh] overflow-y-auto">
        {/* Clock & Date Header */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#0D47A1]/60 to-[#082046] border border-[#2196F3]/40">
          <div>
            <div className="text-[11px] text-[#90CAF9] font-medium">{dateStr}</div>
            <div className="text-2xl font-mono font-bold text-[#E3F2FD] tracking-tight">
              {timeStr}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2196F3] text-white shadow-xs">
              {activeAlarmsCount} Alarm
            </span>
          </div>
        </div>

        {/* Nearest Alarm Alert Ticker */}
        {nearestAlarm && alarmStatus && (
          <div
            onClick={() => onEditNote(nearestAlarm)}
            className="p-2 rounded-xl bg-[#081e3f] border border-[#0D47A1] hover:border-[#2196F3] cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded bg-[#2196F3]/20 text-[#2196F3] shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="font-bold text-[#E3F2FD] truncate">{nearestAlarm.title}</div>
                <div className="text-[10px] text-[#90CAF9] font-mono">
                  {nearestAlarm.alarmTime} · {alarmStatus.statusText}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-[#2196F3] font-bold shrink-0">Buka</span>
          </div>
        )}

        {/* Checklist Sub-Widget */}
        {checklistNote && (
          <div className="p-2.5 rounded-xl bg-[#061733] border border-[#0D47A1] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#90CAF9] flex items-center gap-1.5 text-[11px]">
                <CheckSquare className="w-3.5 h-3.5 text-[#2196F3]" />
                <span className="truncate max-w-44">{checklistNote.title}</span>
              </span>
              <span className="text-[10px] font-mono text-[#E3F2FD]">
                {checklistNote.checklist.filter((i) => i.completed).length}/{checklistNote.checklist.length}
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {checklistNote.checklist.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleChecklist(checklistNote.id, item.id)}
                  className="flex items-center gap-2 p-1.5 rounded bg-[#092247] hover:bg-[#0D47A1]/50 cursor-pointer text-[11px] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggleChecklist(checklistNote.id, item.id)}
                    className="w-3 h-3 rounded accent-[#2196F3] cursor-pointer"
                  />
                  <span
                    className={`truncate ${
                      item.completed ? 'line-through text-[#90CAF9]/50' : 'text-[#E3F2FD]'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick add item input */}
            <form onSubmit={handleQuickAddTask} className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="+ Tambah tugas cepat..."
                value={quickTaskText}
                onChange={(e) => setQuickTaskText(e.target.value)}
                className="flex-1 bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded-lg px-2.5 py-1 text-[11px] text-[#E3F2FD] placeholder-[#90CAF9]/50 outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg text-[11px] font-bold cursor-pointer"
              >
                +
              </button>
            </form>
          </div>
        )}

        {/* Quick Note Snippet */}
        {pinnedNote && (
          <div
            onClick={() => onEditNote(pinnedNote)}
            className="p-2.5 rounded-xl bg-[#081e3f] border border-[#0D47A1] hover:border-[#2196F3] cursor-pointer transition-colors space-y-1"
          >
            <div className="flex items-center justify-between text-[10px] text-[#90CAF9]">
              <span className="font-bold flex items-center gap-1 text-[#2196F3]">
                <FileText className="w-3 h-3" />
                <span>Memo Disematkan</span>
              </span>
              <span>{pinnedNote.category}</span>
            </div>
            <div className="font-bold text-xs text-[#E3F2FD] truncate">{pinnedNote.title}</div>
            {pinnedNote.content && (
              <p className="text-[11px] text-[#90CAF9] line-clamp-2 leading-relaxed">
                {pinnedNote.content}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div className="h-9 bg-[#05142b] border-t border-[#0D47A1] px-3 flex items-center justify-between text-[11px]">
        <button
          onClick={onOpenNewNote}
          className="text-[#90CAF9] hover:text-[#E3F2FD] font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3 text-[#2196F3]" />
          <span>Buat Catatan</span>
        </button>
        <button
          onClick={onExitWidgetMode}
          className="text-[#2196F3] hover:text-[#90CAF9] font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>Buka Aplikasi Penuh</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
