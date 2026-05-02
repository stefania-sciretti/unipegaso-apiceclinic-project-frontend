# `<app-button>` Standalone Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing `BtnDirective` and all raw Tailwind `<button>` elements with a unified `<app-button>` standalone Angular 21 component.

**Architecture:** A single `ButtonComponent` under `src/app/components/ui/button/` uses a CVA-style `computed()` to compose Tailwind classes from `variant` + `size` signals. The host element uses `:host { display: contents }` so the inner native `<button>` is the real rendered element, preserving full `type="submit"` and `:disabled` semantics without custom JS. `BtnDirective` is deleted after all call sites are migrated.

**Tech Stack:** Angular 21, Tailwind CSS 3, TypeScript strict mode.

---

## File Map

| Action | File |
|--------|------|
| **Create** | `src/app/components/ui/button/button.component.ts` |
| **Delete** | `src/app/shared/btn.directive.ts` |
| **Delete** | `src/app/shared/btn.directive.spec.ts` |
| **Modify HTML+TS** | `appointments`, `glycemia`, `nutrition`, `patients`, `recipes`, `reports`, `training` |
| **Modify TS (inline template)** | `confirm-modal.component.ts` |
| **Modify HTML+TS** | `login.component.html` + `.ts` |
| **Modify HTML+TS** | `navbar.component.html` + `.ts` |
| **Modify HTML+TS** | `booking-calendar.component.html` + `.ts` |
| **Modify HTML** | `faq.component.html` + `.ts` |
| **Modify HTML+TS** | `dashboard.component.html` + `.ts` |

---

## Migration Reference

| Old | New |
|-----|-----|
| `<button appBtn="primary">` | `<app-button>` |
| `<button appBtn="outline">` | `<app-button variant="secondary">` |
| `<button appBtn="sm-primary">` | `<app-button size="sm">` |
| `<button appBtn="sm-blue">` | `<app-button size="sm">` ← unified |
| `<button appBtn="sm-danger">` | `<app-button variant="danger" size="sm">` |
| `<button appBtn="close">` | `<app-button variant="close">` |
| `<button appBtn="toggle-active">` | `<app-button variant="toggle-active">` |
| `<button appBtn="toggle-inactive">` | `<app-button variant="toggle-inactive">` |
| Raw ghost on light bg | `<app-button variant="ghost">` |
| Raw ghost on dark bg (white border) | `<app-button variant="ghost-light">` |
| Raw icon-only button | `<app-button variant="icon">` |

---

## Task 1: Create `ButtonComponent`

**Files:**
- Create: `src/app/components/ui/button/button.component.ts`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p src/app/components/ui/button
```

- [ ] **Step 2: Write `button.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'ghost-light'
  | 'icon'
  | 'close'
  | 'toggle-active'
  | 'toggle-inactive';

export type ButtonSize = 'sm' | 'md';

const BASE =
  'inline-flex items-center justify-center gap-[0.4rem] cursor-pointer transition-colors duration-[180ms] font-semibold leading-none';

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'px-[1.1rem] py-2 text-[0.9rem]',
  sm: 'px-[0.7rem] py-[0.3rem] text-[0.8rem]',
};

/** Variants that have fixed padding — ignore the `size` input. */
const FIXED_PADDING_VARIANTS: ButtonVariant[] = [
  'icon', 'close', 'toggle-active', 'toggle-inactive', 'ghost', 'ghost-light',
];

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'border-0 rounded-[10px] bg-[var(--primary)] text-white hover:bg-[var(--primary-mid)] disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'rounded-[10px] bg-transparent border-[1.5px] border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'border-0 rounded-[10px] bg-[var(--danger)] text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent border-0 text-[var(--primary)] hover:bg-[var(--bg)] rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed',
  'ghost-light':
    'rounded-md bg-white/15 text-white border border-white/35 hover:bg-white/25 text-sm disabled:opacity-50 disabled:cursor-not-allowed',
  icon: 'p-1.5 rounded-md bg-transparent border-0 text-[var(--primary-mid)] hover:text-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed',
  close:
    'bg-transparent border-0 text-[1.4rem] text-[var(--primary-mid)] leading-none hover:text-[var(--danger)] transition-colors duration-200 disabled:opacity-50',
  'toggle-active':
    'px-3 py-[0.45rem] border-0 flex items-center text-[0.82rem] bg-[var(--primary)] text-white',
  'toggle-inactive':
    'px-3 py-[0.45rem] border-0 flex items-center text-[0.82rem] bg-white text-[var(--primary-mid)] hover:bg-sky-50',
};

