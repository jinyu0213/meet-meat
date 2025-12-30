import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

export const getMonthDays = (current: Date) => {
  const start = startOfWeek(startOfMonth(current), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(current), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
};

export const ensureDate = (value: string) => {
  const date = startOfDay(parseISO(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error('잘못된 날짜 형식입니다.');
  }
  return date;
};

export const getNextMonthStart = (current: Date) => {
  const next = new Date(current);
  next.setMonth(current.getMonth() + 1, 1);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const todayKey = () => formatDateKey(startOfDay(new Date()));

export const isSameDayKey = (a: string, b: string) => a === b;






