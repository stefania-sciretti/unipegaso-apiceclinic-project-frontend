import { Component, computed, inject, resource, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SpecialistService } from '../../services/specialist.service';
import { ClinicServicesService } from '../../services/clinic-services.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { ServiceResponse, Specialist } from '../../models/models';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';

interface ServiceCategory {
  areaId: number;
  label: string;
  services: ServiceResponse[];
  open: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, ButtonComponent, FormControlDirective, FormLabelDirective],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  private readonly specialistSvc = inject(SpecialistService);
  private readonly clinicSvc     = inject(ClinicServicesService);
  readonly authSvc               = inject(AuthService);
  private readonly alertSvc      = inject(AlertService);
  private readonly fb            = inject(FormBuilder);

  private readonly allSpecialists = resource({
    loader: () => firstValueFrom(this.specialistSvc.getAll()),
  });

  private readonly allServices = resource({
    loader: () => firstValueFrom(this.clinicSvc.getAll()),
  });

  readonly loading = computed(() =>
    this.allServices.isLoading() || this.allSpecialists.isLoading()
  );

  readonly specialists = computed<Specialist[]>(() =>
    this.allSpecialists.value() ?? []
  );

  readonly categories = computed<ServiceCategory[]>(() => {
    const services = this.allServices.value() ?? [];

    const map = new Map<number, { areaName: string; services: ServiceResponse[] }>();
    for (const s of services) {
      const entry = map.get(s.areaId);
      if (entry) {
        entry.services.push(s);
      } else {
        map.set(s.areaId, { areaName: s.areaName, services: [s] });
      }
    }

    return Array.from(map.entries()).map(([areaId, { areaName, services }]) => ({
      areaId,
      label: areaName,
      services,
      open: true,
    }));
  });

  readonly showForm = signal(false);
  readonly saving   = signal(false);

  readonly form: FormGroup = this.fb.group({
    service:      ['', [Validators.required, Validators.maxLength(255)]],
    price:        [null, [Validators.required, Validators.min(0)]],
    specialistId: [null, Validators.required],
  });

  toggle(cat: ServiceCategory): void {
    cat.open = !cat.open;
  }

  openForm(): void {
    this.form.reset();
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      await firstValueFrom(this.clinicSvc.create(this.form.getRawValue()));
      this.alertSvc.show('Servizio creato con successo', 'success');
      this.closeForm();
      this.allServices.reload();
    } finally {
      this.saving.set(false);
    }
  }
}
