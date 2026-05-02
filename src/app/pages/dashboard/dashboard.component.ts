import { Component, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { BookingService, PendingBooking } from '../../services/booking.service';
import { ButtonComponent } from '../../components/ui/button/button.component';

interface Service {
  id: string;
  name: string;
  icon: string;
  appointmentType?: string;
}

interface ServiceArea {
  id: string;
  label: string;
  icon: string;
  services: Service[];
}

interface Doctor {
  id: number;
  name: string;
  title: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NgOptimizedImage, ButtonComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  private readonly router              = inject(Router);
  private readonly appointmentSvc     = inject(AppointmentService);
  protected readonly auth             = inject(AuthService);
  private readonly bookingSvc         = inject(BookingService);

  selectedArea: ServiceArea | null = null;
  selectedService: Service | null = null;
  selectedDate  = '';
  selectedTime  = '';
  minDate       = '';
  maxDate       = '';
  bookingLoading = false;
  showAreaDropdown = false;
  currentMonth: Date = new Date();

  private readonly staffMapping: {[key: string]: number} = {
    sandro: 1, simona: 2, cristiana: 3, mihai: 4, luca: 5
  };

  readonly doctors: {[key: string]: Doctor} = {
    sandro:    { id: 1, name: 'Dott. Sandro Scrigoni',     title: 'Medico dello Sport',      icon: 'medical_services' },
    simona:    { id: 2, name: 'Dott.ssa Simona Ruberti',   title: 'Biologa Nutrizionista',   icon: 'restaurant_menu'  },
    cristiana: { id: 3, name: 'Dott.ssa Cristiana Maratti',title: 'Nutrizionista Sportiva',  icon: 'restaurant_menu'  },
    mihai:     { id: 4, name: 'Dott. Mihai Lavretti',      title: 'Fisioterapista',          icon: 'back_hand'        },
    luca:      { id: 5, name: 'Dott. Luca Siretta',        title: 'Personal Trainer ISSA',   icon: 'fitness_center'   }
  };

  readonly serviceAreas: ServiceArea[] = [
    {
      id: 'clinica', label: 'Area Clinica', icon: 'medical_services',
      services: [
        { id: 'clinica-1', name: 'Visita di Idoneità Sportiva',       icon: 'assignment',      appointmentType: 'clinical' },
        { id: 'clinica-2', name: 'Trattamento Infortuni Sportivi',    icon: 'healing',         appointmentType: 'clinical' },
        { id: 'clinica-3', name: 'Test da Sforzo',                    icon: 'speed',           appointmentType: 'clinical' },
        { id: 'clinica-4', name: 'Prevenzione Infortuni',             icon: 'shield',          appointmentType: 'clinical' },
        { id: 'clinica-5', name: 'Terapia Infiltrativa',              icon: 'medical_services',appointmentType: 'clinical' },
        { id: 'clinica-6', name: 'Ottimizzazione della Performance',  icon: 'trending_up',     appointmentType: 'clinical' },
      ]
    },
    {
      id: 'nutrizione', label: 'Area Nutrizione', icon: 'restaurant_menu',
      services: [
        { id: 'nutri-1', name: 'Piano Alimentare Personalizzato',     icon: 'restaurant_menu', appointmentType: 'fitness' },
        { id: 'nutri-2', name: 'Analisi Composizione Corporea (BIA)', icon: 'monitor_weight',  appointmentType: 'fitness' },
        { id: 'nutri-3', name: 'Nutrizione Clinica',                  icon: 'favorite',        appointmentType: 'fitness' },
        { id: 'nutri-4', name: 'Nutrizione Sportiva e Performance',   icon: 'bolt',            appointmentType: 'fitness' },
        { id: 'nutri-5', name: 'Gestione dell\'Idratazione',          icon: 'water_drop',      appointmentType: 'fitness' },
        { id: 'nutri-6', name: 'Educazione Alimentare',               icon: 'groups',          appointmentType: 'fitness' },
      ]
    },
    {
      id: 'fisioterapia', label: 'Area Fisioterapia', icon: 'back_hand',
      services: [
        { id: 'fisio-1', name: 'Fisioterapia Muscoloscheletrica',   icon: 'back_hand',               appointmentType: 'fitness' },
        { id: 'fisio-2', name: 'Riabilitazione Post-Chirurgica',    icon: 'airline_seat_flat',       appointmentType: 'fitness' },
        { id: 'fisio-3', name: 'Terapia Manuale',                   icon: 'accessibility_new',       appointmentType: 'fitness' },
        { id: 'fisio-4', name: 'Fisioterapia Sportiva',             icon: 'sports_handball',         appointmentType: 'fitness' },
        { id: 'fisio-5', name: 'Rieducazione Posturale',            icon: 'self_improvement',        appointmentType: 'fitness' },
        { id: 'fisio-6', name: 'Fisioterapia Neurologica',          icon: 'psychology',              appointmentType: 'fitness' },
      ]
    },
    {
      id: 'sport', label: 'Area Sport', icon: 'fitness_center',
      services: [
        { id: 'sport-1', name: 'Personal Training',          icon: 'fitness_center',    appointmentType: 'fitness' },
        { id: 'sport-2', name: 'Allenamento Funzionale',     icon: 'directions_run',    appointmentType: 'fitness' },
        { id: 'sport-3', name: 'Preparazione Atletica',      icon: 'sports',            appointmentType: 'fitness' },
        { id: 'sport-4', name: 'Programma Dimagrimento',     icon: 'self_improvement',  appointmentType: 'fitness' },
        { id: 'sport-5', name: 'Tonificazione Muscolare',    icon: 'accessibility_new', appointmentType: 'fitness' },
        { id: 'sport-6', name: 'Coaching Motivazionale',     icon: 'psychology',        appointmentType: 'fitness' },
      ]
    }
  ];

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

  selectArea(area: ServiceArea): void    { this.selectedArea = area; this.selectedService = null; }
  backToAreas(): void                    { this.selectedArea = null; this.selectedService = null; }
  selectService(service: Service): void  { this.selectedService = service; }

  getCalendarDays(): number[] {
    const year     = this.currentMonth.getFullYear();
    const month    = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
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

  getSelectedDoctor(): Doctor | null {
    if (!this.selectedArea) return null;
    let key: string;
    if (this.selectedArea.id === 'nutrizione') {
      key = Math.random() > 0.5 ? 'simona' : 'cristiana';
    } else if (this.selectedArea.id === 'fisioterapia') {
      key = 'mihai';
    } else if (this.selectedArea.id === 'sport') {
      key = 'luca';
    } else {
      key = 'sandro';
    }
    return this.doctors[key] ?? null;
  }

  getAvailableSlots(): string[] {
    if (!this.selectedDate) return [];
    const today = new Date();
    const selected = new Date(`${this.selectedDate}T00:00:00`);
    if (selected <= today) return [];
    return ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];
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

    const specialistId = this.resolveSpecialistId();
    const appointmentDateTime = `${this.selectedDate}T${this.selectedTime}:00`;

    if (!this.auth.currentUser) {
      const pendingBooking: PendingBooking = {
        specialistId,
        scheduledAt: appointmentDateTime,
        serviceType: this.selectedService.name,
        appointmentType: this.selectedService.appointmentType as 'fitness' | 'clinical',
        visitType: this.selectedService.appointmentType === 'clinical' ? this.selectedService.name : undefined
      };
      this.bookingSvc.setPendingBooking(pendingBooking);
      this.auth.openLoginModal();
      return;
    }

    this.bookingLoading = true;

    if (this.selectedService.appointmentType === 'clinical') {
      this.bookingLoading = false;
      alert(`Prenotazione confermata per ${this.selectedService.name} il ${this.formatDateDisplay(this.selectedDate)} alle ${this.selectedTime}`);
      this.resetForm();
    } else {
      this.appointmentSvc.create({
        patientId:    this.auth.currentUser.id,
        specialistId: specialistId,
        scheduledAt: appointmentDateTime,
        serviceType: this.selectedService.name
      }).subscribe({
        next: () => {
          this.bookingLoading = false;
          alert(`Prenotazione confermata per ${this.selectedService?.name} il ${this.formatDateDisplay(this.selectedDate)} alle ${this.selectedTime}`);
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.bookingLoading = false;
          alert('Errore nella prenotazione: ' + (err.error?.message ?? 'Riprova più tardi'));
        }
      });
    }
  }

  private resolveSpecialistId(): number {
    if (this.selectedArea?.id === 'nutrizione')  return Math.random() > 0.5 ? this.staffMapping['simona'] : this.staffMapping['cristiana'];
    if (this.selectedArea?.id === 'fisioterapia')  return this.staffMapping['mihai'];
    if (this.selectedArea?.id === 'sport')       return this.staffMapping['luca'];
    return this.staffMapping['sandro'];
  }

  private formatDateDisplay(date: string): string {
    return new Date(date).toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  private resetForm(): void {
    this.selectedArea    = null;
    this.selectedService = null;
    this.selectedDate    = '';
    this.selectedTime    = '';
    this.showAreaDropdown = false;
  }

  navigate(path: string): void { this.router.navigate([path]); }
}
