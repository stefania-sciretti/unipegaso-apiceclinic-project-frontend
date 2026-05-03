import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiCardsComponent } from './kpi-cards.component';
import { DashboardKpi } from '../../../../models/dashboard.model';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

const MOCK_KPI: DashboardKpi = {
  revenueMonth: 12450, revenuePrevMonth: 11500,
  activePatients: 148, newPatients: 3,
  appointmentsMonth: 87, cancellationRate: 5, agendaOccupancy: 74
};

describe('KpiCardsComponent', () => {
  let fixture: ComponentFixture<KpiCardsComponent>;

  beforeEach(async () => {
    registerLocaleData(localeIt);
    await TestBed.configureTestingModule({
      imports: [KpiCardsComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(KpiCardsComponent);
    fixture.componentRef.setInput('kpi', MOCK_KPI);
    fixture.detectChanges();
  });

  it('should display revenue for the month', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('12.450');
  });

  it('should show positive delta in green', () => {
    const delta = fixture.nativeElement.querySelector('.text-green-600');
    expect(delta).toBeTruthy();
    expect(delta.textContent).toContain('▲');
  });

  it('should display active patients count', () => {
    expect(fixture.nativeElement.textContent).toContain('148');
  });

  it('should compute revenueDelta correctly (8%)', () => {
    const comp = fixture.componentInstance;
    expect(comp.revenueDelta()).toBe(8);
  });
});
