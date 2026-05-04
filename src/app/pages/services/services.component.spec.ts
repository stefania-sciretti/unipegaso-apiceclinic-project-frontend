import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ServicesComponent } from './services.component';

describe('ServicesComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ServicesComponent],
    providers: [provideRouter([]), provideHttpClient()]
  }));
  it('should create', () => expect(TestBed.createComponent(ServicesComponent).componentInstance).toBeTruthy());
});
