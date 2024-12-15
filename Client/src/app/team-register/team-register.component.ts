import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TeamService } from '../services/team.service';
import { Team } from '../model/team';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-team-register',
  templateUrl: './team-register.component.html',
  styleUrls: ['./team-register.component.css']
})
export class TeamRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  teams: Team[] = [];

  constructor(private fb: FormBuilder, private service: TeamService, private route: Router) { }

  // the register form
  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      managerName: ['', Validators.required],
      managerDob: ['', [Validators.required, this.minDateValidator(25)]]
    }, { validators: this.passwordMatchValidator });

    this.registerForm.get('managerDob')?.setErrors({ minDate: true }); // age validation error
    this.registerForm.get('confirmPassword')?.setErrors({ mismatch: true }); // password mismatch error
  }  

  // checkEmailExists(email: string): Observable<boolean> {
  // 
  // }

  // matches the passwords
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  // calculate the date for manager min age
  minDateValidator(minYears: number) {
    return (control: any) => {
      const currentDate = new Date();
      const inputDate = new Date(control.value);
      const differenceInYears = currentDate.getFullYear() - inputDate.getFullYear();
      if (differenceInYears < minYears) {
        return { 'minDate': true };
      }
      return null;
    };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      // Extract form field values to create a new Team object
      const email = this.registerForm.value.email;
      const name = this.registerForm.value.name;
      const address = this.registerForm.value.address;
      const phoneNumber = this.registerForm.value.phoneNumber;
      const password = this.registerForm.value.password;
      const managerName = this.registerForm.value.managerName;
      const managerDobValue = this.registerForm.value.managerDob;
      const profileImg = null
  
      const managerDob = new Date(managerDobValue);
  
      // Check if the manager is older than 25 years
      const currentDate = new Date();
      const minManagerAgeDate = new Date();
      minManagerAgeDate.setFullYear(currentDate.getFullYear() - 25);
  
      if (managerDob > minManagerAgeDate) {
        console.log('Manager must be 25 years old or older.');
        return;
      }
  
      const team: Team = new Team(name, address, phoneNumber, email, password, managerName, managerDob, profileImg!);
  
      this.service.addTeam(team).subscribe(
        () => {
          this.refreshUsers();
          alert('Team registration successful');
          this.route.navigate(['profile/team-login']);
        },
        (error: any) => {
          if (error.status === 400) {
            alert(error.error.message);
          } else {
            alert('The user exists. Please try another email.');
          }
        }
      );
    } else {
      console.log('Form is not valid');
    }
  }
  
  // Fetch the list of teams from the backend server and update the local 'teams' array
  refreshUsers() {
    this.service.getTeams().subscribe((data) => {
      this.teams = data;
    });
  }
}