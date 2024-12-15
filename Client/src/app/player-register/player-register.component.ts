import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlayerService } from '../services/player.service';
import { Player } from '../model/player';
import { Router } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-player-register',
  templateUrl: './player-register.component.html',
  styleUrls: ['./player-register.component.css']
})
export class PlayerRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  players: Player[] = [];

  constructor(private fb: FormBuilder, private service: PlayerService, private route: Router, private taskService: TaskService) { }

  // the register form
  ngOnInit() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      dateOfBirth: ['', [Validators.required, this.minDateValidator(today)]],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      preferredPosition: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.registerForm.get('dateOfBirth')?.setErrors({ minDate: true }); // age validation error
    this.registerForm.get('confirmPassword')?.setErrors({ mismatch: true }); // password mismatch error
  }

  // checkEmailExists(email: string): Observable<boolean> {

  // }

// check if the player's date of birth is 18 years ago or older
  minDateValidator(maxDate: Date) {
    return (control: any) => {
      const inputDate = new Date(control.value);
      if (inputDate > maxDate) {
        return { 'minDate': true };
      }
      return null;
    };
  }

  // matches the passwords
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const name = this.registerForm.value.name;
      const dateOfBirthValue = this.registerForm.value.dateOfBirth;
      const address = this.registerForm.value.address;
      const phoneNumber = this.registerForm.value.phoneNumber;
      const email = this.registerForm.value.email;
      const password = this.registerForm.value.password;
      const preferredPosition = this.registerForm.value.preferredPosition;
      const profileImg = null
  
      const dateOfBirth = new Date(dateOfBirthValue);
  
      // Check if the player is older than 18 years
      const currentDate = new Date();
      const minAgeDate = new Date();
      minAgeDate.setFullYear(currentDate.getFullYear() - 18);
  
      if (dateOfBirth > minAgeDate) {
        console.log('Player must be 18 years old or older.');
        return;
      }
  
      const player: Player = new Player(name, dateOfBirth, address, phoneNumber, email, password, preferredPosition, profileImg!);

      this.service.addPlayer(player).subscribe(
        () => {
          this.refreshUsers();
          alert('Player registration successful');
          this.runTaskLogic();
          this.route.navigate(['profile/player-login']);
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
  
  private runTaskLogic(): void {
    // Call the task service to trigger the task logic
    this.taskService.runTask().subscribe(
      () => {
        console.log('Task executed successfully');
      },
      (error) => {
        console.error('Error executing task:', error);
      }
    );
  }
  
  // Fetch the list of players from server and update the local 'players' array
  refreshUsers() {
    this.service.getPlayers().subscribe((data) => {
      this.players = data;
    });
  }
}