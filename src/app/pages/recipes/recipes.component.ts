import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RecipeService } from '../../services/recipe.service';
import { AlertService } from '../../services/alert.service';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { AuthService } from '../../services/auth.service';
import { Recipe, RecipeRequest, ApiError } from '../../models/models';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { FormControlDirective } from '../../shared/form-control.directive';
import { FormLabelDirective } from '../../shared/form-label.directive';

@Component({
  selector: 'app-recipes',
  imports: [ReactiveFormsModule, NgClass, ButtonComponent, FormControlDirective, FormLabelDirective],
  templateUrl: './recipes.component.html'
})
export class RecipesComponent implements OnInit {
  private readonly svc        = inject(RecipeService);
  private readonly alertSvc   = inject(AlertService);
  private readonly fb         = inject(FormBuilder);
  private readonly confirmSvc = inject(ConfirmModalService);
  private readonly auth       = inject(AuthService);

  protected readonly alertSignal = this.alertSvc.alert;
  protected get isAdmin(): boolean { return this.auth.isAdmin; }

  recipes: Recipe[] = [];
  loading        = false;
  filterCategory = '';
  searchText     = '';
  showModal      = false;
  showDetail     = false;
  editingId: number | null = null;
  selected: Recipe | null  = null;

  readonly fieldErrors = signal<Record<string, string>>({});
  readonly viewMode = signal<'grid' | 'list'>('grid');

  readonly categories = ['Pre-Workout', 'Post-Workout', 'Colazione', 'Pranzo Fit', 'Cena Fit', 'Snack', 'Smoothie'];

  readonly form: FormGroup = this.fb.group({
    title:        ['', Validators.required],
    description:  [''],
    ingredients:  [''],
    instructions: [''],
    calories:     [null],
    category:     ['']
  });

  constructor() {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.svc.getAll(this.filterCategory, this.searchText).subscribe({
      next: (d) => { this.recipes = d; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  onSearch(e: Event): void   { this.searchText = (e.target as HTMLInputElement).value;  this.load(); }
  onCategory(e: Event): void { this.filterCategory = (e.target as HTMLSelectElement).value; this.load(); }

  openDetail(r: Recipe): void { this.selected = r; this.showDetail = true; }
  openCreate(): void          { this.editingId = null; this.form.reset(); this.fieldErrors.set({}); this.showModal = true; }
  openEdit(r: Recipe): void {
    this.editingId = r.id;
    this.fieldErrors.set({});
    this.form.patchValue({
      title: r.title, description: r.description ?? '', ingredients: r.ingredients ?? '',
      instructions: r.instructions ?? '', calories: r.calories, category: r.category ?? ''
    });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const body: RecipeRequest = {
      title: v.title, description: v.description || null, ingredients: v.ingredients || null,
      instructions: v.instructions || null, calories: v.calories || null, category: v.category || null
    };
    const obs = this.editingId ? this.svc.update(this.editingId, body) : this.svc.create(body);
    obs.subscribe({
      next: () => {
        this.alertSvc.show(this.editingId ? 'Ricetta aggiornata!' : 'Ricetta creata!');
        this.showModal = false;
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        const fieldErrors = (err.error as ApiError)?.fieldErrors;
        if (fieldErrors) this.fieldErrors.set(fieldErrors);
      }
    });
  }

  delete(id: number): void {
    this.confirmSvc.open('Eliminare questa ricetta?', () => {
      this.svc.delete(id).subscribe({
        next: () => { this.alertSvc.show('Ricetta eliminata.'); this.load(); }
      });
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  fieldError(field: string): string | null {
    return this.fieldErrors()[field] ?? null;
  }
}
