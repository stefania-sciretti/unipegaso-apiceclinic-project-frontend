# Design: `<app-button>` Standalone Component

**Date:** 2026-05-03
**Repository:** unipegaso-project-frontend (Angular 21)
**Status:** Approved

---

## Problem Statement

The codebase contains ~100 `<button>` elements split across two inconsistent patterns:
1. ~50 buttons already using a `BtnDirective` (`appBtn="primary"`) in 7 CRUD pages.
2. ~50+ buttons still using raw, repetitive Tailwind class strings in `navbar`, `login`, `booking-calendar`, `dashboard`, `faq`, `doctors`, and `confirm-modal`.

Additionally, "Modifica" table buttons use `sm-blue` in some pages and `sm-primary` in others — same role, different style.

**Goal:** Consolidate all button styling into a single `<app-button>` standalone component under `src/app/components/ui/button/`, following Angular 21 Signal-based patterns. Delete `BtnDirective`.

---

## Architecture

### Component: `ButtonComponent`

**Selector:** `app-button`
**Location:** `src/app/components/ui/button/button.component.ts`
**Pattern:** CVA-style variant+size system via `computed()`

```typescript
export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'danger'
  | 'ghost'
  | 'ghost-light'
  | 'icon'
  | 'close'
  | 'toggle-active'
  | 'toggle-inactive';

export type ButtonSize = 'sm' | 'md';
```

### Inputs (Angular 21 signal syntax)

| Input | Type | Default | Notes |
|---|---|---|---|
| `variant` | `ButtonVariant` | `'primary'` | Visual style |
| `size` | `ButtonSize` | `'md'` | `sm` replaces all `sm-*` prefixed variants |

### Template

```html
<ng-content />
```

The component projects content (label text, icons) via `<ng-content />`. No wrapping element — the host `<app-button>` element itself carries the classes via `host: { '[class]': 'classes()' }`.

### Class Composition

A single `computed()` signal merges:
1. **Base classes** (common to all): `inline-flex items-center justify-center gap-[0.4rem] cursor-pointer transition-colors duration-[180ms] font-semibold leading-none`
2. **Size modifier** from `SIZE_CLASSES[size()]`
3. **Variant modifier** from `VARIANT_CLASSES[variant()]`

---

## Tailwind Variant/Size Map

All values use CSS custom properties (`--primary`, `--primary-mid`, `--danger`, `--bg`) — no raw hex values.

### Size classes

| Size | Classes |
|---|---|
| `md` | `px-[1.1rem] py-2 text-[0.9rem]` |
| `sm` | `px-[0.7rem] py-[0.3rem] text-[0.8rem]` |

### Variant classes (base style, no size padding)

| Variant | Classes |
|---|---|
| `primary` | `border-0 rounded-[10px] bg-[var(--primary)] text-white hover:bg-[var(--primary-mid)]` |
| `outline` | `rounded-[10px] bg-transparent border-[1.5px] border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white` |
| `danger` | `border-0 rounded-[10px] bg-[var(--danger)] text-white hover:bg-red-700` |
| `ghost` | `bg-transparent border-0 text-[var(--primary)] hover:bg-[var(--bg)] w-full text-left` |
| `ghost-light` | `rounded-md bg-white/15 text-white border border-white/35 hover:bg-white/25` |
| `icon` | `p-1.5 rounded-md bg-transparent border-0 text-[var(--primary-mid)] hover:text-[var(--primary)]` |
| `close` | `bg-transparent border-0 text-[1.4rem] text-[var(--primary-mid)] leading-none hover:text-[var(--danger)]` |
| `toggle-active` | `border-0 bg-[var(--primary)] text-white` |
| `toggle-inactive` | `border-0 bg-white text-[var(--primary-mid)] hover:bg-sky-50` |

**Note:** `icon` and `close` variants do not use the `size` input (padding is fixed). `ghost` occupies full-width when used in navbars.

---

## Migration Map

| Old pattern | New pattern |
|---|---|
| `<button appBtn="primary">` | `<app-button>` |
| `<button appBtn="outline">` | `<app-button variant="outline">` |
| `<button appBtn="sm-primary">` | `<app-button size="sm">` |
| `<button appBtn="sm-danger">` | `<app-button variant="danger" size="sm">` |
| `<button appBtn="sm-blue">` | `<app-button size="sm">` ← unified with sm-primary |
| `<button appBtn="close">` | `<app-button variant="close">` |
| `<button appBtn="toggle-active">` | `<app-button variant="toggle-active">` |
| `<button appBtn="toggle-inactive">` | `<app-button variant="toggle-inactive">` |
| Raw Tailwind ghost buttons | `<app-button variant="ghost">` |
| Raw Tailwind login navbar button | `<app-button variant="ghost-light">` |
| Raw Tailwind icon buttons | `<app-button variant="icon">` |

---

## Files Changed

### New
- `src/app/components/ui/button/button.component.ts`

### Deleted
- `src/app/shared/btn.directive.ts`
- `src/app/shared/btn.directive.spec.ts`

### Modified (HTML + TS)
- `src/app/components/confirm-modal/confirm-modal.component.ts`
- `src/app/components/navbar/navbar.component.html` + `.ts`
- `src/app/pages/appointments/appointments.component.html` + `.ts`
- `src/app/pages/glycemia/glycemia.component.html` + `.ts`
- `src/app/pages/nutrition/nutrition.component.html` + `.ts`
- `src/app/pages/patients/patients.component.html` + `.ts`
- `src/app/pages/recipes/recipes.component.html` + `.ts`
- `src/app/pages/reports/reports.component.html` + `.ts`
- `src/app/pages/training/training.component.html` + `.ts`
- `src/app/pages/login/login.component.html` + `.ts`
- `src/app/pages/faq/faq.component.html` + `.ts`
- `src/app/pages/booking-calendar/booking-calendar.component.html` + `.ts`
- `src/app/pages/dashboard/dashboard.component.html` + `.ts`

### Not migrated
- `src/app/pages/doctors/doctors.component.html` — the photo-circle button has unique rounded-full + overflow-hidden constraints that don't apply to a generic button component.

---

## Out of Scope
- Input, Card, Badge, or any other UI components (future work).
- `@apply` directives in SCSS (not used, stays that way).
- E2E or unit test updates for the new component (no test infrastructure for components currently).
