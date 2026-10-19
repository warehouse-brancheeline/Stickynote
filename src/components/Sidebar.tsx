import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Bell, 
  CheckSquare, 
  Calendar, 
  Archive, 
  Settings, 
  Plus, 
  Layers
} from 'lucide-react';
import { NoteCategory, ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onNewNote: () => void;
  selectedCategory: NoteCategory | 'Semua';
  onSelectCategory: (cat: NoteCategory | 'Semua') => void;
  totalNotesCount: number;
  activeAlarmsCount: number;
  totalChecklistsCount: number;
  incompleteTasksCount: number;
  archivedCount: number;
  onOpenInstallGuide: () => void;
  onToggleWidgetMode: () => void;
}

const CATEGORIES: { name: NoteCategory; colorClass: string; dotColor: string }[] = [
  { name: 'Kerja', colorClass: 'text-[#90CAF9] bg-[#0D47A1]/40 border-[#2196F3]/30', dotColor: 'bg-[#2196F3]' },
  { name: 'Penting', colorClass: 'text-[#E3F2FD] bg-rose-500/20 border-rose-500/30', dotColor: 'bg-rose-400' },
  { name: 'Tugas', colorClass: 'text-[#E3F2FD] bg-emerald-500/20 border-emerald-500/30', dotColor: 'bg-emerald-400' },
  { name: 'Ide', colorClass: 'text-[#E3F2FD] bg-purple-500/20 border-purple-500/30', dotColor: 'bg-purple-400' },
  { name: 'Pribadi', colorClass: 'text-[#90CAF9] bg-[#2196F3]/20 border-[#2196F3]/30', dotColor: 'bg-[#90CAF9]' },
  { name: 'Harian', colorClass: 'text-[#E3F2FD] bg-amber-500/20 border-amber-500/30', dotColor: 'bg-amber-400' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewNote,
  selectedCategory,
  onSelectCategory,
  totalNotesCount,
  activeAlarmsCount,
  incompleteTasksCount,
  archivedCount,
  onOpenInstallGuide,
  onToggleWidgetMode,
}) => {
  return (
    <aside className="w-64 border-r border-[#0D47A1]/60 bg-[#061a38]/95 flex flex-col justify-between shrink-0 select-none text-xs text-[#E3F2FD]">
      {/* Top action: New Note button in vibrant #2196F3 */}
      <div className="p-3">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg font-semibold text-xs shadow-md shadow-[#2196F3]/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Catatan & Alarm</span>
        </button>
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#90CAF9]/80">
          Menu Utama
        </div>

        {/* Tab 1: Semua Catatan */}
        <button
          onClick={() => onSelectTab('notes')}
          className={`relative w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            currentTab === 'notes' ? 'text-[#E3F2FD] font-semibold' : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/30'
          }`}
        >
          {currentTab === 'notes' && (
            <motion.div
              layoutId="sidebarActivePill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 bg-[#2196F3]/25 border border-[#2196F3]/50 rounded-lg pointer-events-none"
            >
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2196F3] rounded-r" />
            </motion.div>
          )}
          <div className="flex items-center gap-2.5 relative z-10">
            <FileText className={`w-4 h-4 ${currentTab === 'notes' ? 'text-[#90CAF9]' : 'text-[#90CAF9]/70'}`} />
            <span>Semua Catatan</span>
          </div>
          <span className="font-mono tabular-nums text-[11px] text-[#90CAF9] relative z-10 bg-[#0D47A1]/50 px-1.5 py-0.2 rounded">
            {totalNotesCount}
          </span>
        </button>

        {/* Tab 2: Pengingat & Alarm */}
        <button
          onClick={() => onSelectTab('reminders')}
          className={`relative w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            currentTab === 'reminders' ? 'text-[#E3F2FD] font-semibold' : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/30'
          }`}
        >
          {currentTab === 'reminders' && (
            <motion.div
              layoutId="sidebarActivePill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 bg-[#2196F3]/25 border border-[#2196F3]/50 rounded-lg pointer-events-none"
            >
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2196F3] rounded-r" />
            </motion.div>
          )}
          <div className="flex items-center gap-2.5 relative z-10">
            <Bell className={`w-4 h-4 ${currentTab === 'reminders' ? 'text-[#90CAF9]' : 'text-[#90CAF9]/70'}`} />
            <span>Pengingat & Alarm</span>
          </div>
          {activeAlarmsCount > 0 && (
            <span className="font-mono tabular-nums text-[11px] px-1.5 py-0.2 bg-[#2196F3] text-white rounded font-bold relative z-10 shadow-xs">
              {activeAlarmsCount}
            </span>
          )}
        </button>

        {/* Tab 3: Daftar Ceklis */}
        <button
          onClick={() => onSelectTab('checklists')}
          className={`relative w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            currentTab === 'checklists' ? 'text-[#E3F2FD] font-semibold' : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/30'
          }`}
        >
          {currentTab === 'checklists' && (
            <motion.div
              layoutId="sidebarActivePill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 bg-[#2196F3]/25 border border-[#2196F3]/50 rounded-lg pointer-events-none"
            >
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2196F3] rounded-r" />
            </motion.div>
          )}
          <div className="flex items-center gap-2.5 relative z-10">
            <CheckSquare className={`w-4 h-4 ${currentTab === 'checklists' ? 'text-[#90CAF9]' : 'text-[#90CAF9]/70'}`} />
            <span>Daftar Ceklis / To-Do</span>
          </div>
          {incompleteTasksCount > 0 && (
            <span className="font-mono tabular-nums text-[11px] text-[#90CAF9] relative z-10 bg-[#0D47A1]/50 px-1.5 py-0.2 rounded">
              {incompleteTasksCount}
            </span>
          )}
        </button>

        {/* Tab 4: Kalender Jadwal */}
        <button
          onClick={() => onSelectTab('calendar')}
          className={`relative w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            currentTab === 'calendar' ? 'text-[#E3F2FD] font-semibold' : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/30'
          }`}
        >
          {currentTab === 'calendar' && (
            <motion.div
              layoutId="sidebarActivePill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 bg-[#2196F3]/25 border border-[#2196F3]/50 rounded-lg pointer-events-none"
            >
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2196F3] rounded-r" />
            </motion.div>
          )}
          <div className="flex items-center gap-2.5 relative z-10">
            <Calendar className={`w-4 h-4 ${currentTab === 'calendar' ? 'text-[#90CAF9]' : 'text-[#90CAF9]/70'}`} />
            <span>Kalender Jadwal</span>
          </div>
        </button>

        {/* Tab 5: Arsip Catatan */}
        <button
          onClick={() => onSelectTab('archive')}
          className={`relative w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            currentTab === 'archive' ? 'text-[#E3F2FD] font-semibold' : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/30'
          }`}
        >
          {currentTab === 'archive' && (
            <motion.div
              layoutId="sidebarActivePill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 bg-[#0D47A1]/50 border border-[#2196F3]/40 rounded-lg pointer-events-none"
            >
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#90CAF9] rounded-r" />
            </motion.div>
          )}
          <div className="flex items-center gap-2.5 relative z-10">
            <Archive className="w-4 h-4 text-[#90CAF9]/70" />
            <span>Arsip Catatan</span>
          </div>
          {archivedCount > 0 && (
            <span className="font-mono tabular-nums text-[11px] text-[#90CAF9] relative z-10">
              {archivedCount}
            </span>
          )}
        </button>

        {/* Separator */}
        <div className="pt-4 pb-1">
          <div className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-[#90CAF9]/80 flex items-center justify-between">
            <span>Kategori</span>
            {selectedCategory !== 'Semua' && (
              <button
                onClick={() => onSelectCategory('Semua')}
                className="text-[#90CAF9] hover:text-[#E3F2FD] text-[10px] cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Category buttons */}
        <button
          onClick={() => onSelectCategory('Semua')}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
            selectedCategory === 'Semua'
              ? 'bg-[#0D47A1] text-[#E3F2FD] font-semibold border border-[#2196F3]/40'
              : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#90CAF9]" />
            <span>Semua Kategori</span>
          </div>
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
              selectedCategory === cat.name
                ? `${cat.colorClass} font-semibold border`
                : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
              <span>{cat.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Area: Settings, Widget & Info */}
      <div className="p-3 border-t border-[#0D47A1]/60 space-y-1 bg-[#05152e]">
        {/* Toggle Widget Mode */}
        <button
          onClick={onToggleWidgetMode}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0D47A1]/40 hover:bg-[#0D47A1] text-[#E3F2FD] border border-[#2196F3]/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2196F3] animate-pulse" />
            <span>Mode Widget Desktop</span>
          </div>
          <span className="text-[10px] text-[#90CAF9] bg-[#071a38] px-1.5 py-0.2 rounded">Mini</span>
        </button>

        {/* Install Guide */}
        <button
          onClick={onOpenInstallGuide}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/40 transition-colors cursor-pointer"
        >
          <span className="text-[#2196F3]">⬇</span>
          <span>Instal di Windows...</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            currentTab === 'settings'
              ? 'text-[#E3F2FD] font-semibold'
              : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/40'
          }`}
        >
          {currentTab === 'settings' && (
            <motion.div
              layoutId="sidebarActivePill"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="absolute inset-0 bg-[#0D47A1] border border-[#2196F3]/40 rounded-lg pointer-events-none"
            >
              <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#2196F3] rounded-r" />
            </motion.div>
          )}
          <Settings className="w-4 h-4 text-[#90CAF9] relative z-10" />
          <span className="relative z-10">Pengaturan & Audio</span>
        </button>
        <div className="px-3 pt-2 text-[10px] text-[#90CAF9]/70 flex items-center justify-between">
          <span>WinMemo v2.4</span>
          <span className="font-mono text-[#90CAF9]">Palette Active</span>
        </div>
      </div>
    </aside>
  );
};
