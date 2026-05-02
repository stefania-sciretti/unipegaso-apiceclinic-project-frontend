import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../components/ui/button/button.component';

interface Faq {
  q: string;
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  imports: [RouterModule, NgClass, ButtonComponent],
  templateUrl: './faq.component.html'
})
export class FaqComponent {
  constructor() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  faqs: Faq[] = [
    {
      q: 'Come si prenotano le prestazioni?',
      a: 'È possibile prenotare in due modi:\n• Telefonando al numero: +39 348 000 0000\n• Inviando una mail a: prenotazioni@apiceclinic.com\nUna volta loggato come paziente, puoi anche prenotare direttamente dal portale cliccando su "Prenota" nella barra di navigazione.',
      open: false
    },
    {
      q: 'Come posso eseguire il login?',
      a: 'Clicca sul pulsante "Login" in alto a destra nella barra di navigazione. Si aprirà una finestra in cui inserire username e password. Sono disponibili due ruoli: Admin (medici e staff) e Utente (pazienti).',
      open: false
    },
    {
      q: 'Dove posso vedere le prestazioni della clinica?',
      a: 'Clicca sul tasto "Prestazioni" nella barra di navigazione, oppure clicca sull\'immagine "Area Clinica" nella home page. La pagina è accessibile a tutti senza necessità di login.',
      open: false
    },
    {
      q: 'Come posso visualizzare i miei referti?',
      a: 'Effettua il login con le tue credenziali da paziente. Nella barra di navigazione apparirà la voce "I miei referti" da cui potrai consultare tutti i referti clinici associati al tuo profilo.',
      open: false
    },
    {
      q: 'Chi sono i professionisti della clinica?',
      a: 'Puoi conoscere il nostro staff cliccando su "Staff" nella barra di navigazione o visitando le pagine dedicate a ciascun professionista. Il team è composto da: Dott.ssa Simona Ruberti (Biologa Nutrizionista), Dott. Luca Siretta (Personal Trainer ISSA), Dott. Marco Lavecri (Medico dello Sport), Dott. Mihai Lavretti (Osteopata).',
      open: false
    },
    {
      q: 'Come posso contattare la clinica per informazioni?',
      a: 'Puoi contattarci nei seguenti modi:\n• Telefono: +39 348 000 0000\n• Email prenotazioni: prenotazioni@apiceclinic.com\n• Email informazioni: informazioni@apiceclinic.com\nIl nostro staff risponde dal lunedì al venerdì, dalle 9:00 alle 18:00.',
      open: false
    }
  ];

  toggle(faq: Faq): void {
    faq.open = !faq.open;
  }
}
