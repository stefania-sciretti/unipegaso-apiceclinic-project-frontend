import { Component, computed, inject, resource } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SpecialistService } from '../../services/specialist.service';
import { Specialist } from '../../models/models';

export interface SpecialistCard {
  firstName: string;
  lastName: string;
  role: string;
  gender: 'male' | 'female';
  image: string;
  route: string;
}

// Visual enrichment not provided by the API (gender for Italian title, local image asset)
const SPECIALIST_ENRICHMENT: Record<string, { gender: 'male' | 'female'; image: string }> = {
  simona:    { gender: 'female', image: 'assets/icons/simona.webp'    },
  luca:      { gender: 'male',   image: 'assets/icons/luca.webp'      },
  sandro:    { gender: 'male',   image: 'assets/icons/sandro.webp'    },
  michele:   { gender: 'male',   image: 'assets/icons/michele.webp'   },
  cristiana: { gender: 'female', image: 'assets/icons/cristiana.webp' },
};

@Component({
  selector: 'app-specialists',
  standalone: true,
  imports: [],
  templateUrl: './specialists.component.html'
})
export class SpecialistsComponent {
  private readonly specialistService = inject(SpecialistService);
  private readonly router            = inject(Router);

  private readonly allSpecialists = resource({
    loader: () => firstValueFrom(this.specialistService.getAll()),
  });

  readonly loading = computed(() => this.allSpecialists.isLoading());

  readonly specialists = computed<SpecialistCard[]>(() =>
    (this.allSpecialists.value() ?? []).map(s => this.toCard(s))
  );

  private toCard(s: Specialist): SpecialistCard {
    const key        = s.firstName.toLowerCase();
    const enrichment = SPECIALIST_ENRICHMENT[key] ?? { gender: 'male' as const, image: 'assets/icons/default.webp' };
    return {
      firstName: s.firstName,
      lastName:  s.lastName,
      role:      this.roleTranslate(s.role),
      gender:    enrichment.gender,
      image:     enrichment.image,
      route:     `/specialist/${key}`,
    };
  }

  roleTranslate(role: string): string {
    switch (role) {
      case 'NUTRITIONIST':   return 'Nutrizionista';
      case 'PHYSIOTHERAPIST': return 'Fisioterapista';
      case 'DIETOLOGIST':    return 'Dietologa';
      case 'PERSONAL_TRAINER': return 'Personal Trainer';
      case 'SPORT_DOCTOR':   return 'Medico Sportivo';
      default: return role;
    }
  }

  navigateTo(route: string): void { this.router.navigate([route]); }
}
