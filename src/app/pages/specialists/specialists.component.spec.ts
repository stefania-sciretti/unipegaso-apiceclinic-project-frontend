import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SpecialistsComponent } from './specialists.component';
import { SpecialistService } from '../../services/specialist.service';
import { Router } from '@angular/router';
import { Specialist } from '../../models/models';

const makeSpecialist = (overrides: Partial<Specialist> = {}): Specialist => ({
  id: 1, firstName: 'Simona', lastName: 'Ruberti',
  role: 'NUTRITIONIST', email: 'simona@test.com',
  createdAt: '2024-01-01T00:00:00',
  ...overrides
});

describe('SpecialistsComponent', () => {
  let component: SpecialistsComponent;
  let fixture:   ComponentFixture<SpecialistsComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockSpecialistService = jasmine.createSpyObj('SpecialistService', ['getAll']);

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSpecialistService.getAll.calls.reset();
    mockSpecialistService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SpecialistsComponent],
      providers: [
        { provide: SpecialistService, useValue: mockSpecialistService },
        { provide: Router,            useValue: mockRouter }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(SpecialistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('calls SpecialistService.getAll() on init', () =>
    expect(mockSpecialistService.getAll).toHaveBeenCalled());

  it('specialists() is empty when service returns empty array', async () => {
    await fixture.whenStable();
    expect(component.specialists().length).toBe(0);
  });

  it('specialists() maps API data to SpecialistCard shape', async () => {
    mockSpecialistService.getAll.and.returnValue(of([
      makeSpecialist({ firstName: 'Luca', lastName: 'Siretta', role: 'PERSONAL_TRAINER' })
    ]));
    TestBed.resetTestingModule();
    mockSpecialistService.getAll.and.returnValue(of([
      makeSpecialist({ firstName: 'Luca', lastName: 'Siretta', role: 'PERSONAL_TRAINER' })
    ]));
    await TestBed.configureTestingModule({
      imports: [SpecialistsComponent],
      providers: [
        { provide: SpecialistService, useValue: mockSpecialistService },
        { provide: Router,            useValue: mockRouter }
      ]
    }).compileComponents();
    const f = TestBed.createComponent(SpecialistsComponent);
    f.detectChanges();
    await f.whenStable();

    const cards = f.componentInstance.specialists();
    expect(cards.length).toBe(1);
    expect(cards[0].firstName).toBe('Luca');
    expect(cards[0].lastName).toBe('Siretta');
    expect(cards[0].route).toBe('/specialist/luca');
    f.destroy();
  });

  it('specialists() uses enrichment data for known first names', async () => {
    TestBed.resetTestingModule();
    mockSpecialistService.getAll.and.returnValue(of([
      makeSpecialist({ firstName: 'Simona', lastName: 'Ruberti', role: 'NUTRITIONIST' })
    ]));
    await TestBed.configureTestingModule({
      imports: [SpecialistsComponent],
      providers: [
        { provide: SpecialistService, useValue: mockSpecialistService },
        { provide: Router,            useValue: mockRouter }
      ]
    }).compileComponents();
    const f = TestBed.createComponent(SpecialistsComponent);
    f.detectChanges();
    await f.whenStable();

    const card = f.componentInstance.specialists()[0];
    expect(card.gender).toBe('female');
    expect(card.image).toContain('simona.webp');
    f.destroy();
  });

  it('specialists() falls back to default image for unknown first name', async () => {
    TestBed.resetTestingModule();
    mockSpecialistService.getAll.and.returnValue(of([
      makeSpecialist({ firstName: 'Unknown', lastName: 'Person', role: 'NUTRITIONIST' })
    ]));
    await TestBed.configureTestingModule({
      imports: [SpecialistsComponent],
      providers: [
        { provide: SpecialistService, useValue: mockSpecialistService },
        { provide: Router,            useValue: mockRouter }
      ]
    }).compileComponents();
    const f = TestBed.createComponent(SpecialistsComponent);
    f.detectChanges();
    await f.whenStable();

    const card = f.componentInstance.specialists()[0];
    expect(card.image).toContain('default.webp');
    expect(card.gender).toBe('male');
    f.destroy();
  });

  it('navigateTo() calls router.navigate with the given route', () => {
    component.navigateTo('/specialist/luca');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/specialist/luca']);
  });
});
