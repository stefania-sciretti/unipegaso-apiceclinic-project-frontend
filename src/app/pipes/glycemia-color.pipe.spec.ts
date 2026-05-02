import { GlycemiaColorPipe } from './glycemia-color.pipe';

describe('GlycemiaColorPipe', () => {
  let pipe: GlycemiaColorPipe;

  beforeEach(() => { pipe = new GlycemiaColorPipe(); });

  it('NORMALE → badge-success', () => {
    expect(pipe.transform('NORMALE')).toBe('badge-success');
  });

  it('ATTENZIONE → badge-warning', () => {
    expect(pipe.transform('ATTENZIONE')).toBe('badge-warning');
  });

  it('ELEVATA → badge-danger', () => {
    expect(pipe.transform('ELEVATA')).toBe('badge-danger');
  });

  it('unknown value → badge-secondary fallback', () => {
    expect(pipe.transform('UNKNOWN')).toBe('badge-secondary');
    expect(pipe.transform('')).toBe('badge-secondary');
  });

  it('is case-sensitive — lowercase "normale" falls back to badge-secondary', () => {
    expect(pipe.transform('normale')).toBe('badge-secondary');
  });
});
