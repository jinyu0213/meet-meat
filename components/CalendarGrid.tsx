import Link from 'next/link';
import clsx from 'clsx';
import { format, isSameMonth } from 'date-fns';

import { AVAILABILITY_STATUS } from '@/lib/constants';
import { formatDateKey } from '@/lib/date';

type Props = {
  days: Date[];
  currentMonth: Date;
  entryMap: Record<string, string>;
  username: string;
  selectedDate?: string;
};

const statusColor: Record<string, string> = {
  [AVAILABILITY_STATUS.OPEN]: 'bg-emerald-400/80 text-slate-900',
  [AVAILABILITY_STATUS.BUSY]: 'bg-rose-400/80 text-white',
  [AVAILABILITY_STATUS.CLOSED]: 'bg-slate-500/70 text-white',
  [AVAILABILITY_STATUS.NONE]: 'bg-slate-700/60 text-white',
};

export function CalendarGrid({ days, currentMonth, entryMap, username, selectedDate }: Props) {
  return (
    <div className="grid grid-cols-7 gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-xs">
      {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
        <div key={day} className="text-white/50">
          {day}
        </div>
      ))}
      {days.map((day) => {
        const key = formatDateKey(day);
        const status = entryMap[key];
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isSelected = selectedDate === key;

        return (
          <Link
            key={key}
            href={`/profile/${username}?date=${key}`}
            scroll={false}
            className={clsx(
              'rounded-xl border border-transparent p-2 transition hover:border-white/20 hover:bg-white/10',
              !isCurrentMonth && 'opacity-40',
              isSelected && 'border-violet-400 bg-violet-500/10',
            )}
          >
            <div className="text-sm font-semibold text-white">{format(day, 'd')}</div>
            {status && (
              <span
                className={clsx(
                  'mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  statusColor[status] ?? 'bg-slate-600/70',
                )}
              >
                {status}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}






