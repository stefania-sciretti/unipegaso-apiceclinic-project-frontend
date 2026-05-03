import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceDonutComponent } from './service-donut.component';
import { RevenueByArea } from '../../../../models/dashboard.model';

const MOCK_DATA: RevenueByArea[] = [
  { area: { areaId: 1, areaName: 'Nutrizione' }, total: 5000 },
  { area: { areaId: 2, areaName: 'Fitness' }, total: 7450 },
  { area: { areaId: 3, areaName: 'Osteopatia' }, total: 3000 }
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
    expect(opts.labels).toEqual(['Nutrizione', 'Fitness', 'Osteopatia']); // labels now from area.areaName
  });

  it('buildOptions should use donut chart type', () => {
    const opts = fixture.componentInstance.buildOptions(MOCK_DATA) as any;
    expect(opts.chart.type).toBe('donut');
  });
});
