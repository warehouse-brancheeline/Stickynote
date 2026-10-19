import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Volume2, 
  Wifi, 
  Battery, 
  ChevronUp, 
  Plus,
  StickyNote,
  CheckSquare
} from 'lucide-react';

interface TaskbarProps {
  activeAlarmsCount: number;
  onOpenReminders: () => void;
  onNewNote: () => void;
  onOpenChecklists: () => void;
  onToggleWindow: () => void;
  isWindowMinimized: boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  activeAlarmsCount,
  onOpenReminders,
  onNewNote,
  onOpenChecklists,
  onToggleWindow,
  isWindowMinimized,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-11 border-t border-[#0D47A1]/80 bg-[#05142b]/98 backdrop-blur-md select-none flex items-center justify-between px-3 text-xs text-[#E3F2FD] shrink-0 z-30">
      {/* Left: Weather badge with palette */}
      <div className="flex items-center gap-2 w-32">
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#0D47A1]/40 cursor-pointer text-[11px] text-[#90CAF9]">
          <span>⛅ 28°C Cerah</span>
        </div>
      </div>

      {/* Center: Windows 11 Center Aligned Taskbar Icons */}
      <div className="flex items-center gap-1.5">
        {/* Windows Start Button in #2196F3 */}
        <button
          onClick={onToggleWindow}
          className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-[#0D47A1]/50 transition-colors cursor-pointer text-[#2196F3] hover:text-[#90CAF9]"
          title="Windows Start"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/>
          </svg>
        </button>

        {/* WinMemo Running Task Icon with active indicator in #2196F3 */}
        <button
          onClick={onToggleWindow}
          className={`h-9 px-2.5 rounded-md flex items-center gap-2 transition-colors cursor-pointer relative ${
            !isWindowMinimized
              ? 'bg-[#0D47A1]/80 text-[#E3F2FD] shadow-xs border border-[#2196F3]/40'
              : 'hover:bg-[#0D47A1]/40 text-[#90CAF9]'
          }`}
          title="WinMemo - Catatan & Alarm"
        >
          <div className="w-5 h-5 rounded bg-[#2196F3] flex items-center justify-center text-white shadow-xs">
            <StickyNote className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-semibold hidden md:inline text-[#E3F2FD]">WinMemo</span>
          {/* Active bottom running pill in #2196F3 */}
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#2196F3] rounded-full shadow-[0_0_8px_#2196F3]" />
        </button>

        {/* Quick Add Note Icon in Taskbar */}
        <button
          onClick={onNewNote}
          className="w-9 h-9 rounded-md flex items-center justify-center text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/40 transition-colors cursor-pointer"
          title="Tambah Catatan & Alarm Cepat"
        >
          <Plus className="w-4 h-4 text-[#2196F3]" />
        </button>

        {/* Quick Checklist view in Taskbar */}
        <button
          onClick={onOpenChecklists}
          className="w-9 h-9 rounded-md flex items-center justify-center text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/40 transition-colors cursor-pointer"
          title="Buka Daftar Ceklis"
        >
          <CheckSquare className="w-4 h-4 text-[#90CAF9]" />
        </button>

        {/* Quick Alarm view in Taskbar */}
        <button
          onClick={onOpenReminders}
          className="w-9 h-9 rounded-md flex items-center justify-center text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/40 transition-colors cursor-pointer relative"
          title="Buka Alarm & Pengingat"
        >
          <Bell className="w-4 h-4 text-[#90CAF9]" />
          {activeAlarmsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#2196F3] animate-pulse shadow-[0_0_6px_#2196F3]" />
          )}
        </button>
      </div>

      {/* Right: Windows System Tray & Clock */}
      <div className="flex items-center gap-1.5">
        {/* Hidden icons chevron */}
        <button className="p-1 rounded hover:bg-[#0D47A1]/40 text-[#90CAF9]">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        {/* System tray cluster */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#0D47A1]/40 cursor-pointer text-[#90CAF9]">
          <Wifi className="w-3.5 h-3.5" />
          <Volume2 className="w-3.5 h-3.5" />
          <Battery className="w-3.5 h-3.5" />
        </div>

        {/* Digital Clock and Date */}
        <div
          onClick={onOpenReminders}
          className="flex flex-col items-end px-2 py-0.5 rounded hover:bg-[#0D47A1]/40 cursor-pointer font-mono text-[10px] leading-tight text-[#E3F2FD]"
          title="Klik untuk melihat Alarm & Jadwal"
        >
          <span className="font-bold text-[#E3F2FD]">{timeStr}</span>
          <span className="text-[#90CAF9]">{dateStr}</span>
        </div>
      </div>
    </footer>
  );
};
