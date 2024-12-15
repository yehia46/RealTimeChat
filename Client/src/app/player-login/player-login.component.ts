import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlayerService } from '../services/player.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Player } from '../model/player';

@Component({
  selector: 'app-player-login',
  templateUrl: './player-login.component.html',
  styleUrls: ['./player-login.component.css']
})
export class PlayerLoginComponent implements OnInit {
  loginForm!: FormGroup;
  players: Player[] = [];

  constructor(private fb: FormBuilder, private playerService: PlayerService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.playerService.login(this.loginForm.value.email, this.loginForm.value.password)
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