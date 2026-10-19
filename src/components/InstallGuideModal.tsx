import React from 'react';
import { 
  X, 
  Download, 
  Monitor, 
  CheckCircle, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Maximize2,
  Clock,
  Pin
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstall: () => void;
  onToggleWidgetMode: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  onInstall,
  onToggleWidgetMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="bg-[#071a38] border-2 border-[#2196F3] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] text-[#E3F2FD]">
        {/* Title Bar */}
        <div className="h-11 bg-[#05142b] border-b border-[#0D47A1] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-[#2196F3]" />
            <span className="text-xs font-bold text-[#E3F2FD]">
              Panduan Instalasi WinMemo sebagai Widget / Aplikasi Windows
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-[#90CAF9] hover:text-white hover:bg-[#0D47A1] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Header Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0D47A1] to-[#08234d] border border-[#2196F3]/50 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                <Sparkles className="w-4 h-4 text-[#90CAF9]" />
                <span>Jadikan Widget Desktop & Aplikasi Mandiri di Windows</span>
              </div>
              <p className="text-[11px] text-[#90CAF9] leading-relaxed">
                WinMemo didesain menggunakan standar PWA Windows 11. Anda dapat memasangnya tanpa installer berat, memunculkannya di Taskbar Windows, dan menjalankannya sebagai widget mini yang melayang di layar.
              </p>
            </div>

            {/* Quick Install Button if browser supports it */}
            {isInstallable && (
              <button
                onClick={() => {
                  onInstall();
                  onClose();
                }}
                className="px-4 py-2.5 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-xl font-bold flex items-center gap-2 shrink-0 shadow-lg shadow-[#2196F3]/30 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instal Sekarang</span>
              </button>
            )}
          </div>

          {/* MODE 1: Mode Widget Melayang di Aplikasi */}
          <div className="p-4 rounded-xl bg-[#061838] border border-[#0D47A1] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2196F3]">
                <Layers className="w-4 h-4" />
                <span>Fitur Bawaan: Mode Widget Mini (Sticky Note)</span>
              </div>
              <button
                onClick={() => {
                  onToggleWidgetMode();
                  onClose();
                }}
                className="px-3 py-1 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Beralih ke Mode Widget</span>
              </button>
            </div>
            <p className="text-[11px] text-[#90CAF9] leading-relaxed">
              Anda bisa mengubah tampilan software ini menjadi **jendela widget mini yang kompak** di sudut layar monitor Anda. Widget ini menampilkan jam, status alarm berikutnya, dan daftar ceklis tugas cepat tanpa memakan banyak tempat di layar kerja Anda.
            </p>
          </div>

          {/* Cara 1: Microsoft Edge (Browser Resmi Windows 10 & 11) */}
          <div className="p-4 rounded-xl bg-[#061838] border border-[#0D47A1] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E3F2FD]">
              <span className="w-5 h-5 rounded-full bg-[#2196F3] text-white flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span>Melalui Microsoft Edge (Rekomendasi Terbaik di Windows):</span>
            </div>

            <ol className="space-y-2 pl-7 list-decimal text-[11px] text-[#90CAF9] leading-relaxed">
              <li>
                Buka aplikasi ini di <strong>Microsoft Edge</strong>.
              </li>
              <li>
                Klik tombol menu titik tiga <strong className="text-white bg-[#0D47A1] px-1.5 py-0.5 rounded">···</strong> di pojok kanan atas browser Edge.
              </li>
              <li>
                Pilih menu <strong className="text-white">Aplikasi (Apps)</strong> lalu klik <strong className="text-[#2196F3] bg-[#0D47A1]/60 px-1.5 py-0.5 rounded">"Instal situs ini sebagai aplikasi"</strong> (atau klik ikon instal di bilah alamat URL).
              </li>
              <li>
                Beri nama <strong className="text-white">WinMemo Widget</strong> lalu klik <strong>Instal</strong>.
              </li>
              <li>
                Pada jendela konfirmasi Windows, centang opsi:
                <div className="mt-1 space-y-1 pl-2 text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#2196F3]" />
                    <span><strong>Sematkan ke Bilah Tugas (Pin to Taskbar)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#2196F3]" />
                    <span><strong>Sematkan ke Mulai (Pin to Start Menu)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-[#2196F3]" />
                    <span><strong>Mulai otomatis saat masuk ke perangkat</strong></span>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* Cara 2: Google Chrome */}
          <div className="p-4 rounded-xl bg-[#061838] border border-[#0D47A1] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#E3F2FD]">
              <span className="w-5 h-5 rounded-full bg-[#0D47A1] text-white flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <span>Melalui Google Chrome di Windows:</span>
            </div>

            <ol className="space-y-2 pl-7 list-decimal text-[11px] text-[#90CAF9] leading-relaxed">
              <li>
                Klik ikon menu titik tiga <strong className="text-white bg-[#0D47A1] px-1.5 py-0.5 rounded">⋮</strong> di kanan atas Chrome.
              </li>
              <li>
                Arahkan ke <strong className="text-white">Simpan dan bagikan (Save and share)</strong>.
              </li>
              <li>
                Pilih <strong className="text-[#2196F3] bg-[#0D47A1]/60 px-1.5 py-0.5 rounded">"Instal WinMemo..."</strong>.
              </li>
              <li>
                Aplikasi akan langsung terbuka sebagai jendela independen tanpa bilah alamat browser, persis seperti software Windows asli!
              </li>
            </ol>
          </div>

          {/* Tip Menjadikannya Widget di Sudut Layar */}
          <div className="p-3.5 rounded-xl bg-[#0D47A1]/30 border border-[#2196F3]/40 text-[11px] text-[#90CAF9] flex items-start gap-2.5">
            <Pin className="w-4 h-4 text-[#2196F3] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Tips Posisi Widget di Layar Windows:</strong>
              <p className="mt-0.5">
                Setelah terinstal, gunakan tombol <strong>"Mode Widget"</strong> di dalam aplikasi atau kecilkan ukuran jendela lalu posisikan di sisi samping atau sudut desktop Anda. Anda juga bisa menekan tombol pintasan Windows <kbd className="px-1.5 py-0.5 bg-[#0D47A1] rounded text-white font-mono">Win + Tombol Panah Kanan/Kiri</kbd> untuk menempelkan widget secara rapi di samping layar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 bg-[#05142b] border-t border-[#0D47A1] px-4 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#90CAF9]">
            {isInstalled ? '✅ Aplikasi telah terinstal di perangkat Anda' : 'Tersedia untuk Windows 10 & Windows 11'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
