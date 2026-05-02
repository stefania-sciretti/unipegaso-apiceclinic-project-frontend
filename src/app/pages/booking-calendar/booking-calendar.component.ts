import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import { catchError, of } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT } from '../../shared/constants/colors.constants';
import { StatusBadgePipe } from '../../shared/status-badge.pipe';
import { APPOINTMENT_STATUS_LABELS } from '../../shared/constants/appointment-status.constants';

interface BookingEvent {
  id: number;
  type: 'fitness' | 'clinical';
  specialistRole: string;
  title: string;
  start: Date;
  specialistName: string;
  patientName: string;
  serviceType: string;
  note?: string;
  status: string;
}

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [DatePipe, NgClass, NgStyle, StatusBadgePipe],
  providers: [DatePipe],
  templateUrl: './booking-calendar.component.html'
})
export class BookingCalendarComponent implements OnInit {
  private readonly appointmentSvc = inject(AppointmentService);
  private readonly datePipe       = inject(DatePipe);
  private readonly today          = new Date();

  readonly viewMode      = signal<'month' | 'week'>('month');
  readonly currentDate   = signal(new Date());
  readonly events        = signal<BookingEvent[]>([]);
  readonly loading       = signal(true);
  readonly loadError     = signal(false);
  readonly selectedEvent = signal<BookingEvent | null>(null);

  readonly dayLabels     = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  readonly dayLabelsLong = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  readonly weekDays = computed<Date[]>(() => {
    const ref  = new Date(this.currentDate());
    const day  = ref.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    ref.setDate(ref.getDate() + diff);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ref);
      d.setDate(ref.getDate() + i);
      return d;
    });
  });

  readonly weekLabel = computed<string>(() => {
    const days  = this.weekDays();
    const start = days[0];
    const end   = days[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} – ${this.datePipe.transform(end, 'd MMM yyyy', '', 'it-IT') ?? ''}`;
    }
    return `${this.datePipe.transform(start, 'd MMM', '', 'it-IT') ?? ''} – ${this.datePipe.transform(end, 'd MMM yyyy', '', 'it-IT') ?? ''}`;
  });

  ngOnInit(): void {
    this.load();
  }

  private readonly clinicalRoles = new Set(['SPORT_DOCTOR', 'PHYSIOTHERAPIST']);

  load(): void {
    this.loading.set(true);
    this.loadError.set(false);

    this.appointmentSvc.getAll().pipe(
      catchError(() => { this.loadError.set(true); return of([]); })
    ).subscribe({
      next: (appointments) => {
        this.events.set(
          appointments.map(a => ({
            id:             a.id,
            type:           this.clinicalRoles.has(a.specialistRole) ? 'clinical' as const : 'fitness' as const,
            specialistRole: a.specialistRole,
            title:          a.serviceType,
            start:          new Date(a.scheduledAt),
            specialistName: a.specialistFullName,
            patientName:    a.patientFullName,
            serviceType:    a.serviceType,
            note:           a.notes,
            status:         a.status
          }))
          .sort((a, b) => a.start.getTime() - b.start.getTime())
        );
        this.loading.set(false);
      }
    });
  }

  getCalendarDays(): number[] {
    const year  = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: number[] = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) days.push(0);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(0);
    return days;
  }

  getEventsForMonthDay(day: number): BookingEvent[] {
    if (day === 0) return [];
    const y = this.currentDate().getFullYear();
    const m = this.currentDate().getMonth();
    return this.events().filter(e =>
      e.start.getFullYear() === y &&
      e.start.getMonth()    === m &&
      e.start.getDate()     === day
    );
  }

  isToday(day: number): boolean {
    if (day === 0) return false;
    return (
      this.today.getFullYear() === this.currentDate().getFullYear() &&
      this.today.getMonth()    === this.currentDate().getMonth()    &&
      this.today.getDate()     === day
    );
  }

  getEventsForWeekDay(date: Date): BookingEvent[] {
    return this.events().filter(e =>
      e.start.getFullYear() === date.getFullYear() &&
      e.start.getMonth()    === date.getMonth()    &&
      e.start.getDate()     === date.getDate()
    );
  }

  isWeekDayToday(date: Date): boolean {
    return (
      date.getFullYear() === this.today.getFullYear() &&
      date.getMonth()    === this.today.getMonth()    &&
      date.getDate()     === this.today.getDate()
    );
  }

  previousPeriod(): void {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    this.currentDate.set(d);
  }

  nextPeriod(): void {
    const d = new Date(this.currentDate());
    if (this.viewMode() === 'month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    this.currentDate.set(d);
  }

  goToToday(): void { this.currentDate.set(new Date()); }

  openEvent(event: BookingEvent): void { this.selectedEvent.set(event); }
  closePopover(): void                  { this.selectedEvent.set(null); }

  statusLabel(s: string): string { return APPOINTMENT_STATUS_LABELS[s] ?? s; }

  eventBgColor(specialistRole: string): string {
    switch (specialistRole) {
      case 'PERSONAL_TRAINER':                    return COLOR_PRIMARY;
      case 'SPORT_DOCTOR': case 'PHYSIOTHERAPIST': return COLOR_SECONDARY;
      case 'NUTRITIONIST': case 'DIETOLOGIST':    return COLOR_ACCENT;
      default:                                    return COLOR_SECONDARY;
    }
  }
}