/**
 * Reusable button component using Angular 21 signal-based inputs and CVA-style
 * class composition. Uses display:contents on the host so the inner native
 * <button> is the real rendered element — preserves type="submit" and :disabled.
 *
 * @example
 * <app-button>Salva</app-button>
 * <app-button variant="secondary" (click)="cancel()">Annulla</app-button>
 * <app-button variant="danger" size="sm" (click)="delete(id)">Elimina</app-button>
 * <app-button type="submit" [disabled]="loading" extraClass="w-full">Accedi</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [':host { display: contents }'],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || null"
      [attr.aria-label]="ariaLabel() || null"
      [class]="classes()"
    ><ng-content /></button>
  `,
})
export class ButtonComponent {
  readonly variant    = input<ButtonVariant>('primary');
  readonly size       = input<ButtonSize>('md');
  readonly type       = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled   = input<boolean>(false);
  readonly ariaLabel  = input<string | null>(null);
  /** Escape hatch for layout-level classes (e.g. `w-full`, `ml-2`, `self-start`). */
  readonly extraClass = input<string>('');

  protected readonly classes = computed(() => {
    const v = this.variant();
    const sizeClass = FIXED_PADDING_VARIANTS.includes(v) ? '' : SIZE_CLASSES[this.size()];
    return [BASE, VARIANT_CLASSES[v], sizeClass, this.extraClass()]
      .filter(Boolean)
      .join(' ');
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/ui/button/button.component.ts
git commit -m "feat(ui): add ButtonComponent with signal-based variant+size system

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2: Migrate `appointments`

**Files:**
- Modify: `src/app/pages/appointments/appointments.component.html`
- Modify: `src/app/pages/appointments/appointments.component.ts`

- [ ] **Step 1: Update HTML — replace all `appBtn` usages**

Replace every `<button appBtn="...">` with the equivalent `<app-button>`:

```html
<!-- line ~10 -->
<app-button (click)="openCreate()">+ Nuovo Appuntamento</app-button>

<!-- table row actions, line ~47 -->
<app-button size="sm" (click)="openStatusModal(a)">Modifica</app-button>
@if (canCancel(a)) {
  <app-button variant="danger" size="sm" (click)="cancel(a.id)">Annulla</app-button>
}

<!-- create modal header, line ~65 -->
<app-button variant="close" ariaLabel="Chiudi" (click)="showApptModal.set(false)">&times;</app-button>

<!-- create modal footer -->
<app-button variant="secondary" type="button" (click)="showApptModal.set(false)">Annulla</app-button>
<app-button type="submit">Prenota</app-button>

<!-- status modal header -->
<app-button variant="close" ariaLabel="Chiudi" (click)="showStatusModal.set(false)">&times;</app-button>

<!-- status modal footer -->
<app-button variant="secondary" type="button" (click)="showStatusModal.set(false)">Annulla</app-button>
<app-button type="submit">Aggiorna</app-button>
```

- [ ] **Step 2: Update TS — swap import**

In `appointments.component.ts`, replace:
```typescript
import { BtnDirective } from '../../shared/btn.directive';
```
with:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```

In the `imports` array, replace `BtnDirective` with `ButtonComponent`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/appointments/
git commit -m "refactor(appointments): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: Migrate `glycemia`

**Files:**
- Modify: `src/app/pages/glycemia/glycemia.component.html`
- Modify: `src/app/pages/glycemia/glycemia.component.ts`

- [ ] **Step 1: Update HTML**

```html
<!-- header -->
<app-button (click)="openCreate()">+ Nuova Misurazione</app-button>

<!-- table row actions -->
<app-button size="sm" (click)="openEdit(m)"><span class="material-icons text-[1rem]">edit</span></app-button>
<app-button variant="danger" size="sm" (click)="delete(m.id)"><span class="material-icons text-[1rem]">delete</span></app-button>

<!-- modal header -->
<app-button variant="close" (click)="closeModal()">&times;</app-button>

<!-- modal footer -->
<app-button variant="secondary" type="button" (click)="closeModal()">Annulla</app-button>
<app-button type="submit">{{ editingId() ? 'Salva Modifiche' : 'Registra' }}</app-button>
```

- [ ] **Step 2: Update TS — swap import**

Replace `import { BtnDirective } from '../../shared/btn.directive';` with:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```
Replace `BtnDirective` with `ButtonComponent` in the `imports` array.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/glycemia/
git commit -m "refactor(glycemia): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Migrate `nutrition`

**Files:**
- Modify: `src/app/pages/nutrition/nutrition.component.html`
- Modify: `src/app/pages/nutrition/nutrition.component.ts`

- [ ] **Step 1: Update HTML**

```html
<!-- header -->
<app-button (click)="openCreate()">+ Nuovo Piano Dieta</app-button>

<!-- table row actions -->
<app-button size="sm" (click)="openEdit(p)">Modifica</app-button>
<app-button variant="danger" size="sm" (click)="delete(p.id)">Elimina</app-button>

<!-- modal header -->
<app-button variant="close" (click)="showModal.set(false)">&times;</app-button>

<!-- modal footer -->
<app-button variant="secondary" type="button" (click)="showModal.set(false)">Annulla</app-button>
<app-button type="submit">Salva Piano</app-button>
```

- [ ] **Step 2: Update TS — swap import**

Replace `BtnDirective` import with:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```
Replace `BtnDirective` → `ButtonComponent` in `imports`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/nutrition/
git commit -m "refactor(nutrition): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: Migrate `patients`

**Files:**
- Modify: `src/app/pages/patients/patients.component.html`
- Modify: `src/app/pages/patients/patients.component.ts`

- [ ] **Step 1: Update HTML**

```html
<!-- header -->
<app-button (click)="openCreate()">+ Nuovo Paziente</app-button>

<!-- table row actions -->
<app-button size="sm" (click)="openEdit(p)">Modifica</app-button>
<app-button variant="danger" size="sm" (click)="delete(p.id)">Elimina</app-button>

<!-- modal header -->
<app-button variant="close" (click)="closeModal()">&times;</app-button>

<!-- modal footer -->
<app-button variant="secondary" type="button" (click)="closeModal()">Annulla</app-button>
<app-button type="submit">Salva</app-button>
```

- [ ] **Step 2: Update TS — swap import**

Replace `BtnDirective` import with:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```
Replace `BtnDirective` → `ButtonComponent` in `imports`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/patients/
git commit -m "refactor(patients): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6: Migrate `recipes`

**Files:**
- Modify: `src/app/pages/recipes/recipes.component.html`
- Modify: `src/app/pages/recipes/recipes.component.ts`

- [ ] **Step 1: Update HTML**

```html
<!-- header -->
<app-button (click)="openCreate()">+ Nuova Ricetta</app-button>

<!-- view toggle (dynamic variant) -->
<app-button type="button"
  [variant]="viewMode() === 'grid' ? 'toggle-active' : 'toggle-inactive'"
  (click)="viewMode.set('grid')">
  <span class="material-icons text-[1rem]">grid_view</span>
</app-button>
<app-button type="button"
  [variant]="viewMode() === 'list' ? 'toggle-active' : 'toggle-inactive'"
  (click)="viewMode.set('list')">
  <span class="material-icons text-[1rem]">view_list</span>
</app-button>

<!-- grid/list card actions -->
<app-button size="sm" (click)="$event.stopPropagation(); openEdit(r)">Modifica</app-button>
<app-button variant="danger" size="sm" (click)="$event.stopPropagation(); delete(r.id)">Elimina</app-button>

<!-- detail modal header -->
<app-button variant="close" (click)="showDetail = false">&times;</app-button>

<!-- detail modal footer -->
<app-button variant="secondary" (click)="showDetail = false">Chiudi</app-button>
<app-button (click)="showDetail = false; openEdit(selected!)">Modifica</app-button>

<!-- form modal header -->
<app-button variant="close" (click)="showModal = false">&times;</app-button>

<!-- form modal footer -->
<app-button variant="secondary" type="button" (click)="showModal = false">Annulla</app-button>
<app-button type="submit">Salva Ricetta</app-button>
```

- [ ] **Step 2: Update TS — swap import**

Replace `BtnDirective` import with:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```
Replace `BtnDirective` → `ButtonComponent` in `imports`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/recipes/
git commit -m "refactor(recipes): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 7: Migrate `reports`

**Files:**
- Modify: `src/app/pages/reports/reports.component.html`
- Modify: `src/app/pages/reports/reports.component.ts`

- [ ] **Step 1: Update HTML**

```html
<!-- header -->
<app-button (click)="openCreate()">+ Nuovo Referto</app-button>

<!-- table row actions -->
<app-button size="sm" (click)="openDetail(r)">
  <span class="material-icons text-[15px] align-middle">visibility</span> Dettaglio
</app-button>
<app-button size="sm" (click)="openEdit(r)">
  <span class="material-icons text-[15px] align-middle">edit</span> Modifica
</app-button>

<!-- form modal header -->
<app-button variant="close" (click)="closeFormModal()">&times;</app-button>

<!-- form modal footer -->
<app-button variant="secondary" type="button" (click)="closeFormModal()">Annulla</app-button>
<app-button type="submit">Salva Referto</app-button>

<!-- detail modal header -->
<app-button variant="close" (click)="showDetailModal = false">&times;</app-button>

<!-- detail modal footer -->
<app-button variant="secondary" (click)="showDetailModal = false">Chiudi</app-button>
<app-button (click)="openEdit(selectedReport!); showDetailModal = false">
  <span class="material-icons text-[15px] align-middle">edit</span> Modifica
</app-button>
```

- [ ] **Step 2: Update TS — swap import**

Replace `BtnDirective` import with:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```
Replace `BtnDirective` → `ButtonComponent` in `imports`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/reports/
git commit -m "refactor(reports): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 8: Migrate `training`

**Files:**
- Modify: `src/app/pages/training/training.component.html`
- Modify: `src/app/pages/training/training.component.ts`

- [ ] **Step 1: Update HTML**

```html
<!-- header -->
<app-button (click)="openCreate()">+ Nuova Scheda</app-button>

<!-- table row actions — sm-blue unified to sm-primary style -->
<app-button size="sm" (click)="openDetail(p)">Dettaglio</app-button>
<app-button size="sm" (click)="openEdit(p)">Modifica</app-button>
<app-button variant="danger" size="sm" (click)="delete(p.id)">Elimina</app-button>

<!-- detail modal header -->
<app-button variant="close" (click)="showDetail.set(false)">&times;</app-button>

<!-- detail modal footer -->
<app-button variant="secondary" (click)="showDetail.set(false)">Chiudi</app-button>
<app-button (click)="showDetail.set(false); openEdit(selected()!)">Modifica</app-button>

<!-- the 3 sm-primary buttons at mx-5 mb-5 self-start positions -->
<app-button size="sm" extraClass="mx-5 mb-5 self-start" (click)="...">...</app-button>

<!-- form modal header -->
<app-button variant="close" (click)="showModal.set(false)">&times;</app-button>

<!-- form modal footer -->
<app-button variant="secondary" type="button" (click)="showModal.set(false)">Annulla</app-button>
<app-button type="submit">Salva Scheda</app-button>
```

Note: the 3 `<app-button size="sm" extraClass="mx-5 mb-5 self-start">` buttons each have their own `(click)` handler — look at the original HTML around lines 207, 237, 267 and preserve those handlers verbatim.

- [ ] **Step 2: Update TS — swap import**

Replace `BtnDirective` import with:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```
Replace `BtnDirective` → `ButtonComponent` in `imports`.

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/training/
git commit -m "refactor(training): migrate buttons to app-button component, unify sm-blue→sm-primary

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 9: Migrate `confirm-modal`

**Files:**
- Modify: `src/app/components/confirm-modal/confirm-modal.component.ts` (inline template)

- [ ] **Step 1: Add import**

At the top of the file, add:
```typescript
import { ButtonComponent } from '../ui/button/button.component';
```

In `@Component({ imports: [...] })`, add `ButtonComponent`.

- [ ] **Step 2: Replace the two raw buttons in the inline template**

Find:
```html
<button
  type="button"
  class="px-[1.1rem] py-2 rounded-[10px] text-[0.9rem] cursor-pointer font-semibold bg-transparent border-[1.5px] border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors duration-[180ms]"
  (click)="svc.cancel()"
>
  Annulla
</button>
<button
  type="button"
  class="px-[1.1rem] py-2 border-0 rounded-[10px] text-[0.9rem] cursor-pointer font-semibold bg-[var(--danger)] text-white hover:bg-red-700 transition-colors duration-[180ms]"
  (click)="svc.confirm()"
>
  Conferma
</button>
```

Replace with:
```html
<app-button variant="secondary" (click)="svc.cancel()">Annulla</app-button>
<app-button variant="danger" (click)="svc.confirm()">Conferma</app-button>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/components/confirm-modal/confirm-modal.component.ts
git commit -m "refactor(confirm-modal): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 10: Migrate `login` page

**Files:**
- Modify: `src/app/pages/login/login.component.html`
- Modify: `src/app/pages/login/login.component.ts`

- [ ] **Step 1: Update HTML**

Find the toggle-password button (inside the password field wrapper):
```html
<button type="button" (click)="showPassword = !showPassword"
  class="px-3 text-[var(--primary-mid)] hover:text-[var(--primary)] focus:outline-none"
  [attr.aria-label]="showPassword ? 'Nascondi password' : 'Mostra password'">
  <span class="material-icons text-[1.2rem]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
</button>
```
Replace with:
```html
<app-button variant="icon" [ariaLabel]="showPassword ? 'Nascondi password' : 'Mostra password'"
  extraClass="px-3" (click)="showPassword = !showPassword">
  <span class="material-icons text-[1.2rem]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
</app-button>
```

Find the submit button:
```html
<button type="submit"
  class="w-full py-[0.75rem] rounded-xl bg-[var(--primary)] text-white font-semibold text-[0.95rem] cursor-pointer transition-colors duration-200 hover:bg-[var(--primary-mid)] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
  [disabled]="loading">
  @if (!loading) { ... }
  @if (loading) { Caricamento… }
</button>
```
Replace with:
```html
<app-button type="submit" [disabled]="loading" extraClass="w-full mt-1 py-[0.75rem] rounded-xl text-[0.95rem]">
  @if (!loading) { {{ isRegistering ? 'Registrati' : 'Accedi' }} }
  @if (loading) { Caricamento… }
</app-button>
```

- [ ] **Step 2: Update TS — add import**

In `login.component.ts`, add:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```

In `imports: [ReactiveFormsModule, NgClass]`, add `ButtonComponent`:
```typescript
imports: [ReactiveFormsModule, NgClass, ButtonComponent],
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/login/
git commit -m "refactor(login): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 11: Migrate `navbar`

**Files:**
- Modify: `src/app/components/navbar/navbar.component.html`
- Modify: `src/app/components/navbar/navbar.component.ts`

Migrate 4 buttons; leave native HTML for: the logo button (0 padding, image-only), the hamburger (md:hidden with white text), all mobile nav items (dark bg specific), and all desktop nav `<a>` elements (not buttons).

- [ ] **Step 1: Migrate desktop login button**

Find:
```html
<button (click)="openLogin()"
  class="flex items-center gap-[0.4rem] px-4 py-[0.4rem] rounded-md bg-white/15 text-white border border-white/35 text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-white/25">
  <span class="material-icons text-[1.1rem]">login</span> Login
</button>
```
Replace with:
```html
<app-button variant="ghost-light" (click)="openLogin()">
  <span class="material-icons text-[1.1rem]">login</span> Login
</app-button>
```

- [ ] **Step 2: Migrate login modal — close button**

Find (inside the `@if (auth.showModal())` dialog):
```html
<button class="absolute top-3 right-4 bg-transparent border-0 text-2xl text-[var(--text-muted)] cursor-pointer leading-none transition-colors duration-200 hover:text-[var(--primary)]"
  (click)="closeLogin()">&times;</button>
```
Replace with:
```html
<app-button variant="close" extraClass="absolute top-3 right-4" (click)="closeLogin()">&times;</app-button>
```

- [ ] **Step 3: Migrate login modal — toggle-password button**

Find:
```html
<button type="button" (click)="showPassword = !showPassword"
  class="absolute right-3 border-0 bg-transparent p-0 text-[var(--text-muted)] hover:text-[var(--primary)] focus:outline-none cursor-pointer"
  [attr.aria-label]="showPassword ? 'Nascondi password' : 'Mostra password'">
  <span class="material-icons text-[1.1rem]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
</button>
```
Replace with:
```html
<app-button variant="icon" extraClass="absolute right-3 p-0"
  [ariaLabel]="showPassword ? 'Nascondi password' : 'Mostra password'"
  (click)="showPassword = !showPassword">
  <span class="material-icons text-[1.1rem]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
</app-button>
```

- [ ] **Step 4: Migrate login modal — submit button**

Find:
```html
<button type="submit" [disabled]="loginLoading"
  class="w-full py-3 bg-[var(--primary-mid)] text-white border-0 rounded-[var(--radius)] text-base font-semibold cursor-pointer mt-2 transition-[background-color,transform] duration-200 enabled:hover:bg-[var(--primary)] enabled:hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed">
  {{ loginLoading ? 'Accesso in corso...' : 'Accedi' }}
</button>
```
Replace with:
```html
<app-button type="submit" [disabled]="loginLoading" extraClass="w-full mt-2 py-3 text-base">
  {{ loginLoading ? 'Accesso in corso...' : 'Accedi' }}
</app-button>
```

- [ ] **Step 5: Update TS — add import**

In `navbar.component.ts`, add:
```typescript
import { ButtonComponent } from '../ui/button/button.component';
```

Update imports array from `[ReactiveFormsModule, NgOptimizedImage, NgClass]` to:
```typescript
imports: [ReactiveFormsModule, NgOptimizedImage, NgClass, ButtonComponent],
```

- [ ] **Step 6: Commit**

```bash
git add src/app/components/navbar/
git commit -m "refactor(navbar): migrate login/close/icon buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 12: Migrate `booking-calendar`

**Files:**
- Modify: `src/app/pages/booking-calendar/booking-calendar.component.html`
- Modify: `src/app/pages/booking-calendar/booking-calendar.component.ts`

Migrate: view-toggle, prev/next, "Oggi", popover close. Leave native HTML for calendar event buttons (have `[ngStyle]="{'background-color': ...}"` dynamic color — not a generic variant).

- [ ] **Step 1: Migrate view-toggle buttons**

Find:
```html
<div class="flex rounded-lg overflow-hidden border border-[var(--border)]">
  <button
    class="px-4 py-2 text-sm font-semibold transition-colors duration-150"
    [ngClass]="viewMode() === 'month' ? 'bg-[var(--primary)] text-white' : 'bg-white text-[var(--primary)] hover:bg-slate-100'"
    (click)="viewMode.set('month')">
    Mensile
  </button>
  <button
    class="px-4 py-2 text-sm font-semibold transition-colors duration-150 border-l border-[var(--border)]"
    [ngClass]="viewMode() === 'week' ? 'bg-[var(--primary)] text-white' : 'bg-white text-[var(--primary)] hover:bg-slate-100'"
    (click)="viewMode.set('week')">
    Settimanale
  </button>
</div>
```
Replace with:
```html
<div class="flex rounded-lg overflow-hidden border border-[var(--border)]">
  <app-button
    [variant]="viewMode() === 'month' ? 'toggle-active' : 'toggle-inactive'"
    (click)="viewMode.set('month')">
    Mensile
  </app-button>
  <app-button
    [variant]="viewMode() === 'week' ? 'toggle-active' : 'toggle-inactive'"
    extraClass="border-l border-[var(--border)]"
    (click)="viewMode.set('week')">
    Settimanale
  </app-button>
</div>
```

- [ ] **Step 2: Migrate prev/next navigation buttons**

Find:
```html
<button
  class="p-1.5 rounded-md hover:bg-slate-100 border-0 transition-colors text-[var(--primary)]"
  (click)="previousPeriod()">
  <span class="material-icons">chevron_left</span>
</button>
...
<button
  class="p-1.5 rounded-md hover:bg-slate-100 border-0 transition-colors text-[var(--primary)]"
  (click)="nextPeriod()">
  <span class="material-icons">chevron_right</span>
</button>
```
Replace with:
```html
<app-button variant="icon" (click)="previousPeriod()">
  <span class="material-icons">chevron_left</span>
</app-button>
...
<app-button variant="icon" (click)="nextPeriod()">
  <span class="material-icons">chevron_right</span>
</app-button>
```

- [ ] **Step 3: Migrate "Oggi" button**

Find:
```html
<button
  class="ml-2 px-3 py-1.5 rounded-md text-sm font-semibold border-0 hover:bg-slate-100 transition-colors"
  (click)="goToToday()">
  Oggi
</button>
```
Replace with:
```html
<app-button variant="ghost" extraClass="ml-2 px-3 py-1.5 text-sm" (click)="goToToday()">
  Oggi
</app-button>
```

- [ ] **Step 4: Migrate popover close button**

Find:
```html
<button
  class="ml-auto text-[var(--primary-mid)] hover:text-[var(--danger)] bg-transparent border-0 cursor-pointer text-xl leading-none"
  (click)="closePopover()">&times;</button>
```
Replace with:
```html
<app-button variant="close" extraClass="ml-auto" (click)="closePopover()">&times;</app-button>
```

- [ ] **Step 5: Update TS — add import**

In `booking-calendar.component.ts`, add:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```

In `imports: [DatePipe, NgClass, NgStyle, StatusBadgePipe]`, add `ButtonComponent`:
```typescript
imports: [DatePipe, NgClass, NgStyle, StatusBadgePipe, ButtonComponent],
```

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/booking-calendar/
git commit -m "refactor(booking-calendar): migrate buttons to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 13: Migrate `faq`

**Files:**
- Modify: `src/app/pages/faq/faq.component.html`
- Modify: `src/app/pages/faq/faq.component.ts`

- [ ] **Step 1: Update HTML — accordion trigger button**

Find:
```html
<button class="w-full flex items-center gap-4 px-5 py-[1.1rem] bg-transparent border-0 cursor-pointer text-left text-[1rem] font-semibold text-[var(--primary)] transition-colors duration-150 hover:bg-[var(--bg)] select-none"
        (click)="toggle(faq)" role="button" tabindex="0"
        (keydown.enter)="toggle(faq)" (keydown.space)="toggle(faq)">
```
Replace with:
```html
<app-button variant="ghost"
  extraClass="w-full flex items-center gap-4 px-5 py-[1.1rem] text-[1rem] font-semibold select-none"
  (click)="toggle(faq)"
  (keydown.enter)="toggle(faq)" (keydown.space)="toggle(faq)">
```

- [ ] **Step 2: Update TS — add import**

In `faq.component.ts`, add:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```

Update imports array from `[RouterModule, NgClass]` to:
```typescript
imports: [RouterModule, NgClass, ButtonComponent],
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/faq/
git commit -m "refactor(faq): migrate accordion button to app-button component

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 14: Migrate `dashboard`

**Files:**
- Modify: `src/app/pages/dashboard/dashboard.component.html`
- Modify: `src/app/pages/dashboard/dashboard.component.ts`

Migrate: service area dropdown button, "Torna alle aree" button, booking CTA, and the 3 `sm-primary` buttons with `mx-5 mb-5 self-start`. Leave native HTML for: the service items inside the dropdown (dynamic `ngClass` based on selection state), calendar day buttons, time slot buttons.

- [ ] **Step 1: Migrate service area dropdown trigger**

Find:
```html
<button class="flex items-center gap-3 w-full px-[1.125rem] py-[0.875rem] bg-white/15 border border-white/30 rounded-lg text-white cursor-pointer transition-all duration-200 text-[0.95rem] font-medium hover:bg-white/25 hover:border-white/50"
        type="button"
        (click)="showAreaDropdown = !showAreaDropdown">
```
Replace with:
```html
<app-button variant="ghost-light" type="button"
  extraClass="w-full gap-3 px-[1.125rem] py-[0.875rem] text-[0.95rem] font-medium justify-between rounded-lg"
  (click)="showAreaDropdown = !showAreaDropdown">
```

- [ ] **Step 2: Migrate "Torna alle aree" button**

Find:
```html
<button class="flex items-center gap-2 px-4 py-[0.6rem] bg-white/15 border border-white/30 rounded-md text-white cursor-pointer text-[0.9rem] font-medium transition-all duration-200 hover:bg-white/25"
        (click)="backToAreas()">
  <span class="material-icons text-[1rem]">arrow_back</span> Torna alle aree
</button>
```
Replace with:
```html
<app-button variant="ghost-light" extraClass="gap-2 px-4 py-[0.6rem] text-[0.9rem]" (click)="backToAreas()">
  <span class="material-icons text-[1rem]">arrow_back</span> Torna alle aree
</app-button>
```

- [ ] **Step 3: Migrate booking CTA button**

Find the large button near the end of the booking form section (has `disabled:opacity-50 disabled:cursor-not-allowed` and `[disabled]="!selectedService || !selectedDate || !selectedTime"`):
```html
<button
  class="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-mid)] border-none rounded-lg text-white text-[1.05rem] font-bold cursor-pointer transition-all duration-300 whitespace-nowrap shadow-[0_4px_15px_rgba(17,45,78,0.3)] tracking-wide uppercase disabled:opacity-50 disabled:cursor-not-allowed hover:[&:not(:disabled)]:from-[var(--primary-mid)] hover:[&:not(:disabled)]:to-[var(--accent)] hover:[&:not(:disabled)]:-translate-y-0.5 hover:[&:not(:disabled)]:shadow-[0_6px_20px_rgba(17,45,78,0.4)]"
  [disabled]="!selectedService || !selectedDate || !selectedTime"
  (click)="book()">
```
Replace with (simplified — gradient removed per spec):
```html
<app-button
  [disabled]="!selectedService || !selectedDate || !selectedTime"
  extraClass="gap-3 px-8 py-4 text-[1.05rem] uppercase tracking-wide whitespace-nowrap rounded-lg"
  (click)="book()">
```

- [ ] **Step 4: Migrate the 3 `sm-primary` + extra-class buttons**

Each of the 3 occurrences near lines 207, 237, 267:
```html
<button appBtn="sm-primary" class="mx-5 mb-5 self-start" (click)="HANDLER()">
  LABEL
</button>
```
Replace with (preserving the handler and label from the original HTML):
```html
<app-button size="sm" extraClass="mx-5 mb-5 self-start" (click)="HANDLER()">
  LABEL
</app-button>
```

- [ ] **Step 5: Update TS — swap import**

Replace `import { BtnDirective } from '../../shared/btn.directive';` with:
```typescript
import { ButtonComponent } from '../../components/ui/button/button.component';
```

In `imports: [CommonModule, NgOptimizedImage, BtnDirective]`, replace `BtnDirective` with `ButtonComponent`.

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/dashboard/
git commit -m "refactor(dashboard): migrate buttons to app-button, simplify booking CTA

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 15: Delete `BtnDirective`

**Files:**
- Delete: `src/app/shared/btn.directive.ts`
- Delete: `src/app/shared/btn.directive.spec.ts`

- [ ] **Step 1: Verify no remaining usages**

```bash
grep -r "BtnDirective\|appBtn" src/app --include="*.ts" --include="*.html"
```
Expected output: **no matches**. If any appear, go back and fix them before deleting.

- [ ] **Step 2: Delete the files**

```bash
git rm src/app/shared/btn.directive.ts src/app/shared/btn.directive.spec.ts
```

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor(shared): remove BtnDirective (replaced by ButtonComponent)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 16: Build verification

- [ ] **Step 1: Run the Angular build**

```bash
ng build 2>&1 | tail -30
```
Expected: `✔ Building... [HH:mm:ss elapsed]` with 0 errors. If TypeScript errors appear, fix them before proceeding.

- [ ] **Step 2: Run the tests**

```bash
ng test --watch=false --browsers=ChromeHeadless 2>&1 | tail -40
```
Expected: all specs pass (or the same count as before this change — do not introduce new failures).

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: verify build after app-button migration

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
