import { StatusBadgePipe } from './status-badge.pipe';

describe('StatusBadgePipe', () => {
  let pipe: StatusBadgePipe;

  beforeEach(() => { pipe = new StatusBadgePipe(); });

  // ── appointment style (default) ──────────────────────────────────────────

  it('BOOKED → sky badge classes', () => {
    const result = pipe.transform('BOOKED');
    expect(result).toContain('bg-sky-100');
    expect(result).toContain('text-sky-800');
  });

  it('CONFIRMED → green badge classes', () => {
    const result = pipe.transform('CONFIRMED', 'appointment');
    expect(result).toContain('bg-green-100');
    expect(result).toContain('text-green-800');
  });

  it('COMPLETED → blue-50 badge classes', () => {
    const result = pipe.transform('COMPLETED', 'appointment');
    expect(result).toContain('bg-blue-50');
  });

  it('CANCELLED → red badge classes', () => {
    const result = pipe.transform('CANCELLED', 'appointment');
    expect(result).toContain('bg-red-100');
  });

  it('SCHEDULED → purple badge classes', () => {
    const result = pipe.transform('SCHEDULED', 'appointment');
    expect(result).toContain('bg-purple-100');
    expect(result).toContain('text-purple-800');
  });

  it('PENDING → yellow badge classes', () => {
    const result = pipe.transform('PENDING', 'appointment');
    expect(result).toContain('bg-yellow-100');
    expect(result).toContain('text-yellow-800');
  });

  it('unknown appointment status → slate fallback', () => {
    const result = pipe.transform('UNKNOWN_STATUS', 'appointment');
    expect(result).toContain('bg-slate-100');
    expect(result).toContain('text-slate-600');
  });

  // ── glycemia style ───────────────────────────────────────────────────────

  it('NORMALE → green badge classes (glycemia)', () => {
    const result = pipe.transform('NORMALE', 'glycemia');
    expect(result).toContain('bg-green-100');
    expect(result).toContain('text-green-800');
  });

  it('ATTENZIONE → yellow badge classes (glycemia)', () => {
    const result = pipe.transform('ATTENZIONE', 'glycemia');
    expect(result).toContain('bg-yellow-100');
    expect(result).toContain('text-yellow-800');
  });

  it('ELEVATA → red badge classes (glycemia)', () => {
    const result = pipe.transform('ELEVATA', 'glycemia');
    expect(result).toContain('bg-red-100');
  });

  it('unknown glycemia value → slate fallback', () => {
    const result = pipe.transform('ANYTHING', 'glycemia');
    expect(result).toContain('bg-slate-100');
    expect(result).toContain('text-slate-600');
  });

  // ── BASE classes always present ──────────────────────────────────────────

  it('result always contains base inline-block class', () => {
    expect(pipe.transform('BOOKED')).toContain('inline-block');
    expect(pipe.transform('NORMALE', 'glycemia')).toContain('inline-block');
    expect(pipe.transform('???')).toContain('inline-block');
  });

  it('default style argument is appointment when omitted', () => {
    // NORMALE is only in glycemia map; using default (appointment) must fall through to slate
    const withDefault  = pipe.transform('NORMALE');
    const withExplicit = pipe.transform('NORMALE', 'appointment');
    expect(withDefault).toBe(withExplicit);
  });
});
