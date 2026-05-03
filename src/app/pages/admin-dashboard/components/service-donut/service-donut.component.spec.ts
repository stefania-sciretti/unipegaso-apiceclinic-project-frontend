import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceDonutComponent } from './service-donut.component';
import { RevenueByService } from '../../../../models/dashboard.model';

const MOCK_DATA: RevenueByService[] = [
  { service: 'Nutrizione', total: 5000 },
  { service: 'Fitness', total: 7450 },
  { service: 'Osteopatia', total: 3000 }
];

describe('ServiceDonutComponent', () => {
  let fixture: ComponentFixture<ServiceDonutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDonutComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(ServiceDonutComponent);
    fixture.componentRef.setInput('data', MOCK_DATA);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('buildOptions should extract series (totals) and labels (services)', () => {
    const opts = fixture.componentInstance.buildOptions(MOCK_DATA) as any;
    expect(opts.series).toEqual([5000, 7450, 3000]);
    expect(opts.labels).toEqual(['Nutrizione', 'Fitness', 'Osteopatia']);
  });

  it('buildOptions should use donut chart type', () => {
    const opts = fixture.componentInstance.buildOptions(MOCK_DATA) as any;
    expect(opts.chart.type).toBe('donut');
  });
});
