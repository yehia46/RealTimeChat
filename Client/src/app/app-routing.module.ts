import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { PlayerLoginComponent } from './player-login/player-login.component';
import { PlayerRegisterComponent } from './player-register/player-register.component';
import { TeamLoginComponent } from './team-login/team-login.component';
import { TeamRegisterComponent } from './team-register/team-register.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { HomeComponent } from './home/home.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { OtherUsersComponent } from './other-users/other-users.component';
import { ChatComponent } from './chat/chat.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: "profile" },
  {
    path: 'profile', 
    component: ProfileComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: "player-login"},
      { path: 'player-login', component:  PlayerLoginComponent},
      { path: 'player-register', component: PlayerRegisterComponent },
      { path: 'team-login', component: TeamLoginComponent },
      { path: 'team-register', component: TeamRegisterComponent },
      { path: 'user-details', component: UserDetailsComponent },
    ],
  },
  { path: 'other-users/:email', component: OtherUsersComponent },
  { path: 'home', component: HomeComponent },
  { path: 'chat', component: ChatComponent },
  { path: '**', pathMatch: 'full', component: PagenotfoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
