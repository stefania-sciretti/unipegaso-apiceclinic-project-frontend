import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RecipesComponent } from './recipes.component';
import { RecipeService } from '../../services/recipe.service';
import { AlertService } from '../../services/alert.service';
import { Recipe } from '../../models/models';

const makeRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
  id: 1, title: 'Pasta', description: 'Classic',
  ingredients: 'Pasta, pomodoro', instructions: 'Boil pasta',
  calories: 400, category: 'Pranzo Fit', createdAt: '2024-01-01T00:00:00',
  ...overrides
});

describe('RecipesComponent', () => {
  let component: RecipesComponent;
  let fixture:   ComponentFixture<RecipesComponent>;

  const mockRecipeService = jasmine.createSpyObj('RecipeService',
    ['getAll', 'create', 'update', 'delete']);
  const mockAlertService  = jasmine.createSpyObj('AlertService', ['show'], { alert: () => null });

  beforeEach(async () => {
    mockRecipeService.getAll.calls.reset();
    mockRecipeService.create.calls.reset();
    mockRecipeService.update.calls.reset();
    mockRecipeService.delete.calls.reset();

    mockRecipeService.getAll.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RecipesComponent],
      providers: [
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: AlertService,  useValue: mockAlertService }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(RecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('calls getAll on init', () => expect(mockRecipeService.getAll).toHaveBeenCalled());

  // ── modal state ──────────────────────────────────────────────────────────

  it('openCreate() resets form and shows modal', () => {
    component.form.patchValue({ title: 'Existing' });
    component.openCreate();
    expect(component.showModal).toBeTrue();
    expect(component.editingId).toBeNull();
    expect(component.form.value.title).toBeFalsy();
  });

  it('openEdit() patches form and shows modal', () => {
    const recipe = makeRecipe({ id: 3, title: 'Insalata', category: 'Snack' });
    component.openEdit(recipe);
    expect(component.showModal).toBeTrue();
    expect(component.editingId).toBe(3);
    expect(component.form.value.title).toBe('Insalata');
    expect(component.form.value.category).toBe('Snack');
  });

  it('openDetail() sets selected recipe', () => {
    const recipe = makeRecipe({ id: 2 });
    component.openDetail(recipe);
    expect(component.selected).toBe(recipe);
    expect(component.showDetail).toBeTrue();
  });

  // ── isInvalid() ──────────────────────────────────────────────────────────

  it('isInvalid() returns false when field is untouched', () => {
    expect(component.isInvalid('title')).toBeFalse();
  });

  it('isInvalid() returns true when required field is touched and empty', () => {
    component.form.get('title')!.setValue('');
    component.form.get('title')!.markAsTouched();
    expect(component.isInvalid('title')).toBeTrue();
  });

  // ── fieldError() ─────────────────────────────────────────────────────────

  it('fieldError() returns null when no server error present', () => {
    expect(component.fieldError('title')).toBeNull();
  });

  it('fieldError() returns server error message when set', () => {
    component.fieldErrors.set({ title: 'Title already taken' });
    expect(component.fieldError('title')).toBe('Title already taken');
  });

  // ── save() — invalid form ─────────────────────────────────────────────────

  it('save() marks form touched and skips service when invalid', () => {
    component.form.reset();
    component.save();
    expect(mockRecipeService.create).not.toHaveBeenCalled();
    expect(mockRecipeService.update).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  // ── save() — create ──────────────────────────────────────────────────────

  it('save() calls create() when editingId is null and form is valid', () => {
    mockRecipeService.create.and.returnValue(of(makeRecipe()));
    mockRecipeService.getAll.and.returnValue(of([]));
    component.editingId = null;
    component.form.patchValue({ title: 'New Recipe' });
    component.save();
    expect(mockRecipeService.create).toHaveBeenCalledTimes(1);
    expect(mockRecipeService.update).not.toHaveBeenCalled();
  });

  // ── save() — update ──────────────────────────────────────────────────────

  it('save() calls update() when editingId is set and form is valid', () => {
    mockRecipeService.update.and.returnValue(of(makeRecipe()));
    mockRecipeService.getAll.and.returnValue(of([]));
    component.editingId = 1;
    component.form.patchValue({ title: 'Updated Recipe' });
    component.save();
    expect(mockRecipeService.update).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(mockRecipeService.create).not.toHaveBeenCalled();
  });

  // ── viewMode signal ───────────────────────────────────────────────────────

  it('viewMode defaults to "grid"', () => {
    expect(component.viewMode()).toBe('grid');
  });
});
