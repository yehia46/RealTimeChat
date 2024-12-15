import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamLoginComponent } from './team-login.component';

describe('TeamLoginComponent', () => {
  let component: TeamLoginComponent;
  let fixture: ComponentFixture<TeamLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
