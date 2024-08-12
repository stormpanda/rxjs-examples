import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakeConsoleComponent } from './fake-console.component';

describe('FakeConsoleComponent', () => {
  let component: FakeConsoleComponent;
  let fixture: ComponentFixture<FakeConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FakeConsoleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FakeConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
