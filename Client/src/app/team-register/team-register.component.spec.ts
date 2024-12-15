import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRegisterComponent } from './team-register.component';

describe('TeamRegisterComponent', () => {
  let component: TeamRegisterComponent;
  let fixture: ComponentFixture<TeamRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamRegisterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
