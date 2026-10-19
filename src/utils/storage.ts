import { AppSettings, Note } from '../types';
import { getCurrentTimeString, getTodayDateString, getTomorrowDateString } from './dateUtils';

const STORAGE_KEY_NOTES = 'winmemo_notes_v1';
const STORAGE_KEY_SETTINGS = 'winmemo_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultAlarmTone: 'windows-chime',
  alarmVolume: 0.85,
  desktopNotificationsEnabled: true,
  showWindowsWindowFrame: true,
  soundEnabled: true,
};

export const INITIAL_SAMPLE_NOTES: Note[] = [
  {
    id: 'sample-1',
    title: 'Rapat Koordinasi Operasional & Logistik',
    content: 'Membahas evaluasi pengiriman barang cabang, ketersediaan armada, dan update SOP penerimaan barang masuk ke gudang pusat.',
    category: 'Kerja',
    color: 'blue',
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasChecklist: true,
    checklist: [
      { id: 'c1', text: 'Siapkan laporan rekap pengiriman mingguan', completed: true },
      { id: 'c2', text: 'Cek stok barang buffer zone rak B4 - C2', completed: true },
      { id: 'c3', text: 'Koordinasi dengan kepala regu shift siang', completed: false },
      { id: 'c4', text: 'Bagikan notulensi rapat ke grup tim', completed: false },
    ],
    hasAlarm: true,
    alarmDate: getTodayDateString(),
    alarmTime: getCurrentTimeString(45), // 45 minutes from now
    alarmTone: 'windows-chime',
    alarmRepeat: 'none',
    alarmStatus: 'active',
    tags: ['Logistik', 'Gudang', 'Rapat'],
  },
  {
    id: 'sample-2',
    title: 'Daftar Kebutuhan & Belanja Perlengkapan',
    content: 'Perlengkapan inventaris kantor dan gudang yang perlu dibeli untuk kuartal ini.',
    category: 'Tugas',
    color: 'emerald',
    isPinned: true,
    isArchived: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    hasChecklist: true,
    checklist: [
      { id: 'c5', text: 'Kertas thermal printer resi 80mm (5 karton)', completed: true },
      { id: 'c6', text: 'Lakban coklat tebal 2 inch (1 dus)', completed: false },
      { id: 'c7', text: 'Baterai cadangan barcode scanner wireless', completed: false },
      { id: 'c8', text: 'Tinta printer label pengiriman', completed: true },
      { id: 'c9', text: 'Spidol permanen hitam & merah', completed: false },
    ],
    hasAlarm: false,
    alarmDate: '',
    alarmTime: '',
    alarmTone: 'marimba',
    alarmRepeat: 'none',
    alarmStatus: 'dismissed',
    tags: ['Inventaris', 'Belanja'],
  },
  {
    id: 'sample-3',
    title: 'Penting: Konfirmasi Maintenance & Audit Server',
    content: 'Jadwal pemeliharaan server database inventaris lokal. Pastikan backup snapshot selesai sebelum jam 21:00.',
    category: 'Penting',
    color: 'rose',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
    hasChecklist: true,
    checklist: [
      { id: 'c10', text: 'Kirim pengumuman downtime ke seluruh divisi', completed: true },
      { id: 'c11', text: 'Jalankan full database dump & simpan ke cloud backup', completed: false },
      { id: 'c12', text: 'Verifikasi integritas restore file backup', completed: false },
    ],
    hasAlarm: true,
    alarmDate: getTomorrowDateString(),
    alarmTime: '09:00',
    alarmTone: 'radar',
    alarmRepeat: 'none',
    alarmStatus: 'active',
    tags: ['Server', 'Penting', 'Audit'],
  },
  {
    id: 'sample-4',
    title: 'Ide Peningkatan Kecepatan Packing',
    content: 'Gunakan sistem layout warna berdasarkan zona kategori barang. Area fast-moving diletakkan dekat meja packaging utama untuk memangkas jarak jalan tim picking hingga 35%.',
    category: 'Ide',
    color: 'purple',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date().toISOString(),
    hasChecklist: false,
    checklist: [],
    hasAlarm: false,
    alarmDate: '',
    alarmTime: '',
    alarmTone: 'gentle-bell',
    alarmRepeat: 'none',
    alarmStatus: 'dismissed',
    tags: ['Inovasi', 'Efisiensi'],
  },
  {
    id: 'sample-5',
    title: 'Pengingat Minum Air & Istirahat Mata',
    content: 'Jaga kesehatan selama bekerja di depan monitor. Terapkan aturan 20-20-20 setiap 2 jam.',
    category: 'Pribadi',
    color: 'cyan',
    isPinned: false,
    isArchived: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    hasChecklist: false,
    checklist: [],
    hasAlarm: true,
    alarmDate: getTodayDateString(),
    alarmTime: '15:00',
    alarmTone: 'digital-beep',
    alarmRepeat: 'daily',
    alarmStatus: 'active',
    tags: ['Kesehatan', 'Rutinitas'],
  },
];

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTES);
    if (!raw) {
      saveNotes(INITIAL_SAMPLE_NOTES);
      return INITIAL_SAMPLE_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_NOTES;
  } catch (e) {
    console.error('Failed to load notes from localStorage:', e);
    return INITIAL_SAMPLE_NOTES;
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes to localStorage:', e);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}
