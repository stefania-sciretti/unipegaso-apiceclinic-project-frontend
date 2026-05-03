import { Component, computed, inject, resource } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { BookingService, PendingBooking } from '../../services/booking.service';
import { ClinicServicesService } from '../../services/clinic-services.service';
import { SpecialistService } from '../../services/specialist.service';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { ServiceResponse, Specialist } from '../../models/models';

interface BookingArea {
  id: number;
  label: string;
  icon: string;
  image: string;
  appointmentType: 'fitness' | 'clinical';
  navPath: string;
  navLabel: string;
  services: ServiceResponse[];
}

const AREA_CONFIG: Record<string, Omit<BookingArea, 'id' | 'services'>> = {
  'Alimentazione': { label: 'Area Nutrizione', icon: 'restaurant_menu',  image: 'assets/images/nutrition.webp', appointmentType: 'fitness',  navPath: '/nutrition', navLabel: 'Vedi piani nutrizionali →'     },
  'Sport':         { label: 'Area Sport',       icon: 'fitness_center',   image: 'assets/images/gym.webp',       appointmentType: 'fitness',  navPath: '/training',  navLabel: 'Vedi schede allenamento →'    },
  'Clinica':       { label: 'Area Clinica',     icon: 'medical_services', image: 'assets/images/visit.webp',     appointmentType: 'clinical', navPath: '/services',  navLabel: 'Vedi tutte le prestazioni →' },
};

@Component({
  selector: 'app-homepage',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './homepage.component.html'
})
export class HomepageComponent {
  private readonly router         = inject(Router);
  private readonly appointmentSvc = inject(AppointmentService);
  protected readonly auth         = inject(AuthService);
  private readonly bookingSvc     = inject(BookingService);
  private readonly clinicSvc      = inject(ClinicServicesService);
  private readonly specialistSvc  = inject(SpecialistService);

  private readonly allServices = resource({
    loader: () => firstValueFrom(this.clinicSvc.getAll()),
  });

  private readonly allSpecialists = resource({
    loader: () => firstValueFrom(this.specialistSvc.getAll()),
  });

  readonly loading = computed(() =>
    this.allServices.isLoading() || this.allSpecialists.isLoading()
  );

  readonly bookingAreas = computed<BookingArea[]>(() => {
    const services = this.allServices.value() ?? [];
    const areaMap = new Map<number, BookingArea>();
    for (const s of services) {
      if (!areaMap.has(s.areaId)) {
        const cfg = AREA_CONFIG[s.areaName] ?? {
          label: 'Area ' + s.areaName, icon: 'medical_services', image: '',
          appointmentType: 'fitness' as const, navPath: '/services', navLabel: 'Vedi prestazioni →',
        };
        areaMap.set(s.areaId, { id: s.areaId, ...cfg, services: [] });
      }
      areaMap.get(s.areaId)!.services.push(s);
    }
    return [...areaMap.values()];
  });

  selectedArea: BookingArea | null = null;
  selectedService: ServiceResponse | null = null;
  selectedDate   = '';
  selectedTime   = '';
  minDate        = '';
  maxDate        = '';
  bookingLoading = false;
  showAreaDropdown = false;
  currentMonth: Date = new Date();

  constructor() {
    this.initDateRange();
  }

  private initDateRange(): void {
    const today = new Date();
    this.minDate = this.formatDateForInput(today);
    const maxDateObj = new Date(today);
    maxDateObj.setMonth(maxDateObj.getMonth() + 4);
    this.maxDate = this.formatDateForInput(maxDateObj);
  }

  private formatDateForInput(date: Date): string {
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectArea(area: BookingArea): void           { this.selectedArea = area; this.selectedService = null; }
  backToAreas(): void                           { this.selectedArea = null; this.selectedService = null; }
  selectService(service: ServiceResponse): void { this.selectedService = service; }

  getCalendarDays(): number[] {
    const year        = this.currentMonth.getFullYear();
    const month       = this.currentMonth.getMonth();
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: number[] = [];
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) days.push(0);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }

  previousMonth(): void { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1); }
  nextMonth(): void     { this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1); }

  selectCalendarDate(day: number): void {
    if (day === 0 || this.isDateDisabled(day)) return;
    const year  = this.currentMonth.getFullYear();
    const month = String(this.currentMonth.getMonth() + 1).padStart(2, '0');
    const date  = String(day).padStart(2, '0');
    this.selectedDate = `${year}-${month}-${date}`;
  }

  isDateSelected(day: number): boolean {
    if (day === 0) return false;
    const year  = this.currentMonth.getFullYear();
    const month = String(this.currentMonth.getMonth() + 1).padStart(2, '0');
    const date  = String(day).padStart(2, '0');
    return this.selectedDate === `${year}-${month}-${date}`;
  }

  isDateDisabled(day: number): boolean {
    if (day === 0) return true;
    const date  = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today;
  }

  getSelectedSpecialist(): Specialist | null {
    if (!this.selectedService) return null;
    return this.allSpecialists.value()?.find(sp => sp.id === this.selectedService!.specialistId) ?? null;
  }

  getAvailableSlots(): string[] {
    return [];
  }

  selectTime(time: string): void { this.selectedTime = time; }

  bookAppointment(): void {
    if (!this.selectedService || !this.selectedDate || !this.selectedTime) {
      alert('Per favore completa tutti i campi');
      return;
    }

    const selectedDateTime = new Date(`${this.selectedDate}T${this.selectedTime}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDateTime <= today) {
      alert('Non puoi prenotare per oggi. Scegli una data da domani in poi');
      return;
    }

    const specialistId        = this.selectedService.specialistId;
    const appointmentDateTime = `${this.selectedDate}T${this.selectedTime}:00`;
    const appointmentType     = this.selectedArea?.appointmentType ?? 'fitness';

    if (!this.auth.currentUser) {
      const pendingBooking: PendingBooking = {
        specialistId,
        scheduledAt:     appointmentDateTime,
        serviceType:     this.selectedService.service,
        appointmentType,
        visitType: appointmentType === 'clinical' ? this.selectedService.service : undefined,
      };
      this.bookingSvc.setPendingBooking(pendingBooking);
      this.auth.openLoginModal();
      return;
    }

    this.bookingLoading = true;

    if (appointmentType === 'clinical') {
      this.bookingLoading = false;
      alert(`Prenotazione confermata per ${this.selectedService.service} il ${this.formatDateDisplay(this.selectedDate)} alle ${this.selectedTime}`);
      this.resetForm();
    } else {
      this.appointmentSvc.create({
        patientId:   this.auth.currentUser.id,
        specialistId,
        scheduledAt: appointmentDateTime,
        serviceType: this.selectedService.service,
      }).subscribe({
        next: () => {
          this.bookingLoading = false;
          alert(`Prenotazione confermata per ${this.selectedService?.service} il ${this.formatDateDisplay(this.selectedDate)} alle ${this.selectedTime}`);
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.bookingLoading = false;
          alert('Errore nella prenotazione: ' + (err.error?.message ?? 'Riprova più tardi'));
        }
      });
    }
  }

  private formatDateDisplay(date: string): string {
    return new Date(date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  private resetForm(): void {
    this.selectedArea     = null;
    this.selectedService  = null;
    this.selectedDate     = '';
    this.selectedTime     = '';
    this.showAreaDropdown = false;
  }

  navigate(path: string): void { this.router.navigate([path]); }
}
