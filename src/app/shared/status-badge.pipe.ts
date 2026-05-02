import { Pipe, PipeTransform } from '@angular/core';

export type BadgeStyle = 'appointment' | 'glycemia';

const BASE = 'inline-block px-[0.65rem] py-[0.2rem] rounded-xl text-[0.75rem] font-bold uppercase tracking-[0.5px]';

const APPOINTMENT_COLORS: Record<string, string> = {
  BOOKED:    'bg-sky-100 text-sky-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-50 text-[var(--primary)]',
  CANCELLED: 'bg-red-100 text-[var(--danger)]',
  SCHEDULED: 'bg-purple-100 text-purple-800',
  PENDING:   'bg-yellow-100 text-yellow-800',
};

const GLYCEMIA_COLORS: Record<string, string> = {
  NORMALE:    'bg-green-100 text-green-800',
  ATTENZIONE: 'bg-yellow-100 text-yellow-800',
  ELEVATA:    'bg-red-100 text-[var(--danger)]',
};

@Pipe({
  name: 'statusBadge',
  standalone: true,
  pure: true
})
export class StatusBadgePipe implements PipeTransform {
  transform(value: string, style: BadgeStyle = 'appointment'): string {
    const map = style === 'glycemia' ? GLYCEMIA_COLORS : APPOINTMENT_COLORS;
    return `${BASE} ${map[value] ?? 'bg-slate-100 text-slate-600'}`;
  }
}
