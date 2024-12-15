import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerRegisterComponent } from './player-register.component';

describe('PlayerRegisterComponent', () => {
  let component: PlayerRegisterComponent;
  let fixture: ComponentFixture<PlayerRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerRegisterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
