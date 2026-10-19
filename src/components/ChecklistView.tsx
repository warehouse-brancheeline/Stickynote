import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  CheckCircle2, 
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Note } from '../types';

interface ChecklistViewProps {
  notes: Note[];
  onToggleChecklist: (noteId: string, itemId: string) => void;
  onEditNote: (note: Note) => void;
  onNewChecklistNote: () => void;
  onAddChecklistItem: (noteId: string, text: string) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  notes,
  onToggleChecklist,
  onEditNote,
  onNewChecklistNote,
  onAddChecklistItem,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [activeNoteForAdd, setActiveNoteForAdd] = useState<string>('');
  const [newItemText, setNewItemText] = useState<string>('');

  // Collect all notes with checklists
  const checklistNotes = notes.filter(
    (n) => n.hasChecklist && n.checklist && n.checklist.length > 0 && !n.isDeleted && !n.isArchived
  );

  // Compute aggregate stats
  let totalTasks = 0;
  let completedTasks = 0;

  checklistNotes.forEach((n) => {
    n.checklist.forEach((item) => {
      totalTasks++;
      if (item.completed) completedTasks++;
    });
  });

  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggle = (noteId: string, itemId: string, isCurrentlyDone: boolean) => {
    onToggleChecklist(noteId, itemId);
    if (!isCurrentlyDone) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleAddItemToNote = (noteId: string) => {
    if (!newItemText.trim()) return;
    onAddChecklistItem(noteId, newItemText.trim());
    setNewItemText('');
    setActiveNoteForAdd('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none text-[#E3F2FD]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0D47A1]/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#E3F2FD] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#2196F3]" />
            <span>Daftar Ceklis & To-Do List</span>
          </h1>
          <p className="text-xs text-[#90CAF9] mt-0.5">
            Pantau progres tugas harian, checklist inventaris, dan daftar pekerjaan Anda.
          </p>
        </div>

        <button
          onClick={onNewChecklistNote}
          className="flex items-center gap-2 px-3 py-2 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg text-xs font-bold shadow-md shadow-[#2196F3]/30 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Daftar Ceklis Baru</span>
        </button>
      </div>

      {/* Progress Metric Card */}
      <div className="p-4 rounded-xl bg-[#061838] border border-[#0D47A1] shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2196F3]" />
            <span className="font-bold text-[#E3F2FD]">Kemajuan Tugas Keseluruhan</span>
          </div>
          <span className="font-mono tabular-nums text-[#90CAF9] font-bold">
            {completedTasks} dari {totalTasks} selesai ({overallPercent}%)
          </span>
        </div>

        <div className="w-full h-2.5 bg-[#0D47A1]/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2196F3] to-[#90CAF9] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-[#0D47A1]/60 text-xs">
          <span className="text-[#90CAF9] text-[11px] mr-1 flex items-center gap-1 font-semibold">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#2196F3] text-white'
                : 'text-[#90CAF9] hover:text-[#E3F2FD]'
            }`}
          >
            Semua ({totalTasks})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-[#0D47A1] text-[#E3F2FD] border border-[#2196F3]'
                : 'text-[#90CAF9] hover:text-[#E3F2FD]'
            }`}
          >
            Belum Selesai ({totalTasks - completedTasks})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-[#0D47A1] text-[#E3F2FD] border border-[#2196F3]'
                : 'text-[#90CAF9] hover:text-[#E3F2FD]'
            }`}
          >
            Sudah Selesai ({completedTasks})
          </button>
        </div>
      </div>

      {/* Checklist Grouped by Notes */}
      {checklistNotes.length === 0 ? (
        <div className="p-10 text-center rounded-xl border border-dashed border-[#0D47A1] text-[#90CAF9] text-xs">
          <CheckSquare className="w-8 h-8 mx-auto mb-2 text-[#90CAF9]/60" />
          <p className="font-semibold text-[#E3F2FD]">Belum ada daftar ceklis yang dibuat.</p>
          <p className="text-[11px] text-[#90CAF9] mt-1">
            Klik tombol "Buat Daftar Ceklis Baru" untuk mulai mencatat tugas dan target harian.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {checklistNotes.map((note) => {
            const itemsToRender = note.checklist.filter((item) => {
              if (filter === 'pending') return !item.completed;
              if (filter === 'completed') return item.completed;
              return true;
            });

            if (itemsToRender.length === 0 && filter !== 'all') {
              return null;
            }

            const noteCompleted = note.checklist.filter((i) => i.completed).length;
            const noteTotal = note.checklist.length;
            const notePercent = noteTotal > 0 ? Math.round((noteCompleted / noteTotal) * 100) : 0;

            return (
              <div
                key={note.id}
                className="rounded-xl bg-[#081e3f] border border-[#0D47A1] overflow-hidden shadow-xs"
              >
                {/* Note Checklist Header */}
                <div className="p-3.5 bg-[#05142b] border-b border-[#0D47A1] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#0D47A1] text-[#E3F2FD]">
                      {note.category}
                    </span>
                    <h3
                      onClick={() => onEditNote(note)}
                      className="text-sm font-bold text-[#E3F2FD] hover:text-[#90CAF9] cursor-pointer"
                    >
                      {note.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono tabular-nums text-[#90CAF9] font-bold">
                      {noteCompleted}/{noteTotal} ({notePercent}%)
                    </span>
                    <button
                      onClick={() => onEditNote(note)}
                      className="text-[#90CAF9] hover:text-[#E3F2FD] text-xs underline cursor-pointer"
                    >
                      Buka
                    </button>
                  </div>
                </div>

                {/* Checklist items list */}
                <div className="p-3 space-y-1.5">
                  {itemsToRender.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggle(note.id, item.id, item.completed)}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        item.completed
                          ? 'bg-[#061833]/40 text-[#90CAF9]/50 hover:bg-[#061833]/60'
                          : 'bg-[#061833] text-[#E3F2FD] hover:bg-[#092349]'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggle(note.id, item.id, item.completed)}
                          className="w-4 h-4 rounded border-[#0D47A1] text-[#2196F3] focus:ring-0 cursor-pointer accent-[#2196F3]"
                        />
                        <span className={`truncate ${item.completed ? 'line-through text-[#90CAF9]/50' : ''}`}>
                          {item.text}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Inline quick add item to this note */}
                  {activeNoteForAdd === note.id ? (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Ketik tugas baru lalu tekan Enter..."
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddItemToNote(note.id);
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-[#0a234a] border border-[#0D47A1] focus:border-[#2196F3] rounded px-2.5 py-1 text-xs text-[#E3F2FD] outline-none"
                      />
                      <button
                        onClick={() => handleAddItemToNote(note.id)}
                        className="px-2.5 py-1 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded text-xs font-bold"
                      >
                        Tambah
                      </button>
                      <button
                        onClick={() => setActiveNoteForAdd('')}
                        className="px-2 py-1 text-[#90CAF9] hover:text-[#E3F2FD] text-xs"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveNoteForAdd(note.id);
                        setNewItemText('');
                      }}
                      className="mt-1 flex items-center gap-1.5 text-xs text-[#90CAF9] hover:text-[#E3F2FD] py-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah tugas ke daftar ini...</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
