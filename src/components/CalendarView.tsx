import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Clock, 
  Plus, 
} from 'lucide-react';
import { Note } from '../types';
import { formatIndonesianDate, getTodayDateString } from '../utils/dateUtils';

interface CalendarViewProps {
  notes: Note[];
  onSelectDateToCreate: (date: string) => void;
  onEditNote: (note: Note) => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  notes,
  onSelectDateToCreate,
  onEditNote,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0-6)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Previous month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const todayStr = getTodayDateString();

  // Filter notes for selected date
  const notesOnSelectedDate = notes.filter((n) => {
    if (n.isDeleted || n.isArchived) return false;
    if (n.hasAlarm && n.alarmDate === selectedDateStr) return true;
    if (n.createdAt.startsWith(selectedDateStr)) return true;
    return false;
  });

  // Build grid days
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push(formattedDate);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none text-[#E3F2FD]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0D47A1]/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#E3F2FD] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#2196F3]" />
            <span>Kalender Jadwal & Pengingat</span>
          </h1>
          <p className="text-xs text-[#90CAF9] mt-0.5">
            Lihat sebaran catatan dan alarm berdasarkan tanggal kalender.
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-[#0D47A1] hover:bg-[#2196F3] text-white transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-[#E3F2FD] text-sm min-w-36 text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-[#0D47A1] hover:bg-[#2196F3] text-white transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-[#061838] border border-[#0D47A1] rounded-2xl p-4 shadow-sm">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[#90CAF9] pb-2 border-b border-[#0D47A1]/60 mb-2">
            {DAY_NAMES.map((name, idx) => (
              <div key={idx} className={idx === 0 ? 'text-rose-400' : ''}>
                {name}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`blank-${idx}`} className="h-16 rounded-lg bg-[#040e21]/40" />;
              }

              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;

              const dayNotes = notes.filter(
                (n) => !n.isDeleted && !n.isArchived && ((n.hasAlarm && n.alarmDate === dateStr) || n.createdAt.startsWith(dateStr))
              );
              const dayAlarms = dayNotes.filter((n) => n.hasAlarm && n.alarmDate === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#2196F3] bg-[#0D47A1]/50 ring-2 ring-[#2196F3]'
                      : isToday
                      ? 'border-[#2196F3]/80 bg-[#081e3f]'
                      : 'border-[#0D47A1]/40 bg-[#05142b]/60 hover:border-[#2196F3]/60 hover:bg-[#081e3f]/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span
                      className={`font-semibold font-mono ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#2196F3] text-white flex items-center justify-center text-[10px] font-bold shadow-xs'
                          : isSelected
                          ? 'text-[#E3F2FD] font-bold'
                          : 'text-[#90CAF9]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayAlarms.length > 0 && (
                      <span className="flex items-center gap-0.5 text-[#2196F3] text-[9px] font-mono font-bold bg-[#0D47A1] px-1 rounded">
                        <Bell className="w-2.5 h-2.5 fill-current" />
                        <span>{dayAlarms.length}</span>
                      </span>
                    )}
                  </div>

                  {/* Tiny indicators */}
                  <div className="flex items-center gap-1 overflow-hidden">
                    {dayNotes.slice(0, 2).map((n) => (
                      <span
                        key={n.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          n.hasAlarm ? 'bg-[#2196F3]' : 'bg-[#90CAF9]'
                        }`}
                      />
                    ))}
                    {dayNotes.length > 2 && (
                      <span className="text-[9px] text-[#90CAF9]">+{dayNotes.length - 2}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Side Panel */}
        <div className="bg-[#061838] border border-[#0D47A1] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="border-b border-[#0D47A1] pb-3 mb-3">
              <span className="text-[11px] font-bold text-[#90CAF9] uppercase tracking-wider">
                Agenda Tanggal Terpilih
              </span>
              <h2 className="text-sm font-bold text-[#E3F2FD] mt-0.5">
                {formatIndonesianDate(selectedDateStr)}
              </h2>
            </div>

            {/* List notes on date */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {notesOnSelectedDate.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#90CAF9] border border-dashed border-[#0D47A1] rounded-xl">
                  Tidak ada catatan atau alarm pada tanggal ini.
                </div>
              ) : (
                notesOnSelectedDate.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onEditNote(n)}
                    className="p-3 rounded-xl bg-[#081e3f] border border-[#0D47A1] hover:border-[#2196F3] transition-all cursor-pointer text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-[#E3F2FD] px-1.5 py-0.2 rounded bg-[#0D47A1]">
                        {n.category}
                      </span>
                      {n.hasAlarm && (
                        <span className="flex items-center gap-1 text-[11px] text-[#2196F3] font-mono font-bold">
                          <Clock className="w-3 h-3" />
                          <span>{n.alarmTime}</span>
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-[#E3F2FD] truncate">{n.title}</div>
                    {n.content && (
                      <div className="text-[11px] text-[#90CAF9] truncate mt-0.5">{n.content}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#0D47A1] mt-3">
            <button
              onClick={() => onSelectDateToCreate(selectedDateStr)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#2196F3] hover:bg-[#1e88e5] text-white rounded-xl text-xs font-bold shadow-md shadow-[#2196F3]/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Catatan & Alarm di Tanggal Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
