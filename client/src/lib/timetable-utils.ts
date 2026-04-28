export const DAYS = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export const DEFAULT_PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "08:00", end: "08:45" },
  2: { start: "08:45", end: "09:30" },
  3: { start: "09:30", end: "10:15" },
  4: { start: "10:30", end: "11:15" },
  5: { start: "11:15", end: "12:00" },
  6: { start: "12:00", end: "12:45" },
  7: { start: "13:30", end: "14:15" },
  8: { start: "14:15", end: "15:00" },
};

export function getTodayDayNumber(): number | null {
  const day = new Date().getDay();
  if (day === 0) return null;
  return day;
}

export function getCurrentPeriod(): number | null {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  for (const [period, times] of Object.entries(DEFAULT_PERIOD_TIMES)) {
    if (hhmm >= times.start && hhmm < times.end) {
      return Number(period);
    }
  }
  return null;
}

export function subjectColor(subjectName: string): string {
  const colors = [
    "bg-primary/8 text-primary border-primary/20",
    "bg-gold/10 text-gold-dark border-gold/30",
    "bg-emerald-50 text-emerald-700 border-emerald-200",
    "bg-blue-50 text-blue-700 border-blue-200",
    "bg-orange-50 text-orange-700 border-orange-200",
    "bg-purple-50 text-purple-700 border-purple-200",
  ];
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
