import { Component, computed, effect, inject, resource } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpecialistService } from '../../../services/specialist.service';
import { roleTranslate } from '../../specialists/specialists.component';
import { getServicesByRole, SpecialistServiceItem } from '../specialist-data';

// Visual enrichment not available from the API (gender for Italian title, local image).
const SPECIALIST_ENRICHMENT: Record<string, { gender: 'male' | 'female'; image: string }> = {
  simona:    { gender: 'female', image: 'assets/icons/simona.webp'    },
  luca:      { gender: 'male',   image: 'assets/icons/luca.webp'      },
  sandro:    { gender: 'male',   image: 'assets/icons/sandro.webp'    },
  michele:   { gender: 'male',   image: 'assets/icons/michele.webp'     },
  cristiana: { gender: 'female', image: 'assets/icons/cristiana.webp' },
};

export interface SpecialistMemberView {
  title: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  services: SpecialistServiceItem[];
}

@Component({
  selector: 'app-specialist-detail',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './specialist-detail.component.html'
})
export class SpecialistDetailComponent {
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly specialistSvc  = inject(SpecialistService);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map(p => p.get('slug') ?? ''))
  );

  readonly allSpecialists = resource({
    loader: () => firstValueFrom(this.specialistSvc.getAll()),
  });

  private readonly found = computed(() => {
    const list = this.allSpecialists.value();
    const slug = this.slug() ?? '';
    return list?.find(s => s.firstName.toLowerCase() === slug);
  });

  readonly member = computed<SpecialistMemberView | undefined>(() => {
    const s = this.found();
    if (!s) return undefined;
    const key        = s.firstName.toLowerCase();
    const enrichment = SPECIALIST_ENRICHMENT[key] ?? { gender: 'male' as const, image: 'assets/icons/default.webp' };
    return {
      title:    enrichment.gender === 'female' ? 'Dott.ssa' : 'Dott.',
      name:     `${s.lastName} ${s.firstName}`,
      role:     roleTranslate(s.role),
      photo:    enrichment.image,
      bio:      s.bio ?? '',
      services: getServicesByRole(s.role),
    };
  });

  readonly isLoading = computed(() => this.allSpecialists.isLoading());
  readonly hasError  = computed(() => !!this.allSpecialists.error());

  constructor() {
    // Redirect to the specialists list when loading finishes and slug has no match.
    effect(() => {
      if (!this.allSpecialists.isLoading() && !this.allSpecialists.error()) {
        const list = this.allSpecialists.value();
        if (list && !this.found()) {
          this.router.navigate(['/specialists']);
        }
      }
    });
  }
}
