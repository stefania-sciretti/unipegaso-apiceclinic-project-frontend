import {Component, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {NavbarComponent} from './components/navbar/navbar.component';
import {ConfirmModalComponent} from './components/confirm-modal/confirm-modal.component';
import { initFlowbite } from 'flowbite'; 

@Component({
    selector: 'app-root',
    imports: [RouterModule, NavbarComponent, ConfirmModalComponent],
    template: `
    <app-navbar></app-navbar>
    <div class="page-content">
      <router-outlet></router-outlet>
    </div>
    <footer class="app-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <img src="assets/logo/logo-full.svg" alt="Apice Clinic" style="height:32px;width:auto;filter:brightness(0) invert(1);" />
        </div>
        <div class="footer-contacts">
          <a href="mailto:prenotazioni@apiceclinic.com" class="footer-link">
            <span class="material-icons" style="font-size:1rem">mail_outline</span>
            prenotazioni&#64;apiceclinic.com
          </a>
          <a href="mailto:informazioni@apiceclinic.com" class="footer-link">
            <span class="material-icons" style="font-size:1rem">mail_outline</span>
            informazioni&#64;apiceclinic.com
          </a>
          <a href="tel:+393480000000" class="footer-link">
            <span class="material-icons" style="font-size:1rem">phone</span>
            +39 348 000 0000
          </a>
        </div>
        <div class="footer-nav">
          <a [routerLink]="['/faq']" class="footer-link">
            <span class="material-icons" style="font-size:1rem">help_outline</span>
            <span class="footer-link-text">Domande Frequenti (FAQ)</span>
          </a>
        </div>
        <div class="footer-copy">
          © 2026 Apice Clinic — Tutti i diritti riservati
        </div>
      </div>
    </footer>
    <app-confirm-modal></app-confirm-modal>
  `
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    initFlowbite();
  }
}
