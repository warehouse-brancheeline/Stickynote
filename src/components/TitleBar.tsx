import React, { useEffect, useState } from 'react';
import { 
  Minus, 
  Square, 
  X, 
  Bell, 
  Plus, 
  Search, 
  Volume2, 
  VolumeX, 
  Download,
  Layers
} from 'lucide-react';
import { AppSettings } from '../types';

interface TitleBarProps {
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onNewNote: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeAlarmsCount: number;
  onOpenReminders: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onOpenInstallGuide: () => void;
  onToggleWidgetMode: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  settings,
  onUpdateSettings,
  onNewNote,
  searchQuery,
  onSearchChange,
  activeAlarmsCount,
  onOpenReminders,
  isFullscreen,
  onToggleFullscreen,
  isMinimized,
  onToggleMinimize,
  onOpenInstallGuide,
  onToggleWidgetMode,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-10 border-b border-[#0D47A1]/60 bg-[#082046]/95 backdrop-blur-md select-none flex items-center justify-between px-3 text-xs text-[#E3F2FD] shrink-0 z-30">
      {/* Zone 1: App Identity & Windows Icon with user's blue colors */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Windows 11 style Note + Alarm App Icon with gradient #2196F3 to #0D47A1 */}
          <div className="w-5 h-5 rounded bg-gradient-to-br from-[#2196F3] to-[#0D47A1] flex items-center justify-center text-white shadow-sm ring-1 ring-[#90CAF9]/40">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z"/>
            </svg>
          </div>
          <span className="font-bold text-[#E3F2FD] tracking-tight text-xs">
            WinMemo
          </span>
          <span className="text-[#90CAF9] text-[11px] hidden sm:inline opacity-80">
            Catatan & Alarm Windows
          </span>
        </div>

        {/* Global Quick Add button in #2196F3 */}
        <button
          onClick={onNewNote}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded text-[11px] font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Buat Catatan Baru (Ctrl+N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catatan Baru</span>
        </button>
      </div>

      {/* Zone 2: Search & Mode Widget Action */}
      <div className="flex items-center gap-2 max-w-md w-full justify-center px-2">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#90CAF9]" />
          <input
            type="text"
            placeholder="Cari catatan, tag, atau isi... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#0a2754]/90 hover:bg-[#0a2754] focus:bg-[#092249] border border-[#0D47A1] focus:border-[#2196F3] text-[#E3F2FD] placeholder-[#90CAF9]/60 rounded-md pl-8 pr-2.5 py-1 text-xs outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#90CAF9] hover:text-[#E3F2FD]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Widget Mode Toggle */}
        <button
          onClick={onToggleWidgetMode}
          className="hidden lg:flex items-center gap-1 px-2 py-1 bg-[#0D47A1]/50 hover:bg-[#0D47A1] text-[#90CAF9] hover:text-[#E3F2FD] border border-[#0D47A1] rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0"
          title="Ubah ke Mode Widget Desktop Mini"
        >
          <Layers className="w-3 h-3 text-[#2196F3]" />
          <span>Mode Widget</span>
        </button>

        {/* Install / Widget Guide Button */}
        <button
          onClick={onOpenInstallGuide}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#0D47A1] hover:bg-[#2196F3] text-white border border-[#2196F3]/50 rounded text-[11px] font-bold transition-all shadow-xs cursor-pointer shrink-0"
          title="Cara Pasang sebagai Widget / Aplikasi Windows"
        >
          <Download className="w-3 h-3 text-[#E3F2FD]" />
          <span>Instal di Windows</span>
        </button>
      </div>

      {/* Zone 3: Windows Status & Controls */}
      <div className="flex items-center gap-2">
        {/* Active Alarms Indicator Button */}
        <button
          onClick={onOpenReminders}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors text-xs cursor-pointer ${
            activeAlarmsCount > 0
              ? 'bg-[#2196F3]/20 text-[#E3F2FD] border border-[#2196F3]/50 hover:bg-[#2196F3]/30'
              : 'text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/40'
          }`}
          title={`${activeAlarmsCount} alarm aktif terjadwal`}
        >
          <Bell className={`w-3.5 h-3.5 ${activeAlarmsCount > 0 ? 'text-[#90CAF9]' : ''}`} />
          <span className="font-mono tabular-nums text-[11px] font-semibold">
            {activeAlarmsCount}
          </span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
          className="p-1.5 text-[#90CAF9] hover:text-[#E3F2FD] hover:bg-[#0D47A1]/50 rounded transition-colors cursor-pointer"
          title={settings.soundEnabled ? 'Suara alarm aktif' : 'Suara alarm dibisukan'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 text-[#90CAF9]" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          )}
        </button>

        {/* Live Windows Clock in #0D47A1 and #E3F2FD */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#0D47A1]/40 border border-[#0D47A1]/80 rounded text-[#90CAF9] font-mono text-[11px] tabular-nums">
          <span>{currentDate}</span>
          <span className="text-[#90CAF9]/50">·</span>
          <span className="font-bold text-[#E3F2FD]">{currentTime}</span>
        </div>

        {/* Windows Window Controls (Minimize, Maximize, Close) */}
        <div className="flex items-center -mr-2 ml-1">
          <button
            onClick={onToggleMinimize}
            className="w-9 h-10 inline-flex items-center justify-center text-[#90CAF9] hover:text-white hover:bg-[#0D47A1]/60 transition-colors cursor-pointer"
            title={isMinimized ? 'Pulihkan Jendela' : 'Minimalkan'}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleFullscreen}
            className="w-9 h-10 inline-flex items-center justify-center text-[#90CAF9] hover:text-white hover:bg-[#0D47A1]/60 transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Maksimalkan'}
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Tutup aplikasi WinMemo? Catatan Anda tersimpan aman secara otomatis.')) {
                onToggleMinimize();
              }
            }}
            className="w-10 h-10 inline-flex items-center justify-center text-[#90CAF9] hover:text-white hover:bg-red-600 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
