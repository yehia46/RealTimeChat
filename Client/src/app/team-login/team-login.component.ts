import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Team } from '../model/team';
import { TeamService } from '../services/team.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-team-login',
  templateUrl: './team-login.component.html',
  styleUrls: ['./team-login.component.css']
})
export class TeamLoginComponent implements OnInit {
  loginForm!: FormGroup;
  teams: Team[] = []

  constructor(private fb: FormBuilder, private teamService: TeamService, private route: ActivatedRoute, private router:Router) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.teamService.login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe(
          success => {
            if (success) {
              this.router.navigate(['/home']);
            } else {
              alert('Invalid email or password');
            }
          },
          error => {
            if (error.message === 'Invalid email') {
              alert('Invalid email');
            } else if (error.message === 'Invalid password') {
              alert('Invalid password');
            } else {
              alert(error.message || 'Something went wrong');
            }
          }
        );
    }
  }
}
