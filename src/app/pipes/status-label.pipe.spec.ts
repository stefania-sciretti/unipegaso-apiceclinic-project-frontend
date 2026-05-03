import { StatusLabelPipe } from './status-label.pipe';

describe('StatusLabelPipe', () => {
  let pipe: StatusLabelPipe;

  beforeEach(() => { pipe = new StatusLabelPipe(); });

  it('BOOKED → Prenotato', () => {
    expect(pipe.transform('BOOKED')).toBe('Prenotato');
  });

  it('CONFIRMED → Confermato', () => {
    expect(pipe.transform('CONFIRMED')).toBe('Confermato');
  });

  it('COMPLETED → Completato', () => {
    expect(pipe.transform('COMPLETED')).toBe('Completato');
  });

  it('CANCELLED → Annullato', () => {
    expect(pipe.transform('CANCELLED')).toBe('Annullato');
  });

  it('unknown status → returns the raw status string', () => {
    expect(pipe.transform('CUSTOM_STATUS')).toBe('CUSTOM_STATUS');
    expect(pipe.transform('')).toBe('');
  });
});
