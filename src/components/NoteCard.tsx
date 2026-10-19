import React from 'react';
import { 
  Pin, 
  Bell, 
  BellOff, 
  CheckSquare, 
  Clock, 
  Calendar as CalendarIcon, 
  Edit3, 
  Trash2, 
  Copy, 
  Archive,
} from 'lucide-react';
import { Note, NoteColor } from '../types';
import { formatShortDate, getAlarmStatus } from '../utils/dateUtils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onToggleChecklist: (noteId: string, itemId: string) => void;
  onToggleAlarm: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (note: Note) => void;
}

const COLOR_MAP: Record<NoteColor, { border: string; bg: string; badge: string }> = {
  default: {
    border: 'border-[#0D47A1]/70 hover:border-[#2196F3]',
    bg: 'bg-[#081e3f]/85',
    badge: 'text-[#90CAF9] bg-[#0D47A1]/50',
  },
  blue: {
    border: 'border-[#2196F3]/50 hover:border-[#2196F3]',
    bg: 'bg-[#0D47A1]/35',
    badge: 'text-[#E3F2FD] bg-[#2196F3]/30',
  },
  purple: {
    border: 'border-purple-500/40 hover:border-purple-400',
    bg: 'bg-purple-950/25',
    badge: 'text-purple-200 bg-purple-500/20',
  },
  amber: {
    border: 'border-amber-500/40 hover:border-amber-400',
    bg: 'bg-amber-950/25',
    badge: 'text-amber-200 bg-amber-500/20',
  },
  emerald: {
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'bg-emerald-950/25',
    badge: 'text-emerald-200 bg-emerald-500/20',
  },
  rose: {
    border: 'border-rose-500/40 hover:border-rose-400',
    bg: 'bg-rose-950/25',
    badge: 'text-rose-200 bg-rose-500/20',
  },
  cyan: {
    border: 'border-[#90CAF9]/40 hover:border-[#90CAF9]',
    bg: 'bg-[#092b57]/40',
    badge: 'text-[#E3F2FD] bg-[#0D47A1]/70',
  },
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onTogglePin,
  onToggleChecklist,
  onToggleAlarm,
  onDelete,
  onArchive,
  onDuplicate,
}) => {
  const colorStyle = COLOR_MAP[note.color] || COLOR_MAP.default;

  // Checklist statistics
  const totalItems = note.checklist?.length || 0;
  const completedItems = note.checklist?.filter((item) => item.completed).length || 0;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Alarm countdown status
  const alarmStatus = note.hasAlarm
    ? getAlarmStatus(note.alarmDate, note.alarmTime, note.snoozeUntil)
    : null;

  return (
    <div
      className={`group relative rounded-xl border ${colorStyle.border} ${colorStyle.bg} p-4 transition-all duration-200 hover:shadow-xl hover:shadow-[#0D47A1]/20 flex flex-col justify-between select-none backdrop-blur-xs`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Category & Pinned status */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colorStyle.badge}`}>
              {note.category}
            </span>
            {note.isPinned && (
              <span className="flex items-center gap-1 text-[11px] text-[#90CAF9] font-medium">
                <Pin className="w-3 h-3 fill-[#2196F3] text-[#2196F3]" />
                <span className="hidden sm:inline">Disematkan</span>
              </span>
            )}
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              className={`p-1 rounded hover:bg-[#0D47A1]/60 transition-colors ${
                note.isPinned ? 'text-[#2196F3]' : 'text-[#90CAF9] hover:text-[#E3F2FD]'
              }`}
              title={note.isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onEdit(note)}
              className="p-1 rounded text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/60 transition-colors"
              title="Edit Catatan"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onEdit(note)}
          className="text-sm font-bold text-[#E3F2FD] line-clamp-2 leading-snug cursor-pointer hover:text-[#90CAF9] transition-colors mb-1.5"
        >
          {note.title || 'Catatan Tanpa Judul'}
        </h3>

        {/* Note Content Text Snippet */}
        {note.content && (
          <p
            onClick={() => onEdit(note)}
            className="text-xs text-[#E3F2FD]/80 line-clamp-3 leading-relaxed cursor-pointer mb-3"
          >
            {note.content}
          </p>
        )}

        {/* Interactive Checklist Preview */}
        {note.hasChecklist && note.checklist && note.checklist.length > 0 && (
          <div className="mb-3 p-2.5 rounded-lg bg-[#061833]/80 border border-[#0D47A1]/60">
            {/* Progress header */}
            <div className="flex items-center justify-between text-[11px] text-[#90CAF9] mb-2">
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-[#2196F3]" />
                <span className="font-semibold">Ceklis</span>
              </span>
              <span className="font-mono tabular-nums text-[#E3F2FD]">
                {completedItems}/{totalItems} ({progressPercent}%)
              </span>
            </div>

            {/* Progress bar in #2196F3 with #0D47A1 background */}
            <div className="w-full h-1.5 bg-[#0D47A1]/50 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-gradient-to-r from-[#2196F3] to-[#90CAF9] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Items */}
            <div className="space-y-1.5">
              {note.checklist.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleChecklist(note.id, item.id);
                  }}
                  className="flex items-center gap-2 group/item cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggleChecklist(note.id, item.id)}
                    className="w-3.5 h-3.5 rounded border-[#0D47A1] text-[#2196F3] focus:ring-0 cursor-pointer accent-[#2196F3]"
                  />
                  <span
                    className={`truncate transition-all ${
                      item.completed ? 'line-through text-[#90CAF9]/60' : 'text-[#E3F2FD]'
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
              {note.checklist.length > 4 && (
                <div
                  onClick={() => onEdit(note)}
                  className="text-[10px] text-[#90CAF9] hover:text-[#E3F2FD] pt-0.5 cursor-pointer font-medium"
                >
                  +{note.checklist.length - 4} tugas lainnya...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Area: Alarm Settings & Timestamp */}
      <div className="pt-2 border-t border-[#0D47A1]/40 mt-1">
        {/* Active / Inactive Alarm Pill */}
        {note.hasAlarm && (
          <div className="mb-2 flex items-center justify-between gap-1.5 p-1.5 rounded-lg bg-[#071c3b]/90 border border-[#0D47A1] text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className={`p-1 rounded ${
                  note.alarmStatus === 'active'
                    ? 'text-[#2196F3] bg-[#2196F3]/15'
                    : 'text-[#90CAF9]/50 bg-[#0D47A1]/40'
                }`}
              >
                {note.alarmStatus === 'active' ? (
                  <Bell className="w-3.5 h-3.5" />
                ) : (
                  <BellOff className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-[#E3F2FD]">
                  <CalendarIcon className="w-3 h-3 text-[#90CAF9] shrink-0" />
                  <span>{formatShortDate(note.alarmDate)}</span>
                  <span className="text-[#90CAF9]/60">·</span>
                  <Clock className="w-3 h-3 text-[#90CAF9] shrink-0" />
                  <span className="font-bold">{note.alarmTime}</span>
                </div>
                {alarmStatus && (
                  <span
                    className={`text-[10px] truncate font-medium ${
                      alarmStatus.isOverdue
                        ? 'text-rose-400'
                        : alarmStatus.isDue
                        ? 'text-[#E3F2FD] font-bold'
                        : 'text-[#90CAF9]'
                    }`}
                  >
                    {alarmStatus.statusText}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Toggle Alarm on/off button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleAlarm(note.id);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                note.alarmStatus === 'active'
                  ? 'bg-[#2196F3] text-white hover:bg-[#1e88e5]'
                  : 'bg-[#0D47A1]/60 text-[#90CAF9] hover:bg-[#0D47A1]'
              }`}
            >
              {note.alarmStatus === 'active' ? 'Aktif' : 'Mati'}
            </button>
          </div>
        )}

        {/* Footer row: Tags and Card Actions */}
        <div className="flex items-center justify-between text-[11px] text-[#90CAF9] pt-1">
          {/* Tags */}
          <div className="flex items-center gap-1 overflow-hidden">
            {note.tags && note.tags.length > 0 ? (
              note.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.2 rounded bg-[#0D47A1]/50 border border-[#0D47A1] text-[10px] text-[#E3F2FD] truncate"
                >
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-[#90CAF9]/80">
                {formatShortDate(note.updatedAt)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicate(note)}
              className="p-1 rounded text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/50 transition-colors"
              title="Duplikat Catatan"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onArchive(note.id)}
              className="p-1 rounded text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/50 transition-colors"
              title={note.isArchived ? 'Batal Arsipkan' : 'Arsipkan'}
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1 rounded text-[#90CAF9] hover:text-rose-400 hover:bg-[#0D47A1]/50 transition-colors"
              title="Hapus Catatan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
