const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const dayName = DAYS_ID[d.getDay()];
  const dateNum = d.getDate();
  const monthName = MONTHS_ID[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${dateNum} ${monthName} ${year}`;
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const dateNum = d.getDate();
  const monthShort = MONTHS_ID[d.getMonth()].slice(0, 3);
  return `${dateNum} ${monthShort}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${date}`;
}

export function getCurrentTimeString(offsetMinutes: number = 0): string {
  const d = new Date();
  if (offsetMinutes !== 0) {
    d.setMinutes(d.getMinutes() + offsetMinutes);
  }
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export interface AlarmCountdownInfo {
  isDue: boolean;
  isOverdue: boolean;
  statusText: string;
  diffMinutes: number;
}

export function getAlarmStatus(
  alarmDate: string,
  alarmTime: string,
  snoozeUntil?: string
): AlarmCountdownInfo {
  if (!alarmDate || !alarmTime) {
    return { isDue: false, isOverdue: false, statusText: '', diffMinutes: 0 };
  }

  const now = new Date();
  let target: Date;

  if (snoozeUntil) {
    target = new Date(snoozeUntil);
  } else {
    const [year, month, day] = alarmDate.split('-').map(Number);
    const [hours, minutes] = alarmTime.split(':').map(Number);
    target = new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  const diffMs = target.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMs) <= 30000) {
    return {
      isDue: true,
      isOverdue: false,
      statusText: 'Waktunya berdering sekarang!',
      diffMinutes: 0,
    };
  }

  if (diffMs < 0) {
    const absMin = Math.abs(diffMinutes);
    let overdueText = '';
    if (absMin < 60) {
      overdueText = `Lewat ${absMin} mnt lalu`;
    } else if (absMin < 1440) {
      const h = Math.floor(absMin / 60);
      const m = absMin % 60;
      overdueText = `Lewat ${h} jam ${m > 0 ? `${m} mnt` : ''} lalu`;
    } else {
      const days = Math.floor(absMin / 1440);
      overdueText = `Terlewat ${days} hari lalu`;
    }
    return {
      isDue: false,
      isOverdue: true,
      statusText: overdueText,
      diffMinutes,
    };
  }

  // Future
  let futureText = '';
  if (diffMinutes < 60) {
    futureText = `Dalam ${diffMinutes} menit`;
  } else if (diffMinutes < 1440) {
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    futureText = `Dalam ${h} jam ${m > 0 ? `${m} m` : ''}`;
  } else {
    const days = Math.floor(diffMinutes / 1440);
    futureText = `Dalam ${days} hari`;
  }

  return {
    isDue: false,
    isOverdue: false,
    statusText: futureText,
    diffMinutes,
  };
}
