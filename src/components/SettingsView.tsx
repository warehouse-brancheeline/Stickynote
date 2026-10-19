import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Bell, 
  Play, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
} from 'lucide-react';
import { AlarmTone, AppSettings, Note } from '../types';
import { playToneMotif } from '../utils/audioSynthesizer';
import { requestNotificationPermission } from '../utils/notification';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  notes: Note[];
  onImportNotes: (imported: Note[]) => void;
  onResetSampleNotes: () => void;
  onClearAllNotes: () => void;
}

const TONES: { id: AlarmTone; name: string; desc: string }[] = [
  { id: 'windows-chime', name: 'Windows Chime', desc: 'Harmonik bel 4 nada khas Windows 11' },
  { id: 'digital-beep', name: 'Digital Beep', desc: 'Bunyi bip jam digital ganda' },
  { id: 'radar', name: 'Radar Alert', desc: 'Sapuan sonar frekuensi presisi tinggi' },
  { id: 'gentle-bell', name: 'Gentle Bell', desc: 'Lonceng rileks hangat menenangkan' },
  { id: 'marimba', name: 'Marimba Melody', desc: 'Melodi marimba ceria & energetik' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  notes,
  onImportNotes,
  onResetSampleNotes,
  onClearAllNotes,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string>(
    'Notification' in window ? Notification.permission : 'not-supported'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request browser notification permission
  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
    onUpdateSettings({ desktopNotificationsEnabled: granted });
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `winmemo_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportNotes(parsed);
          alert(`Berhasil memulihkan ${parsed.length} catatan dari cadangan!`);
        } else {
          alert('Format berkas cadangan JSON tidak valid.');
        }
      } catch {
        alert('Gagal membaca berkas cadangan JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl select-none text-[#E3F2FD]">
      {/* Top Header */}
      <div className="border-b border-[#0D47A1]/60 pb-4">
        <h1 className="text-xl font-bold text-[#E3F2FD] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#2196F3]" />
          <span>Pengaturan & Konfigurasi WinMemo</span>
        </h1>
        <p className="text-xs text-[#90CAF9] mt-0.5">
          Atur nada dering suara alarm, izin notifikasi Windows, volume audio, dan cadangan data Anda.
        </p>
      </div>

      {/* AUDIO & ALARM SECTION */}
      <div className="p-5 rounded-2xl bg-[#061838] border border-[#0D47A1] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#0D47A1]/60 pb-3">
          <Volume2 className="w-4 h-4 text-[#2196F3]" />
          <h2 className="text-sm font-bold text-[#E3F2FD]">
            Pengaturan Audio & Alarm Nyata
          </h2>
        </div>

        {/* Master Sound Switch */}
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-[#E3F2FD]">Suara Alarm & Efek Audio</div>
            <div className="text-[11px] text-[#90CAF9]">
              Bunyikan speaker ketika waktu alarm tiba
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs ${
              settings.soundEnabled
                ? 'bg-[#2196F3] hover:bg-[#1e88e5] text-white shadow-[#2196F3]/30'
                : 'bg-[#0D47A1] hover:bg-[#0D47A1]/80 text-[#90CAF9]'
            }`}
          >
            {settings.soundEnabled ? 'Suara Aktif' : 'Dibisukan'}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#90CAF9]">Volume Dering Alarm</span>
            <span className="font-mono tabular-nums text-[#E3F2FD] font-semibold">
              {Math.round(settings.alarmVolume * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-[#90CAF9]/60" />
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.alarmVolume}
              onChange={(e) => onUpdateSettings({ alarmVolume: parseFloat(e.target.value) })}
              className="w-full accent-[#2196F3] cursor-pointer"
            />
            <Volume2 className="w-4 h-4 text-[#2196F3]" />
          </div>
        </div>

        {/* Default Tone & Test */}
        <div className="pt-2">
          <div className="text-xs font-bold text-[#90CAF9] mb-2 uppercase tracking-wide">
            Pilihan Nada Default & Uji Coba:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {TONES.map((tone) => (
              <div
                key={tone.id}
                onClick={() => onUpdateSettings({ defaultAlarmTone: tone.id })}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  settings.defaultAlarmTone === tone.id
                    ? 'bg-[#0D47A1]/60 border-[#2196F3] text-[#E3F2FD]'
                    : 'bg-[#081e3f] border-[#0D47A1] text-[#90CAF9] hover:border-[#2196F3]/60'
                }`}
              >
                <div>
                  <div className="font-bold text-[#E3F2FD]">{tone.name}</div>
                  <div className="text-[10px] text-[#90CAF9]">{tone.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playToneMotif(tone.id, settings.alarmVolume);
                  }}
                  className="p-1.5 rounded-lg bg-[#0D47A1] hover:bg-[#2196F3] text-white"
                  title="Tes Suara Ini"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS SECTION */}
      <div className="p-5 rounded-2xl bg-[#061838] border border-[#0D47A1] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#0D47A1]/60 pb-3">
          <Bell className="w-4 h-4 text-[#2196F3]" />
          <h2 className="text-sm font-bold text-[#E3F2FD]">
            Notifikasi Desktop Windows
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-bold text-[#E3F2FD]">
              Izin Notifikasi Banner Sistem
            </div>
            <div className="text-[11px] text-[#90CAF9]">
              Tampilkan notifikasi Windows saat aplikasi di latar belakang atau terminimalkan
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold font-mono ${
                notificationStatus === 'granted'
                  ? 'bg-[#2196F3]/20 text-[#E3F2FD] border border-[#2196F3]/50'
                  : 'bg-[#0D47A1] text-[#90CAF9]'
              }`}
            >
              {notificationStatus === 'granted' ? 'Diizinkan' : 'Perlu Izin'}
            </span>
            {notificationStatus !== 'granted' && (
              <button
                onClick={handleRequestNotification}
                className="px-3.5 py-1.5 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg text-xs font-bold cursor-pointer shadow-md shadow-[#2196F3]/25"
              >
                Aktifkan Izin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BACKUP & DATA MANAGEMENT SECTION */}
      <div className="p-5 rounded-2xl bg-[#061838] border border-[#0D47A1] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#0D47A1]/60 pb-3">
          <ShieldCheck className="w-4 h-4 text-[#2196F3]" />
          <h2 className="text-sm font-bold text-[#E3F2FD]">
            Cadangan & Pengelolaan Data (Offline Storage)
          </h2>
        </div>

        <p className="text-xs text-[#90CAF9] leading-relaxed">
          Semua catatan, alarm, dan ceklis Anda tersimpan secara otomatis dan aman di browser perangkat lokal Anda tanpa perlu akun pihak ketiga.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Export */}
          <button
            onClick={handleExportBackup}
            className="p-3 rounded-xl bg-[#081e3f] hover:bg-[#0D47A1]/80 border border-[#0D47A1] text-[#E3F2FD] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-[#2196F3]" />
              <div className="text-left">
                <div className="font-bold text-[#E3F2FD]">Ekspor Cadangan (JSON)</div>
                <div className="text-[10px] text-[#90CAF9]">Unduh semua data ke file lokal</div>
              </div>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-[#081e3f] hover:bg-[#0D47A1]/80 border border-[#0D47A1] text-[#E3F2FD] flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-[#90CAF9]" />
              <div className="text-left">
                <div className="font-bold text-[#E3F2FD]">Impor Cadangan (JSON)</div>
                <div className="text-[10px] text-[#90CAF9]">Pulihkan catatan dari file</div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </button>
        </div>

        {/* Reset / Clear Actions */}
        <div className="pt-3 border-t border-[#0D47A1]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            onClick={() => {
              if (window.confirm('Muat ulang data contoh catatan bawaan?')) {
                onResetSampleNotes();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#081e3f] hover:bg-[#0D47A1] text-[#90CAF9] hover:text-[#E3F2FD] border border-[#0D47A1] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pulihkan Contoh Data Bawaan</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('PERINGATAN: Hapus semua catatan dan alarm secara permanen?')) {
                onClearAllNotes();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Catatan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
