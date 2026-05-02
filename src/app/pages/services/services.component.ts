import { Component, computed, inject, resource } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SpecialistService } from '../../services/specialist.service';

interface ServiceItem {
  icon: string;
  name: string;
  description: string;
  duration?: string;
}

interface ServiceCategory {
  key: string;
  label: string;
  color: string;
  bgColor: string;
  services: ServiceItem[];
  open: boolean;
}

interface AreaConfig {
  key: string;
  areaName: string;
  roleMatcher: (role: string) => boolean;
  services: ServiceItem[];
}

const AREA_CONFIGS: AreaConfig[] = [
  {
    key: 'clinico',
    areaName: 'Area Clinica',
    roleMatcher: (role) => /medico|sport/i.test(role),
    services: [
      { icon: 'assignment', name: 'Visita di Idoneità Sportiva', duration: '45 min',
        description: 'Certificazione medica per attività sportive agonistiche e non agonistiche, con ECG e spirometria.' },
      { icon: 'healing', name: 'Trattamento Infortuni Sportivi', duration: '45 min',
        description: 'Diagnosi e trattamento di distorsioni, contratture, tendinopatie e altri infortuni legati all\'attività fisica.' },
      { icon: 'speed', name: 'Test da Sforzo', duration: '30 min',
        description: 'Valutazione della capacità cardiorespiratoria tramite test ergometrici per definire le zone di allenamento ottimali.' },
      { icon: 'shield', name: 'Prevenzione Infortuni',
        description: 'Programmi preventivi personalizzati per ridurre il rischio di infortuni nello sport e nel lavoro fisico.' },
      { icon: 'medical_services', name: 'Terapia Infiltrativa', duration: '30 min',
        description: 'Infiltrazioni di acido ialuronico, PRP e corticosteroidi per il trattamento di patologie articolari e tendinee.' },
      { icon: 'trending_up', name: 'Ottimizzazione della Performance',
        description: 'Consulenza medica per atleti agonisti volta a massimizzare le prestazioni nel rispetto della salute.' },
    ]
  },
  {
    key: 'nutrizione',
    areaName: 'Area Nutrizione',
    roleMatcher: (role) => /nutri|dietol/i.test(role),
    services: [
      { icon: 'restaurant_menu', name: 'Piano Alimentare Personalizzato', duration: '60 min',
        description: 'Elaborazione di piani nutrizionali su misura basati su analisi della composizione corporea e obiettivi specifici.' },
      { icon: 'monitor_weight', name: 'Analisi Composizione Corporea (BIA)', duration: '20 min',
        description: 'Misurazione di massa grassa, massa magra, acqua corporea totale e metabolismo basale tramite bioimpedenziometria.' },
      { icon: 'favorite', name: 'Nutrizione Clinica', duration: '45 min',
        description: 'Supporto nutrizionale per patologie metaboliche come diabete, ipertensione, dislipidemia e intolleranze alimentari.' },
      { icon: 'bolt', name: 'Nutrizione Sportiva e Performance', duration: '45 min',
        description: 'Piani alimentari specifici per atleti: gestione del timing dei nutrienti, recupero e supplementazione mirata.' },
      { icon: 'water_drop', name: 'Gestione dell\'Idratazione',
        description: 'Strategie per mantenere un corretto equilibrio idrico prima, durante e dopo l\'attività fisica.' },
      { icon: 'groups', name: 'Educazione Alimentare',
        description: 'Percorsi di consapevolezza alimentare per individui e famiglie, con focus sulla corretta lettura delle etichette.' },
      { icon: 'refresh', name: 'Follow-up e Monitoraggio', duration: '30 min',
        description: 'Visite di controllo periodiche per adattare il piano nutrizionale all\'evoluzione del paziente.' },
    ]
  },
  {
    key: 'sport',
    areaName: 'Area Sport',
    roleMatcher: (role) => /personal trainer|fitness|trainer/i.test(role),
    services: [
      { icon: 'fitness_center', name: 'Personal Training', duration: '60 min',
        description: 'Sessioni individuali di allenamento personalizzate in base agli obiettivi, al livello di fitness e alle condizioni fisiche del cliente.' },
      { icon: 'directions_run', name: 'Allenamento Funzionale', duration: '60 min',
        description: 'Programmi basati su movimenti naturali per migliorare forza, equilibrio, coordinazione e resistenza nella vita quotidiana.' },
      { icon: 'sports', name: 'Preparazione Atletica', duration: '60 min',
        description: 'Piani di allenamento specifici per atleti amatoriali e agonisti, con periodizzazione e peak performance.' },
      { icon: 'self_improvement', name: 'Programma Dimagrimento', duration: '60 min',
        description: 'Training ad alta intensità (HIIT) e circuiti mirati per la riduzione del grasso corporeo e il miglioramento della composizione corporea.' },
      { icon: 'accessibility_new', name: 'Tonificazione Muscolare', duration: '60 min',
        description: 'Schede di allenamento progressive per la definizione e l\'aumento della massa muscolare magra.' },
      { icon: 'psychology', name: 'Coaching Motivazionale',
        description: 'Supporto psicologico e motivazionale per mantenere la costanza nel percorso di allenamento e superare i momenti di stallo.' },
    ]
  },
  {
    key: 'fisioterapia',
    areaName: 'Area Fisioterapia',
    roleMatcher: (role) => /fisioterapi|physio/i.test(role),
    services: [
      { icon: 'back_hand', name: 'Fisioterapia Muscoloscheletrica', duration: '60 min',
        description: 'Trattamento di patologie muscolo-scheletriche: dolori articolari, tendinopatie, lombalgie e cervicalgie attraverso tecniche fisioterapiche mirate.' },
      { icon: 'airline_seat_flat', name: 'Riabilitazione Post-Chirurgica', duration: '60 min',
        description: 'Percorsi riabilitativi personalizzati dopo interventi ortopedici per recuperare la funzionalità e tornare alla vita quotidiana.' },
      { icon: 'accessibility_new', name: 'Terapia Manuale', duration: '45 min',
        description: 'Tecniche specifiche di mobilizzazione articolare e manipolazione per ridurre il dolore e migliorare la mobilità.' },
      { icon: 'sports_handball', name: 'Fisioterapia Sportiva', duration: '60 min',
        description: 'Valutazione e trattamento degli infortuni sportivi, con programmi di recupero per tornare all\'attività fisica in sicurezza.' },
      { icon: 'self_improvement', name: 'Rieducazione Posturale', duration: '60 min',
        description: 'Programmi personalizzati per la correzione di squilibri posturali, scoliosi e paramorfismi attraverso esercizi specifici.' },
      { icon: 'psychology', name: 'Fisioterapia Neurologica', duration: '60 min',
        description: 'Trattamento fisioterapico per patologie neurologiche come ictus, sclerosi multipla e Parkinson per migliorare la funzionalità motoria.' },
    ]
  }
];

@Component({
  selector: 'app-services',
  imports: [CommonModule, UpperCasePipe],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  private readonly specialistSvc = inject(SpecialistService);

  private readonly allSpecialists = resource({
    loader: () => firstValueFrom(this.specialistSvc.getAll()),
  });

  readonly loading = computed(() => this.allSpecialists.isLoading());

  readonly categories = computed<ServiceCategory[]>(() => {
    const specialists = this.allSpecialists.value();

    // On error or before data arrives, show all configured areas as a fallback.
    if (this.allSpecialists.error() || !specialists) {
      return AREA_CONFIGS.map(config => ({
        key:      config.key,
        label:    config.areaName,
        color:    'var(--primary)',
        bgColor:  'var(--primary-light)',
        services: config.services,
        open:     true,
      }));
    }

    return AREA_CONFIGS
      .filter(config => specialists.some(s => config.roleMatcher(s.role)))
      .map(config => ({
        key:      config.key,
        label:    config.areaName,
        color:    'var(--primary)',
        bgColor:  'var(--primary-light)',
        services: config.services,
        open:     true,
      }));
  });

  toggle(cat: ServiceCategory): void {
    cat.open = !cat.open;
  }
}
