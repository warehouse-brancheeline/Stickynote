import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  BellRing, 
  Volume2, 
  CheckCircle, 
  ExternalLink 
} from 'lucide-react';
import { Note } from '../types';
import { stopAlarmLoop } from '../utils/audioSynthesizer';

interface AlarmRingingModalProps {
  ringingNote: Note | null;
  onDismiss: (noteId: string) => void;
  onSnooze: (noteId: string, minutes: number) => void;
  onOpenNote: (note: Note) => void;
}

export const AlarmRingingModal: React.FC<AlarmRingingModalProps> = ({
  ringingNote,
  onDismiss,
  onSnooze,
  onOpenNote,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!ringingNote) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in zoom-in-95 duration-200">
      <div className="bg-[#071a38] border-2 border-[#2196F3] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#E3F2FD]">
        {/* Top Alert Bar */}
        <div className="h-10 bg-gradient-to-r from-red-600 via-rose-600 to-[#0D47A1] px-4 flex items-center justify-between text-white font-bold text-xs">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 animate-bounce" />
            <span className="tracking-wider">ALARM PENGINGAT BERDERING!</span>
          </div>
          <span className="font-mono tabular-nums text-xs font-bold bg-black/30 px-2 py-0.5 rounded text-[#E3F2FD]">
            {currentTime}
          </span>
        </div>

        {/* Modal Center Content */}
        <div className="p-6 text-center space-y-4">
          {/* Animated Alarm Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#2196F3]/20 text-[#2196F3] border border-[#2196F3]/50 animate-alarm-pulse mx-auto shadow-lg shadow-[#2196F3]/25">
            <Bell className="w-10 h-10 fill-current animate-wiggle" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#E3F2FD] bg-[#0D47A1] border border-[#2196F3]/40 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
              {ringingNote.category}
            </span>
            <h2 className="text-xl font-bold text-[#E3F2FD] tracking-tight leading-snug">
              {ringingNote.title || 'Pengingat Waktu'}
            </h2>
            {ringingNote.content && (
              <p className="text-sm text-[#E3F2FD]/85 mt-2 max-w-md mx-auto line-clamp-3 bg-[#05142b] p-3 rounded-xl border border-[#0D47A1] text-left">
                {ringingNote.content}
              </p>
            )}
          </div>

          {/* Checklist reminder snippet */}
          {ringingNote.hasChecklist && ringingNote.checklist && ringingNote.checklist.length > 0 && (
            <div className="text-left bg-[#05142b] p-3 rounded-xl border border-[#0D47A1] max-h-32 overflow-y-auto space-y-1.5 text-xs text-[#E3F2FD]">
              <div className="text-[11px] font-bold text-[#90CAF9] mb-1 uppercase tracking-wide">
                Daftar Tugas Terkait:
              </div>
              {ringingNote.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full border ${
                      item.completed ? 'bg-[#2196F3] border-[#90CAF9]' : 'border-[#0D47A1]'
                    }`}
                  />
                  <span className={item.completed ? 'line-through text-[#90CAF9]/60' : 'text-[#E3F2FD]'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-[#90CAF9] pt-1">
            <Volume2 className="w-4 h-4 text-[#2196F3] animate-pulse" />
            <span>Memutar nada: <strong className="text-[#E3F2FD] capitalize">{ringingNote.alarmTone.replace('-', ' ')}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#05142b] border-t border-[#0D47A1] flex flex-col gap-2">
          {/* Dismiss Primary Button */}
          <button
            onClick={() => onDismiss(ringingNote.id)}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Matikan Alarm (Dismiss)</span>
          </button>

          {/* Snooze & Details Secondary Options */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => onSnooze(ringingNote.id, 5)}
              className="py-2 bg-[#0D47A1] hover:bg-[#0D47A1]/80 text-[#E3F2FD] border border-[#2196F3]/40 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Tunda 5 Mnt
            </button>
            <button
              onClick={() => onSnooze(ringingNote.id, 10)}
              className="py-2 bg-[#0D47A1] hover:bg-[#0D47A1]/80 text-[#E3F2FD] border border-[#2196F3]/40 rounded-lg font-semibold transition-colors cursor-pointer"
            >
              Tunda 10 Mnt
            </button>
            <button
              onClick={() => {
                stopAlarmLoop();
                onOpenNote(ringingNote);
              }}
              className="py-2 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Detail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
