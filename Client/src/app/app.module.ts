import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { PlayerLoginComponent } from './player-login/player-login.component';
import { PlayerRegisterComponent } from './player-register/player-register.component';
import { TeamRegisterComponent } from './team-register/team-register.component';
import { TeamLoginComponent } from './team-login/team-login.component';
import { ProfileComponent } from './profile/profile.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OtherUsersComponent } from './other-users/other-users.component';
import { DatePipe } from '@angular/common';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    PagenotfoundComponent,
    PlayerLoginComponent,
    PlayerRegisterComponent,
    TeamRegisterComponent,
    TeamLoginComponent,
    ProfileComponent,
    UserDetailsComponent,
    OtherUsersComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,
      serverLoggingUrl: '/api/logs',
      serverLogLevel: NgxLoggerLevel.ERROR,
    })
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
