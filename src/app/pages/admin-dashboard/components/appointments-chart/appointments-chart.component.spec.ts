import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsChartComponent } from './appointments-chart.component';
import { AppointmentsByMonth } from '../../../../models/dashboard.model';

const MOCK_DATA: AppointmentsByMonth[] = [
  { month: 'Gen', booked: 80, completed: 70, cancelled: 10 },
  { month: 'Feb', booked: 90, completed: 80, cancelled: 10 }
];

describe('AppointmentsChartComponent', () => {
  let fixture: ComponentFixture<AppointmentsChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsChartComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(AppointmentsChartComponent);
    fixture.componentRef.setInput('data', MOCK_DATA);
    fixture.componentRef.setInput('period', '1m');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('buildOptions should have 3 series (booked, completed, cancelled)', () => {
    const opts = (fixture.componentInstance as any).buildOptions(MOCK_DATA);
    expect(opts.series.length).toBe(3);
    expect(opts.series[0].name).toBe('Prenotati');
    expect(opts.series[1].name).toBe('Completati');
    expect(opts.series[2].name).toBe('Cancellati');
  });

  it('buildOptions should map data correctly', () => {
    const opts = (fixture.componentInstance as any).buildOptions(MOCK_DATA);
    expect(opts.series[0].data).toEqual([80, 90]);
    expect(opts.series[2].data).toEqual([10, 10]);
    expect(opts.xaxis.categories).toEqual(['Gen', 'Feb']);
  });
});
