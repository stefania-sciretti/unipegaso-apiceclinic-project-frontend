import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevenueChartComponent } from './revenue-chart.component';
import { RevenueByMonth } from '../../../../models/dashboard.model';

const MOCK_DATA: RevenueByMonth[] = [
  { month: 'Gen', total: 8000 },
  { month: 'Feb', total: 9500 },
  { month: 'Mar', total: 12450 }
];

describe('RevenueChartComponent', () => {
  let fixture: ComponentFixture<RevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueChartComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(RevenueChartComponent);
    fixture.componentRef.setInput('data', MOCK_DATA);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('buildOptions should include series data mapped from input', () => {
    const comp = fixture.componentInstance;
    const opts = comp.buildOptions(MOCK_DATA) as any;
    expect(opts.series[0].data).toEqual([8000, 9500, 12450]);
    expect(opts.xaxis.categories).toEqual(['Gen', 'Feb', 'Mar']);
  });

  it('buildOptions should use bar chart type', () => {
    const opts = (fixture.componentInstance.buildOptions(MOCK_DATA) as any);
    expect(opts.chart.type).toBe('bar');
  });
});
